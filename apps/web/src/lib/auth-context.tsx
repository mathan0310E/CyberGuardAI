"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
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
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("cg_token") : null;
    if (savedToken) {
      setToken(savedToken);
      api.setToken(savedToken);
      api.getMe()
        .then((data) => setUser(data as unknown as User))
        .catch(() => {
          localStorage.removeItem("cg_token");
          setToken(null);
          api.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user as unknown as User);
    localStorage.setItem("cg_token", result.token);
    api.setToken(result.token);
  }, []);

  const register = useCallback(async (data: Parameters<typeof api.register>[0]) => {
    const result = await api.register(data);
    setToken(result.token);
    setUser(result.user as unknown as User);
    localStorage.setItem("cg_token", result.token);
    api.setToken(result.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cg_token");
    api.setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
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
