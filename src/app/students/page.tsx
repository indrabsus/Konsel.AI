"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  Phone,
  CheckCircle,
  RefreshCw,
  X,
  GraduationCap,
} from "lucide-react";

const ALL_ACTIVE_CLASSES = [
  "AK 1", "AK 2", "AKL 1", "AKL 2",
  "BDP 1", "BDP 2", "BR 1", "BR 2", "BR 3",
  "MPLB 1", "MPLB 2", "MPLB 3", "MPLB 4",
  "PM 1", "PM 2", "PM 3",
  "PPLG 1", "PPLG 2", "PPLG 3", "PPLG 4"
];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState<number>(0); // 0 = Semua siswa aktif
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [form, setForm] = useState({
    username: "",
    name: "",
    className: "",
    major: "",
    phone: "",
    parentPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchStudents = async (
    page = currentPage,
    limit = pageSize,
    searchVal = search,
    cls = classFilter
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchVal.trim()) params.append("search", searchVal.trim());
      if (cls !== "ALL") params.append("class", cls);
      if (page) params.append("page", String(page));
      params.append("limit", String(limit));

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        if (data.pagination) {
          setTotalCount(data.pagination.total);
          setTotalPages(data.pagination.totalPages || 1);
          setCurrentPage(data.pagination.page || 1);
        } else {
          setTotalCount((data.students || []).length);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, pageSize, search, classFilter);
  }, [classFilter]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchStudents(1, pageSize, search, classFilter);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setPageSize(newLimit);
    setCurrentPage(1);
    fetchStudents(1, newLimit, search, classFilter);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({
      username: "",
      name: "",
      className: "XII RPL 1",
      major: "Rekayasa Perangkat Lunak",
      phone: "",
      parentPhone: "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setForm({
      username: student.username || student.nisn || "",
      name: student.name,
      className: student.class,
      major: student.major || "",
      phone: student.phone || "",
      parentPhone: student.parentPhone || "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleResetPassword = async (stu: any) => {
    const studentUser = stu.username || stu.nisn;
    if (!confirm(`Reset kata sandi siswa "${stu.name}" (${studentUser}) ke default 123456?`)) {
      return;
    }

    try {
      setResettingId(stu.id);
      const res = await fetch("/api/students/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: studentUser, id: stu.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`✅ Kata sandi untuk ${stu.name} (${studentUser}) berhasil di-reset ke default 123456.`);
        setTimeout(() => setSuccessMessage(""), 6000);
      } else {
        setErrorMessage(data.message || "Gagal mereset kata sandi siswa.");
        setTimeout(() => setErrorMessage(""), 6000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Kesalahan jaringan saat mereset kata sandi.");
      setTimeout(() => setErrorMessage(""), 6000);
    } finally {
      setResettingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa ${name}? Riwayat konselingnya juga akan terhapus.`)) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      let res;
      if (editingStudent) {
        res = await fetch(`/api/students/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal menyimpan data.");
      } else {
        setSuccessMessage(data.message || "Data berhasil disimpan.");
        setTimeout(() => setSuccessMessage(""), 3000);
        setIsModalOpen(false);
        fetchStudents();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan server.");
    } finally {
      setSubmitting(false);
    }
  };

  const [syncing, setSyncing] = useState(false);

  const handleSyncSakuci = async () => {
    if (!confirm("Apakah Anda ingin menyinkronkan seluruh data siswa aktif dari server Sakuci (sakuciserver@103.158.96.244)?")) return;
    try {
      setSyncing(true);
      const res = await fetch("/api/students/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`✅ Berhasil menyinkronkan ${data.synced} siswa dari server Sakuci!`);
        setTimeout(() => setSuccessMessage(""), 5000);
        fetchStudents(1, pageSize, search, classFilter);
      } else {
        setErrorMessage(data.message || "Gagal sinkronisasi data dari server Sakuci.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Kesalahan jaringan.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Manajemen Akun Siswa & Kredensial WA
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {totalCount > 0 ? totalCount.toLocaleString("id-ID") : students.length} Siswa Aktif Terdaftar
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh siswa aktif yang berhak mengakses Konsel.AI di WhatsApp. Terhubung langsung secara real-time ke sistem Sakuci.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncSakuci}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            title="Tarik data siswa dari sakuciserver@103.158.96.244"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Menyinkronkan..." : "Tarik Data Sakuci"}
          </button>
          <button
            onClick={() => fetchStudents(currentPage, pageSize, search, classFilter)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Segarkan
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {successMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Cari nama, Username, atau No WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Kelas:</span>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">Semua Kelas ({totalCount > 0 ? totalCount.toLocaleString("id-ID") : "1.219"})</option>
              {ALL_ACTIVE_CLASSES.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value={0}>Semua Siswa ({totalCount > 0 ? totalCount.toLocaleString("id-ID") : "1.219"})</option>
              <option value={50}>50 per halaman</option>
              <option value={100}>100 per halaman</option>
              <option value={250}>250 per halaman</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Username</th>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">Kelas & Jurusan</th>
                <th className="p-4">No. WhatsApp Siswa</th>
                <th className="p-4">WhatsApp Ortu</th>
                <th className="p-4 text-center">Konseling</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                    Memuat seluruh data siswa aktif dari server Sakuci...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                students.map((stu) => {
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-mono font-bold text-indigo-600">
                        {stu.username || stu.nisn}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{stu.name}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">{stu.class}</span>
                        {stu.major && (
                          <div className="text-[11px] text-slate-400 truncate">{stu.major}</div>
                        )}
                      </td>
                      <td className="p-4 font-mono">
                        {stu.phone ? (
                          <a
                            href={`https://wa.me/${stu.phone.replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> {stu.phone}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-4 font-mono">
                        {stu.parentPhone ? (
                          <a
                            href={`https://wa.me/${stu.parentPhone.replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-700 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> {stu.parentPhone}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                          {stu._count?.sessions || 0}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetPassword(stu)}
                            disabled={resettingId === stu.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition disabled:opacity-50"
                            title="Reset kata sandi siswa ke default 123456"
                          >
                            <KeyRound className={`w-3.5 h-3.5 ${resettingId === stu.id ? "animate-spin text-amber-600" : ""}`} />
                            <span>{resettingId === stu.id ? "Mereset..." : "Reset Password (123456)"}</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(stu)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Ubah Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stu.id, stu.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
          <div>
            Menampilkan halaman <span className="font-bold text-slate-900">{currentPage}</span> dari{" "}
            <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount.toLocaleString("id-ID")} total siswa aktif)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  const p = currentPage - 1;
                  setCurrentPage(p);
                  fetchStudents(p, pageSize, search, classFilter);
                }
              }}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition disabled:opacity-40"
            >
              ← Sebelumnya
            </button>
            <span className="px-2 font-bold text-indigo-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  const p = currentPage + 1;
                  setCurrentPage(p);
                  fetchStudents(p, pageSize, search, classFilter);
                }
              }}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition disabled:opacity-40"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingStudent ? "Ubah Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Akun Sakuci *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingStudent}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Contoh: 572abduroh"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Username resmi siswa yang terdaftar di sistem Sakuci. Kata sandi default adalah 123456.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    placeholder="Contoh: XII RPL 1"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jurusan
                  </label>
                  <input
                    type="text"
                    value={form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WA Siswa
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WA Orang Tua
                  </label>
                  <input
                    type="text"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    placeholder="081299998888"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Data Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
