export const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001/api";

export const API_ENDPOINTS = {
  scans: {
    list: `${API_BASE_URL}/scans`,
    create: `${API_BASE_URL}/scans`,
    get: (id: string) => `${API_BASE_URL}/scans/${id}`,
    cancel: (id: string) => `${API_BASE_URL}/scans/${id}/cancel`,
  },
  reports: {
    list: `${API_BASE_URL}/reports`,
    get: (id: string) => `${API_BASE_URL}/reports/${id}`,
    download: (id: string) => `${API_BASE_URL}/reports/${id}/download`,
    delete: (id: string) => `${API_BASE_URL}/reports/${id}`,
  },
  chat: {
    send: `${API_BASE_URL}/chat`,
    history: (conversationId: string) => `${API_BASE_URL}/chat/${conversationId}`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/dashboard/stats`,
  },
} as const;
