import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, getProjectStatusTone } from "@/components/StatusBadge";
import { serverFetch } from "@/lib/api-server";
import { capitalize, formatDateTime } from "@/lib/utils";
import type { ProjectDetail } from "@/lib/api";

type ProjectDetailsPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { projectId } = await params;

  let project: ProjectDetail;
  try {
    project = await serverFetch<ProjectDetail>(`/api/v1/projects/${projectId}`);
  } catch {
    notFound();
  }

  return (
    <PageShell
      actions={
        <>
          <Link href={`/projects/${projectId}/logs/upload`} className="btn-primary">
            <Icon name="upload" className="h-4 w-4" />
            Upload logs
          </Link>
          <Link href={`/projects/${projectId}/ai`} className="btn-secondary">
            <Icon name="bot" className="h-4 w-4" />
            Ask AI
          </Link>
        </>
      }
      backHref="/projects"
      backLabel="Back to projects"
      description={project.description || "No description provided."}
      eyebrow="Project Details"
      title={project.name}
    >
      <section className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge tone={getProjectStatusTone(project.status)}>
          {capitalize(project.status)}
        </StatusBadge>
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-zinc-600">
          {capitalize(project.environment)}
        </span>
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-zinc-600">
          Last log: {formatDateTime(project.last_log_at)}
        </span>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          accent="green"
          description="Deployment target"
          icon="terminal"
          label="Environment"
          value={capitalize(project.environment)}
        />
        <StatCard
          accent="cyan"
          description="Stored for investigation"
          icon="logs"
          label="Logs analyzed"
          value={project.logs_count.toLocaleString()}
        />
        <StatCard
          accent={project.open_incidents ? "rose" : "amber"}
          description={`${project.open_incidents ?? 0} currently open`}
          icon="alert"
          label="Incidents"
          value={project.incidents_count.toLocaleString()}
        />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          href={`/projects/${projectId}/logs`}
          className="panel group p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-xl"
        >
          <Icon name="logs" className="h-5 w-5 text-cyan-700" />
          <h2 className="mt-4 text-lg font-black text-zinc-950">View logs</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Inspect the latest log evidence, sorted by timestamp.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-950">
            Open logs
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition group-hover:translate-x-0.5"
            />
          </span>
        </Link>

        <Link
          href={`/projects/${projectId}/logs/upload`}
          className="panel group p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-xl"
        >
          <Icon name="upload" className="h-5 w-5 text-emerald-700" />
          <h2 className="mt-4 text-lg font-black text-zinc-950">Upload logs</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Paste logs or upload a text file for AI-ready analysis.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-950">
            Add evidence
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition group-hover:translate-x-0.5"
            />
          </span>
        </Link>

        <Link
          href={`/projects/${projectId}/ai`}
          className="panel group p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-xl"
        >
          <Icon name="bot" className="h-5 w-5 text-amber-700" />
          <h2 className="mt-4 text-lg font-black text-zinc-950">Ask AI</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Generate a root-cause summary, fix plan, or incident report.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-950">
            Start analysis
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      </section>
    </PageShell>
  );
}
