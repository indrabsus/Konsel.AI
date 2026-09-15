// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const notificationLogs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const settingsObj: Record<string, string> = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value;
    }

    return NextResponse.json({
      success: true,
      settings: settingsObj,
      notificationLogs,
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
    const { action, settings, testPhone } = body;

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

    // Simpan pengaturan
    if (settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan sistem berhasil disimpan.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/settings:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}
