import { store, type MemoryUser } from "../store.js";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getAdminAuth } from "../firebase.js";

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

// Firebase-aware sync endpoint: creates/updates user doc from Firebase Auth token
authRoutes.post("/sync", async (req: Request, res: Response) => {
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    res.status(500).json({ success: false, data: null, error: "Firebase not configured", timestamp: new Date().toISOString() });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, data: null, error: "Authentication required", timestamp: new Date().toISOString() });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const firebaseUid = decoded.uid;
    const email = decoded.email ?? "";
    const displayName = decoded.name ?? "";

    // Check if user already exists
    let user = await store.getUserByFirebaseUid(firebaseUid);
    if (user) {
      // Update last login
      user.updatedAt = new Date();
      await store.updateUser(user._id, { updatedAt: new Date() });
    } else {
      // Check if email already taken
      const existingEmail = await store.getUserByEmail(email);
      if (existingEmail) {
        // Link firebase UID to existing user
        await store.updateUser(existingEmail._id, { firebaseUid });
        user = (await store.getUserById(existingEmail._id))!;
      } else {
        // Create new user
        const userCount = await store.getUserCount();
        const isFirstUser = userCount === 0;
        const _id = await store.getNextId("usr");
        const username = email.split("@")[0] + "_" + _id.slice(-4);

        const newUser: MemoryUser = {
          _id,
          firebaseUid,
          fullName: displayName || email.split("@")[0],
          username,
          email,
          phone: null,
          companyName: "Personal",
          companyWebsite: null,
          companySize: "1-10",
          industry: "Technology",
          password: "", // No password — Firebase Auth handles auth
          role: isFirstUser ? "admin" : "user",
          status: "active",
          scanCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await store.addUser(newUser);
        await store.addLog("info", `New user synced from Firebase: ${email}`, _id);
        user = newUser;
      }
    }

    res.json({
      success: true,
      data: {
        _id: user!._id,
        fullName: user!.fullName,
        username: user!.username,
        email: user!.email,
        role: user!.role,
        status: user!.status,
        companyName: user!.companyName,
      },
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Firebase sync error:", err);
    res.status(401).json({ success: false, data: null, error: "Invalid Firebase token", timestamp: new Date().toISOString() });
  }
});

// Register (legacy JWT — kept for backward compatibility when Firebase is not configured)
authRoutes.post("/register", async (req: Request, res: Response) => {
  const adminAuth = getAdminAuth();
  if (adminAuth) {
    res.status(400).json({ success: false, data: null, error: "Use Firebase Auth to register", timestamp: new Date().toISOString() });
    return;
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid input", timestamp: new Date().toISOString() });
    return;
  }

  const { fullName, username, email, phone, companyName, companyWebsite, companySize, industry, password } = parsed.data;

  const existingEmail = await store.getUserByEmail(email);
  if (existingEmail) {
    res.status(409).json({ success: false, data: null, error: "Email already registered", timestamp: new Date().toISOString() });
    return;
  }

  const existingUsername = await store.getUserByUsername(username);
  if (existingUsername) {
    res.status(409).json({ success: false, data: null, error: "Username already taken", timestamp: new Date().toISOString() });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userCount = await store.getUserCount();
  const isFirstUser = userCount === 0;

  const _id = await store.getNextId("usr");

  const user: MemoryUser = {
    _id,
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

  await store.addUser(user);
  await store.addLog("info", `New user registered: ${email} (${companyName})`, user._id);

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

// Login (legacy JWT — kept for backward compatibility)
authRoutes.post("/login", async (req: Request, res: Response) => {
  const adminAuth = getAdminAuth();
  if (adminAuth) {
    res.status(400).json({ success: false, data: null, error: "Use Firebase Auth to sign in", timestamp: new Date().toISOString() });
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, data: null, error: "Invalid email or password", timestamp: new Date().toISOString() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await store.getUserByEmail(email);

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
    await store.addLog("warn", `Failed login attempt for ${email}`, user._id);
    res.status(401).json({ success: false, data: null, error: "Invalid email or password", timestamp: new Date().toISOString() });
    return;
  }

  const token = generateToken(user._id);

  await store.addLog("info", `User logged in: ${email}`, user._id);

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

// Get current user (supports both Firebase and legacy JWT)
authRoutes.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, data: null, error: "Not authenticated", timestamp: new Date().toISOString() });
    return;
  }

  const token = authHeader.slice(7);
  const adminAuth = getAdminAuth();

  // Firebase mode
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const user = await store.getUserByFirebaseUid(decoded.uid);
      if (!user) {
        res.status(401).json({ success: false, data: null, error: "User not found. Please sync your account.", timestamp: new Date().toISOString() });
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
    return;
  }

  // Legacy JWT mode
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await store.getUserById(decoded.userId);

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
