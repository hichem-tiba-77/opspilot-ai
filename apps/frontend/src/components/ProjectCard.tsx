import Link from "next/link";
import { Icon } from "@/components/Icon";
import { StatusBadge, getProjectStatusTone } from "@/components/StatusBadge";
import { capitalize, formatDateTime } from "@/lib/utils";

type ProjectCardProps = {
  id: number;
  name: string;
  description: string;
  status: string;
  environment: string;
  logs_count: number;
  incidents_count: number;
  last_log_at?: string | null;
  open_incidents?: number;
};

export function ProjectCard({
  id,
  name,
  description,
  status,
  environment,
  logs_count,
  incidents_count,
  last_log_at,
  open_incidents = 0,
}: ProjectCardProps) {
  return (
    <article className="panel group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
            {capitalize(environment)}
          </p>
          <h2 className="mt-2 truncate text-xl font-black text-zinc-950">
            {name}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
            {description || "No description provided."}
          </p>
        </div>

        <StatusBadge
          className="shrink-0"
          tone={getProjectStatusTone(status)}
        >
          {capitalize(status)}
        </StatusBadge>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div className="panel-muted p-3">
          <p className="text-xs font-bold text-zinc-500">Logs</p>
          <p className="mt-2 text-2xl font-black text-zinc-950">
            {logs_count.toLocaleString()}
          </p>
        </div>

        <div className="panel-muted p-3">
          <p className="text-xs font-bold text-zinc-500">Open</p>
          <p className="mt-2 text-2xl font-black text-zinc-950">
            {open_incidents.toLocaleString()}
          </p>
        </div>

        <div className="panel-muted p-3">
          <p className="text-xs font-bold text-zinc-500">Total</p>
          <p className="mt-2 text-2xl font-black text-zinc-950">
            {incidents_count.toLocaleString()}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs font-medium text-zinc-500">
        Last log: {formatDateTime(last_log_at)}
      </p>

      <Link
        href={`/projects/${id}`}
        className="btn-secondary mt-5 w-full justify-between"
      >
        View details
        <Icon
          name="arrow-right"
          className="h-4 w-4 transition group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
}
