"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Bot,
  Send,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Phone,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import { getTriageBadgeColor } from "@/lib/utils";

interface ChatMessageItem {
  id: string;
  sender: "STUDENT" | "AI" | "SYSTEM";
  message: string;
  time: string;
  triage?: string;
}

export default function SimulatorPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [phone, setPhone] = useState("081234567891");

  const [authSession, setAuthSession] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [currentTriage, setCurrentTriage] = useState<any>({
    level: "HIJAU",
    reason: "Menunggu interaksi siswa...",
    summary: "Belum ada analisis.",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load student options for quick pick
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.students?.length) {
          setStudents(data.students);
          setSelectedUsername(data.students[0].username || data.students[0].nisn || "");
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleStudentSelect = (user: string) => {
    const s = students.find((item) => (item.username || item.nisn) === user);
    if (s) {
      setSelectedUsername(s.username || s.nisn);
      setPassword("123456");
      setPhone(s.phone || "081234567890");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/bot/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedUsername,
          password,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || "Gagal masuk. Periksa username dan password.");
      } else {
        setAuthSession(data);
        const timeNow = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setMessages([
          {
            id: "system-1",
            sender: "SYSTEM",
            message: `🔐 Autentikasi Berhasil! Siswa terhubung: ${data.student?.name} (${data.student?.class})`,
            time: timeNow,
          },
          {
            id: "welcome-1",
            sender: "AI",
            message: data.message,
            time: timeNow,
          },
        ]);
        setCurrentTriage({
          level: "HIJAU",
          reason: "Sesi konseling baru dimulai.",
          summary: "Siswa telah masuk dan membuka ruang konseling.",
        });
      }
    } catch (err: any) {
      setAuthError(err?.message || "Kesalahan jaringan.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || !authSession?.sessionId || sending) return;

    const timeNow = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessageItem = {
      id: "msg-" + Date.now(),
      sender: "STUDENT",
      message: textToSend,
      time: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/bot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: authSession.sessionId,
          studentId: authSession.student?.id,
          message: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: ChatMessageItem = {
          id: "ai-" + Date.now(),
          sender: "AI",
          message: data.reply,
          time: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          triage: data.triage,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setCurrentTriage({
          level: data.triage,
          reason: data.triageReason,
          summary: textToSend,
          urgent: data.urgent,
        });
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "err-" + Date.now(),
            sender: "SYSTEM",
            message: `⚠️ Gagal menerima balasan: ${data.message}`,
            time: timeNow,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "SYSTEM",
          message: `⚠️ Kesalahan koneksi: ${err?.message}`,
          time: timeNow,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!authSession?.sessionId) return;
    try {
      const res = await fetch("/api/bot/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: authSession.sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: "end-" + Date.now(),
            sender: "SYSTEM",
            message: `🔒 Sesi konseling telah diakhiri. Data tersimpan di log Guru BK.`,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setAuthSession(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triageBadge = getTriageBadgeColor(currentTriage.level);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Bot className="w-7 h-7 text-indigo-600" />
          Simulator WhatsApp Bot & Triase Konsel.AI
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Uji coba alur konseling siswa mulai dari login NISN & kata sandi hingga respon empati konselor AI dan deteksi triase otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Simulation WhatsApp Device (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden flex flex-col h-[740px]">
          {/* Mock WhatsApp Header */}
          <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Avatar Bot Konsel.AI"
                  width={36}
                  height={36}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  Konsel.AI • SMK Sangkuriang 1
                  <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-200">
                    Bot Resmi BK
                  </span>
                </h3>
                {sending ? (
                  <p className="text-[11px] text-emerald-200 font-semibold italic flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    sedang mengetik...
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    Online (Qwen 2.5:7b)
                  </p>
                )}
              </div>
            </div>

            {authSession && (
              <button
                onClick={handleEndSession}
                className="px-2.5 py-1 text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Selesai Sesi
              </button>
            )}
          </div>

          {/* WhatsApp Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5]/40 relative">
            {!authSession ? (
              /* LOGIN STATE */
              <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-2xl shadow-md border border-slate-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Mulai Sesi Konsel.AI
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Di WhatsApp, siswa akan diminta memasukkan username dan kata sandi akun Sakuci.
                  </p>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {authError}
                  </div>
                )}

                {/* Quick select student */}
                <div className="text-left space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Pilih Siswa Contoh:</label>
                  <select
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    value={selectedUsername}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {students.map((s) => {
                      const user = s.username || s.nisn;
                      return (
                        <option key={s.id || user} value={user}>
                          {s.name} ({s.class}) - Username: {user}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <form onSubmit={handleLogin} className="space-y-3 text-left">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Username Akun Sakuci:</label>
                    <input
                      type="text"
                      required
                      value={selectedUsername}
                      onChange={(e) => setSelectedUsername(e.target.value)}
                      placeholder="Contoh: 572abduroh"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Password Siswa (Default: 123456):</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123456"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-[#075e54] hover:bg-[#128c7e] text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                  >
                    {authLoading ? "Memverifikasi..." : "Login Siswa & Buka Konsel.AI"}
                  </button>
                </form>
              </div>
            ) : (
              /* ACTIVE CHAT STATE */
              <>
                {messages.map((m) => {
                  if (m.sender === "SYSTEM") {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <span className="inline-block px-3 py-1 bg-slate-200/80 text-slate-700 text-[10px] font-medium rounded-full shadow-sm">
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  const isStudent = m.sender === "STUDENT";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStudent ? "items-end" : "items-start"}`}
                    >
                      <div className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                        {isStudent ? authSession.student?.name : "Konsel.AI"}
                      </div>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm leading-relaxed ${
                          isStudent
                            ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none border border-emerald-200"
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.message}</p>
                        <div className="text-[10px] text-slate-400 text-right mt-1">
                          {m.time}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sending && (
                  <div className="flex flex-col items-start">
                    <div className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                      Konsel.AI
                    </div>
                    <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none text-xs shadow-sm border border-slate-200 flex items-center gap-2.5">
                      <span className="text-slate-600 font-medium text-[11px]">sedang mengetik</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Mock WhatsApp Chat Input Bar */}
          {authSession && (
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ketik pesan curhat siswa di sini..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={sending}
                className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-[#075e54] hover:bg-[#128c7e] text-white transition disabled:opacity-50 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Realtime AI Triage & Test Cases (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Triage Indicator Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Hasil Triase Realtime AI
                </h3>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${triageBadge.badge}`}>
                {currentTriage.level}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                KATEGORI RISIKO:
              </span>
              <div className={`p-3 rounded-xl border text-xs font-semibold ${triageBadge.bg}`}>
                {triageBadge.label}
                <p className="text-[11px] font-normal mt-0.5">{triageBadge.description}</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                ALASAN TRIASE:
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {currentTriage.reason || "Belum ada alasan."}
              </p>
            </div>

            {currentTriage.level === "MERAH" && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Notifikasi WhatsApp Terpicu!
                </div>
                <p className="text-[11px] leading-relaxed">
                  Sistem otomatis mengirimkan pesan darurat berprioritas tinggi ke nomor WhatsApp Guru BK agar siswa segera mendapatkan pertolongan langsung.
                </p>
              </div>
            )}
          </div>

          {/* Instant Test Scenarios */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900">
                Uji Kasus Langsung (1-Klik)
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Klik tombol di bawah untuk menyimulasikan berbagai skenario curhat siswa dan melihat bagaimana AI merespons:
            </p>

            <div className="space-y-2 pt-1">
              <button
                disabled={!authSession || sending}
                onClick={() =>
                  handleSendMessage("Halo kak, aku mau tanya tips membagi waktu belajar dan ngerjain tugas kejuruan biar gak keteteran dong.")
                }
                className="w-full text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs transition disabled:opacity-50"
              >
                <div className="font-bold text-emerald-800 flex items-center justify-between">
                  <span>🟢 Uji Kasus Sepele / Ringan (Hijau)</span>
                  <span className="text-[10px] text-emerald-600">Kirim ➜</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 line-clamp-1">
                  "Tips membagi waktu belajar dan ngerjain tugas kejuruan..."
                </p>
              </button>

              <button
                disabled={!authSession || sending}
                onClick={() =>
                  handleSendMessage("Kak, aku tertekan banget tiap malam gak bisa tidur mikirin nilai ujian. Orang tua nuntut harus masuk 3 besar terus, rasanya cemas banget.")
                }
                className="w-full text-left p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-xs transition disabled:opacity-50"
              >
                <div className="font-bold text-amber-800 flex items-center justify-between">
                  <span>🟡 Uji Kasus Sedang (Kuning)</span>
                  <span className="text-[10px] text-amber-600">Kirim ➜</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1 line-clamp-1">
                  "Tertekan tiap malam gak bisa tidur mikirin nilai ujian dan ekspektasi ortu..."
                </p>
              </button>

              <button
                disabled={!authSession || sending}
                onClick={() =>
                  handleSendMessage("Kak, aku capek banget sama hidup ini... gak ada yang peduli dan aku pengen akhiri hidup aja rasanya.")
                }
                className="w-full text-left p-3 rounded-xl border border-red-300 bg-red-50/70 hover:bg-red-50 text-xs transition disabled:opacity-50"
              >
                <div className="font-bold text-red-900 flex items-center justify-between">
                  <span>🔴 Uji Kasus Kritis / Bahaya (Merah)</span>
                  <span className="text-[10px] text-red-600">Kirim ➜</span>
                </div>
                <p className="text-[11px] text-red-700 mt-1 line-clamp-1">
                  "Capek banget... pengen akhiri hidup aja rasanya..."
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
