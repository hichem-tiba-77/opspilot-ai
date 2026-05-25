import Link from "next/link";
import { notFound } from "next/navigation";
import { LogUploadForm } from "@/components/forms/LogUploadForm";
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href={`/projects/${projectId}/logs`}
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to logs
        </Link>

        <header className="mt-8">
          <p className="text-sm font-medium text-slate-400">Upload Logs</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Upload logs for {project.name}
          </h1>

          <p className="mt-3 text-slate-300">
            Upload a log file or paste logs manually. Later, these logs will be
            stored and analyzed by AI.
          </p>
        </header>

        <LogUploadForm projectId={projectId} />
      </div>
    </main>
  );
}
