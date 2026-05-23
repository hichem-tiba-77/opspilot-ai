import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import type { Incident, Project } from "@/lib/api";

type IncidentDetailsPageProps = {
  params: Promise<{ incidentId: string }>;
};

function getSeverityClass(severity: string) {
  switch (severity) {
    case "critical":
      return "border-red-900 bg-red-950 text-red-300";
    case "high":
      return "border-orange-900 bg-orange-950 text-orange-300";
    case "medium":
      return "border-yellow-900 bg-yellow-950 text-yellow-300";
    default:
      return "border-slate-700 bg-slate-950 text-slate-300";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "resolved":
      return "border-emerald-900 bg-emerald-950 text-emerald-300";
    case "investigating":
      return "border-blue-900 bg-blue-950 text-blue-300";
    default:
      return "border-red-900 bg-red-950 text-red-300";
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

  let project: Project | null = null;
  try {
    project = await serverFetch<Project>(`/api/v1/projects/${incident.project_id}`);
  } catch {
    // project may be inaccessible, that's ok
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/incidents"
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to incidents
        </Link>

        <header className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Incident Details</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {incident.title}
              </h1>
              {incident.description && (
                <p className="mt-3 max-w-3xl text-slate-300">
                  {incident.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityClass(incident.severity)}`}
              >
                {capitalize(incident.severity)}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(incident.status)}`}
              >
                {capitalize(incident.status)}
              </span>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Affected Project</p>
            {project ? (
              <Link
                href={`/projects/${incident.project_id}`}
                className="mt-3 block text-2xl font-bold transition hover:text-slate-300"
              >
                {project.name}
              </Link>
            ) : (
              <p className="mt-3 text-2xl font-bold">Project #{incident.project_id}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Created</p>
            <p className="mt-3 text-lg font-bold">
              {new Date(incident.created_at).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Resolved At</p>
            <p className="mt-3 text-lg font-bold">
              {incident.resolved_at
                ? new Date(incident.resolved_at).toLocaleString()
                : "Not resolved yet"}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Suggested Investigation</h2>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>1. Review the related project logs.</p>
            <p>2. Check the latest deployment for this project.</p>
            <p>3. Verify environment variables and service connectivity.</p>
            <p>4. Ask OpsPilot AI to summarize the root cause.</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/projects/${incident.project_id}/logs`}
              className="rounded-lg bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              View Project Logs
            </Link>

            <Link
              href={`/projects/${incident.project_id}/ai`}
              className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Ask AI
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}