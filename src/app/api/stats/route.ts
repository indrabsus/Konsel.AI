// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalSessions,
      activeSessions,
      totalStudents,
      countHijau,
      countKuning,
      countMerah,
      countPendingAction,
      urgentCases,
      recentSessions,
    ] = await Promise.all([
      prisma.counselingSession.count(),
      prisma.counselingSession.count({ where: { status: "ACTIVE" } }),
      prisma.student.count(),
      prisma.counselingSession.count({ where: { triageLevel: "HIJAU" } }),
      prisma.counselingSession.count({ where: { triageLevel: "KUNING" } }),
      prisma.counselingSession.count({ where: { triageLevel: "MERAH" } }),
      prisma.counselingSession.count({
        where: {
          handlingStatus: "MENUNGGU",
          triageLevel: { in: ["MERAH", "KUNING"] },
        },
      }),
      prisma.counselingSession.findMany({
        where: { triageLevel: "MERAH", handlingStatus: { not: "SELESAI" } },
        include: { student: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.counselingSession.findMany({
        include: {
          student: true,
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        activeSessions,
        totalStudents,
        countHijau,
        countKuning,
        countMerah,
        countPendingAction,
      },
      urgentCases,
      recentSessions,
    });
  } catch (error: any) {
    console.error("Error in /api/stats:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil statistik dashboard." },
      { status: 500 }
    );
  }
}
