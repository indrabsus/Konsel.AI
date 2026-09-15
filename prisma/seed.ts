// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial data for Konsel.AI...");

  // 1. Admin / Guru BK
  const admin = await prisma.adminUser.upsert({
    where: { username: "gurubk" },
    update: {},
    create: {
      username: "gurubk",
      name: "Ibu Rahmawati, S.Pd., Kons. (Guru BK)",
      password: "adminbk_sangkuriang",
      role: "GURU_BK",
    },
  });
  console.log("Seeded Admin:", admin.username);

  // 2. Default System Settings
  const defaultSettings = [
    { key: "WA_GATEWAY_URL", value: "https://api.fonnte.com/send", description: "URL WhatsApp Gateway (Fonnte/Webhook)" },
    { key: "WA_GATEWAY_TOKEN", value: "", description: "Token API WhatsApp Gateway" },
    { key: "WA_GURU_BK_NUMBER", value: "081234567890", description: "Nomor WhatsApp Guru BK penerima notifikasi" },
    { key: "NOTIF_ALERT_LEVEL", value: "ALL", description: "Tingkat triase yang memicu notifikasi: ALL, KUNING_MERAH, MERAH_ONLY" },
    { key: "OLLAMA_BASE_URL", value: "https://ai.smksangkuriang1cimahi.sch.id", description: "URL Server Ollama AI" },
    { key: "OLLAMA_MODEL", value: "qwen2.5:7b", description: "Model LLM Ollama" },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // 3. Students
  const students = [
    {
      nisn: "20240101",
      name: "Ahmad Rizky Pratama",
      class: "XII RPL 1",
      major: "Rekayasa Perangkat Lunak",
      password: "siswa123",
      phone: "081234567891",
      parentPhone: "081299990001",
    },
    {
      nisn: "20240102",
      name: "Nabila Putri Azzahra",
      class: "XI TKJ 2",
      major: "Teknik Komputer & Jaringan",
      password: "siswa123",
      phone: "081234567892",
      parentPhone: "081299990002",
    },
    {
      nisn: "20240103",
      name: "Bima Arya Sena",
      class: "X DKV 1",
      major: "Desain Komunikasi Visual",
      password: "siswa123",
      phone: "081234567893",
      parentPhone: "081299990003",
    },
    {
      nisn: "20240104",
      name: "Cindy Claudia",
      class: "XII AKL 2",
      major: "Akuntansi & Keuangan Lembaga",
      password: "siswa123",
      phone: "081234567894",
      parentPhone: "081299990004",
    },
    {
      nisn: "20240105",
      name: "Dimas Febrianto",
      class: "XI TBSM 1",
      major: "Teknik Bisnis Sepeda Motor",
      password: "siswa123",
      phone: "081234567895",
      parentPhone: "081299990005",
    },
  ];

  for (const stu of students) {
    await prisma.student.upsert({
      where: { nisn: stu.nisn },
      update: {},
      create: stu,
    });
  }
  console.log("Seeded 5 sample students");

  // 4. Sample Counseling Sessions with Triase Examples
  const student1 = await prisma.student.findUnique({ where: { nisn: "20240101" } });
  const student2 = await prisma.student.findUnique({ where: { nisn: "20240102" } });
  const student3 = await prisma.student.findUnique({ where: { nisn: "20240103" } });

  if (student1) {
    const sessionHijau = await prisma.counselingSession.create({
      data: {
        studentId: student1.id,
        status: "CLOSED",
        triageLevel: "HIJAU",
        triageReason: "Curhat ringan mengenai manajemen waktu tugas dan persiapan PKL",
        handlingStatus: "SELESAI",
        summary: "Siswa merasa agak kewalahan membagi waktu antara tugas kejuruan dan persiapan PKL, namun sudah mendapatkan saran strategi jadwal.",
        counselorNotes: "Sudah diberikan motivasi dan lembar perencana belajar mingguan. Siswa merasa lebih tenang.",
        messages: {
          create: [
            { sender: "STUDENT", message: "Halo kak, aku mau cerita dikit nih soal tugas sekolah yang numpuk." },
            { sender: "AI", message: "Halo Ahmad! Terima kasih sudah mau bercerita. Wajar banget kalau di kelas XII ini tugas mulai terasa padat. Bagian mana yang paling bikin kamu kewalahan?" },
            { sender: "STUDENT", message: "Proyek akhir koding kak, kadang bingung mau mulai dari mana." },
            { sender: "AI", message: "Paham banget, proyek koding memang butuh fokus bertahap. Coba pecah jadi modul-modul kecil ya. Kamu pasti bisa melaluinya langkah demi langkah!" },
          ],
        },
      },
    });
  }

  if (student2) {
    const sessionKuning = await prisma.counselingSession.create({
      data: {
        studentId: student2.id,
        status: "ACTIVE",
        triageLevel: "KUNING",
        triageReason: "Stres berlebih menghadapi ujian kejuruan dan tekanan nilai dari orang tua",
        handlingStatus: "PROSES",
        summary: "Siswa mengalami kecemasan tinggi dan sulit tidur karena takut nilainya tidak memenuhi ekspektasi keluarga.",
        counselorNotes: "Siswa sudah dipanggil ke ruang BK pada jam istirahat pertama untuk sesi relaksasi dan konseling tatap muka.",
        messages: {
          create: [
            { sender: "STUDENT", message: "Kak, aku takut banget tiap malam gak bisa tidur mikirin ujian minggu depan." },
            { sender: "AI", message: "Halo Nabila, terima kasih sudah berani mengungkapkan ini. Perasaan cemas seperti ini sangat melelahkan ya. Apa yang paling kamu cemaskan dari ujian tersebut?" },
            { sender: "STUDENT", message: "Takut nilainya jelek terus orang tua kecewa berat kak..." },
            { sender: "AI", message: "Kakak paham beban harapan keluarga memang terasa berat di pundakmu. Tapi ingat, kesehatan mental dan fisikmu juga sangat berharga. Nanti kita jadwalkan ngobrol santai dengan Guru BK di sekolah ya." },
          ],
        },
      },
    });
  }

  if (student3) {
    const sessionMerah = await prisma.counselingSession.create({
      data: {
        studentId: student3.id,
        status: "ACTIVE",
        triageLevel: "MERAH",
        triageReason: "Terdeteksi indikasi depresi berat dan ungkapan keputusasaan hidup",
        handlingStatus: "MENUNGGU",
        summary: "Siswa mengungkapkan rasa putus asa yang mendalam, merasa tidak ada gunanya lagi hidup karena masalah perundungan dan keluarga.",
        counselorNotes: "PERHATIAN KRITIS: Notifikasi WA terkirim ke Guru BK. Segera lakukan pendampingan fisik langsung di kelas.",
        messages: {
          create: [
            { sender: "STUDENT", message: "Kak, rasanya aku capek banget sama semuanya... kayaknya kalau aku gak ada, semua bakal lebih baik." },
            { sender: "AI", message: "Bima, kakak mendengarmu dan kakak sangat peduli dengan apa yang kamu rasakan saat ini. Kamu sangat berharga, dan kamu tidak sendirian. Jangan simpan rasa sakit ini sendiri ya. Tolong tetap aman, sebentar lagi guru BK kita akan mendampingimu." },
          ],
        },
      },
    });
  }

  console.log("Seeded counseling sessions with HIJAU, KUNING, MERAH cases.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
