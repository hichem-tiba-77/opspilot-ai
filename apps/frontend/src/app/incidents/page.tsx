import { IncidentCard } from "@/components/IncidentCard";
import { getIncidents } from "@/lib/api";

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-10">
          <p className="text-sm font-medium text-slate-400">Incidents</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Production Incidents
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Review active and resolved incidents detected from logs, alerts, and
            AI analysis.
          </p>
        </header>

        {incidents.length === 0 ? (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            No incidents found.
          </section>
        ) : (
          <section className="space-y-6">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                id={incident.id}
                title={incident.title}
                severity={incident.severity}
                status={incident.status}
                summary={incident.summary}
                createdAt={incident.createdAt}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}