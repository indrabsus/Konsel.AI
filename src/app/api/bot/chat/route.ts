// src/app/api/bot/chat/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";
import { generateCounselingReply, evaluateTriage } from "@/lib/ollama";
import { sendWhatsAppNotification, sendWhatsAppTyping } from "@/lib/whatsapp";
import { aiQueue, AIConcurrencyError } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, message } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "sessionId wajib diisi." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Ambil sesi konseling via Sakuci Backend API
    const sessionRes = await sakuciBackend.getSessionDetail(sessionId);
    const session = sessionRes.session;

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi konseling tidak ditemukan atau sudah berakhir. Silakan login kembali.",
        },
        { status: 404 }
      );
    }

    const student = session.student;

    // 1. Simpan pesan siswa ke database via API segera agar tidak hilang
    await sakuciBackend.addMessage({
      sessionId: session.id,
      sender: "STUDENT",
      message: message.trim(),
    });

    // 2. Memicu sinyal "sedang mengetik" ke WhatsApp siswa secara asinkron
    if (student?.phone) {
      sendWhatsAppTyping(student.phone).catch(() => {});
    }

    // 3. Eksekusi proses AI melalui antrian terkontrol (Concurrency Queue Limiter)
    // Mencegah server crash / timeout jika puluhan siswa curhat bersamaan
    const result = await aiQueue.run(session.id, async () => {
      const historyContext = (session.messages || []).map((m: any) => ({
        sender: m.sender,
        message: m.message,
      }));

      // Eksekusi evaluasi triase dan generasi balasan konselor secara paralel (Promise.all)
      // Memangkas waktu tunggu dari ~10 detik menjadi ~4-5 detik
      const [triageResult, aiReply] = await Promise.all([
        evaluateTriage(message.trim(), historyContext),
        generateCounselingReply(
          student?.name || "Siswa",
          student?.class || "Siswa",
          historyContext,
          message.trim()
        ),
      ]);

      // Prioritas triase: MERAH > KUNING > HIJAU
      let newLevel = triageResult.level;
      if (session.triageLevel === "MERAH") {
        newLevel = "MERAH";
      } else if (session.triageLevel === "KUNING" && triageResult.level === "HIJAU") {
        newLevel = "KUNING";
      }

      // Simpan balasan AI ke database via API
      await sakuciBackend.addMessage({
        sessionId: session.id,
        sender: "AI",
        message: aiReply,
        triageFlag: newLevel,
      });

      // Update data sesi (triage level, summary, reason)
      const shouldNotify =
        (newLevel === "MERAH" && !session.notifiedGuruBk) ||
        (newLevel === "KUNING" && !session.notifiedGuruBk) ||
        triageResult.urgent;

      await sakuciBackend.updateSession(session.id, {
        triageLevel: newLevel,
        triageReason: triageResult.reason || session.triageReason,
        summary: triageResult.summary || session.summary,
        notifiedGuruBk: shouldNotify ? true : session.notifiedGuruBk,
      });

      // Jika terdeteksi kondisi darurat / butuh notifikasi, kirim WA ke Guru BK secara asinkron
      if (shouldNotify && student) {
        sendWhatsAppNotification({
          sessionId: session.id,
          studentName: student.name,
          studentClass: student.class,
          studentNisn: student.nisn,
          triageLevel: newLevel,
          triageReason: triageResult.reason,
          summary: triageResult.summary,
          latestMessage: message.trim(),
        }).catch((err) => console.error("Error triggering WA notification:", err));
      }

      return {
        reply: aiReply,
        triage: newLevel,
        triageReason: triageResult.reason,
        urgent: triageResult.urgent,
      };
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      sessionId: session.id,
      triage: result.triage,
      triageReason: result.triageReason,
      urgent: result.urgent,
    });
  } catch (error: any) {
    console.error("Error in /api/bot/chat:", error);

    // Tangani kondisi beban antrian server dan spam per sesi dengan respon ramah
    if (error instanceof AIConcurrencyError) {
      return NextResponse.json({
        success: true,
        reply: error.message,
        sessionId: (await req.clone().json().catch(() => ({})))?.sessionId,
        triage: "HIJAU",
        isQueueNotice: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses percakapan AI.",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}

