import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function getTriageBadgeColor(level: string) {
  switch (level?.toUpperCase()) {
    case "MERAH":
      return {
        bg: "bg-red-500/10 text-red-500 border-red-500/30",
        badge: "bg-red-600 text-white",
        dot: "bg-red-500 animate-pulse",
        label: "🔴 Merah (Kritis)",
        description: "Masalah berat / risiko keselamatan diri (butuh penanganan darurat segera)",
      };
    case "KUNING":
      return {
        bg: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        badge: "bg-amber-500 text-white",
        dot: "bg-amber-500",
        label: "🟡 Kuning (Sedang)",
        description: "Masalah sedang / butuh perhatian & konseling lanjutan",
      };
    case "HIJAU":
    default:
      return {
        bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        badge: "bg-emerald-600 text-white",
        dot: "bg-emerald-500",
        label: "🟢 Hijau (Ringan)",
        description: "Masalah sepele / ringan / curhat harian siswa",
      };
  }
}

export function getHandlingStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "SELESAI":
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-300",
        label: "Selesai Ditangani",
      };
    case "PROSES":
      return {
        badge: "bg-blue-100 text-blue-700 border-blue-300",
        label: "Sedang Ditangani Guru BK",
      };
    case "MENUNGGU":
    default:
      return {
        badge: "bg-orange-100 text-orange-700 border-orange-300",
        label: "Menunggu Tindakan",
      };
  }
}
