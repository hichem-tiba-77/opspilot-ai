import { EmptyState } from "@/components/EmptyState";
import { IncidentCard } from "@/components/IncidentCard";
import { PageShell } from "@/components/PageShell";
import { serverFetch } from "@/lib/api-server";
import type { Incident } from "@/lib/api";

async function getAllIncidents(): Promise<Incident[]> {
  try {
    return await serverFetch<Incident[]>("/api/v1/incidents");
  } catch {
    return [];
  }
}

export default async function IncidentsPage() {
  const incidents = await getAllIncidents();

  return (
    <PageShell
      description="Review active, investigating, and resolved incidents detected from logs, alerts, and AI analysis."
      eyebrow="Incidents"
      title="Production incidents"
    >
      {incidents.length === 0 ? (
        <EmptyState
          actionHref="/projects"
          actionLabel="Open projects"
          description="Incidents are created from project workspaces after logs reveal an issue."
          icon="alert"
          title="No incidents found"
        />
      ) : (
        <section className="grid gap-5">
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
        </section>
      )}
    </PageShell>
  );
}
