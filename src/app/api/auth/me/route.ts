// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = verifyAdminToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username,
      name: session.name,
      role: session.role,
    },
  });
}
