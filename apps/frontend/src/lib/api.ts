import { logs } from "@/lib/logs";
import type { LogEntry } from "@/lib/logs";
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

export async function getProjectLogs(
  projectId: string
): Promise<LogEntry[]> {
  return logs.filter((log) => log.projectId === Number(projectId));
}

export type UploadProjectLogsInput = {
  projectId: string;
  source: string;
  rawLogs: string;
};

export async function uploadProjectLogs(
  input: UploadProjectLogsInput
): Promise<{ success: boolean; linesCount: number }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const linesCount = input.rawLogs
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  return {
    success: true,
    linesCount,
  };
} 

export type AnalyzeProjectLogsInput = {
  projectId: string;
  question: string;
};

export async function analyzeProjectLogs(
  input: AnalyzeProjectLogsInput
): Promise<{ answer: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const project = await getProject(input.projectId);
  const projectLogs = await getProjectLogs(input.projectId);

  const errorLogs = projectLogs.filter((log) => log.level === "ERROR");
  const warningLogs = projectLogs.filter((log) => log.level === "WARN");

  return {
    answer: `AI analysis for ${project?.name ?? "this project"}:

I found ${projectLogs.length} logs, including ${errorLogs.length} errors and ${warningLogs.length} warnings.

Possible root cause:
The most important issue appears to be related to backend or service errors. If there are database timeout messages, you should check database availability, connection settings, and environment variables.

Suggested next steps:
1. Check the latest ERROR logs.
2. Verify backend environment variables.
3. Check database connectivity.
4. Review the last deployment.

User question:
"${input.question}"

This is a fake frontend AI response. Later it will come from the backend and OpenAI API.`,
  };
}