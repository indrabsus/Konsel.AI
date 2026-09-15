// src/app/api/bot/end/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, studentId } = body;

    if (!sessionId && !studentId) {
      return NextResponse.json(
        { success: false, message: "sessionId atau studentId diperlukan." },
        { status: 400 }
      );
    }

    const session = await prisma.counselingSession.findFirst({
      where: sessionId ? { id: sessionId } : { studentId, status: "ACTIVE" },
      include: { student: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi konseling aktif tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.counselingSession.update({
      where: { id: session.id },
      data: {
        status: "CLOSED",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Terima kasih ${session.student.name} sudah berkonsultasi dengan Konsel.AI. Tetap semangat, jaga kesehatan mentalmu, dan jangan ragu untuk datang ke ruang BK jika butuh teman bicara ya!`,
    });
  } catch (error: any) {
    console.error("Error in /api/bot/end:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengakhiri sesi konseling." },
      { status: 500 }
    );
  }
}
