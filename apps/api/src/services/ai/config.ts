export const AI_CONFIG = {
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    modelsUrl: "https://openrouter.ai/api/v1/models",
    apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  },

  discovery: {
    refreshIntervalMs: 15 * 60 * 1000,
    requestTimeoutMs: 10000,
  },

  defaults: {
    temperature: 0.7,
    maxTokens: 2048,
    timeoutMs: 30000,
    maxRetries: 3,
    retryDelayMs: 1000,
    maxHistoryMessages: 20,
  },

  health: {
    cooldownMs: 60000,
    maxFailuresBeforeCooldown: 3,
  },

  filtering: {
    namePatterns: [
      /\b(music|musical|lyrics?|lyric|song|songs|singing|sing|vocal|voice|tts|text.to.speech|speech|audio|sound|melody|beat|rhythm|instrument|piano|guitar|drum|chord|harmony|compose|composer)\b/i,
      /\b(image|img|pic|picture|photo|photograph|draw|drawing|paint|painting|art|artwork|stable.diffusion|dall.e|midjourney|flux|sdxl|imagen)\b/i,
      /\b(video|vid|movie|film|animation|animate|animated|gen_video|video.gen)\b/i,
      /\b(embed|embedding|embeddings?|vector|vectors|text2vec)\b/i,
      /\b(rerank|reranking|re.rank)\b/i,
      /\b(moderate|moderation|moderator|content.safety|nsfw)\b/i,
      /\b(whisper|asr|stt|speech.to.text|transcri|transcription)\b/i,
      /\b(diagram|chart|graph|visuali[sz]ation|svg|plot|canvas)\b/i,
    ],

    idPatterns: [
      /\b(music|lyric|song|sing|vocal|voice|tts|speech|audio|sound|melody|beat)\b/i,
      /\b(image|img|dall.e|stable.diffusion|midjourney|flux|sdxl|imagen|paint)\b/i,
      /\b(video|movie|film|animate|gen_video)\b/i,
      /\b(embed|vector|text2vec)\b/i,
      /\b(rerank|re.rank)\b/i,
      /\b(moderate|moderation|nsfw|safety)\b/i,
      /\b(whisper|asr|stt|transcri)\b/i,
    ],

    allowedOutputModalities: ["text"],

    bannedModelIds: new Set<string>([
      "cohere/north-mini-code:free",
      "nvidia/nemotron-3.5-content-safety:free",
    ]),
  },

  healthCheck: {
    prompt: 'Say "Hello".',
    blacklistPatterns: [
      /\[\[A\d+\]\]/,
      /\[\[B\d+\]\]/,
      /\b(lyrics?|timestamps?|chorus|verse|bridge|outro|intro|music|sing|song|melody|beat|rhythm|instrument)\b/i,
      /\b(\[Verse\]|\[Chorus\]|\[Bridge\]|\[Outro\]|\[Intro\])\b/i,
    ],
  },
} as const;

export type ModelTier = "greeting" | "reasoning" | "coding" | "general";

export interface FreeModel {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  maxOutputTokens: number;
  tier: ModelTier;
  capability: "chat" | "reasoning" | "coding";
}
