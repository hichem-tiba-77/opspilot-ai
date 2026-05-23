import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/projects"
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to projects
        </Link>

        <header className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Project Details</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                {project.description}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                project.status.toLowerCase() === "warning"
                  ? "border-yellow-800 bg-yellow-950 text-yellow-300"
                  : project.status.toLowerCase() === "critical"
                  ? "border-red-800 bg-red-950 text-red-300"
                  : "border-emerald-800 bg-emerald-950 text-emerald-300"
              }`}
            >
              {project.status}
            </span>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Environment</p>
            <p className="mt-3 text-2xl font-bold">{project.environment}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Logs Analyzed</p>
            <p className="mt-3 text-2xl font-bold">
              {project.logs_count.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Incidents</p>
            <p className="mt-3 text-2xl font-bold">{project.incidents_count}</p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Actions</h2>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/projects/${projectId}/logs`}
              className="inline-flex rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              View Logs
            </Link>

            <Link
              href={`/projects/${projectId}/logs/upload`}
              className="inline-flex rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Upload Logs
            </Link>

            <Link
              href={`/projects/${projectId}/ai`}
              className="inline-flex rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Ask AI
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}