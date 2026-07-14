import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isValid, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

export function safeDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === "number") {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }
  if (typeof value === "object" && value !== null && "seconds" in value && "nanoseconds" in value) {
    const ts = value as { seconds: number; nanoseconds: number };
    const d = new Date(ts.seconds * 1000 + ts.nanoseconds / 1_000_000);
    return isValid(d) ? d : null;
  }
  return null;
}

export function safeFormatDistanceToNow(value: unknown, fallback = "Unknown"): string {
  const d = safeDate(value);
  if (!d) return fallback;
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return fallback;
  }
}

export function safeToLocaleDateString(value: unknown, fallback = "Unknown", options?: Intl.DateTimeFormatOptions): string {
  const d = safeDate(value);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString("en-US", options);
  } catch {
    return fallback;
  }
}

export function safeToLocaleString(value: unknown, fallback = "Unknown", options?: Intl.DateTimeFormatOptions): string {
  const d = safeDate(value);
  if (!d) return fallback;
  try {
    return d.toLocaleString("en-US", options);
  } catch {
    return fallback;
  }
}
