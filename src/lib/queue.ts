// src/lib/queue.ts

export class AIConcurrencyError extends Error {
  public code: "ALREADY_PROCESSING" | "QUEUE_FULL" | "TIMEOUT";

  constructor(code: "ALREADY_PROCESSING" | "QUEUE_FULL" | "TIMEOUT", message: string) {
    super(message);
    this.name = "AIConcurrencyError";
    this.code = code;
  }
}

interface QueueItem<T> {
  id: string;
  sessionId: string;
  task: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  queuedAt: number;
}

export class AIConcurrencyQueue {
  private maxConcurrent: number;
  private maxQueueSize: number;
  private activeCount: number = 0;
  private queue: QueueItem<any>[] = [];
  private activeSessions: Set<string> = new Set();

  constructor(maxConcurrent = 4, maxQueueSize = 60) {
    this.maxConcurrent = maxConcurrent;
    this.maxQueueSize = maxQueueSize;
  }

  public setMaxConcurrent(limit: number) {
    if (typeof limit === "number" && limit > 0) {
      this.maxConcurrent = limit;
      this.processNext();
    }
  }

  public getStats() {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxQueueSize: this.maxQueueSize,
      activeSessionsCount: this.activeSessions.size,
    };
  }

  public async run<T>(sessionId: string, task: () => Promise<T>): Promise<T> {
    // 1. Proteksi Anti-Spam Per Sesi:
    // Jika siswa yang sama masih menunggu hasil proses AI dari pesan sebelumnya, cegah penumpukan proses
    if (this.activeSessions.has(sessionId)) {
      throw new AIConcurrencyError(
        "ALREADY_PROCESSING",
        "Konsel.AI sedang merangkai balasan untuk pesanmu sebelumnya. Tunggu beberapa detik ya..."
      );
    }

    // 2. Proteksi Kapasitas Maksimal Antrian Server:
    if (this.queue.length >= this.maxQueueSize) {
      throw new AIConcurrencyError(
        "QUEUE_FULL",
        "Mohon maaf, ruang konseling sedang sangat padat melayani siswa lain. Pesanmu sudah tersimpan di sistem, silakan coba kirimkan pesan kembali dalam 1-2 menit."
      );
    }

    // 3. Masukkan ke antrian FIFO terkontrol
    return new Promise<T>((resolve, reject) => {
      this.activeSessions.add(sessionId);

      this.queue.push({
        id: Math.random().toString(36).substring(2, 9),
        sessionId,
        task,
        resolve,
        reject,
        queuedAt: Date.now(),
      });

      this.processNext();
    });
  }

  private async processNext() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.activeCount++;

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      this.activeCount--;
      this.activeSessions.delete(item.sessionId);
      this.processNext();
    }
  }
}

// Inisialisasi antrian AI global dengan batas default 4 proses paralel
const defaultMax = parseInt(process.env.MAX_CONCURRENT_CHATS || "4", 10) || 4;
export const aiQueue = new AIConcurrencyQueue(defaultMax, 60);
