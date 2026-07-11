import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App | null = null;
let db: Firestore | null = null;
let adminAuth: Auth | null = null;

export function initFirebase(): Firestore | null {
  const projectId = process.env["FIREBASE_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
  const privateKey = process.env["FIREBASE_PRIVATE_KEY"];

  if (!projectId || !clientEmail || !privateKey) {
    console.log("Firebase credentials not configured — running in in-memory mode");
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    app = getApps()[0]!;
  }

  db = getFirestore(app);
  adminAuth = getAuth(app);
  console.log("Firebase Firestore + Auth connected");
  return db;
}

export function getDb(): Firestore | null {
  return db;
}

export function getAdminAuth(): Auth | null {
  return adminAuth;
}
