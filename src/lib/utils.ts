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
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        badge: "bg-rose-50 text-rose-700 border border-rose-200 font-semibold",
        dot: "bg-rose-500",
        label: "🔴 Merah (Kritis)",
        description: "Masalah berat / risiko keselamatan diri (butuh penanganan darurat segera)",
      };
    case "KUNING":
      return {
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        badge: "bg-amber-50 text-amber-800 border border-amber-200 font-semibold",
        dot: "bg-amber-500",
        label: "🟡 Kuning (Sedang)",
        description: "Masalah sedang / butuh perhatian & konseling lanjutan",
      };
    case "HIJAU":
    default:
      return {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        badge: "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold",
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
        badge: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
        label: "Selesai Ditangani",
      };
    case "PROSES":
      return {
        badge: "bg-sky-50 text-sky-800 border-sky-200 font-medium",
        label: "Sedang Ditangani",
      };
    case "MENUNGGU":
    default:
      return {
        badge: "bg-amber-50/80 text-amber-800 border-amber-200/80 font-medium",
        label: "Menunggu Tindakan",
      };
  }
}
