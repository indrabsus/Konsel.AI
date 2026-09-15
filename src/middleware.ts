// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Izinkan akses ke aset statis dan file internal Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") // file statis seperti .png, .svg, dll
  ) {
    return NextResponse.next();
  }

  // 2. Izinkan akses publik ke API bot WA dan API Login
  if (
    pathname.startsWith("/api/bot") ||
    pathname.startsWith("/api/auth/login")
  ) {
    return NextResponse.next();
  }

  // 3. Cek Cookie Autentikasi Admin
  const token = request.cookies.get("konsel_admin_token")?.value;

  // Verifikasi format dasar token payload.signature
  const hasValidTokenFormat = Boolean(token && token.includes("."));

  // 4. Jika user sudah login dan membuka /login -> Redirect ke Dashboard
  if (pathname === "/login") {
    if (hasValidTokenFormat) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 5. Jika belum login dan mengakses halaman private / dashboard -> Redirect ke /login
  if (!hasValidTokenFormat) {
    // Jika request ke API selain yang di-whitelist, berikan 401 JSON
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Silakan login terlebih dahulu sebagai admin." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
