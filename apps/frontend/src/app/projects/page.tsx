import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/lib/projects";


export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

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

          <Link
            href="/projects/new"
            className="rounded-lg bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-slate-200">
            New Project
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
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