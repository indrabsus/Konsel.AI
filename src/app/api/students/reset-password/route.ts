// src/app/api/students/reset-password/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, id } = body;

    if (!username && !id) {
      return NextResponse.json(
        { success: false, message: "Username atau ID siswa wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sakuciBackend.resetStudentPassword(username, id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/students/reset-password:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mereset kata sandi siswa." },
      { status: 500 }
    );
  }
}
