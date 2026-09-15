// src/lib/whatsapp.ts
import { sakuciBackend } from "./api-client";

interface SendNotificationParams {
  sessionId?: string;
  studentName: string;
  studentClass: string;
  studentNisn: string;
  triageLevel: "HIJAU" | "KUNING" | "MERAH";
  triageReason?: string;
  summary?: string;
  latestMessage?: string;
  isNewSession?: boolean;
}

export async function sendWhatsAppNotification(params: SendNotificationParams): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const gatewayUrl =
      process.env.WA_GATEWAY_URL ||
      "https://bot.smksangkuriang1cimahi.sch.id/wa/kirim";
    const token = process.env.WA_GATEWAY_TOKEN || "";
    const targetNumber = process.env.WA_GURU_BK_NUMBER || "081234567890";
    const alertLevel = process.env.NOTIF_ALERT_LEVEL || "ALL"; // ALL, KUNING_MERAH, MERAH_ONLY

    // Cek apakah tingkat triase memenuhi syarat pengiriman notifikasi
    if (alertLevel === "MERAH_ONLY" && params.triageLevel !== "MERAH") {
      return { success: false, message: "Dilewati: Notifikasi disetel hanya untuk level MERAH" };
    }
    if (
      alertLevel === "KUNING_MERAH" &&
      params.triageLevel !== "MERAH" &&
      params.triageLevel !== "KUNING"
    ) {
      return {
        success: false,
        message: "Dilewati: Notifikasi disetel hanya untuk level KUNING & MERAH",
      };
    }

    if (!targetNumber) {
      console.warn("Nomor WhatsApp Guru BK belum disetel. Notifikasi tidak dapat dikirim.");
      return { success: false, message: "Nomor WhatsApp Guru BK belum dikonfigurasi" };
    }

    // 2. Susun template pesan berdasarkan tingkat triase
    let messageText = "";
    const now = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date());

    if (params.triageLevel === "MERAH") {
      messageText = `🚨 *[PERINGATAN KRITIS - GURU BK]* 🚨
Aplikasi Konsel.AI SMK Sangkuriang 1 Cimahi mendeteksi siswa dalam kondisi darurat / butuh penanganan segera!

👤 *Identitas Siswa:*
• Nama: *${params.studentName}*
• Kelas: *${params.studentClass}*
• NISN: ${params.studentNisn}
• Waktu: ${now}

🔴 *Status Triase:* *MERAH (KRITIS)*
📌 *Alasan Triase:* ${params.triageReason || "Terindikasi masalah keselamatan diri/kekerasan"}
📝 *Ringkasan Masalah:*
_${params.summary || params.latestMessage || "-"}_

💬 *Pesan Terakhir Siswa:*
"${params.latestMessage || "-"}"

⚠️ *Rekomendasi:*
Mohon Guru BK segera membuka Web Portal Konsel.AI dan melakukan pendampingan / memanggil siswa yang bersangkutan.`;
    } else if (params.triageLevel === "KUNING") {
      messageText = `🟡 *[NOTIFIKASI BK - MASALAH SEDANG]*
Siswa terdeteksi memerlukan perhatian dan konseling lebih lanjut.

👤 *Data Siswa:*
• Nama: *${params.studentName}* (${params.studentClass})
• NISN: ${params.studentNisn}
• Waktu: ${now}

Status: *KUNING (SEDANG)*
📌 Alasan: ${params.triageReason || "Masalah akademik / emosional sedang"}
📝 Ringkasan: _${params.summary || "-"}_

Pantau detail percakapan di Web Dashboard Konsel.AI.`;
    } else {
      messageText = `🟢 *[INFO KONSELING BARU]*
Siswa telah memulai sesi percakapan dengan Konsel.AI.

👤 *Siswa:* ${params.studentName} (${params.studentClass})
🕒 *Waktu:* ${now}
📊 *Status Triase:* HIJAU (Ringan)

Ringkasan: ${params.summary || "Curhat atau obrolan harian santai."}`;
    }

    // 3. Kirim ke WhatsApp Gateway (bot.smksangkuriang1cimahi.sch.id atau Fonnte)
    let apiStatus = "SENT";
    let apiResponse = "";

    const isSakuciBot = gatewayUrl.includes("/wa/kirim") || gatewayUrl.includes("bot.smksangkuriang1cimahi.sch.id");

    try {
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      let bodyPayload: any = {};

      if (isSakuciBot) {
        // Format endpoint internal bot Baileys /wa/kirim
        if (token) headers["x-api-key"] = token;
        bodyPayload = {
          nomor: targetNumber,
          pesan: messageText,
        };
      } else {
        // Format Fonnte / Gateway umum
        if (token) headers["Authorization"] = token;
        bodyPayload = {
          target: targetNumber,
          message: messageText,
          countryCode: "62",
        };
      }

      const response = await fetch(gatewayUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
      });

      const resText = await response.text();
      apiResponse = resText;

      if (!response.ok) {
        apiStatus = "FAILED";
      }
    } catch (err: any) {
      apiStatus = "FAILED";
      apiResponse = err?.message || String(err);
      console.error("Gagal mengirim notifikasi WA ke gateway:", err);
    }

    // 4. Catat riwayat notifikasi ke database via API Sakuci Express
    await sakuciBackend.saveNotificationLog({
      sessionId: params.sessionId,
      recipient: targetNumber,
      message: messageText,
      status: apiStatus,
      response: apiResponse,
    }).catch((err) => console.warn("Gagal simpan notification log:", err));

    return {
      success: apiStatus === "SENT" || apiStatus === "SIMULATED",
      message:
        apiStatus === "SENT"
          ? "Notifikasi WhatsApp berhasil dikirim ke Guru BK"
          : "Notifikasi tercatat di Log (Token belum aktif)",
      details: apiResponse,
    };
  } catch (error: any) {
    console.error("Error in sendWhatsAppNotification:", error);
    return { success: false, message: error?.message || "Internal error sending notification" };
  }
}
