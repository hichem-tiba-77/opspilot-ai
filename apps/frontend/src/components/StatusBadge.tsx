import type { ReactNode } from "react";
import type { IncidentSeverity, IncidentStatus } from "@/lib/api";
import { capitalize, cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-zinc-200 bg-zinc-100 text-zinc-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

type StatusBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
};

export function StatusBadge({
  children,
  className,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function getProjectStatusTone(status: string): BadgeTone {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "critical") {
    return "danger";
  }

  if (normalizedStatus === "warning") {
    return "warning";
  }

  return "success";
}

export function getSeverityTone(severity: IncidentSeverity): BadgeTone {
  if (severity === "critical" || severity === "high") {
    return "danger";
  }

  if (severity === "medium") {
    return "warning";
  }

  return "neutral";
}

export function getIncidentStatusTone(status: IncidentStatus): BadgeTone {
  if (status === "resolved") {
    return "success";
  }

  if (status === "investigating") {
    return "info";
  }

  return "danger";
}

export function HumanizedBadge({
  value,
  tone,
}: {
  value: string;
  tone?: BadgeTone;
}) {
  return <StatusBadge tone={tone}>{capitalize(value)}</StatusBadge>;
}
