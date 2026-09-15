// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settingsObj: Record<string, string> = {
      WA_GATEWAY_URL: process.env.WA_GATEWAY_URL || "https://bot.smksangkuriang1cimahi.sch.id/wa/kirim",
      WA_GATEWAY_TOKEN: process.env.WA_GATEWAY_TOKEN || "",
      WA_GURU_BK_NUMBER: process.env.WA_GURU_BK_NUMBER || "081234567890",
      NOTIF_ALERT_LEVEL: process.env.NOTIF_ALERT_LEVEL || "ALL",
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "https://ai.smksangkuriang1cimahi.sch.id",
      OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5:7b",
      SAKUCI_API_URL: process.env.SAKUCI_API_URL || "https://eks.smksangkuriang1cimahi.sch.id",
    };

    return NextResponse.json({
      success: true,
      settings: settingsObj,
      notificationLogs: [],
    });
  } catch (error: any) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengaturan sistem." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // Aksi Test Kirim WhatsApp Notifikasi
    if (action === "test_wa") {
      const res = await sendWhatsAppNotification({
        studentName: "Ahmad Rizky (Tes Sistem)",
        studentClass: "XII RPL 1",
        studentNisn: "20240101",
        triageLevel: "MERAH",
        triageReason: "Uji coba pengiriman notifikasi darurat Konsel.AI",
        summary: "Pesan uji coba koneksi gateway WhatsApp untuk Guru BK.",
        latestMessage: "Halo Bu/Pak Guru BK, ini adalah pesan simulasi peringatan dari sistem Konsel.AI.",
      });

      return NextResponse.json({
        success: res.success,
        message: res.message,
        details: res.details,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan sistem dikonfigurasi melalui Environment Variables di Vercel.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/settings:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses permintaan." },
      { status: 500 }
    );
  }
}

