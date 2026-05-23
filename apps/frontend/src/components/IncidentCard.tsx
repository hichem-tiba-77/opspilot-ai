import type { IncidentSeverity, IncidentStatus } from "@/lib/api";

type IncidentCardProps = {
  id: number;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  createdAt: string;
  projectId: number;
};

function getSeverityClass(severity: IncidentSeverity) {
  switch (severity) {
    case "critical":
      return "border-red-900 bg-red-950 text-red-300";
    case "high":
      return "border-orange-900 bg-orange-950 text-orange-300";
    case "medium":
      return "border-yellow-900 bg-yellow-950 text-yellow-300";
    default:
      return "border-slate-700 bg-slate-950 text-slate-300";
  }
}

function getStatusClass(status: IncidentStatus) {
  switch (status) {
    case "resolved":
      return "border-emerald-900 bg-emerald-950 text-emerald-300";
    case "investigating":
      return "border-blue-900 bg-blue-950 text-blue-300";
    default:
      return "border-red-900 bg-red-950 text-red-300";
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function IncidentCard({
  id,
  title,
  severity,
  status,
  description,
  createdAt,
  projectId,
}: IncidentCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          )}
        </div>

        <div className="flex flex-shrink-0 gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityClass(severity)}`}
          >
            {capitalize(severity)}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(status)}`}
          >
            {capitalize(status)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {new Date(createdAt).toLocaleString()}
      </p>

      <a
        href={`/projects/${projectId}/incidents/${id}`}
        className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        View incident →
      </a>
    </div>
  );
}