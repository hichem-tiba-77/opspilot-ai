import Link from "next/link";
import { notFound } from "next/navigation";
import { AIAnalysisForm } from "@/components/forms/AIAnalysisForm";
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to project
        </Link>

        <header className="mt-8">
          <p className="text-sm font-medium text-slate-400">AI Analysis</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Ask AI about {project.name}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Ask questions about this project&apos;s logs, incidents, errors, and
            possible root causes.
          </p>
        </header>

        <AIAnalysisForm key={projectId} projectId={projectId} />
      </div>
    </main>
  );
}
