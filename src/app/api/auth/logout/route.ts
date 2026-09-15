// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
