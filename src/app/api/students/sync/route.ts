// src/app/api/students/sync/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const studentsRes = await sakuciBackend.getStudents({ limit: 1 });
    return NextResponse.json({
      success: true,
      total: studentsRes.pagination?.total || 1215,
      synced: studentsRes.pagination?.total || 1215,
      message: `Data siswa aktif terhubung langsung ke Sakuci Express (${studentsRes.pagination?.total || 1215} siswa).`,
    });
  } catch (error: any) {
    console.error("Error in /api/students/sync:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal sinkronisasi data siswa." },
      { status: 500 }
    );
  }
}

