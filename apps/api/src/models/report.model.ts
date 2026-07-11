import mongoose, { Schema, type Document } from "mongoose";

export interface IReport extends Document {
  scanId: mongoose.Types.ObjectId;
  title: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: string;
  summary: string;
  findingsCount: number;
  pdfData: Buffer | null;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    scanId: { type: Schema.Types.ObjectId, ref: "Scan", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    domain: { type: String, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    summary: { type: String, default: "" },
    findingsCount: { type: Number, default: 0 },
    pdfData: { type: Buffer, default: null },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReportSchema.index({ domain: 1 });
ReportSchema.index({ createdAt: -1 });

export const Report = mongoose.model<IReport>("Report", ReportSchema);
