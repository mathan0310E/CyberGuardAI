import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { CyberGrid } from "@/components/effects/CyberGrid";
import { AuthProvider } from "@/lib/auth-context";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "CyberGuard AI — AI-Powered Cybersecurity Platform",
  description:
    "Enterprise-grade AI platform for detecting malware, phishing, and security threats. Real-time threat intelligence, vulnerability scanning, and automated incident response.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text antialiased">
        <AuthProvider>
          <AnimatedBackground />
          <CyberGrid />
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0B1120",
                border: "1px solid rgba(0,229,255,0.15)",
                color: "#F8FAFC",
                boxShadow: "0 0 20px rgba(0,229,255,0.1)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
