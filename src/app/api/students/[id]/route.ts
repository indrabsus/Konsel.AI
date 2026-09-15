// src/app/api/students/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { nisn, name, className, major, password, phone, parentPhone } = body;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(nisn ? { nisn: String(nisn).trim() } : {}),
        ...(name ? { name: String(name).trim() } : {}),
        ...(className ? { class: String(className).trim() } : {}),
        ...(major !== undefined ? { major: String(major).trim() } : {}),
        ...(password ? { password: String(password).trim() } : {}),
        ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
        ...(parentPhone !== undefined ? { parentPhone: String(parentPhone).trim() } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data siswa berhasil diperbarui.",
      student: updated,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/students/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data siswa." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Data siswa berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/students/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus siswa." },
      { status: 500 }
    );
  }
}
