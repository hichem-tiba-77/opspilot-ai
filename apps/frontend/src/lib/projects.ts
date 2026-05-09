export type Environment = "Development" | "Staging" | "Production";

export type Project = {
  id: number;
  name: string;
  description: string;
  status: "Healthy" | "Warning" | "Critical";
  logsCount: number;
  incidentsCount: number;
  lastIncident: string;
  environment: Environment;
};

export const projects: Project[] = [
  {
    id: 1,
    name: "Backend API",
    description:
      "Main FastAPI service that will handle users, logs, and AI analysis.",
    status: "Healthy",
    logsCount: 842,
    incidentsCount: 1,
    lastIncident: "Database connection timeout",
    environment: "Production",
  },
  {
    id: 2,
    name: "Frontend Dashboard",
    description: "Next.js dashboard used by teams to review logs and incidents.",
    status: "Healthy",
    logsCount: 256,
    incidentsCount: 0,
    lastIncident: "No active incidents",
    environment: "Staging",
  },
  {
    id: 3,
    name: "Worker Service",
    description: "Background service that will process AI log analysis jobs.",
    status: "Warning",
    logsCount: 150,
    incidentsCount: 1,
    lastIncident: "AI analysis job delayed",
    environment: "Development",
  },
];

export function getProjectById(projectId: string) {
  return projects.find((project) => project.id === Number(projectId));
}