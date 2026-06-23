import { notFound } from "next/navigation";
import { LogUploadForm } from "@/components/forms/LogUploadForm";
import { PageShell } from "@/components/PageShell";
import { serverFetch } from "@/lib/api-server";
import type { ProjectDetail } from "@/lib/api";

type UploadLogsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function UploadLogsPage({ params }: UploadLogsPageProps) {
  const { projectId } = await params;

  let project: ProjectDetail;
  try {
    project = await serverFetch<ProjectDetail>(`/api/v1/projects/${projectId}`);
  } catch {
    notFound();
  }

  return (
    <PageShell
      backHref={`/projects/${projectId}/logs`}
      backLabel="Back to logs"
      description="Upload a log file or paste logs manually. OpsPilot normalizes each line for triage and AI analysis."
      eyebrow="Upload Logs"
      maxWidth="narrow"
      title={`Upload logs for ${project.name}`}
    >
      <LogUploadForm projectId={projectId} />
    </PageShell>
  );
}
