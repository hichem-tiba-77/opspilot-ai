import Link from "next/link";
import { Icon } from "@/components/Icon";
import { IncidentCard } from "@/components/IncidentCard";
import { PageShell } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
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
      value: stats ? String(stats.projects_count) : "-",
      description: "Monitored applications",
      accent: "green" as const,
      icon: "folder" as const,
    },
    {
      label: "Logs Analyzed",
      value: stats ? stats.total_logs.toLocaleString() : "-",
      description: "Recent operational evidence",
      accent: "cyan" as const,
      icon: "logs" as const,
    },
    {
      label: "Open Incidents",
      value: stats ? String(stats.open_incidents) : "-",
      description: "Needs attention",
      accent: "rose" as const,
      icon: "alert" as const,
    },
    {
      label: "Resolved",
      value: stats ? String(stats.resolved_incidents) : "-",
      description: "Closed incidents",
      accent: "amber" as const,
      icon: "check" as const,
    },
  ];

  return (
    <PageShell
      actions={
        <>
          <Link href="/projects/new" className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            New project
          </Link>
          <Link href="/incidents" className="btn-secondary">
            View incidents
          </Link>
        </>
      }
      description="See the health of your monitored applications, recent incidents, and AI-ready operational evidence."
      eyebrow="Command Center"
      title="Dashboard"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            accent={stat.accent}
            icon={stat.icon}
          />
        ))}
      </section>

      <section className="panel mt-6 p-5">
        <div className="flex flex-col gap-3 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-950">
              Recent incidents
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              The latest issues across every project in this workspace.
            </p>
          </div>
          <Link href="/incidents" className="btn-secondary min-h-10">
            Open incident list
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Icon name="check" className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-black text-zinc-950">
              No incidents yet
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Upload logs or create incidents from a project and they will
              appear here.
            </p>
            <Link href="/projects" className="btn-secondary mt-6">
              View projects
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
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
      </section>
    </PageShell>
  );
}
