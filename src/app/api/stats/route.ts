// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await sakuciBackend.getStats();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/stats:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil statistik dashboard." },
      { status: 500 }
    );
  }
}

