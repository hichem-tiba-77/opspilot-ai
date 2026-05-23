import Link from "next/link";

type ProjectCardProps = {
  id: number;
  name: string;
  description: string;
  status: string;
  environment: string;
  logs_count: number;
  incidents_count: number;
};

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "warning":
      return "border-yellow-800 bg-yellow-950 text-yellow-300";
    case "critical":
      return "border-red-800 bg-red-950 text-red-300";
    default:
      return "border-emerald-800 bg-emerald-950 text-emerald-300";
  }
}

export function ProjectCard({
  id,
  name,
  description,
  status,
  environment,
  logs_count,
  incidents_count,
}: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-white">{name}</h2>
          <p className="mt-1 text-xs text-slate-500">{environment}</p>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>

        <span
          className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(status)}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Logs</p>
          <p className="mt-2 text-2xl font-bold text-white">{logs_count}</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Incidents</p>
          <p className="mt-2 text-2xl font-bold text-white">{incidents_count}</p>
        </div>
      </div>

      <Link
        href={`/projects/${id}`}
        className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        View details →
      </Link>
    </div>
  );
}