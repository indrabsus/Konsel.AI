// src/app/api/bot/chat/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCounselingReply, evaluateTriage } from "@/lib/ollama";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, studentId, message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Cari sesi konseling
    let session = null;
    if (sessionId) {
      session = await prisma.counselingSession.findUnique({
        where: { id: sessionId },
        include: {
          student: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 10,
          },
        },
      });
    }

    if (!session && studentId) {
      session = await prisma.counselingSession.findFirst({
        where: { studentId, status: "ACTIVE" },
        include: {
          student: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 10,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi konseling tidak ditemukan atau sudah berakhir. Silakan login kembali dengan NISN dan password.",
        },
        { status: 404 }
      );
    }

    const student = session.student;

    // 1. Simpan pesan siswa ke database
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "STUDENT",
        message: message.trim(),
      },
    });

    // 2. Evaluasi Triase (apakah Hijau, Kuning, atau Merah)
    const triageResult = await evaluateTriage(
      message.trim(),
      session.messages.map((m) => ({ sender: m.sender, message: m.message }))
    );

    // Prioritas triase: MERAH > KUNING > HIJAU
    // Jangan turunkan status MERAH jika sebelumnya sudah terdeteksi MERAH
    let newLevel = triageResult.level;
    if (session.triageLevel === "MERAH") {
      newLevel = "MERAH";
    } else if (session.triageLevel === "KUNING" && triageResult.level === "HIJAU") {
      newLevel = "KUNING";
    }

    // 3. Generate respon AI dari Ollama qwen2.5:7b
    const aiReply = await generateCounselingReply(
      student.name,
      student.class,
      session.messages.map((m) => ({ sender: m.sender, message: m.message })),
      message.trim()
    );

    // 4. Simpan balasan AI ke database
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI",
        message: aiReply,
        triageFlag: newLevel,
      },
    });

    // 5. Update data sesi (triage level, summary, reason)
    const shouldNotify =
      (newLevel === "MERAH" && !session.notifiedGuruBk) ||
      (newLevel === "KUNING" && !session.notifiedGuruBk) ||
      triageResult.urgent;

    await prisma.counselingSession.update({
      where: { id: session.id },
      data: {
        triageLevel: newLevel,
        triageReason: triageResult.reason || session.triageReason,
        summary: triageResult.summary || session.summary,
        notifiedGuruBk: shouldNotify ? true : session.notifiedGuruBk,
        updatedAt: new Date(),
      },
    });

    // 6. Jika terdeteksi kondisi darurat / butuh notifikasi, kirim WA ke Guru BK secara asinkron
    if (shouldNotify) {
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

    return NextResponse.json({
      success: true,
      reply: aiReply,
      sessionId: session.id,
      triage: newLevel,
      triageReason: triageResult.reason,
      urgent: triageResult.urgent,
    });
  } catch (error: any) {
    console.error("Error in /api/bot/chat:", error);
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
