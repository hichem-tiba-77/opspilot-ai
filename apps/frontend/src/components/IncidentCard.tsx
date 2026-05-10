import Link from "next/link";
import type { IncidentSeverity, IncidentStatus } from "@/lib/incidents";

type IncidentCardProps = {
  id: number;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary: string;
  createdAt: string;
};

function getSeverityClass(severity: IncidentSeverity) {
  if (severity === "Critical") {
    return "border-red-900 bg-red-950 text-red-300";
  }

  if (severity === "High") {
    return "border-orange-900 bg-orange-950 text-orange-300";
  }

  if (severity === "Medium") {
    return "border-yellow-900 bg-yellow-950 text-yellow-300";
  }

  return "border-slate-700 bg-slate-950 text-slate-300";
}

function getStatusClass(status: IncidentStatus) {
  if (status === "Resolved") {
    return "border-emerald-900 bg-emerald-950 text-emerald-300";
  }

  if (status === "Investigating") {
    return "border-blue-900 bg-blue-950 text-blue-300";
  }

  return "border-red-900 bg-red-950 text-red-300";
}

export function IncidentCard({
  id,
  title,
  severity,
  status,
  summary,
  createdAt,
}: IncidentCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">{summary}</p>
        </div>

        <div className="flex gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityClass(
              severity
            )}`}
          >
            {severity}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">Created at: {createdAt}</p>

      <Link
        href={`/incidents/${id}`}
        className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        View incident
      </Link>
    </div>
  );
}