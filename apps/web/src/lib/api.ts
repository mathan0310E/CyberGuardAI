import { API_BASE_URL, API_ENDPOINTS } from "@cyberguard/shared";
import type { ApiResponse } from "@cyberguard/types";

type TokenProvider = () => Promise<string | null>;

class ApiClient {
  private tokenProvider: TokenProvider | null = null;
  private staticToken: string | null = null;

  constructor(_baseUrl: string) {
  }

  setTokenProvider(provider: TokenProvider | null) {
    this.tokenProvider = provider;
  }

  setToken(token: string | null) {
    this.staticToken = token;
  }

  private async getAuthToken(): Promise<string | null> {
    if (this.tokenProvider) {
      try {
        return await this.tokenProvider();
      } catch {
        return this.staticToken;
      }
    }
    return this.staticToken;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    const data = (await res.json()) as ApiResponse<T>;

    if (!res.ok || !data.success) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }

    return data.data;
  }

  // Auth
  async register(payload: {
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    companyName: string;
    companyWebsite?: string;
    companySize: string;
    industry: string;
    password: string;
    confirmPassword: string;
  }) {
    return this.request<{ user: Record<string, unknown>; token: string }>(
      `${API_BASE_URL}/auth/register`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  }

  async login(email: string, password: string) {
    return this.request<{ user: Record<string, unknown>; token: string }>(
      `${API_BASE_URL}/auth/login`,
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  }

  async getMe() {
    return this.request<Record<string, unknown>>(`${API_BASE_URL}/auth/me`);
  }

  async syncFirebaseUser() {
    return this.request<Record<string, unknown>>(
      `${API_BASE_URL}/auth/sync`,
      { method: "POST" }
    );
  }

  // Scans
  async createScan(url: string, options?: Record<string, boolean>) {
    return this.request<Record<string, unknown>>(API_ENDPOINTS.scans.create, {
      method: "POST",
      body: JSON.stringify({ url, options }),
    });
  }

  async getScan(id: string) {
    return this.request<Record<string, unknown>>(API_ENDPOINTS.scans.get(id));
  }

  async listScans(page = 1, pageSize = 20) {
    return this.request<{
      data: Record<string, unknown>[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${API_ENDPOINTS.scans.list}?page=${page}&pageSize=${pageSize}`);
  }

  async deleteScan(id: string) {
    return this.request<{ deleted: boolean }>(API_ENDPOINTS.scans.get(id), {
      method: "DELETE",
    });
  }

  // Reports
  async createReport(scanId: string) {
    return this.request<Record<string, unknown>>(API_ENDPOINTS.reports.list, {
      method: "POST",
      body: JSON.stringify({ scanId }),
    });
  }

  async listReports(page = 1, pageSize = 20) {
    return this.request<{
      data: Record<string, unknown>[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${API_ENDPOINTS.reports.list}?page=${page}&pageSize=${pageSize}`);
  }

  async getReport(id: string) {
    return this.request<Record<string, unknown>>(API_ENDPOINTS.reports.get(id));
  }

  getReportDownloadUrl(id: string) {
    return API_ENDPOINTS.reports.download(id);
  }

  async deleteReport(id: string) {
    return this.request<{ deleted: boolean }>(API_ENDPOINTS.reports.delete(id), {
      method: "DELETE",
    });
  }

  // Chat
  async sendChatMessage(
    message: string,
    scanId?: string,
    conversationId?: string,
    history: Array<{ id: string; role: "user" | "assistant"; content: string; timestamp: string }> = []
  ) {
    return this.request<{
      message: { id: string; role: string; content: string; timestamp: string };
      conversationId: string;
      suggestedFollowUps: string[];
    }>(API_ENDPOINTS.chat.send, {
      method: "POST",
      body: JSON.stringify({ message, scanId, conversationId, history }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<{
      totalScans: number;
      completedScans: number;
      malwareDetected: number;
      cleanSites: number;
      averageRiskScore: number;
      recentScans: Record<string, unknown>[];
      threatDistribution: Array<{ category: string; count: number }>;
      riskOverTime: Array<{ date: string; averageScore: number; scanCount: number }>;
    }>(API_ENDPOINTS.dashboard.stats);
  }

  // Admin
  async getAdminUsers() {
    return this.request<Record<string, unknown>[]>(`${API_BASE_URL}/admin/users`);
  }

  async getAdminStats() {
    return this.request<Record<string, unknown>>(`${API_BASE_URL}/admin/stats`);
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request<{ _id: string; status: string }>(
      `${API_BASE_URL}/admin/users/${userId}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) }
    );
  }

  async getAdminLogs(page = 1, pageSize = 50) {
    return this.request<{
      data: Record<string, unknown>[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${API_BASE_URL}/admin/logs?page=${page}&pageSize=${pageSize}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
