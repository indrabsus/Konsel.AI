// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const className = searchParams.get("class") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nisn: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (className && className !== "ALL") {
      where.class = className;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        _count: {
          select: { sessions: true },
        },
      },
      orderBy: { class: "asc" },
    });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error("Error in GET /api/students:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data siswa." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nisn, name, className, major, password, phone, parentPhone } = body;

    if (!nisn || !name || !className || !password) {
      return NextResponse.json(
        { success: false, message: "NISN, Nama, Kelas, dan Password wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.student.findUnique({
      where: { nisn: String(nisn).trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Siswa dengan NISN ${nisn} sudah terdaftar!` },
        { status: 409 }
      );
    }

    const student = await prisma.student.create({
      data: {
        nisn: String(nisn).trim(),
        name: String(name).trim(),
        class: String(className).trim(),
        major: major ? String(major).trim() : null,
        password: String(password).trim(),
        phone: phone ? String(phone).trim() : null,
        parentPhone: parentPhone ? String(parentPhone).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data siswa ${student.name} berhasil ditambahkan.`,
      student,
    });
  } catch (error: any) {
    console.error("Error in POST /api/students:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan siswa." },
      { status: 500 }
    );
  }
}
