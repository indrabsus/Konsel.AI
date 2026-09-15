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
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat data dashboard Konsel.AI...</p>
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Dashboard Bimbingan Konseling
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
              Live Monitoring
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau curhat dan kondisi psikologis siswa dari bot WhatsApp secara otomatis dengan klasifikasi triase AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Perbarui Data
          </button>
          <Link
            href="/simulator"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/20 transition"
          >
            <Bot className="w-4 h-4" />
            Uji Simulator AI
          </Link>
        </div>
      </div>

      {/* URGENT RED ALERT BANNER (If any pending critical cases) */}
      {urgentCases.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-red-500/10 to-rose-500/5 border-2 border-red-500/40 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30 animate-bounce">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  PERINGATAN KRITIS: {urgentCases.length} Siswa Membutuhkan Tindakan Darurat Guru BK Segera!
                </h3>
                <p className="text-xs text-red-700 mt-0.5 max-w-3xl">
                  AI mendeteksi indikasi bahaya keselamatan diri/krisis pada siswa berikut:{" "}
                  <strong>{urgentCases.map((c: any) => `${c.student.name} (${c.student.class})`).join(", ")}</strong>.
                  Notifikasi telah dikirimkan ke WhatsApp Guru BK.
                </p>
              </div>
            </div>

            <Link
              href="/counseling?triage=MERAH"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition shrink-0"
            >
              Lihat Kasus Kritis & Tindak Lanjut
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Konseling */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Konseling</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalSessions || 0}</div>
          <span className="text-[11px] text-slate-400 mt-1">Seluruh sesi siswa</span>
        </div>

        {/* Sesi Aktif */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sesi Aktif</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.activeSessions || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1">Sedang berlangsung</span>
        </div>

        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalStudents || 0}</div>
          <span className="text-[11px] text-slate-400 mt-1">Akun login WA</span>
        </div>

        {/* Hijau (Ringan) */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold">🟢 Hijau (Ringan)</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.countHijau || 0}</div>
          <span className="text-[11px] text-emerald-600 mt-1">Curhat biasa/santai</span>
        </div>

        {/* Kuning (Sedang) */}
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold">🟡 Kuning (Sedang)</span>
          </div>
          <div className="text-2xl font-bold text-amber-700">{stats.countKuning || 0}</div>
          <span className="text-[11px] text-amber-600 mt-1">Butuh perhatian BK</span>
        </div>

        {/* Merah (Kritis) */}
        <div className="bg-red-50/70 p-4 rounded-xl border border-red-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-bold">🔴 Merah (Kritis)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700">{stats.countMerah || 0}</div>
          <span className="text-[11px] text-red-600 font-bold mt-1">Tindakan darurat</span>
        </div>
      </div>

      {/* TWO COLUMN CONTENT: Urgent/Pending Action on Left, Recent Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kasus Perlu Penanganan (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daftar Siswa Perlu Tindak Lanjut Guru BK
                </h2>
                <p className="text-xs text-slate-500">
                  Prioritas penanganan kasus berdasarkan tingkat risiko triase AI
                </p>
              </div>
            </div>

            <Link
              href="/counseling"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Semua Kasus <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1">
            {urgentCases.length === 0 && stats.countPendingAction === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  Luar biasa! Tidak ada kasus kritis yang tertunda.
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                  Semua masalah siswa berada di tingkat aman atau sudah ditangani oleh Guru BK.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentCases.map((item: any) => {
                  const triage = getTriageBadgeColor(item.triageLevel);
                  const handling = getHandlingStatusBadge(item.handlingStatus);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${triage.badge}`}>
                            {item.triageLevel}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${handling.badge}`}>
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
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {item.summary || item.triageReason || "Siswa membutuhkan pendampingan konseling."}
                        </p>
                      </div>

                      <div className="shrink-0 flex sm:flex-col items-end gap-2">
                        <Link
                          href={`/counseling?session=${item.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
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
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Aktivitas Konseling Terbaru
              </h3>
              <span className="text-[11px] text-slate-400">Realtime</span>
            </div>

            <div className="space-y-3.5">
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
                      className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                          {session.student.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${triage.badge}`}>
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
          <div className="mt-5 p-3.5 rounded-xl bg-slate-900 text-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Alur Konsel.AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Siswa membuka menu <strong>Konsel.AI</strong> di Bot WhatsApp, memasukkan Username & password, lalu curhat secara langsung. Sistem secara otomatis men-triase masalah dan memberi peringatan ke nomor WhatsApp Guru BK jika terdeteksi masalah darurat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
