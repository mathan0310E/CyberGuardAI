import PDFDocument from "pdfkit";
import type { MemoryScan } from "../../lib/store.js";

const COLORS = {
  primary: "#7C3AED",
  accent: "#38BDF8",
  text: "#1E293B",
  muted: "#64748B",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#22C55E",
  bg: "#F8FAFC",
  white: "#FFFFFF",
};

export async function generatePDFReport(scan: MemoryScan): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      info: {
        Title: `CyberGuard AI Report - ${scan.domain}`,
        Author: "CyberGuard AI",
        Subject: "Website Security Assessment Report",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover Page
    doc.rect(0, 0, 595.28, 841.89).fill("#09090B");
    doc.fontSize(36).fillColor(COLORS.white).text("CyberGuard AI", 50, 150, { align: "center" });
    doc.fontSize(14).fillColor("#94A3B8").text("Website Security Assessment Report", 50, 200, { align: "center" });
    doc.moveDown(3);
    doc.fontSize(24).fillColor(COLORS.accent).text(scan.domain, { align: "center" });
    doc.moveDown(1);
    doc.fontSize(14).fillColor("#94A3B8").text(`Risk Score: ${scan.riskScore}/100 (${scan.riskLevel})`, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#64748B").text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.text(`URL: ${scan.url}`, { align: "center" });

    // New Page
    doc.addPage();
    doc.rect(0, 0, 595.28, 50).fill(COLORS.primary);
    doc.fontSize(18).fillColor(COLORS.white).text("Executive Summary", 50, 16);
    doc.moveDown(2);
    doc.fontSize(11).fillColor(COLORS.text);
    const summary = scan.aiAnalysis ? (scan.aiAnalysis as Record<string, unknown>)["executiveSummary"] as string : "Scan analysis pending.";
    doc.text(summary, 50, 80, { width: 495 });
    doc.moveDown(2);

    // Website Info
    doc.fontSize(18).fillColor(COLORS.primary).text("Website Information", 50);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(COLORS.text);
    doc.text(`URL: ${scan.url}`);
    doc.text(`Domain: ${scan.domain}`);
    doc.text(`Scan Date: ${scan.startedAt ? new Date(scan.startedAt).toLocaleString() : "N/A"}`);
    doc.text(`Duration: ${scan.duration ? `${scan.duration}s` : "In progress"}`);
    doc.text(`Status: ${scan.status}`);
    doc.moveDown(2);

    // Threat Intelligence
    if (scan.threatIntel && scan.threatIntel.length > 0) {
      doc.fontSize(18).fillColor(COLORS.primary).text("Threat Intelligence", 50);
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor(COLORS.text);
      for (const ti of scan.threatIntel) {
        const tiData = ti as Record<string, unknown>;
        const statusColor = tiData["status"] === "malicious" ? COLORS.danger :
          tiData["status"] === "suspicious" ? COLORS.warning : COLORS.success;
        doc.fontSize(10).fillColor(statusColor).text(`${tiData["source"]}: ${tiData["status"]} — ${tiData["details"]}`);
        doc.moveDown(0.3);
      }
      doc.moveDown(1);
    }

    // Malware Findings
    if (scan.malwareIndicators && scan.malwareIndicators.length > 0) {
      doc.addPage();
      doc.rect(0, 0, 595.28, 50).fill(COLORS.primary);
      doc.fontSize(18).fillColor(COLORS.white).text("Malware Findings", 50, 16);
      doc.moveDown(2);

      for (const indicator of scan.malwareIndicators) {
        const ind = indicator as Record<string, unknown>;
        const severityColor = ind["severity"] === "critical" ? COLORS.danger :
          ind["severity"] === "high" ? COLORS.warning : COLORS.muted;

        doc.fontSize(12).fillColor(severityColor).text(`${ind["severity"]?.toString().toUpperCase()}: ${ind["title"]}`);
        doc.fontSize(9).fillColor(COLORS.muted).text(`Category: ${ind["category"]} | Location: ${ind["location"]}`);
        doc.fontSize(10).fillColor(COLORS.text).text(ind["description"]?.toString() ?? "", { indent: 20 });
        doc.moveDown(0.5);
      }
    }

    // Recommendations
    doc.addPage();
    doc.rect(0, 0, 595.28, 50).fill(COLORS.primary);
    doc.fontSize(18).fillColor(COLORS.white).text("Recommendations", 50, 16);
    doc.moveDown(2);
    doc.fontSize(10).fillColor(COLORS.text);

    const recs = scan.aiAnalysis ? (scan.aiAnalysis as Record<string, unknown>)["recommendations"] as string[] ?? [] : [];
    for (let i = 0; i < recs.length; i++) {
      doc.text(`${i + 1}. ${recs[i]}`, { indent: 20, width: 475 });
      doc.moveDown(0.3);
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor("#94A3B8").text(
        `CyberGuard AI — Confidential Security Report`,
        50,
        doc.page.height - 40,
        { align: "center", width: 495 }
      );
    }

    doc.end();
  });
}
