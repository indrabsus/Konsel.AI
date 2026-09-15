// src/app/api/sessions/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await prisma.counselingSession.findUnique({
      where: { id },
      include: {
        student: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi konseling tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("Error in GET /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat detail sesi." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { counselorNotes, handlingStatus, triageLevel, status } = body;

    const dataToUpdate: any = {};
    if (counselorNotes !== undefined) dataToUpdate.counselorNotes = counselorNotes;
    if (handlingStatus !== undefined) dataToUpdate.handlingStatus = handlingStatus;
    if (triageLevel !== undefined) dataToUpdate.triageLevel = triageLevel;
    if (status !== undefined) dataToUpdate.status = status;

    const updated = await prisma.counselingSession.update({
      where: { id },
      data: dataToUpdate,
      include: { student: true },
    });

    return NextResponse.json({
      success: true,
      message: "Data penanganan Guru BK berhasil disimpan.",
      session: updated,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data penanganan." },
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
    await prisma.counselingSession.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Sesi konseling berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus sesi." },
      { status: 500 }
    );
  }
}
