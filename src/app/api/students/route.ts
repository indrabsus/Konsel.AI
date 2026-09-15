// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    // Default limit 0 (tanpa batasan, ambil seluruh siswa aktif) jika tidak dispesifikasikan
    const limit = searchParams.get("limit") !== null ? Number(searchParams.get("limit")) : 0;
    const classFilter = searchParams.get("class") || "";

    const data = await sakuciBackend.getStudents({ search, page, limit, class: classFilter });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/students:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data siswa." },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  return NextResponse.json({
    success: true,
    message: "Penambahan siswa dilakukan secara terpusat melalui portal Sakuci Express.",
  });
}

