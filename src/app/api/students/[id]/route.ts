// src/app/api/students/[id]/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT() {
  return NextResponse.json({
    success: true,
    message: "Data siswa dikelola dan disinkronkan secara otomatis melalui portal Sakuci Express.",
  });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: "Data siswa dikelola melalui portal Sakuci Express.",
  });
}

