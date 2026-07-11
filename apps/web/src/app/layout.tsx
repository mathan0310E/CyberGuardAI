import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { CyberGrid } from "@/components/effects/CyberGrid";

export const metadata: Metadata = {
  title: "CyberGuard AI — AI-Powered Website Threat Scanner",
  description:
    "Production-quality defensive AI platform for detecting malware, phishing, and security threats on websites. Scan any URL for hidden threats.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text antialiased">
        <AnimatedBackground />
        <CyberGrid />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
