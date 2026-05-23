"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const protectedNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Incidents", href: "/incidents" },
  { label: "Settings", href: "/settings" },
];

export function AppNavbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-white">
          OpsPilot AI
        </Link>

        <div className="flex items-center gap-4">
          {!isLoading && user && (
            <>
              {protectedNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}

              <span className="text-sm text-slate-500">{user.name}</span>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Logout
              </button>
            </>
          )}

          {!isLoading && !user && (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 transition hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}