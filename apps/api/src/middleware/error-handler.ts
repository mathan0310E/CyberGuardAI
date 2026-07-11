import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal server error";

  logger.error(`${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
    timestamp: new Date().toISOString(),
  });
}
