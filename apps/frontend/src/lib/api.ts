import { getProjectById, projects } from "@/lib/projects";
import type { Environment, Project } from "@/lib/projects";

export type CreateProjectInput = {
  name: string;
  description: string;
  environment: Environment;
};

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getProject(projectId: string): Promise<Project | undefined> {
  return getProjectById(projectId);
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    id: Date.now(),
    name: input.name,
    description: input.description,
    environment: input.environment,
    status: "Healthy",
    logsCount: 0,
    incidentsCount: 0,
    lastIncident: "No active incidents",
  };
}