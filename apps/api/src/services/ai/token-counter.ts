export function estimateTokens(text: string): number {
  if (!text) return 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 0x7F) {
      count += code === 0x20 || code === 0x0A ? 1 : (code >= 0x21 && code <= 0x7E) ? 1 : 1;
    } else if (code <= 0x7FF) {
      count += 1;
    } else if (code >= 0xD800 && code <= 0xDBFF) {
      count += 2;
      i++;
    } else {
      count += 1;
    }
  }
  return Math.max(1, Math.ceil(count / 3.5));
}

export function countMessageTokens(messages: Array<{ role: string; content: string }>): number {
  let total = 0;
  for (const msg of messages) {
    total += estimateTokens(msg.content);
    total += 4;
  }
  total += 2;
  return total;
}

export function fitMessagesToLimit(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): Array<{ role: string; content: string }> {
  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystem = messages.filter((m) => m.role !== "system");

  const systemTokens = systemMsg ? countMessageTokens([systemMsg]) : 0;
  const available = maxTokens - systemTokens - 100;

  if (available <= 0) return systemMsg ? [systemMsg] : [];

  const result: Array<{ role: string; content: string }> = [];
  let used = 0;

  for (let i = nonSystem.length - 1; i >= 0; i--) {
    const msg = nonSystem[i]!;
    const tokens = countMessageTokens([msg]);
    if (used + tokens > available) break;
    used += tokens;
    result.unshift(msg);
  }

  if (systemMsg) result.unshift(systemMsg);
  return result;
}
