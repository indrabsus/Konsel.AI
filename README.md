# Konsel.AI - Sistem Bimbingan Konseling & Triase Siswa Berbasis AI
**SMK Sangkuriang 1 Cimahi**

Aplikasi web berbasis Next.js (App Router) untuk Admin / Guru Bimbingan Konseling (BK) yang terintegrasi langsung dengan WhatsApp Bot siswa dan server Ollama (`qwen2.5:7b` di `https://ai.smksangkuriang1cimahi.sch.id`).

---

## 🌟 Fitur Utama

1. **Autentikasi Siswa di WhatsApp Bot (`/api/bot/auth`)**:
   - Siswa memilih opsi **Konsel.AI** di WhatsApp Bot (atau ketik `bk` / `konsel`).
   - Siswa memasukkan **NISN** atau **Username** dan **kata sandi** akun Sakuci mereka.
   - Terintegrasi langsung dengan database **`sakuciserver@103.158.96.244`** (`/www/wwwroot/sakuci_express/`), mencakup **1.200+ siswa aktif**.
   - Mendukung verifikasi password hash bcrypt maupun fallback password.
   - Jika gagal, bot menolak akses. Jika berhasil, sesi konseling aktif dibuka dan nama serta kelas siswa langsung dikenali.

2. **Konselor AI Berempati & Triase Otomatis (`/api/bot/chat`)**:
   - Terhubung langsung dengan Ollama `qwen2.5:7b`.
   - Menggunakan prompt psikologi konseling ramah remaja (mendengar aktif, validasi emosi, non-judgmental).
   - Mengklasifikasikan keparahan masalah secara otomatis:
     - 🟢 **Hijau (Ringan)**: Curhat sepele/harian (tugas, grogi ujian, pertemanan ringan).
     - 🟡 **Kuning (Sedang)**: Butuh perhatian BK (stres berat, malas masuk/bolos, konflik keluarga, perundungan).
     - 🔴 **Merah (Kritis)**: Tindakan darurat (keinginan bunuh diri, melukai diri/self-harm, kekerasan fisik/seksual, depresi akut).

3. **Notifikasi WhatsApp Otomatis ke Guru BK**:
   - Saat terdeteksi status **MERAH (Kritis)** atau sesi baru, sistem otomatis mengirimkan pesan peringatan WhatsApp ke nomor Guru BK melalui gateway (Fonnte / Webhook).
   - Guru BK dapat langsung melihat identitas siswa, kelas, alasan triase, dan pesan terakhir siswa.

4. **Portal Web Guru BK**:
   - **Dashboard**: Statistik realtime konseling, pemantauan kasus darurat (banner merah interaktif).
   - **Log Konseling & Triase**: Transkrip lengkap percakapan WhatsApp siswa vs AI, filter triase, dan formulir pengisian catatan penanganan Guru BK.
   - **Manajemen Akun Siswa**: Tambah/ubah/hapus akun siswa dan lihat/ubah kata sandi untuk login WA.
   - **Simulator Konsel.AI**: Uji coba chat WhatsApp dan triase langsung dari browser tanpa perlu membuka HP.
   - **Pengaturan & API Bot**: Konfigurasi token WhatsApp gateway, nomor Guru BK, server Ollama, dan dokumentasi API.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Kebutuhan Sistem
- Node.js v18+ atau v20+ / v22+
- Akses internet ke server Ollama: `https://ai.smksangkuriang1cimahi.sch.id`

### 2. Instalasi Dependensi & Database
```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Menjalankan Mode Development
```bash
npm run dev
```
Buka browser di: **`http://localhost:3000`**

### 4. Menjalankan Mode Production
```bash
npm run build
npm run start
```

---

## 🔑 Data Akun Awal (Seeded)

### Akun Guru BK / Admin
- **Username**: `gurubk`
- **Password**: `adminbk_sangkuriang`

### Akun Contoh Siswa (Untuk Login di Bot WA)
| NISN (Username WA) | Nama Siswa | Kelas | Password WA |
| :--- | :--- | :--- | :--- |
| `20240101` | Ahmad Rizky Pratama | XII RPL 1 | `siswa123` |
| `20240102` | Nabila Putri Azzahra | XI TKJ 2 | `siswa123` |
| `20240103` | Bima Arya Sena | X DKV 1 | `siswa123` |
| `20240104` | Cindy Claudia | XII AKL 2 | `siswa123` |
| `20240105` | Dimas Febrianto | XI TBSM 1 | `siswa123` |

---

## 🤖 Dokumentasi Integrasi Bot WhatsApp

Bot WhatsApp Anda cukup memanggil REST API berikut:

### 1. Validasi Login Siswa
- **Endpoint**: `POST /api/bot/auth`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "username": "20240101",
  "password": "siswa123",
  "phone": "081234567891"
}
```
- **Respon Berhasil**:
```json
{
  "success": true,
  "message": "✅ Selamat datang, Ahmad Rizky Pratama (XII RPL 1)!...",
  "sessionId": "cmu2...",
  "student": { "id": "...", "name": "...", "class": "..." }
}
```

### 2. Kirim Pesan Curhat Siswa
- **Endpoint**: `POST /api/bot/chat`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "sessionId": "cmu2...",
  "message": "Kak, aku pusing banget tugas sekolah numpuk..."
}
```
- **Respon AI**:
```json
{
  "success": true,
  "reply": "Halo Ahmad, wajar banget kalau kamu merasa pusing...",
  "sessionId": "cmu2...",
  "triage": "HIJAU",
  "triageReason": "Curhat tugas sekolah harian",
  "urgent": false
}
```

### 3. Akhiri Sesi Konseling
- **Endpoint**: `POST /api/bot/end`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "sessionId": "cmu2..."
}
```

---

## 📲 Pengaturan Notifikasi WhatsApp Guru BK

1. Buka menu **Pengaturan & API Bot** di web portal (`/settings`).
2. Masukkan **Nomor WhatsApp Guru BK** (contoh: `081234567890`).
3. Masukkan **Token API Fonnte / Gateway** Anda.
4. Klik tombol **Kirim Uji Coba WA** untuk menguji pengiriman pesan.
5. Bila ada siswa dengan status **MERAH (Kritis)**, Guru BK akan segera menerima pesan peringatan darurat.
