import { z } from "zod";

export const scanRequestSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
  options: z
    .object({
      deepScan: z.boolean().default(true),
      captureScreenshot: z.boolean().default(true),
      runOCR: z.boolean().default(true),
      runCV: z.boolean().default(true),
      checkThreatIntel: z.boolean().default(true),
      analyzeJS: z.boolean().default(true),
    })
    .optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(10000),
  scanId: z.string().optional(),
  conversationId: z.string().optional(),
  history: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string(),
      })
    )
    .default([]),
});
