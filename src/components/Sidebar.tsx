"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareHeart,
  Users,
  Bot,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Statistik & Kasus Terkini",
  },
  {
    href: "/counseling",
    label: "Log Konseling & Triase",
    icon: MessageSquareHeart,
    description: "Transkrip Chat & Tindak Lanjut",
  },
  {
    href: "/students",
    label: "Data Siswa & Akun WA",
    icon: Users,
    description: "Kelola Password & Siswa",
  },
  {
    href: "/simulator",
    label: "Simulator Konsel.AI",
    icon: Bot,
    badge: "Live Test",
    description: "Uji Chat & Triase AI",
  },
  {
    href: "/settings",
    label: "Pengaturan & API Bot",
    icon: Settings,
    description: "Koneksi WA & Panduan Bot",
  },
];

export default function Sidebar({
  onLogout,
  onCloseMobile,
}: {
  onLogout?: () => void;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="Logo SMK Sangkuriang 1 Cimahi"
              width={40}
              height={40}
              className="w-10 h-10 object-contain drop-shadow"
            />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
              Konsel<span className="text-indigo-400">.AI</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-1.5 py-0.5 rounded border border-indigo-500/30">
                BK
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">SMK Sangkuriang 1 Cimahi</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-indigo-400/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/30">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate font-normal">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Triage Quick Info Card - Re-positioned and Redesigned */}
      <div className="mx-3 my-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Status Triase Kasus</span>
          <Link
            href="/counseling"
            onClick={() => onCloseMobile?.()}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Buka Log →
          </Link>
        </div>
        <div className="space-y-1.5">
          <Link
            href="/counseling?triage=HIJAU"
            onClick={() => onCloseMobile?.()}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/40 text-xs transition group"
          >
            <span className="flex items-center gap-2 text-emerald-300 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              🟢 Hijau (Ringan)
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Umum</span>
          </Link>

          <Link
            href="/counseling?triage=KUNING"
            onClick={() => onCloseMobile?.()}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/80 border border-amber-800/40 text-xs transition group"
          >
            <span className="flex items-center gap-2 text-amber-300 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              🟡 Kuning (Sedang)
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Perhatian BK</span>
          </Link>

          <Link
            href="/counseling?triage=MERAH"
            onClick={() => onCloseMobile?.()}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/40 text-xs transition group"
          >
            <span className="flex items-center gap-2 text-rose-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              🔴 Merah (Kritis)
            </span>
            <span className="text-[10px] text-rose-400 font-bold group-hover:text-rose-300">Tindakan Segera</span>
          </Link>
        </div>
      </div>

      {/* AI Model Status & User Info */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Model server status badge */}
        <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <div>
              <p className="text-slate-300 font-semibold text-[11px]">Ollama qwen2.5:7b</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                ai.smksangkuriang1cimahi.sch.id
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Aktif
          </span>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">Administrator</p>
              <p className="text-[11px] text-indigo-400 truncate font-mono">admin</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Keluar / Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
