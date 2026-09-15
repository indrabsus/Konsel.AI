// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "100");

    const data = await sakuciBackend.getStudents({ search, page, limit });
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

