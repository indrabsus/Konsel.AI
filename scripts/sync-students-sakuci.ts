// scripts/sync-students-sakuci.ts
import { exec } from "child_process";
import { promisify } from "util";
import prisma from "../src/lib/prisma";

const execAsync = promisify(exec);

export async function syncStudentsFromSakuci(): Promise<{
  success: boolean;
  total: number;
  synced: number;
  message: string;
}> {
  console.log("Menghubungkan ke sakuciserver@103.158.96.244...");

  // Query MySQL di server Ubuntu untuk mengekstrak data siswa aktif dalam format JSON
  const remoteCommand = `mysql -h 127.0.0.1 -u zakola_id -p'Sangkuriang2020@#@#' zakola_id -N -e "
    SELECT JSON_OBJECT(
      'id', sp.id_siswa,
      'name', sp.nama_lengkap,
      'nisn', sp.nisn,
      'username', sp.username,
      'password', sp.password,
      'class', COALESCE(kp.nama_kelas, '-'),
      'major', COALESCE(sp.minat_jurusan1, '-'),
      'phone', sp.no_hp,
      'parentPhone', sp.no_hp_ortu
    )
    FROM siswa_ppdb sp
    LEFT JOIN (
      SELECT id_siswa, id_kelas FROM siswa_baru
    ) sb ON sp.id_siswa = sb.id_siswa
    LEFT JOIN kelas_ppdb kp ON sb.id_kelas = kp.id_kelas
    WHERE sp.status = 'aktif';
  "`;

  const sshCommand = `ssh -o ConnectTimeout=10 sakuciserver@103.158.96.244 "${remoteCommand.replace(/"/g, '\\"')}"`;

  try {
    const { stdout, stderr } = await execAsync(sshCommand, {
      maxBuffer: 1024 * 1024 * 20, // 20MB buffer
    });

    if (stderr && !stdout) {
      throw new Error(`SSH error: ${stderr}`);
    }

    const lines = stdout.trim().split("\n").filter(Boolean);
    console.log(`Ditemukan ${lines.length} data siswa aktif dari server Sakuci.`);

    let syncedCount = 0;
    const existingNisns = new Set<string>();

    for (const line of lines) {
      try {
        const item = JSON.parse(line.trim());
        let nisn = (item.nisn || "").trim();
        const username = (item.username || "").trim();

        // Jika NISN kosong atau strip '-', fallback gunakan username atau id
        if (!nisn || nisn === "-" || nisn === "null") {
          nisn = username || item.id;
        }

        // Cegah duplikasi NISN dalam satu batch
        if (existingNisns.has(nisn)) {
          nisn = `${nisn}_${username || Math.floor(Math.random() * 1000)}`;
        }
        existingNisns.add(nisn);

        await prisma.student.upsert({
          where: { nisn },
          update: {
            username: username || null,
            name: (item.name || "Siswa").trim(),
            class: (item.class || "-").trim(),
            major: (item.major || "-").trim(),
            password: item.password || "siswa123",
            phone: item.phone ? String(item.phone).trim() : null,
            parentPhone: item.parentPhone ? String(item.parentPhone).trim() : null,
          },
          create: {
            nisn,
            username: username || null,
            name: (item.name || "Siswa").trim(),
            class: (item.class || "-").trim(),
            major: (item.major || "-").trim(),
            password: item.password || "siswa123",
            phone: item.phone ? String(item.phone).trim() : null,
            parentPhone: item.parentPhone ? String(item.parentPhone).trim() : null,
          },
        });

        syncedCount++;
      } catch (err) {
        // Skip parse error on individual rows
      }
    }

    console.log(`Berhasil menyinkronkan ${syncedCount} siswa ke database Konsel.AI.`);
    return {
      success: true,
      total: lines.length,
      synced: syncedCount,
      message: `Berhasil menyinkronkan ${syncedCount} siswa dari server Sakuci.`,
    };
  } catch (err: any) {
    console.error("Gagal sinkronisasi siswa dari Sakuci:", err);
    return {
      success: false,
      total: 0,
      synced: 0,
      message: err?.message || "Gagal menghubungi server Sakuci.",
    };
  }
}

// Jika dijalankan langsung via terminal CLI:
if (require.main === module) {
  syncStudentsFromSakuci()
    .then((res) => {
      console.log(res.message);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
