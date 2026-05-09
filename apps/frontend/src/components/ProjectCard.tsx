import Link from "next/link";

type ProjectCardProps = {
  id: number;
  name: string;
  description: string;
  status: string;
  logsCount: number;
  incidentsCount: number;
};

export function ProjectCard({
  id,
  name,
  description,
  status,
  logsCount,
  incidentsCount,
}: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{name}</h2>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>

        <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
          {status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Logs</p>
          <p className="mt-2 text-2xl font-bold text-white">{logsCount}</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Incidents</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {incidentsCount}
          </p>
        </div>
      </div>

      <Link
        href={`/projects/${id}`}
        className="mt-6 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        View details
      </Link>
    </div>
  );
}