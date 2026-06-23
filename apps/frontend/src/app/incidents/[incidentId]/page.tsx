import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import {
  HumanizedBadge,
  getIncidentStatusTone,
  getSeverityTone,
} from "@/components/StatusBadge";
import { serverFetch } from "@/lib/api-server";
import { formatDateTime } from "@/lib/utils";
import type { Incident, ProjectDetail } from "@/lib/api";

type IncidentDetailsPageProps = {
  params: Promise<{ incidentId: string }>;
};

export default async function IncidentDetailsPage({
  params,
}: IncidentDetailsPageProps) {
  const { incidentId } = await params;

  let incident: Incident;
  try {
    incident = await serverFetch<Incident>(`/api/v1/incidents/${incidentId}`);
  } catch {
    notFound();
  }

  let project: ProjectDetail | null = null;
  try {
    project = await serverFetch<ProjectDetail>(
      `/api/v1/projects/${incident.project_id}`
    );
  } catch {
    project = null;
  }

  return (
    <PageShell
      actions={
        <>
          <Link
            href={`/projects/${incident.project_id}/logs`}
            className="btn-primary"
          >
            <Icon name="logs" className="h-4 w-4" />
            View logs
          </Link>
          <Link
            href={`/projects/${incident.project_id}/ai`}
            className="btn-secondary"
          >
            <Icon name="bot" className="h-4 w-4" />
            Ask AI
          </Link>
        </>
      }
      backHref="/incidents"
      backLabel="Back to incidents"
      description={incident.description || "No description provided."}
      eyebrow="Incident Details"
      title={incident.title}
    >
      <section className="mb-6 flex flex-wrap items-center gap-2">
        <HumanizedBadge
          value={incident.severity}
          tone={getSeverityTone(incident.severity)}
        />
        <HumanizedBadge
          value={incident.status}
          tone={getIncidentStatusTone(incident.status)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm font-bold text-zinc-500">Affected project</p>
          {project ? (
            <Link
              href={`/projects/${incident.project_id}`}
              className="mt-3 inline-flex items-center gap-2 text-2xl font-black text-zinc-950 transition hover:text-emerald-700"
            >
              {project.name}
              <Icon name="arrow-right" className="h-5 w-5" />
            </Link>
          ) : (
            <p className="mt-3 text-2xl font-black text-zinc-950">
              Project #{incident.project_id}
            </p>
          )}
        </div>

        <div className="panel p-5">
          <p className="text-sm font-bold text-zinc-500">Created</p>
          <p className="mt-3 text-lg font-black text-zinc-950">
            {formatDateTime(incident.created_at)}
          </p>
        </div>

        <div className="panel p-5">
          <p className="text-sm font-bold text-zinc-500">Resolved at</p>
          <p className="mt-3 text-lg font-black text-zinc-950">
            {incident.resolved_at
              ? formatDateTime(incident.resolved_at)
              : "Not resolved yet"}
          </p>
        </div>
      </section>

      <section className="panel mt-6 p-5">
        <div className="flex items-center gap-2">
          <Icon name="terminal" className="h-5 w-5 text-emerald-700" />
          <h2 className="text-xl font-black text-zinc-950">
            Suggested investigation
          </h2>
        </div>

        <ol className="mt-5 grid gap-3 text-sm leading-6 text-zinc-700 md:grid-cols-2">
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            Review the most recent ERROR and WARN logs around the incident time.
          </li>
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            Compare the incident window with the latest deployment.
          </li>
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            Verify environment variables, service connectivity, and queue depth.
          </li>
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            Ask OpsPilot AI for a root-cause summary and fix checklist.
          </li>
        </ol>
      </section>
    </PageShell>
  );
}
