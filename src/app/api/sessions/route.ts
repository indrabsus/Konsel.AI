// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const triage = searchParams.get("triage");
    const status = searchParams.get("status");
    const handling = searchParams.get("handling");
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (triage && triage !== "ALL") {
      whereClause.triageLevel = triage;
    }
    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (handling && handling !== "ALL") {
      whereClause.handlingStatus = handling;
    }

    if (search) {
      whereClause.student = {
        OR: [
          { name: { contains: search } },
          { nisn: { contains: search } },
          { class: { contains: search } },
        ],
      };
    }

    const sessions = await prisma.counselingSession.findMany({
      where: whereClause,
      include: {
        student: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error("Error in /api/sessions:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar sesi konseling." },
      { status: 500 }
    );
  }
}
