import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { store } from "../store.js";

const JWT_SECRET = process.env["JWT_SECRET"] ?? "cyberguard-dev-secret-change-in-production";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, data: null, error: "Authentication required", timestamp: new Date().toISOString() });
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
