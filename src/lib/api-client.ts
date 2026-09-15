// src/lib/api-client.ts
// HTTP REST API client yang berkomunikasi dengan Sakuci Express Backend (eks.smksangkuriang1cimahi.sch.id)

const SAKUCI_API_URL = (
  process.env.SAKUCI_API_URL || "https://eks.smksangkuriang1cimahi.sch.id"
).replace(/\/$/, "");

const KONSEL_API_KEY = process.env.KONSEL_API_KEY || "konsel_ai_secret_sangkuriang_2026";

async function sakuciFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${SAKUCI_API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "x-konsel-key": KONSEL_API_KEY,
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let errorJson: any = {};
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // ignore
    }
    throw new Error(errorJson.message || `API error (${res.status}): ${errorText || res.statusText}`);
  }

  return res.json();
}

export const sakuciBackend = {
  // Stats
  async getStats() {
    return sakuciFetch<{
      success: boolean;
      stats: {
        totalSessions: number;
        activeSessions: number;
        totalStudents: number;
        countHijau: number;
        countKuning: number;
        countMerah: number;
        countPendingAction: number;
      };
      urgentCases: any[];
      recentSessions: any[];
    }>("/api/konsel/stats");
  },

  // Sessions
  async getSessions(params: { triage?: string; status?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.triage) query.set("triage", params.triage);
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);

    const qs = query.toString();
    return sakuciFetch<{ success: boolean; sessions: any[] }>(
      `/api/konsel/sessions${qs ? `?${qs}` : ""}`
    );
  },

  async getSessionDetail(id: string) {
    return sakuciFetch<{ success: boolean; session: any }>(`/api/konsel/sessions/${id}`);
  },

  async createSession(data: {
    studentId: string;
    status?: string;
    triageLevel?: string;
    triageReason?: string | null;
    handlingStatus?: string;
    summary?: string | null;
  }) {
    return sakuciFetch<{ success: boolean; session: any }>("/api/konsel/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSession(id: string, data: Record<string, any>) {
    return sakuciFetch<{ success: boolean; message: string }>(`/api/konsel/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Messages
  async addMessage(data: {
    sessionId: string;
    sender: string;
    message: string;
    triageFlag?: string | null;
  }) {
    return sakuciFetch<{ success: boolean; chatMessage: any }>("/api/konsel/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Students
  async getStudents(params: { search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return sakuciFetch<{
      success: boolean;
      students: any[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/konsel/students${qs ? `?${qs}` : ""}`);
  },

  // Bot Student Auth & Find
  async findStudentForBot(data: { username: string; phone?: string }) {
    return sakuciFetch<{
      success: boolean;
      student: any;
      session: any;
      isNewSession: boolean;
    }>("/api/konsel/students/auth-find", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Reset Student Password to 123456
  async resetStudentPassword(username: string, id?: string) {
    return sakuciFetch<{ success: boolean; message: string }>("/api/konsel/students/reset-password", {
      method: "POST",
      body: JSON.stringify({ username, id }),
    });
  },

  // Notification Log
  async saveNotificationLog(data: {
    sessionId?: string | null;
    recipient: string;
    message: string;
    status?: string;
    response?: string | null;
  }) {
    return sakuciFetch<{ success: boolean; id: string }>("/api/konsel/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
