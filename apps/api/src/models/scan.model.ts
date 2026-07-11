import mongoose, { Schema, type Document } from "mongoose";

export interface IScan extends Document {
  url: string;
  domain: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  scanOptions: {
    deepScan: boolean;
    captureScreenshot: boolean;
    runOCR: boolean;
    runCV: boolean;
    checkThreatIntel: boolean;
    analyzeJS: boolean;
  };
  htmlAnalysis: Record<string, unknown> | null;
  jsAnalysis: Record<string, unknown> | null;
  screenshot: Record<string, unknown> | null;
  ocrResults: Record<string, unknown> | null;
  cvAnalysis: Record<string, unknown> | null;
  threatIntel: Record<string, unknown>[];
  technologies: Record<string, unknown>[];
  malwareIndicators: Record<string, unknown>[];
  aiAnalysis: Record<string, unknown> | null;
  reportId: mongoose.Types.ObjectId | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    url: { type: String, required: true },
    domain: { type: String, required: true },
    status: { type: String, default: "pending" },
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, default: "safe" },
    scanOptions: {
      deepScan: { type: Boolean, default: true },
      captureScreenshot: { type: Boolean, default: true },
      runOCR: { type: Boolean, default: true },
      runCV: { type: Boolean, default: true },
      checkThreatIntel: { type: Boolean, default: true },
      analyzeJS: { type: Boolean, default: true },
    },
    htmlAnalysis: { type: Schema.Types.Mixed, default: null },
    jsAnalysis: { type: Schema.Types.Mixed, default: null },
    screenshot: { type: Schema.Types.Mixed, default: null },
    ocrResults: { type: Schema.Types.Mixed, default: null },
    cvAnalysis: { type: Schema.Types.Mixed, default: null },
    threatIntel: [{ type: Schema.Types.Mixed }],
    technologies: [{ type: Schema.Types.Mixed }],
    malwareIndicators: [{ type: Schema.Types.Mixed }],
    aiAnalysis: { type: Schema.Types.Mixed, default: null },
    reportId: { type: Schema.Types.ObjectId, ref: "Report", default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    duration: { type: Number, default: null },
  },
  { timestamps: true }
);

ScanSchema.index({ domain: 1 });
ScanSchema.index({ status: 1 });
ScanSchema.index({ createdAt: -1 });

export const Scan = mongoose.model<IScan>("Scan", ScanSchema);
