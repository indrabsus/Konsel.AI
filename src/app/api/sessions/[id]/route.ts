// src/app/api/sessions/[id]/route.ts
import { NextResponse } from "next/server";
import { sakuciBackend } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await sakuciBackend.getSessionDetail(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memuat detail sesi." },
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

    await sakuciBackend.updateSession(id, dataToUpdate);

    return NextResponse.json({
      success: true,
      message: "Data penanganan Guru BK berhasil disimpan.",
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/sessions/[id]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui data penanganan." },
      { status: 500 }
    );
  }
}

