"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

const AUTH_PATHS = ["/auth/login", "/auth/register"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <div className="relative z-10 min-h-screen">{children}</div>;
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 md:ml-60 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
