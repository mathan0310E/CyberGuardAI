import { type Request, type Response, type NextFunction } from "express";
import { getAdminAuth } from "../firebase.js";
import { store } from "../store.js";

export interface AuthRequest extends Request {
  userId?: string;
  firebaseUid?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, data: null, error: "Authentication required", timestamp: new Date().toISOString() });
    return;
  }

  const token = authHeader.slice(7);
  const adminAuth = getAdminAuth();

  // Firebase mode: verify ID token
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const firebaseUid = decoded.uid;

      // Find user in store by firebaseUid
      const user = await store.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        res.status(401).json({ success: false, data: null, error: "User not found. Please sync your account.", timestamp: new Date().toISOString() });
        return;
      }

      if (user.status === "blocked" || user.status === "suspended") {
        res.status(403).json({ success: false, data: null, error: "Account is not active", timestamp: new Date().toISOString() });
        return;
      }

      req.userId = user._id;
      req.firebaseUid = firebaseUid;
      next();
    } catch {
      res.status(401).json({ success: false, data: null, error: "Invalid or expired token", timestamp: new Date().toISOString() });
    }
    return;
  }

  // Fallback: legacy JWT mode (when Firebase not configured)
  const JWT_SECRET = process.env["JWT_SECRET"];
  if (!JWT_SECRET) {
    res.status(500).json({ success: false, data: null, error: "Authentication not configured", timestamp: new Date().toISOString() });
    return;
  }
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await store.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, data: null, error: "User not found", timestamp: new Date().toISOString() });
      return;
    }

    if (user.status === "blocked" || user.status === "suspended") {
      res.status(403).json({ success: false, data: null, error: "Account is not active", timestamp: new Date().toISOString() });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, data: null, error: "Invalid token", timestamp: new Date().toISOString() });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, data: null, error: "Authentication required", timestamp: new Date().toISOString() });
      return;
    }
    const user = await store.getUserById(userId);
    if (!user || user.role !== "admin") {
      res.status(403).json({ success: false, data: null, error: "Admin access required", timestamp: new Date().toISOString() });
      return;
    }
    next();
  });
}
