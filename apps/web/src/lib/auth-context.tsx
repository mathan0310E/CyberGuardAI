"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: "admin" | "user";
  status: string;
  companyName: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: {
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
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function requireAuthInstance(): NonNullable<typeof auth> {
  if (!auth) {
    throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local");
  }
  return auth;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    api.setTokenProvider(async () => {
      const currentUser = auth?.currentUser;
      if (currentUser) {
        return currentUser.getIdToken(true);
      }
      return null;
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!mountedRef.current) return;

      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const token = await fbUser.getIdToken();
          api.setToken(token);
          const userData = await api.getMe() as unknown as User;
          if (mountedRef.current) setUser(userData);
        } catch {
          try {
            await api.syncFirebaseUser();
            const userData = await api.getMe() as unknown as User;
            if (mountedRef.current) setUser(userData);
          } catch {
            if (mountedRef.current) setUser(null);
          }
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        api.setToken(null);
      }
      if (mountedRef.current) setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authInstance = requireAuthInstance();
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    const token = await result.user.getIdToken();
    api.setToken(token);

    try {
      const userData = await api.getMe() as unknown as User;
      setUser(userData);
    } catch {
      try {
        await api.syncFirebaseUser();
        const userData = await api.getMe() as unknown as User;
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const authInstance = requireAuthInstance();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authInstance, provider);
    const token = await result.user.getIdToken();
    api.setToken(token);

    try {
      const userData = await api.getMe() as unknown as User;
      setUser(userData);
    } catch {
      try {
        await api.syncFirebaseUser();
        const userData = await api.getMe() as unknown as User;
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const register = useCallback(async (data: Parameters<typeof api.register>[0]) => {
    const authInstance = requireAuthInstance();
    const result = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
    const token = await result.user.getIdToken();
    api.setToken(token);

    await api.syncFirebaseUser();
    const userData = await api.getMe() as unknown as User;
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    const authInstance = requireAuthInstance();
    await signOut(authInstance);
    setUser(null);
    setFirebaseUser(null);
    api.setToken(null);
    api.setTokenProvider(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!firebaseUser && !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
