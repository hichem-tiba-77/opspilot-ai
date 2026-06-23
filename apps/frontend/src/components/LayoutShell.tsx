"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const isWorkspace = !isLoading && user && !isPublicPage;

  return (
    <div className={isWorkspace ? "min-h-screen bg-zinc-50" : "min-h-screen"}>
      {children}
    </div>
  );
}
