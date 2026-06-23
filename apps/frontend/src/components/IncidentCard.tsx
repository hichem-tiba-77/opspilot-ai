import Link from "next/link";
import type { IncidentSeverity, IncidentStatus } from "@/lib/api";
import { Icon } from "@/components/Icon";
import {
  HumanizedBadge,
  getIncidentStatusTone,
  getSeverityTone,
} from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/utils";

type IncidentCardProps = {
  id: number;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  createdAt: string;
  projectId: number;
};

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
    <article className="panel group p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
            <Icon name="alert" className="h-4 w-4" />
            Project #{projectId}
          </div>
          <h2 className="mt-2 text-xl font-black text-zinc-950">{title}</h2>
          {description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <HumanizedBadge value={severity} tone={getSeverityTone(severity)} />
          <HumanizedBadge value={status} tone={getIncidentStatusTone(status)} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-zinc-500">
          Opened {formatDateTime(createdAt)}
        </p>

        <Link href={`/incidents/${id}`} className="btn-secondary min-h-10">
          View incident
          <Icon
            name="arrow-right"
            className="h-4 w-4 transition group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
