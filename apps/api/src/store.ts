import type { RiskLevel, ScanStatus } from "@cyberguard/types";
import { getDb } from "./firebase.js";

export interface MemoryUser {
  _id: string;
  firebaseUid?: string;
  fullName: string;
  username: string;
  email: string;
  phone: string | null;
  companyName: string;
  companyWebsite: string | null;
  companySize: string;
  industry: string;
  password: string;
  role: "admin" | "user";
  status: "active" | "pending_review" | "suspended" | "blocked";
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryScan {
  _id: string;
  url: string;
  domain: string;
  status: ScanStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  scanOptions: Record<string, boolean>;
  htmlAnalysis: Record<string, unknown> | null;
  jsAnalysis: Record<string, unknown> | null;
  screenshot: Record<string, unknown> | null;
  ocrResults: Record<string, unknown> | null;
  cvAnalysis: Record<string, unknown> | null;
  threatIntel: Record<string, unknown>[];
  technologies: Record<string, unknown>[];
  malwareIndicators: Record<string, unknown>[];
  aiAnalysis: Record<string, unknown> | null;
  reportId: string | null;
  userId: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryReport {
  _id: string;
  scanId: string;
  title: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  findingsCount: number;
  pdfData: Buffer | null;
  generatedAt: Date;
  createdAt: Date;
}

export interface MemoryLog {
  _id: string;
  level: "info" | "warn" | "error";
  message: string;
  userId: string | null;
  timestamp: Date;
}

// ── In-memory fallback (used when Firebase is not configured) ──

let scanIdCounter = 1;
let reportIdCounter = 1;
let userIdCounter = 1;
let logIdCounter = 1;

function makeId(prefix: string, counter: number): string {
  return `${prefix}_${counter.toString().padStart(4, "0")}`;
}

const memScans: MemoryScan[] = [];
const memReports: MemoryReport[] = [];
const memUsers: MemoryUser[] = [];
const memLogs: MemoryLog[] = [
  { _id: makeId("log", logIdCounter++), level: "info", message: "CyberGuard API started", userId: null, timestamp: new Date() },
];

// ── Firestore helpers ──

function toFirestoreData(obj: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value instanceof Date) {
      data[key] = value;
    } else if (Array.isArray(value)) {
      data[key] = value;
    } else if (typeof value === "object" && value !== null) {
      data[key] = value;
    } else {
      data[key] = value;
    }
  }
  return data;
}

function fromFirestoreDoc(doc: FirebaseFirestore.DocumentSnapshot): Record<string, unknown> | null {
  if (!doc.exists) return null;
  const data = doc.data()!;
  return { _id: doc.id, ...data } as Record<string, unknown>;
}

// ── Store ──

export const store = {
  // ── Scans ──

  async getScanById(id: string): Promise<MemoryScan | null> {
    const db = getDb();
    if (!db) return memScans.find((s) => s._id === id) ?? null;
    const doc = await db.collection("scans").doc(id).get();
    return fromFirestoreDoc(doc) as unknown as MemoryScan | null;
  },

  async addScan(scan: MemoryScan): Promise<void> {
    const db = getDb();
    if (!db) { memScans.unshift(scan); return; }
    await db.collection("scans").doc(scan._id).set(toFirestoreData(scan as unknown as Record<string, unknown>));
  },

  async updateScan(id: string, data: Partial<MemoryScan>): Promise<void> {
    const db = getDb();
    if (!db) {
      const scan = memScans.find((s) => s._id === id);
      if (scan) Object.assign(scan, data);
      return;
    }
    await db.collection("scans").doc(id).update(toFirestoreData(data as unknown as Record<string, unknown>));
  },

  async deleteScan(id: string): Promise<void> {
    const db = getDb();
    if (!db) {
      const idx = memScans.findIndex((s) => s._id === id);
      if (idx !== -1) memScans.splice(idx, 1);
      return;
    }
    await db.collection("scans").doc(id).delete();
  },

  async listScans(page: number, pageSize: number): Promise<{ data: MemoryScan[]; total: number }> {
    const db = getDb();
    if (!db) {
      const total = memScans.length;
      const start = (page - 1) * pageSize;
      return { data: memScans.slice(start, start + pageSize), total };
    }
    const countSnap = await db.collection("scans").count().get();
    const total = countSnap.data().count;
    const snap = await db.collection("scans").orderBy("createdAt", "desc").offset((page - 1) * pageSize).limit(pageSize).get();
    const data = snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryScan);
    return { data, total };
  },

  async getAllScans(): Promise<MemoryScan[]> {
    const db = getDb();
    if (!db) return [...memScans];
    const snap = await db.collection("scans").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryScan);
  },

  async getRecentScans(limit: number): Promise<MemoryScan[]> {
    const db = getDb();
    if (!db) return memScans.slice(0, limit);
    const snap = await db.collection("scans").orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryScan);
  },

  async getScansByUser(userId: string): Promise<MemoryScan[]> {
    const db = getDb();
    if (!db) return memScans.filter((s) => s.userId === userId);
    const snap = await db.collection("scans").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryScan);
  },

  // ── Reports ──

  async addReport(report: MemoryReport): Promise<void> {
    const db = getDb();
    if (!db) { memReports.unshift(report); return; }
    await db.collection("reports").doc(report._id).set(toFirestoreData(report as unknown as Record<string, unknown>));
  },

  async getReportById(id: string): Promise<MemoryReport | null> {
    const db = getDb();
    if (!db) return memReports.find((r) => r._id === id) ?? null;
    const doc = await db.collection("reports").doc(id).get();
    return fromFirestoreDoc(doc) as unknown as MemoryReport | null;
  },

  async getReportByScanId(scanId: string): Promise<MemoryReport | null> {
    const db = getDb();
    if (!db) return memReports.find((r) => r.scanId === scanId) ?? null;
    const snap = await db.collection("reports").where("scanId", "==", scanId).limit(1).get();
    return snap.docs.length > 0 ? (fromFirestoreDoc(snap.docs[0]!) as unknown as MemoryReport) : null;
  },

  async deleteReport(id: string): Promise<void> {
    const db = getDb();
    if (!db) {
      const idx = memReports.findIndex((r) => r._id === id);
      if (idx !== -1) memReports.splice(idx, 1);
      return;
    }
    await db.collection("reports").doc(id).delete();
  },

  async listReports(page: number, pageSize: number): Promise<{ data: MemoryReport[]; total: number }> {
    const db = getDb();
    if (!db) {
      const total = memReports.length;
      const start = (page - 1) * pageSize;
      return { data: memReports.slice(start, start + pageSize), total };
    }
    const countSnap = await db.collection("reports").count().get();
    const total = countSnap.data().count;
    const snap = await db.collection("reports").orderBy("createdAt", "desc").offset((page - 1) * pageSize).limit(pageSize).get();
    const data = snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryReport);
    return { data, total };
  },

  async getAllReports(): Promise<MemoryReport[]> {
    const db = getDb();
    if (!db) return [...memReports];
    const snap = await db.collection("reports").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryReport);
  },

  // ── Users ──

  async addUser(user: MemoryUser): Promise<void> {
    const db = getDb();
    if (!db) { memUsers.push(user); return; }
    await db.collection("users").doc(user._id).set(toFirestoreData(user as unknown as Record<string, unknown>));
  },

  async getUserById(id: string): Promise<MemoryUser | null> {
    const db = getDb();
    if (!db) return memUsers.find((u) => u._id === id) ?? null;
    const doc = await db.collection("users").doc(id).get();
    return fromFirestoreDoc(doc) as unknown as MemoryUser | null;
  },

  async getUserByEmail(email: string): Promise<MemoryUser | null> {
    const db = getDb();
    if (!db) return memUsers.find((u) => u.email === email) ?? null;
    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    return snap.docs.length > 0 ? (fromFirestoreDoc(snap.docs[0]!) as unknown as MemoryUser) : null;
  },

  async getUserByUsername(username: string): Promise<MemoryUser | null> {
    const db = getDb();
    if (!db) return memUsers.find((u) => u.username === username) ?? null;
    const snap = await db.collection("users").where("username", "==", username).limit(1).get();
    return snap.docs.length > 0 ? (fromFirestoreDoc(snap.docs[0]!) as unknown as MemoryUser) : null;
  },

  async getUserByFirebaseUid(firebaseUid: string): Promise<MemoryUser | null> {
    const db = getDb();
    if (!db) return memUsers.find((u) => u.firebaseUid === firebaseUid) ?? null;
    const snap = await db.collection("users").where("firebaseUid", "==", firebaseUid).limit(1).get();
    return snap.docs.length > 0 ? (fromFirestoreDoc(snap.docs[0]!) as unknown as MemoryUser) : null;
  },

  async updateUser(id: string, data: Partial<MemoryUser>): Promise<void> {
    const db = getDb();
    if (!db) {
      const user = memUsers.find((u) => u._id === id);
      if (user) Object.assign(user, data);
      return;
    }
    await db.collection("users").doc(id).update(toFirestoreData(data as unknown as Record<string, unknown>));
  },

  async listUsers(): Promise<MemoryUser[]> {
    const db = getDb();
    if (!db) return [...memUsers];
    const snap = await db.collection("users").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryUser);
  },

  async getUserCount(): Promise<number> {
    const db = getDb();
    if (!db) return memUsers.length;
    const snap = await db.collection("users").count().get();
    return snap.data().count;
  },

  async getActiveUserCount(): Promise<number> {
    const db = getDb();
    if (!db) return memUsers.filter((u) => u.status === "active").length;
    const snap = await db.collection("users").where("status", "==", "active").count().get();
    return snap.data().count;
  },

  // ── Logs ──

  async addLog(level: "info" | "warn" | "error", message: string, userId?: string): Promise<void> {
    const db = getDb();
    const log: MemoryLog = { _id: makeId("log", logIdCounter++), level, message, userId: userId ?? null, timestamp: new Date() };
    if (!db) { memLogs.push(log); return; }
    await db.collection("logs").doc(log._id).set(toFirestoreData(log as unknown as Record<string, unknown>));
  },

  async listLogs(page: number, pageSize: number): Promise<{ data: MemoryLog[]; total: number }> {
    const db = getDb();
    if (!db) {
      const total = memLogs.length;
      const start = (page - 1) * pageSize;
      return { data: memLogs.slice(start, start + pageSize).reverse(), total };
    }
    const countSnap = await db.collection("logs").count().get();
    const total = countSnap.data().count;
    const snap = await db.collection("logs").orderBy("timestamp", "desc").offset((page - 1) * pageSize).limit(pageSize).get();
    const data = snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryLog);
    return { data, total };
  },

  async getRecentLogs(limit: number): Promise<MemoryLog[]> {
    const db = getDb();
    if (!db) return memLogs.slice(-limit);
    const snap = await db.collection("logs").orderBy("timestamp", "desc").limit(limit).get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryLog);
  },

  async getAllLogs(): Promise<MemoryLog[]> {
    const db = getDb();
    if (!db) return [...memLogs];
    const snap = await db.collection("logs").orderBy("timestamp", "desc").get();
    return snap.docs.map((d) => fromFirestoreDoc(d) as unknown as MemoryLog);
  },

  // ── ID Counters ──

  async getNextId(prefix: string): Promise<string> {
    const db = getDb();
    if (!db) {
      switch (prefix) {
        case "scan": return makeId("scan", scanIdCounter++);
        case "rpt": return makeId("rpt", reportIdCounter++);
        case "usr": return makeId("usr", userIdCounter++);
        default: return makeId(prefix, scanIdCounter++);
      }
    }
    const counterRef = db.collection("counters").doc(prefix);
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(counterRef);
      const current = doc.exists ? (doc.data()?.["value"] as number ?? 0) : 0;
      const next = current + 1;
      t.set(counterRef, { value: next });
      return next;
    });
    return makeId(prefix, result);
  },
};
