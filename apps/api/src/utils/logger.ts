const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /sk-or-v1-[a-f0-9]+/gi,
  /AIzaSy[A-Za-z0-9\-._]{33}/g,
  /password["\s]*[:=]["\s]*["'][^"']+["']/gi,
  /token["\s]*[:=]["\s]*["'][^"']+["']/gi,
  /secret["\s]*[:=]["\s]*["'][^"']+["']/gi,
  /api[_-]?key["\s]*[:=]["\s]*["'][^"']+["']/gi,
  /private[_-]?key["\s]*[:=]["\s]*["'][^"']+["']/gi,
];

function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    let sanitized = value;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match) => {
        const eqIdx = match.indexOf("=");
        if (eqIdx === -1) return match.slice(0, 12) + "***REDACTED***";
        return match.slice(0, eqIdx + 1) + "***REDACTED***";
      });
    }
    return sanitized;
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitize(v);
    }
    return out;
  }
  return value;
}

function formatMessage(level: string, msg: string, data?: unknown): string {
  const ts = new Date().toISOString();
  if (data !== undefined) {
    return `[${ts}] [${level.toUpperCase()}] ${msg} ${JSON.stringify(sanitize(data))}`;
  }
  return `[${ts}] [${level.toUpperCase()}] ${msg}`;
}

export const logger = {
  info(msg: string, data?: unknown) {
    console.log(formatMessage("info", msg, data));
  },
  warn(msg: string, data?: unknown) {
    console.warn(formatMessage("warn", msg, data));
  },
  error(msg: string, data?: unknown) {
    console.error(formatMessage("error", msg, data));
  },
  sanitize,
};
