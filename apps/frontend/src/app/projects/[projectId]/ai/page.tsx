import Link from "next/link";
import { notFound } from "next/navigation";
import { AIAnalysisForm } from "@/components/forms/AIAnalysisForm";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { serverFetch } from "@/lib/api-server";
import type { ProjectDetail } from "@/lib/api";

type ProjectAIPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectAIPage({ params }: ProjectAIPageProps) {
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
          <Link href={`/projects/${projectId}/logs`} className="btn-secondary">
            <Icon name="logs" className="h-4 w-4" />
            Logs
          </Link>
          <Link
            href={`/projects/${projectId}/logs/upload`}
            className="btn-primary"
          >
            <Icon name="upload" className="h-4 w-4" />
            Upload
          </Link>
        </>
      }
      backHref={`/projects/${projectId}`}
      backLabel="Back to project"
      description="Turn logs into a focused root-cause investigation, mitigation plan, and incident-ready summary."
      eyebrow="AI Analysis"
      title={`Ask AI about ${project.name}`}
    >
      <AIAnalysisForm
        key={projectId}
        environment={project.environment}
        incidentsCount={project.incidents_count}
        lastLogAt={project.last_log_at}
        logsCount={project.logs_count}
        openIncidents={project.open_incidents ?? 0}
        projectId={projectId}
        projectName={project.name}
      />
    </PageShell>
  );
}
