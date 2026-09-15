// src/lib/ollama.ts

interface ChatMessageContext {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TriageResult {
  level: "HIJAU" | "KUNING" | "MERAH";
  reason: string;
  summary: string;
  urgent: boolean;
}

const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL || "https://ai.smksangkuriang1cimahi.sch.id";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

const SYSTEM_PROMPT_COUNSELOR = `Kamu adalah Konsel.AI, asisten konseling digital ramah dan empatik untuk siswa SMK Sangkuriang 1 Cimahi.
Tugas utamamu adalah menjadi teman curhat dan konselor pertama bagi siswa.

PEDOMAN UTAMA KONSELOR:
1. Bersikaplah hangat, suportif, penuh empati, dan tidak menghakimi (non-judgmental).
2. Gunakan gaya bahasa Indonesia yang santun, akrab, dan mudah dipahami siswa SMA/SMK (hindari bahasa kaku atau terlalu akademis). Panggil siswa dengan "kamu" atau sebut namanya bila ada, dan sebut dirimu "Konsel.AI" atau "Kakak/Konselor".
3. Terapkan teknik konseling aktif:
   - Validasi emosi siswa terlebih dahulu (misal: "Kakak paham banget perasaanmu pasti berat ya...", "Wajar kok kalau kamu merasa sedih/kecewa...").
   - Ajukan 1-2 pertanyaan terbuka untuk membantu siswa merefleksikan perasaannya lebih jauh.
   - Jangan langsung memberi nasihat panjang lebar atau ceramah moral di awal curhat.
4. JIKA SISWA MENGINDIKASIKAN PIKIRAN BUNUH DIRI, MELUKAI DIRI (SELF-HARM), PELECEHAN, ATAU KEKERASAN FISIK:
   - Tanggapi dengan sangat tenang, penuh kasih sayang, dan peduli.
   - Katakan bahwa hidupnya sangat berharga dan dia tidak sendirian.
   - Sarankan dengan lembut agar segera bertemu dan berbicara langsung dengan Guru BK di sekolah (Bu/Pak Guru BK) atau orang dewasa yang dipercaya agar bisa dibantu secara langsung.`;

export async function generateCounselingReply(
  studentName: string,
  studentClass: string,
  chatHistory: { sender: string; message: string }[],
  latestStudentMessage: string
): Promise<string> {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL;

  // Format context messages for Ollama /api/chat
  const messages: ChatMessageContext[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT_COUNSELOR}\n\nSiswa yang sedang kamu ajak bicara:\nNama: ${studentName}\nKelas: ${studentClass}`,
    },
  ];

  // Include last 6 turns of history
  const recentHistory = chatHistory.slice(-6);
  for (const item of recentHistory) {
    messages.push({
      role: item.sender === "STUDENT" ? "user" : "assistant",
      content: item.message,
    });
  }

  messages.push({
    role: "user",
    content: latestStudentMessage,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama chat API returned status ${res.status}`);
    }

    const data = await res.json();
    return data.message?.content || "Halo! Konsel.AI siap mendengarkan cerita kamu. Bagaimana perasaanmu hari ini?";
  } catch (error: any) {
    console.error("Error calling Ollama chat:", error?.message || error);
    // Fallback response if network / timeout occurs
    return (
      "Halo, terima kasih sudah mau berbagi cerita dengan Konsel.AI. Ceritakan apa saja yang sedang membebani pikiranmu saat ini, kakak siap mendengarkan dengan sepenuh hati."
    );
  }
}

// Emergency safety words for immediate red triage detection
const EMERGENCY_KEYWORDS = [
  "bunuh diri",
  "mati aja",
  "pengen mati",
  "mau mati",
  "akhiri hidup",
  "self harm",
  "lukai diri",
  "sayat tangan",
  "potong urat",
  "minum racun",
  "gantung diri",
  "lompat dari",
  "diperkosa",
  "pelecehan seksual",
  "dipukuli terus",
  "disiksa",
  "diancam dibunuh",
];

const WARNING_KEYWORDS = [
  "stres berat",
  "depresi",
  "gak kuat lagi",
  "frustasi",
  "dibully",
  "diejek terus",
  "diasingkan",
  "takut masuk sekolah",
  "bolos",
  "orang tua cerai",
  "berantem hebat",
  "panik berlebih",
  "susah tidur seminggu",
  "menangis terus",
];

export async function evaluateTriage(
  studentMessage: string,
  chatHistory: { sender: string; message: string }[] = []
): Promise<TriageResult> {
  const lowerMsg = studentMessage.toLowerCase();

  // Fast Rule-Based Emergency Fallback
  for (const kw of EMERGENCY_KEYWORDS) {
    if (lowerMsg.includes(kw)) {
      return {
        level: "MERAH",
        reason: `Terdeteksi indikasi bahaya kritis/keselamatan diri (${kw})`,
        summary: `Siswa mengungkapkan indikasi krisis (${kw}). Butuh penanganan darurat dari Guru BK segera.`,
        urgent: true,
      };
    }
  }

  // Ollama evaluation
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || DEFAULT_MODEL;

  const conversationSnippet = [
    ...chatHistory.slice(-4).map((m) => `${m.sender}: ${m.message}`),
    `STUDENT: ${studentMessage}`,
  ].join("\n");

  const prompt = `Analisis percakapan konseling siswa sekolah berikut ini dan lakukan triase tingkat keparahan masalah:

PERCAKAPAN:
${conversationSnippet}

KATEGORI TRIASE:
- MERAH: Masalah darurat keselamatan diri/orang lain (keinginan bunuh diri, melukai diri/self harm, kekerasan fisik/seksual berat, depresi akut berat).
- KUNING: Masalah sedang yang butuh perhatian konselor (stres akademik tinggi, perundungan verbal, masalah keluarga berat, bolos sekolah, cemas berat, rasa tertekan).
- HIJAU: Masalah ringan/sepele (curhat tugas harian, bingung memilih jurusan/hobi, pertemanan ringan, obrolan santai, grogi ujian wajar).

BERIKAN JAWABAN HANYA DALAM FORMAT JSON BERIKUT TANPA TEKS LAIN:
{
  "level": "HIJAU" | "KUNING" | "MERAH",
  "reason": "Alasan singkat klasifikasi dalam bahasa Indonesia",
  "summary": "Ringkasan 1-2 kalimat mengenai masalah utama siswa"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        format: "json",
        stream: false,
        options: {
          temperature: 0.1,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawText = data.response || "{}";
      const parsed = JSON.parse(rawText);

      let level: "HIJAU" | "KUNING" | "MERAH" = "HIJAU";
      if (parsed.level === "MERAH" || parsed.level === "KUNING" || parsed.level === "HIJAU") {
        level = parsed.level;
      }

      return {
        level,
        reason: parsed.reason || `Klasifikasi otomatis AI: ${level}`,
        summary: parsed.summary || studentMessage.slice(0, 150),
        urgent: level === "MERAH",
      };
    }
  } catch (error) {
    console.error("Error in AI triage evaluation:", error);
  }

  // Fallback to warning keyword check if AI call fails
  for (const kw of WARNING_KEYWORDS) {
    if (lowerMsg.includes(kw)) {
      return {
        level: "KUNING",
        reason: `Terdeteksi indikasi masalah sedang (${kw})`,
        summary: `Siswa menyampaikan keluhan terkait ${kw}. Memerlukan perhatian dari Guru BK.`,
        urgent: false,
      };
    }
  }

  return {
    level: "HIJAU",
    reason: "Curhat harian atau masalah ringan.",
    summary: studentMessage.slice(0, 150),
    urgent: false,
  };
}
