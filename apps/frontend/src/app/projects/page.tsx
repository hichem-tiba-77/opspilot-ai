import { AppNavbar } from "@/components/AppNavbar";
import { ProjectCard } from "@/components/ProjectCard";

const projects = [
  {
    id: 1,
    name: "Backend API",
    description: "Main FastAPI service that will handle users, logs, and AI analysis.",
    status: "Healthy",
    logsCount: 842,
    incidentsCount: 1,
  },
  {
    id: 2,
    name: "Frontend Dashboard",
    description: "Next.js dashboard used by teams to review logs and incidents.",
    status: "Healthy",
    logsCount: 256,
    incidentsCount: 0,
  },
  {
    id: 3,
    name: "Worker Service",
    description: "Background service that will process AI log analysis jobs.",
    status: "Warning",
    logsCount: 150,
    incidentsCount: 1,
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-400">Projects</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Monitored Applications
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Each project represents an application or service that OpsPilot AI
              will monitor and analyze.
            </p>
          </div>

          <button className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200">
            New Project
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              description={project.description}
              status={project.status}
              logsCount={project.logsCount}
              incidentsCount={project.incidentsCount}
            />
          ))}
        </section>
      </div>
    </main>
  );
}