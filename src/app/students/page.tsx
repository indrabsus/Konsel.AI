"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Phone,
  CheckCircle,
  RefreshCw,
  X,
  GraduationCap,
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [form, setForm] = useState({
    nisn: "",
    name: "",
    className: "",
    major: "",
    password: "",
    phone: "",
    parentPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (classFilter !== "ALL") params.append("class", classFilter);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({
      nisn: "",
      name: "",
      className: "XII RPL 1",
      major: "Rekayasa Perangkat Lunak",
      password: "siswa" + Math.floor(100 + Math.random() * 900),
      phone: "",
      parentPhone: "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setForm({
      nisn: student.nisn,
      name: student.name,
      className: student.class,
      major: student.major || "",
      password: student.password,
      phone: student.phone || "",
      parentPhone: student.parentPhone || "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
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

  // Distinct classes for filter
  const classesList = Array.from(new Set(students.map((s) => s.class))).filter(Boolean);

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
        fetchStudents();
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
              {students.length} Siswa Terdaftar
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar siswa yang berhak mengakses Konsel.AI di WhatsApp. Data tersinkron dengan server Sakuci.
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
            onClick={fetchStudents}
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
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Cari nama, NISN, atau No WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <button
            onClick={fetchStudents}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
          >
            Cari
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Kelas:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Kelas</option>
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">NISN (Username WA)</th>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">Kelas & Jurusan</th>
                <th className="p-4">Kata Sandi Bot WA</th>
                <th className="p-4">No. WhatsApp Siswa</th>
                <th className="p-4">WhatsApp Ortu</th>
                <th className="p-4 text-center">Konseling</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                students.map((stu) => {
                  const showPass = showPasswordMap[stu.id] || false;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-mono font-bold text-indigo-600">
                        {stu.nisn}
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
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono font-bold">
                            {showPass ? stu.password : "••••••••"}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(stu.id)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Tampilkan / Sembunyikan"
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN (Username WA) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    value={form.nisn}
                    onChange={(e) => setForm({ ...form, nisn: e.target.value })}
                    placeholder="Contoh: 20240101"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Bot WA *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Contoh: siswa123"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
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
