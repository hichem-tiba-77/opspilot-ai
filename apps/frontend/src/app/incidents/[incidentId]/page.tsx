import Link from "next/link";
import { notFound } from "next/navigation";

import { getIncident, getProject } from "@/lib/api";
import type { IncidentSeverity, IncidentStatus } from "@/lib/incidents";

type IncidentDetailsPageProps = {
  params: Promise<{
    incidentId: string;
  }>;
};

function getSeverityClass(severity: IncidentSeverity) {
  if (severity === "Critical") {
    return "border-red-900 bg-red-950 text-red-300";
  }

  if (severity === "High") {
    return "border-orange-900 bg-orange-950 text-orange-300";
  }

  if (severity === "Medium") {
    return "border-yellow-900 bg-yellow-950 text-yellow-300";
  }

  return "border-slate-700 bg-slate-950 text-slate-300";
}

function getStatusClass(status: IncidentStatus) {
  if (status === "Resolved") {
    return "border-emerald-900 bg-emerald-950 text-emerald-300";
  }

  if (status === "Investigating") {
    return "border-blue-900 bg-blue-950 text-blue-300";
  }

  return "border-red-900 bg-red-950 text-red-300";
}

export default async function IncidentDetailsPage({
  params,
}: IncidentDetailsPageProps) {
  const { incidentId } = await params;

  const incident = await getIncident(incidentId);

  if (!incident) {
    notFound();
  }

  const project = await getProject(String(incident.projectId));

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
              <p className="text-sm font-medium text-slate-400">
                Incident Details
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {incident.title}
              </h1>

              <p className="mt-3 max-w-3xl text-slate-300">
                {incident.summary}
              </p>
            </div>

            <div className="flex gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityClass(
                  incident.severity
                )}`}
              >
                {incident.severity}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                  incident.status
                )}`}
              >
                {incident.status}
              </span>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Affected Project</p>

            {project ? (
              <Link
                href={`/projects/${incident.projectId}`}
                className="mt-3 block text-2xl font-bold transition hover:text-slate-300"
              >
                {project.name}
              </Link>
            ) : (
              <p className="mt-3 text-2xl font-bold">Unknown project</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Severity</p>
            <p className="mt-3 text-2xl font-bold">{incident.severity}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-3 text-2xl font-bold">{incident.status}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Incident Summary</h2>

            <p className="mt-4 text-slate-300">{incident.summary}</p>

            <p className="mt-6 text-sm text-slate-500">
              Created at: {incident.createdAt}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Suggested Investigation</h2>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>1. Review the related project logs.</p>
              <p>2. Check the latest deployment for this project.</p>
              <p>3. Verify environment variables and service connectivity.</p>
              <p>4. Ask OpsPilot AI to summarize the root cause.</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/projects/${incident.projectId}/logs`}
                className="rounded-lg bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-slate-200"
              >
                View Project Logs
              </Link>

              <Link
                href={`/projects/${incident.projectId}/ai`}
                className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Ask AI
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}