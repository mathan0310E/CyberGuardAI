import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const apiKey = process.env["NEXT_PUBLIC_FIREBASE_API_KEY"];

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (apiKey) {
  const firebaseConfig = {
    apiKey,
    authDomain: process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
    projectId: process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
    storageBucket: process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
    messagingSenderId: process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
    appId: process.env["NEXT_PUBLIC_FIREBASE_APP_ID"],
  };

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }

  auth = getAuth(app);
} else {
  console.warn("Firebase not configured — set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local");
}

export { app, auth };
