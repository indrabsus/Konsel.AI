// src/app/api/bot/end/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "sessionId diperlukan." },
        { status: 400 }
      );
    }

    await sakuciBackend.updateSession(sessionId, {
      status: "CLOSED",
    });

    return NextResponse.json({
      success: true,
      message: "Terima kasih sudah berkonsultasi dengan Konsel.AI. Tetap semangat, jaga kesehatan mentalmu, dan jangan ragu untuk datang ke ruang BK jika butuh teman bicara ya!",
    });
  } catch (error: any) {
    console.error("Error in /api/bot/end:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengakhiri sesi konseling." },
      { status: 500 }
    );
  }
}

