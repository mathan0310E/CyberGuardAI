import { store, type MemoryUser } from "../store.js";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "cyberguard-dev-secret-change-in-production";

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  companyName: z.string().min(1).max(100),
  companyWebsite: z.string().url().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),
  industry: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export const authRoutes = Router();

authRoutes.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input", timestamp: new Date().toISOString() });
    return;
  }

  const { fullName, username, email, phone, companyName, companyWebsite, companySize, industry, password } = parsed.data;

  const existingEmail = store.users.find((u) => u.email === email);
  if (existingEmail) {
    res.status(409).json({ success: false, data: null, error: "Email already registered", timestamp: new Date().toISOString() });
    return;
  }

  const existingUsername = store.users.find((u) => u.username === username);
  if (existingUsername) {
    res.status(409).json({ success: false, data: null, error: "Username already taken", timestamp: new Date().toISOString() });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const isFirstUser = store.users.length === 0;

  const user: MemoryUser = {
    _id: store.getNextUserId(),
    fullName,
    username,
    email,
    phone: phone ?? null,
    companyName,
    companyWebsite: companyWebsite ?? null,
    companySize,
    industry,
    password: hashedPassword,
    role: isFirstUser ? "admin" : "user",
    status: "active",
    scanCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.users.push(user);
  store.addLog("info", `New user registered: ${email} (${companyName})`, user._id);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: { _id: user._id, fullName: user.fullName, username: user.username, email: user.email, role: user.role, status: user.status, companyName: user.companyName },
      token,
    },
    error: null,
    timestamp: new Date().toISOString(),
  });
});

authRoutes.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, data: null, error: "Invalid email or password", timestamp: new Date().toISOString() });
    return;
  }

  const { email, password } = parsed.data;
  const user = store.users.find((u) => u.email === email);

  if (!user) {
    res.status(401).json({ success: false, data: null, error: "Invalid email or password", timestamp: new Date().toISOString() });
    return;
  }

  if (user.status === "blocked") {
    res.status(403).json({ success: false, data: null, error: "Account has been blocked. Contact support.", timestamp: new Date().toISOString() });
    return;
  }

  if (user.status === "suspended") {
    res.status(403).json({ success: false, data: null, error: "Account is suspended. Contact support.", timestamp: new Date().toISOString() });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    store.addLog("warn", `Failed login attempt for ${email}`, user._id);
    res.status(401).json({ success: false, data: null, error: "Invalid email or password", timestamp: new Date().toISOString() });
    return;
  }

  const token = generateToken(user._id);

  store.addLog("info", `User logged in: ${email}`, user._id);

  res.json({
    success: true,
    data: {
      user: { _id: user._id, fullName: user.fullName, username: user.username, email: user.email, role: user.role, status: user.status, companyName: user.companyName },
      token,
    },
    error: null,
    timestamp: new Date().toISOString(),
  });
});

authRoutes.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, data: null, error: "Not authenticated", timestamp: new Date().toISOString() });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = store.users.find((u) => u._id === decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, data: null, error: "User not found", timestamp: new Date().toISOString() });
      return;
    }

    res.json({
      success: true,
      data: { _id: user._id, fullName: user.fullName, username: user.username, email: user.email, role: user.role, status: user.status, companyName: user.companyName, companyWebsite: user.companyWebsite, companySize: user.companySize, industry: user.industry, phone: user.phone },
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(401).json({ success: false, data: null, error: "Invalid token", timestamp: new Date().toISOString() });
  }
});
