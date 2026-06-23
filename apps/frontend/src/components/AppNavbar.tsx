"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const protectedNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Projects", href: "/projects", icon: "folder" },
  { label: "Incidents", href: "/incidents", icon: "alert" },
  { label: "Settings", href: "/settings", icon: "settings" },
] satisfies Array<{ label: string; href: string; icon: IconName }>;

const publicNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
];

export function AppNavbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/92 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:grid lg:min-h-20 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(280px,1fr)] lg:items-center lg:gap-6">
        <Link
          href={user ? "/dashboard" : "/"}
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-zinc-950 text-white shadow-sm transition group-hover:scale-[1.02]">
            <Icon name="activity" className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black leading-tight tracking-normal text-zinc-950">
              OpsPilot AI
            </span>
            <span className="block truncate text-xs font-semibold text-zinc-500">
              Incident command center
            </span>
          </span>
        </Link>

        {!isLoading && user && (
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-1 lg:justify-self-center lg:overflow-visible">
            {protectedNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3.5 text-sm font-bold transition",
                    isActive
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && !user && (
          <div className="hidden items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 lg:flex lg:justify-self-center">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center rounded-md px-3.5 text-sm font-bold text-zinc-600 transition hover:bg-white hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex min-w-0 items-center gap-2 lg:justify-self-end">
          <ThemeToggle />

          {!isLoading && user && (
            <>
              <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 lg:flex">
                <Icon name="user" className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="max-w-44 truncate text-sm font-bold text-zinc-700">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-950"
                type="button"
              >
                <Icon name="log-out" className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {!isLoading && !user && (
            <>
              <Link href="/login" className="btn-secondary min-h-10 px-3">
                Login
              </Link>
              <Link href="/register" className="btn-primary min-h-10 px-3">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
