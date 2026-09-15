import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Konsel.AI - Portal Guru BK SMK Sangkuriang 1 Cimahi",
  description:
    "Sistem Pemantauan Konseling AI, Triase Masalah Siswa (Hijau, Kuning, Merah), dan Notifikasi WhatsApp Otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navbar */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Konsel.AI <span className="text-slate-400 font-normal">| Portal Bimbingan Konseling</span>
                </h2>
                <p className="text-xs text-slate-500">
                  SMK Sangkuriang 1 Cimahi • Terintegrasi WhatsApp Bot & AI Qwen 2.5
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Server AI Ollama Online
                </div>
              </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
