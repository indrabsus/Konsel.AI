"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquareHeart,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  User,
  Send,
  Save,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { formatDate, formatTime, getTriageBadgeColor, getHandlingStatusBadge } from "@/lib/utils";

function CounselingContent() {
  const searchParams = useSearchParams();
  const initialTriage = searchParams.get("triage") || "ALL";
  const initialSessionId = searchParams.get("session") || null;

  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTriage, setFilterTriage] = useState(initialTriage);
  const [filterHandling, setFilterHandling] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Counselor Notes Form state
  const [handlingStatus, setHandlingStatus] = useState("MENUNGGU");
  const [counselorNotes, setCounselorNotes] = useState("");
  const [overrideTriage, setOverrideTriage] = useState("HIJAU");
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSessions = async (selectId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTriage !== "ALL") params.append("triage", filterTriage);
      if (filterHandling !== "ALL") params.append("handling", filterHandling);
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/sessions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);

        // Pilih sesi target
        const targetId = selectId || initialSessionId || data.sessions?.[0]?.id;
        if (targetId) {
          fetchSessionDetail(targetId);
        } else {
          setSelectedSession(null);
        }
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const data = await res.json();
      if (data.success && data.session) {
        setSelectedSession(data.session);
        setHandlingStatus(data.session.handlingStatus || "MENUNGGU");
        setCounselorNotes(data.session.counselorNotes || "");
        setOverrideTriage(data.session.triageLevel || "HIJAU");
      }
    } catch (err) {
      console.error("Error fetching session detail:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [filterTriage, filterHandling, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  const handleToggleSessionStatus = async (newStatus: "ACTIVE" | "CLOSED") => {
    if (!selectedSession) return;
    try {
      setSavingNotes(true);
      const autoHandle = newStatus === "CLOSED" && handlingStatus === "MENUNGGU" ? "SELESAI" : handlingStatus;
      const res = await fetch(`/api/sessions/${selectedSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          handlingStatus: autoHandle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSession((prev: any) => prev ? { ...prev, status: newStatus, handlingStatus: autoHandle } : null);
        if (autoHandle === "SELESAI") setHandlingStatus("SELESAI");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSessions(selectedSession.id);
      }
    } catch (err) {
      console.error("Error toggling session status:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSession) return;
    try {
      setSavingNotes(true);
      const shouldClose = handlingStatus === "SELESAI";
      const res = await fetch(`/api/sessions/${selectedSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handlingStatus,
          counselorNotes,
          triageLevel: overrideTriage,
          ...(shouldClose ? { status: "CLOSED" } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (shouldClose) {
          setSelectedSession((prev: any) => prev ? { ...prev, status: "CLOSED" } : null);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSessions(selectedSession.id);
      }
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Log Konseling & Triase Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat lengkap percakapan siswa di WhatsApp, evaluasi tingkat risiko AI, dan catatan penanganan Guru BK.
          </p>
        </div>

        <button
          onClick={() => fetchSessions(selectedSession?.id)}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Segarkan Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Sesi Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Status Sesi:
            </span>
            {[
              { key: "ALL", label: "Semua" },
              { key: "ACTIVE", label: "🟢 Aktif" },
              { key: "CLOSED", label: "⚪ Selesai" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Triage Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Triase:
            </span>
            {[
              { key: "ALL", label: "Semua" },
              { key: "MERAH", label: "🔴 Merah (Kritis)" },
              { key: "KUNING", label: "🟡 Kuning (Sedang)" },
              { key: "HIJAU", label: "🟢 Hijau (Ringan)" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTriage(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterTriage === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Cari nama, username, atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </form>
      </div>

      {/* Master Detail Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Sessions (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Daftar Sesi ({sessions.length})
            </span>
            <span className="text-[11px] text-slate-400">Urutkan: Terkini</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada sesi konseling yang cocok dengan filter.
              </div>
            ) : (
              sessions.map((item) => {
                const isSelected = selectedSession?.id === item.id;
                const triage = getTriageBadgeColor(item.triageLevel);
                const handling = getHandlingStatusBadge(item.handlingStatus);

                return (
                  <button
                    key={item.id}
                    onClick={() => fetchSessionDetail(item.id)}
                    className={`w-full text-left p-4 transition flex flex-col gap-2 ${
                      isSelected
                        ? "bg-slate-100/80 border-l-4 border-slate-900"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${triage.badge}`}>
                          {item.triageLevel}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          item.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {item.status === "ACTIVE" ? "🟢 Aktif" : "⚪ Selesai"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.updatedAt)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.student?.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.student?.class} • {item.student?.username || item.student?.nisn}
                      </p>
                    </div>

                    {item.summary && (
                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${handling.badge}`}>
                        {handling.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item._count?.messages || 0} pesan
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Session Detail & Chat Viewer (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {!selectedSession ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 h-[750px] flex flex-col items-center justify-center">
              <MessageSquareHeart className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Pilih salah satu sesi konseling</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Klik daftar di sebelah kiri untuk melihat percakapan WhatsApp siswa, evaluasi triase AI, dan mengisi catatan Guru BK.
              </p>
            </div>
          ) : (
            <>
              {/* Student Card & Contact Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-base">
                      {selectedSession.student?.name?.[0] || "S"}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedSession.student?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedSession.student?.class} • {selectedSession.student?.major || "Siswa SMK"} • {selectedSession.student?.username || selectedSession.student?.nisn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedSession.student?.phone && (
                      <a
                        href={`https://wa.me/${selectedSession.student.phone.replace(/^0/, "62")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Chat WA Siswa
                      </a>
                    )}
                    {selectedSession.student?.parentPhone && (
                      <a
                        href={`https://wa.me/${selectedSession.student.parentPhone.replace(/^0/, "62")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Hubungi Ortu
                      </a>
                    )}
                  </div>
                </div>

                {/* AI Triage Analysis Banner */}
                <div className="mt-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                        Analisis Triase AI:
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-md ${getTriageBadgeColor(selectedSession.triageLevel).badge}`}>
                        {selectedSession.triageLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                        selectedSession.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {selectedSession.status === "ACTIVE" ? "🟢 Sedang Aktif" : "⚪ Selesai"}
                      </span>
                      {selectedSession.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => handleToggleSessionStatus("CLOSED")}
                          disabled={savingNotes}
                          className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-xs transition cursor-pointer"
                          title="Tandai sesi ini telah selesai"
                        >
                          Selesaikan Sesi
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleSessionStatus("ACTIVE")}
                          disabled={savingNotes}
                          className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-xs transition cursor-pointer"
                          title="Buka kembali sesi konseling ini"
                        >
                          Buka Kembali
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700">
                    <strong>Indikasi:</strong> {selectedSession.triageReason || "Percakapan konseling rutin"}
                  </p>
                  {selectedSession.summary && (
                    <p className="text-xs text-slate-600 italic">
                      <strong>Ringkasan:</strong> "{selectedSession.summary}"
                    </p>
                  )}
                </div>
              </div>

              {/* Chat Transcript Timeline (WhatsApp Style) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[420px]">
                <div className="p-3.5 border-b border-slate-100 bg-slate-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-bold">Transkrip Percakapan WhatsApp</span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Ollama qwen2.5:7b • Konsel.AI
                  </span>
                </div>

                {/* Message Bubble Container with WhatsApp wallpaper styling */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5]/30">
                  {selectedSession.messages?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada pesan dalam sesi ini.
                    </div>
                  ) : (
                    selectedSession.messages?.map((msg: any) => {
                      const isStudent = msg.sender === "STUDENT";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isStudent ? "items-start" : "items-end"
                          }`}
                        >
                          <div className="text-[10px] font-semibold text-slate-500 mb-1 px-1">
                            {isStudent ? selectedSession.student?.name : "Konsel.AI (Konselor)"}
                          </div>
                          <div
                            className={`max-w-[82%] p-3 rounded-2xl text-xs shadow-sm leading-relaxed ${
                              isStudent
                                ? "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                                : "bg-[#dcf8c6] text-slate-900 rounded-tr-none border border-emerald-200"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1">
                              <span>{formatTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Counselor Handling Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Save className="w-4 h-4 text-slate-700" />
                    Formulir Tindak Lanjut Guru BK
                  </h4>
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Catatan Berhasil Disimpan!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status Penanganan Kasus
                    </label>
                    <select
                      value={handlingStatus}
                      onChange={(e) => setHandlingStatus(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    >
                      <option value="MENUNGGU">Menunggu Tindakan</option>
                      <option value="PROSES">Sedang Ditangani Guru BK</option>
                      <option value="SELESAI">Selesai Ditangani</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      * Memilih <strong>Selesai Ditangani</strong> otomatis menutup sesi konseling ini.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Koreksi Triase (Jika Diperlukan)
                    </label>
                    <select
                      value={overrideTriage}
                      onChange={(e) => setOverrideTriage(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    >
                      <option value="HIJAU">🟢 HIJAU (Ringan / Masalah Sepele)</option>
                      <option value="KUNING">🟡 KUNING (Sedang / Perlu Bimbingan)</option>
                      <option value="MERAH">🔴 MERAH (Kritis / Butuh Tindakan Darurat)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Guru BK / Tindakan Yang Telah Diambil
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Siswa sudah dipanggil ke ruang BK pukul 09:30. Dilakukan konseling empat mata dan telah dikonfirmasi dengan wali kelas..."
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {savingNotes ? "Menyimpan..." : "Simpan Catatan & Update Status"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CounselingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat log konseling...</p>
        </div>
      }
    >
      <CounselingContent />
    </Suspense>
  );
}
