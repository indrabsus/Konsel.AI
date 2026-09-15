"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Code,
  Copy,
  Check,
  RefreshCw,
  Phone,
  Server,
  Bell,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    WA_GATEWAY_URL: "https://api.fonnte.com/send",
    WA_GATEWAY_TOKEN: "",
    WA_GURU_BK_NUMBER: "",
    NOTIF_ALERT_LEVEL: "ALL",
    OLLAMA_BASE_URL: "https://ai.smksangkuriang1cimahi.sch.id",
    OLLAMA_MODEL: "qwen2.5:7b",
  });
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
        setNotificationLogs(data.notificationLogs || []);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlertInfo(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertInfo({ type: "success", text: "Pengaturan berhasil disimpan ke sistem." });
      } else {
        setAlertInfo({ type: "error", text: data.message || "Gagal menyimpan." });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", text: err?.message || "Kesalahan server." });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setTestingWa(true);
    setAlertInfo(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_wa" }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertInfo({
          type: "success",
          text: "Pesan uji coba WhatsApp berhasil diproses! Periksa log notifikasi di bawah.",
        });
        fetchSettings();
      } else {
        setAlertInfo({
          type: "error",
          text: `Gagal kirim notifikasi: ${data.message}`,
        });
      }
    } catch (err: any) {
      setAlertInfo({ type: "error", text: err?.message || "Kesalahan jaringan." });
    } finally {
      setTestingWa(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const sampleBotCode = `// Contoh Integrasi WhatsApp Bot (Node.js / Baileys)
const KONSEL_API_URL = "http://localhost:3000"; // Ganti dengan URL domain web portal Konsel.AI

// 1. Ketika Siswa Memilih Menu Konsel.AI dan Mengirim NISN & Password:
async function loginStudent(username, password, phone) {
  const response = await fetch(\`\${KONSEL_API_URL}/api/bot/auth\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, phone })
  });
  return await response.json();
  // Mengembalikan: { success: true, sessionId: "...", message: "...", student: {...} }
}

// 2. Ketika Siswa Mengirimkan Pesan Curhat:
async function sendCounselingMessage(sessionId, studentId, message) {
  const response = await fetch(\`\${KONSEL_API_URL}/api/bot/chat\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, studentId, message })
  });
  return await response.json();
  // Mengembalikan: { success: true, reply: "...", triage: "HIJAU"|"KUNING"|"MERAH" }
}

// 3. Ketika Siswa Ingin Mengakhiri Konseling (misal ketik "SELESAI"):
async function endCounseling(sessionId) {
  const response = await fetch(\`\${KONSEL_API_URL}/api/bot/end\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId })
  });
  return await response.json();
}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600" />
          Pengaturan Sistem & Integrasi WhatsApp Bot
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Konfigurasikan gateway notifikasi WhatsApp ke Guru BK, server Ollama AI, serta dokumentasi API untuk bot WhatsApp.
        </p>
      </div>

      {alertInfo && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border ${
            alertInfo.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {alertInfo.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          {alertInfo.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: WhatsApp & AI Settings (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Konfigurasi Notifikasi WhatsApp Guru BK
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Guru BK (Penerima Notifikasi) *
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={settings.WA_GURU_BK_NUMBER}
                  onChange={(e) =>
                    setSettings({ ...settings, WA_GURU_BK_NUMBER: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nomor ini akan menerima pesan otomatis setiap kali siswa melakukan konseling atau terdeteksi risiko bahaya.
                </p>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    URL WhatsApp Gateway API
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          WA_GATEWAY_URL: "https://bot.smksangkuriang1cimahi.sch.id/wa/kirim",
                        })
                      }
                      className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200 transition"
                    >
                      Preset: Bot Sekolah
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          WA_GATEWAY_URL: "https://api.fonnte.com/send",
                        })
                      }
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded transition"
                    >
                      Fonnte
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="https://bot.smksangkuriang1cimahi.sch.id/wa/kirim"
                  value={settings.WA_GATEWAY_URL}
                  onChange={(e) =>
                    setSettings({ ...settings, WA_GATEWAY_URL: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung endpoint <code>/wa/kirim</code> (Bot Baileys internal sekolah) maupun <code>https://api.fonnte.com/send</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Token / API Key WhatsApp (Opsional jika bot internal tidak diproteksi)
                </label>
                <input
                  type="password"
                  placeholder="Masukkan token akun Fonnte Anda..."
                  value={settings.WA_GATEWAY_TOKEN}
                  onChange={(e) =>
                    setSettings({ ...settings, WA_GATEWAY_TOKEN: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Jika dikosongkan, pesan notifikasi tetap tercatat di Log Riwayat sistem Konsel.AI untuk simulasi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Triase Yang Memicu Notifikasi WhatsApp
                </label>
                <select
                  value={settings.NOTIF_ALERT_LEVEL}
                  onChange={(e) =>
                    setSettings({ ...settings, NOTIF_ALERT_LEVEL: e.target.value })
                  }
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ALL">Semua Kasus (🟢 Hijau, 🟡 Kuning, 🔴 Merah)</option>
                  <option value="KUNING_MERAH">Kasus Sedang & Kritis (🟡 Kuning + 🔴 Merah)</option>
                  <option value="MERAH_ONLY">Hanya Kasus Darurat Kritis (🔴 Merah Saja)</option>
                </select>
              </div>
            </div>

            {/* AI Server Config */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                Konfigurasi Ollama AI Server
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={settings.OLLAMA_BASE_URL}
                  onChange={(e) =>
                    setSettings({ ...settings, OLLAMA_BASE_URL: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Model LLM
                </label>
                <input
                  type="text"
                  value={settings.OLLAMA_MODEL}
                  onChange={(e) =>
                    setSettings({ ...settings, OLLAMA_MODEL: e.target.value })
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={testingWa}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {testingWa ? "Menguji..." : "Kirim Uji Coba WA"}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </form>

          {/* Notification Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                Riwayat Log Pengiriman Notifikasi WhatsApp
              </h3>
              <button
                onClick={fetchSettings}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notificationLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Belum ada riwayat notifikasi terkirim.
                </p>
              ) : (
                notificationLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">
                        {log.recipient}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          log.status === "SENT"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.status === "SIMULATED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                      "{log.message.replace(/\n/g, " ")}"
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Documentation: Bot WhatsApp API Guide (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              Panduan Integrasi WhatsApp Bot (API Endpoints)
            </h3>
            <button
              onClick={() => copyToClipboard(sampleBotCode, "code")}
              className="text-xs flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {copiedIndex === "code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === "code" ? "Disalin!" : "Salin Kode"}
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Bot WhatsApp Anda (Baileys / Node.js / Python / Wablas) cukup memanggil endpoint REST API Konsel.AI berikut untuk mengautentikasi siswa dan menjalankan percakapan konseling AI:
          </p>

          <div className="space-y-3 text-xs">
            {/* 1. Auth Endpoint */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">POST /api/bot/auth</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">
                  Login Siswa
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Kirim Username dan password yang dimasukkan siswa di WhatsApp:
              </p>
              <pre className="text-[10px] bg-slate-900/80 p-2 rounded text-slate-300 overflow-x-auto font-mono">
                {`{\n  "username": "657abyanjih",\n  "password": "password",\n  "phone": "081234567890"\n}`}
              </pre>
            </div>

            {/* 2. Chat Endpoint */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-indigo-400 font-bold">POST /api/bot/chat</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded">
                  Kirim Curhat
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Kirim pesan siswa. Sistem otomatis membalas dan mengevaluasi triase:
              </p>
              <pre className="text-[10px] bg-slate-900/80 p-2 rounded text-slate-300 overflow-x-auto font-mono">
                {`{\n  "sessionId": "clxxx...",\n  "message": "Aku stres banget tugas numpuk..."\n}`}
              </pre>
              <p className="text-[10px] text-slate-400">
                Respon akan berisi balasan konseling AI dan status <code>triage: "HIJAU"|"KUNING"|"MERAH"</code>.
              </p>
            </div>

            {/* 3. End Endpoint */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-amber-400 font-bold">POST /api/bot/end</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">
                  Tutup Sesi
                </span>
              </div>
              <pre className="text-[10px] bg-slate-900/80 p-2 rounded text-slate-300 overflow-x-auto font-mono">
                {`{ "sessionId": "clxxx..." }`}
              </pre>
            </div>
          </div>

          {/* Full Code Sample */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">
              Contoh Implementasi Lengkap (JavaScript / Node.js):
            </span>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-200 overflow-x-auto leading-relaxed max-h-72">
              {sampleBotCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
