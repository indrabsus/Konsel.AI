// src/app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const triage = searchParams.get("triage") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await sakuciBackend.getSessions({ triage, status, search });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/sessions:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil daftar sesi konseling." },
      { status: 500 }
    );
  }
}

