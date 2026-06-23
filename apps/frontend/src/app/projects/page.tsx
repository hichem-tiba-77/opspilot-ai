import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { serverFetch } from "@/lib/api-server";
import type { ProjectSummary } from "@/lib/api";

async function getProjects(): Promise<ProjectSummary[]> {
  try {
    return await serverFetch<ProjectSummary[]>("/api/v1/projects");
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PageShell
      actions={
        <Link href="/projects/new" className="btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          New project
        </Link>
      }
      description="Each project represents an application, service, API, or worker that OpsPilot AI monitors and analyzes."
      eyebrow="Projects"
      title="Monitored applications"
    >
      {projects.length === 0 ? (
        <EmptyState
          actionHref="/projects/new"
          actionLabel="Create first project"
          description="Create a project, upload logs, and start building an incident intelligence workspace."
          icon="folder"
          title="No projects yet"
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              status={project.status}
              environment={project.environment}
              logs_count={project.logs_count}
              incidents_count={project.incidents_count}
              last_log_at={project.last_log_at}
              open_incidents={project.open_incidents}
            />
          ))}
        </section>
      )}
    </PageShell>
  );
}
