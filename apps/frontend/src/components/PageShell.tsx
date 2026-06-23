import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

type PageShellProps = {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  maxWidth?: "narrow" | "wide";
  title: string;
};

export function PageShell({
  actions,
  backHref,
  backLabel = "Back",
  children,
  className,
  description,
  eyebrow,
  maxWidth = "wide",
  title,
}: PageShellProps) {
  return (
    <main className="app-surface min-h-screen text-zinc-950">
      <div
        className={cn(
          "mx-auto px-4 py-6 sm:px-6 lg:py-8",
          maxWidth === "narrow" ? "max-w-3xl" : "max-w-6xl",
          className
        )}
      >
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            {backLabel}
          </Link>
        )}

        <header
          className={cn(
            "mb-8 flex flex-col gap-5",
            actions ? "sm:flex-row sm:items-end sm:justify-between" : ""
          )}
        >
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-emerald-700">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </header>

        {children}
      </div>
    </main>
  );
}
