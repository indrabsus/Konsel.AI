// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createAdminToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const inputUser = String(username).trim();
    const inputPass = String(password).trim();

    // 1. Validasi: HANYA USERNAME "admin" yang diizinkan
    if (inputUser.toLowerCase() !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "⛔ Akses Ditolak: Hanya akun dengan username 'admin' yang memiliki hak akses ke portal Konsel.AI.",
        },
        { status: 403 }
      );
    }

    // 2. Verifikasi Kredensial ke API Sakuci Express (eks.smksangkuriang1cimahi.sch.id)
    const sakuciBaseUrl = (
      process.env.SAKUCI_API_URL || "https://eks.smksangkuriang1cimahi.sch.id"
    ).replace(/\/$/, "");

    let sakuciRes;
    try {
      sakuciRes = await fetch(`${sakuciBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: inputUser,
          password: inputPass,
        }),
      });
    } catch (networkError: any) {
      console.error("Gagal koneksi ke Sakuci API:", networkError);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal terhubung ke server autentikasi Sakuci Express (eks.smksangkuriang1cimahi.sch.id).",
        },
        { status: 502 }
      );
    }

    const sakuciData = await sakuciRes.json().catch(() => ({}));

    // Cek respon Sakuci Express
    if (!sakuciRes.ok || sakuciData.status !== 200) {
      return NextResponse.json(
        {
          success: false,
          message: sakuciData.message || "Username atau kata sandi admin salah di server Sakuci.",
        },
        { status: 401 }
      );
    }

    // 3. Buat Session Token untuk Admin
    const displayName =
      sakuciData.data?.nama_lengkap ||
      sakuciData.data?.username ||
      "Administrator SMK Sangkuriang 1 Cimahi";

    const token = createAdminToken("admin", displayName);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil. Selamat datang, Administrator!",
      user: {
        username: "admin",
        name: displayName,
        role: sakuciData.data?.role || "admin",
      },
    });

    // 4. Set Cookie Sesi Aman (HttpOnly, Secure, 7 Hari)
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error: any) {
    console.error("Error in /api/auth/login:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses login." },
      { status: 500 }
    );
  }
}
