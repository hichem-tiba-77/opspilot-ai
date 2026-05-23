import { StatCard } from "@/components/StatCard";
import { IncidentCard } from "@/components/IncidentCard";
import { serverFetch } from "@/lib/api-server";
import type { DashboardStats, Incident } from "@/lib/api";

async function getStats(): Promise<DashboardStats | null> {
  try {
    return await serverFetch<DashboardStats>("/api/v1/dashboard/stats");
  } catch {
    return null;
  }
}

async function getRecentIncidents(): Promise<Incident[]> {
  try {
    return await serverFetch<Incident[]>("/api/v1/dashboard/recent-incidents");
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const [stats, incidents] = await Promise.all([
    getStats(),
    getRecentIncidents(),
  ]);

  const statCards = [
    {
      label: "Projects",
      value: stats ? String(stats.projects_count) : "—",
      description: "Active monitored applications",
    },
    {
      label: "Logs Analyzed",
      value: stats ? stats.total_logs.toLocaleString() : "—",
      description: "Processed by OpsPilot AI",
    },
    {
      label: "Open Incidents",
      value: stats ? String(stats.open_incidents) : "—",
      description: "Need investigation",
    },
    {
      label: "Resolved",
      value: stats ? String(stats.resolved_incidents) : "—",
      description: "Incidents resolved",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-10">
          <p className="text-sm font-medium text-slate-400">OpsPilot AI</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Monitor your projects, review incidents, and use AI to understand
            production issues faster.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </section>

        <section className="mt-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Recent Incidents</h2>

            {incidents.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                No incidents yet. Upload logs and create incidents to see them here.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {incidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    id={incident.id}
                    title={incident.title}
                    severity={incident.severity}
                    status={incident.status}
                    description={incident.description}
                    createdAt={incident.created_at}
                    projectId={incident.project_id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}