// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { aiQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backendData = await sakuciBackend.getSettings();

    const fallbackSettings: Record<string, string> = {
      WA_GATEWAY_URL: process.env.WA_GATEWAY_URL || "https://bot.smksangkuriang1cimahi.sch.id/wa/kirim",
      WA_GATEWAY_TOKEN: process.env.WA_GATEWAY_TOKEN || "",
      WA_GURU_BK_NUMBER: process.env.WA_GURU_BK_NUMBER || "081234567890",
      NOTIF_ALERT_LEVEL: process.env.NOTIF_ALERT_LEVEL || "ALL",
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "https://ai.smksangkuriang1cimahi.sch.id",
      OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5:7b",
      SAKUCI_API_URL: process.env.SAKUCI_API_URL || "https://eks.smksangkuriang1cimahi.sch.id",
      MAX_CONCURRENT_CHATS: process.env.MAX_CONCURRENT_CHATS || "4",
      ENABLE_TYPING_STATUS: process.env.ENABLE_TYPING_STATUS || "true",
    };

    const mergedSettings = {
      ...fallbackSettings,
      ...(backendData?.settings || {}),
    };

    // Update antrian runtime jika ada setting tersimpan
    if (mergedSettings.MAX_CONCURRENT_CHATS) {
      aiQueue.setMaxConcurrent(parseInt(mergedSettings.MAX_CONCURRENT_CHATS, 10));
    }

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
      queueStats: aiQueue.getStats(),
      notificationLogs: backendData?.notificationLogs || [],
    });
  } catch (error: any) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json(
      {
        success: true,
        settings: {
          WA_GATEWAY_URL: process.env.WA_GATEWAY_URL || "https://bot.smksangkuriang1cimahi.sch.id/wa/kirim",
          WA_GATEWAY_TOKEN: process.env.WA_GATEWAY_TOKEN || "",
          WA_GURU_BK_NUMBER: process.env.WA_GURU_BK_NUMBER || "081234567890",
          NOTIF_ALERT_LEVEL: process.env.NOTIF_ALERT_LEVEL || "ALL",
          OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "https://ai.smksangkuriang1cimahi.sch.id",
          OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5:7b",
          SAKUCI_API_URL: process.env.SAKUCI_API_URL || "https://eks.smksangkuriang1cimahi.sch.id",
          MAX_CONCURRENT_CHATS: process.env.MAX_CONCURRENT_CHATS || "4",
          ENABLE_TYPING_STATUS: process.env.ENABLE_TYPING_STATUS || "true",
        },
        queueStats: aiQueue.getStats(),
        notificationLogs: [],
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, settings } = body;

    // Aksi Test Kirim WhatsApp Notifikasi
    if (action === "test_wa") {
      const res = await sendWhatsAppNotification({
        studentName: "Siswa Pengujian (Tes Sistem)",
        studentClass: "X PPLG 1",
        studentNisn: "0000000000",
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

    // Aksi Simpan Pengaturan
    if (settings && typeof settings === "object") {
      const saveRes = await sakuciBackend.saveSettings(settings);

      // Sinkronisasi memori lokal proses
      if (settings.WA_GATEWAY_URL) process.env.WA_GATEWAY_URL = settings.WA_GATEWAY_URL;
      if (settings.WA_GATEWAY_TOKEN !== undefined) process.env.WA_GATEWAY_TOKEN = settings.WA_GATEWAY_TOKEN;
      if (settings.WA_GURU_BK_NUMBER) process.env.WA_GURU_BK_NUMBER = settings.WA_GURU_BK_NUMBER;
      if (settings.NOTIF_ALERT_LEVEL) process.env.NOTIF_ALERT_LEVEL = settings.NOTIF_ALERT_LEVEL;
      if (settings.OLLAMA_BASE_URL) process.env.OLLAMA_BASE_URL = settings.OLLAMA_BASE_URL;
      if (settings.OLLAMA_MODEL) process.env.OLLAMA_MODEL = settings.OLLAMA_MODEL;
      if (settings.MAX_CONCURRENT_CHATS) {
        process.env.MAX_CONCURRENT_CHATS = settings.MAX_CONCURRENT_CHATS;
        aiQueue.setMaxConcurrent(parseInt(settings.MAX_CONCURRENT_CHATS, 10));
      }
      if (settings.ENABLE_TYPING_STATUS) {
        process.env.ENABLE_TYPING_STATUS = settings.ENABLE_TYPING_STATUS;
      }

      return NextResponse.json({
        success: true,
        message: saveRes?.message || "Pengaturan berhasil disimpan ke sistem dan basis data Sakuci.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Format payload pengaturan tidak valid." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/settings:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}


