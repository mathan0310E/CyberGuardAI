import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app: App | null = null;
let db: Firestore | null = null;
let adminAuth: Auth | null = null;

export function initFirebase(): Firestore | null {
  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  const privateKey = process.env["FIREBASE_PRIVATE_KEY"];

  // Tier 0: Service account JSON file → Firestore + Auth
  const saPath = resolve(__dirname, "../../service-account.json");
  try {
    const sa = JSON.parse(readFileSync(saPath, "utf-8"));
    if (getApps().length === 0) {
      app = initializeApp({ credential: cert(sa) });
    } else {
      app = getApps()[0]!;
    }
    if (app) {
      db = getFirestore(app);
      adminAuth = getAuth(app);
      logger.info("Firebase Firestore + Auth connected (service account file)");
      return db;
    }
  } catch {
    // Fall through to env-based tiers
  }

  // Tier 1: Full Firebase — service account credentials → Firestore + Auth
  if (projectId && clientEmail && privateKey) {
    if (getApps().length === 0) {
      try {
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        });
      } catch (err) {
        logger.error("Firebase full initialization failed:", err);
      }
    } else {
      app = getApps()[0]!;
    }

    if (app) {
      try {
        db = getFirestore(app);
        adminAuth = getAuth(app);
        logger.info("Firebase Firestore + Auth connected (full mode)");
        return db;
      } catch (err) {
        logger.error("Firebase service initialization failed:", err);
      }
    }
  }

  // Tier 2: Auth-only — projectId only → Auth verification (verifyIdToken works with public keys)
  if (projectId) {
    if (getApps().length === 0) {
      try {
        app = initializeApp({ projectId });
      } catch (err) {
        logger.error("Firebase Auth-only initialization failed:", err);
      }
    } else {
      app = getApps()[0]!;
    }

    if (app) {
      try {
        adminAuth = getAuth(app);
        logger.info(`Firebase Auth initialized (projectId=${projectId}) — using in-memory store`);
      } catch (err) {
        logger.error("Firebase Auth initialization failed:", err);
      }
    }
  }

  if (!adminAuth) {
    logger.info("Firebase not configured — running in legacy JWT mode");
  }

  return db;
}

export function getDb(): Firestore | null {
  return db;
}

export function getAdminAuth(): Auth | null {
  return adminAuth;
}
