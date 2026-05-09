import Link from "next/link";
import { notFound } from "next/navigation";

import { getProject } from "@/lib/api";

type ProjectDetailsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
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
              <p className="text-sm font-medium text-slate-400">
                Project Details
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {project.name}
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                {project.description}
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
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
            <p className="mt-3 text-2xl font-bold">{project.logsCount}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Open Incidents</p>
            <p className="mt-3 text-2xl font-bold">
              {project.incidentsCount}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Latest Incident</h2>

          <p className="mt-3 text-slate-300">{project.lastIncident}</p>
          <Link
            href={`/projects/${projectId}/logs`}
            className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            View Logs
          </Link>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            Later, this page will show uploaded logs, AI summaries, deployments,
            and incident history for this project.
          </div>
        </section>
      </div>
    </main>
  );
}