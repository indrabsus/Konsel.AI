"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Bot,
  Sparkles,
  PhoneCall,
  Bell,
  RefreshCw,
} from "lucide-react";
import { formatDate, getTriageBadgeColor, getHandlingStatusBadge } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Memuat data dashboard Konsel.AI...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const urgentCases = data?.urgentCases || [];
  const recentSessions = data?.recentSessions || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Bimbingan Konseling
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Monitoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantauan otomatis riwayat curhat siswa WhatsApp dengan evaluasi triase AI dan catatan penanganan Guru BK.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchStats}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Perbarui Data
          </button>
          <Link
            href="/simulator"
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Bot className="w-4 h-4" />
            Uji Simulator
          </Link>
        </div>
      </div>

      {/* URGENT RED ALERT BANNER (If any pending critical cases) */}
      {urgentCases.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 shadow-xs relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  PERINGATAN KRITIS: {urgentCases.length} Siswa Membutuhkan Tindakan Darurat Guru BK Segera
                </h3>
                <p className="text-xs text-rose-800/90 mt-0.5 max-w-3xl leading-relaxed">
                  AI mendeteksi indikasi bahaya keselamatan diri/krisis pada siswa:{" "}
                  <span className="font-semibold">{urgentCases.map((c: any) => `${c.student?.name} (${c.student?.class})`).join(", ")}</span>.
                  Notifikasi darurat telah dikirimkan ke nomor WhatsApp Guru BK.
                </p>
              </div>
            </div>

            <Link
              href="/counseling?triage=MERAH"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition shrink-0"
            >
              Lihat Kasus Kritis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Konseling */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Total Sesi</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalSessions || 0}</div>
          <span className="text-[11px] text-slate-400 mt-1">Seluruh riwayat</span>
        </div>

        {/* Sesi Aktif */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Sesi Aktif</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.activeSessions || 0}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Berlangsung
          </span>
        </div>

        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-slate-500">Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalStudents || 0}</div>
          <span className="text-[11px] text-slate-400 mt-1">Akun login WA</span>
        </div>

        {/* Hijau (Ringan) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Triase Ringan</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.countHijau || 0}</div>
          <span className="text-[11px] text-slate-400 mt-1">Konseling rutin</span>
        </div>

        {/* Kuning (Sedang) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Triase Sedang</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.countKuning || 0}</div>
          <span className="text-[11px] text-slate-400 mt-1">Perhatian BK</span>
        </div>

        {/* Merah (Kritis) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Triase Kritis</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{stats.countMerah || 0}</div>
          <span className="text-[11px] text-rose-600 font-medium mt-1">Tindakan darurat</span>
        </div>
      </div>

      {/* TWO COLUMN CONTENT: Urgent/Pending Action on Left, Recent Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kasus Perlu Penanganan (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Daftar Siswa Perlu Tindak Lanjut Guru BK
                </h2>
                <p className="text-xs text-slate-500">
                  Prioritas penanganan kasus berdasarkan tingkat risiko triase AI
                </p>
              </div>
            </div>

            <Link
              href="/counseling"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition"
            >
              Semua Kasus <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 sm:p-5 flex-1">
            {urgentCases.length === 0 && stats.countPendingAction === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada kasus kritis yang tertunda.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                  Semua masalah siswa berada di tingkat aman atau sudah selesai ditangani oleh Guru BK.
                </p>
              </div>
            ) : urgentCases.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada kasus darurat tingkat kritis (Merah).
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Terdapat {stats.countPendingAction} sesi konseling sedang dalam pantauan.
                </p>
                <Link
                  href="/counseling"
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Buka Log Konseling <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentCases.map((item: any) => {
                  const triage = getTriageBadgeColor(item.triageLevel);
                  const handling = getHandlingStatusBadge(item.handlingStatus);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded-md ${triage.badge}`}>
                            {item.triageLevel}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-md border ${handling.badge}`}>
                            {handling.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {formatDate(item.updatedAt)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {item.student.name}{" "}
                          <span className="font-normal text-slate-500">
                            ({item.student.class} - {item.student.username || item.student.nisn})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.summary || item.triageReason || "Siswa membutuhkan pendampingan konseling."}
                        </p>
                      </div>

                      <div className="shrink-0 flex sm:flex-col items-end gap-2">
                        <Link
                          href={`/counseling?session=${item.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                        >
                          Buka & Tangani
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Aktivitas Konseling Terkini (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Aktivitas Konseling Terbaru
              </h3>
              <span className="text-[11px] text-slate-400">Realtime</span>
            </div>

            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Belum ada sesi konseling siswa.
                </p>
              ) : (
                recentSessions.slice(0, 5).map((session: any) => {
                  const triage = getTriageBadgeColor(session.triageLevel);
                  return (
                    <Link
                      key={session.id}
                      href={`/counseling?session=${session.id}`}
                      className="block p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition">
                          {session.student.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${triage.badge}`}>
                          {session.triageLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {session.student.class} • {formatDate(session.updatedAt)}
                      </p>
                      {session.summary && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 italic">
                          "{session.summary}"
                        </p>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-900">Alur Kerja Konsel.AI</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Siswa login dengan Username & Password di WhatsApp, lalu berdiskusi dengan AI. Sistem mengklasifikasikan risiko psikologis dan mengirim peringatan langsung ke Guru BK jika terdeteksi masalah kritis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
