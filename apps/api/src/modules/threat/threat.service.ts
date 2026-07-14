import type { ThreatIntelResult } from "@cyberguard/types";

const TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function checkVirusTotal(domain: string): Promise<ThreatIntelResult> {
  const apiKey = process.env["VIRUSTOTAL_API_KEY"];
  if (!apiKey) {
    return { source: "virustotal", status: "unknown", details: "API key not configured", score: null, lastChecked: new Date().toISOString() };
  }

  try {
    const res = await fetchWithTimeout(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      { headers: { "x-apikey": apiKey } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { data?: { attributes?: { last_analysis_stats?: { malicious?: number; suspicious?: number; harmless?: number } } } };
    const stats = data.data?.attributes?.last_analysis_stats;
    const malicious = stats?.malicious ?? 0;
    const total = (stats?.malicious ?? 0) + (stats?.suspicious ?? 0) + (stats?.harmless ?? 0);

    const status = malicious > 5 ? "malicious" : malicious > 0 ? "suspicious" : "clean";

    return {
      source: "virustotal",
      status: status as ThreatIntelResult["status"],
      details: `${malicious}/${total} engines flagged this domain`,
      score: total > 0 ? Math.round((malicious / total) * 100) : 0,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return { source: "virustotal", status: "error", details: "Failed to check VirusTotal", score: null, lastChecked: new Date().toISOString() };
  }
}

export async function checkURLScan(domain: string): Promise<ThreatIntelResult> {
  const apiKey = process.env["URLSCAN_API_KEY"];
  if (!apiKey) {
    return { source: "urlscan", status: "unknown", details: "API key not configured", score: null, lastChecked: new Date().toISOString() };
  }

  try {
    const res = await fetchWithTimeout("https://urlscan.io/api/v1/search/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "API-Key": apiKey },
      body: JSON.stringify({ query: `domain:${domain}` }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { results?: Array<{ verdicts?: { malicious?: boolean; score?: number } }> };
    const result = data.results?.[0];
    const malicious = result?.verdicts?.malicious ?? false;
    const score = result?.verdicts?.score ?? 0;

    return {
      source: "urlscan",
      status: malicious ? "malicious" : score > 5 ? "suspicious" : "clean",
      details: malicious ? "Flagged as malicious by URLScan" : "No malicious verdicts found",
      score,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return { source: "urlscan", status: "error", details: "Failed to check URLScan.io", score: null, lastChecked: new Date().toISOString() };
  }
}

export async function checkAbuseIPDB(ip: string): Promise<ThreatIntelResult> {
  const apiKey = process.env["ABUSEIPDB_API_KEY"];
  if (!apiKey) {
    return { source: "abuseipdb", status: "unknown", details: "API key not configured", score: null, lastChecked: new Date().toISOString() };
  }

  try {
    const res = await fetchWithTimeout(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`,
      { headers: { Key: apiKey, Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { data?: { abuseConfidenceScore?: number } };
    const score = data.data?.abuseConfidenceScore ?? 0;

    return {
      source: "abuseipdb",
      status: score > 50 ? "malicious" : score > 10 ? "suspicious" : "clean",
      details: `Abuse confidence: ${score}%`,
      score,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return { source: "abuseipdb", status: "error", details: "Failed to check AbuseIPDB", score: null, lastChecked: new Date().toISOString() };
  }
}

export async function runThreatIntel(domain: string, ip?: string): Promise<ThreatIntelResult[]> {
  const results = await Promise.all([
    checkVirusTotal(domain),
    checkURLScan(domain),
    ...(ip ? [checkAbuseIPDB(ip)] : []),
  ]);
  return results;
}
