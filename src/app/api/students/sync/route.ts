// src/app/api/students/sync/route.ts
import { NextResponse } from "next/server";
import { syncStudentsFromSakuci } from "../../../../../scripts/sync-students-sakuci";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncStudentsFromSakuci();
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total: result.total,
      synced: result.synced,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error in /api/students/sync:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal sinkronisasi data siswa." },
      { status: 500 }
    );
  }
}
