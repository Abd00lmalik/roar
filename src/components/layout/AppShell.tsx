"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === "/" || pathname === "/onboarding";

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {!hideChrome ? <Navbar /> : null}
      <main>{children}</main>
      {!hideChrome ? <BottomNav /> : null}
    </div>
  );
}
