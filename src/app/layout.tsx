import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Konsel.AI - Portal Guru BK SMK Sangkuriang 1 Cimahi",
  description:
    "Sistem Pemantauan Konseling AI, Triase Masalah Siswa (Hijau, Kuning, Merah), dan Notifikasi WhatsApp Otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}

