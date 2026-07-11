import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { CyberGrid } from "@/components/effects/CyberGrid";
import { AuthProvider } from "@/lib/auth-context";

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
        <AuthProvider>
          <AnimatedBackground />
          <CyberGrid />
          <div className="relative z-10 flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 md:ml-60 pt-14 md:pt-0">{children}</main>
          </div>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#111827",
                border: "1px solid #1E293B",
                color: "#F8FAFC",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
