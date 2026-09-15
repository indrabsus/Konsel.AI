"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { LogOut, ShieldCheck } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  // Jika halaman login, jangan tampilkan sidebar dan header navigasi dashboard
  if (pathname === "/login") {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Konsel.AI <span className="text-slate-400 font-normal">| Portal Bimbingan Konseling</span>
            </h2>
            <p className="text-xs text-slate-500">
              SMK Sangkuriang 1 Cimahi • Terintegrasi WhatsApp Bot & Sakuci Express
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Sakuci</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Server AI Online
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari sesi Admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
