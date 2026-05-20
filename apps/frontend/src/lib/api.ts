// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function loginUser(input: LoginInput): Promise<{ success: boolean }> {
  const data = await apiFetch<{ access_token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveToken(data.access_token);
  return { success: true };
}

export async function registerUser(input: RegisterInput): Promise<{ success: boolean }> {
  const data = await apiFetch<{ access_token: string }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveToken(data.access_token);
  return { success: true };
}

export async function getCurrentUser(): Promise<{
  id: number;
  name: string;
  email: string;
} | null> {
  try {
    return await apiFetch("/api/v1/auth/me", {
      headers: authHeader(),
    });
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  clearToken();
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type Environment = "production" | "staging" | "development";

export type Project = {
  id: number;
  name: string;
  description: string;
  environment: Environment;
  status: string;
  created_at: string;
  owner_id: number;
};

export type CreateProjectInput = {
  name: string;
  description: string;
  environment: Environment;
};

export async function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/v1/projects", {
    headers: authHeader(),
  });
}

export async function getProject(projectId: string): Promise<Project> {
  return apiFetch<Project>(`/api/v1/projects/${projectId}`, {
    headers: authHeader(),
  });
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return apiFetch<Project>("/api/v1/projects", {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(input),
  });
}
// ── Logs ──────────────────────────────────────────────────────────────────────

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export type Log = {
  id: number;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
  project_id: number;
};

export type UploadLogsInput = {
  projectId: string;
  logs: {
    level: LogLevel;
    message: string;
    source: string;
    timestamp?: string;
  }[];
};

export async function getProjectLogs(projectId: string): Promise<Log[]> {
  return apiFetch<Log[]>(`/api/v1/projects/${projectId}/logs`, {
    headers: authHeader(),
  });
}

export async function uploadProjectLogs(input: UploadLogsInput): Promise<Log[]> {
  return apiFetch<Log[]>(`/api/v1/projects/${input.projectId}/logs`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ logs: input.logs }),
  });
}
// ── AI Analysis ───────────────────────────────────────────────────────────────

export type AnalyzeProjectLogsInput = {
  projectId: string;
  question: string;
};

export async function analyzeProjectLogs(
  input: AnalyzeProjectLogsInput
): Promise<{ answer: string }> {
  return apiFetch<{ answer: string }>(
    `/api/v1/projects/${input.projectId}/analysis`,
    {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ question: input.question }),
    }
  );
}
// ── Incidents ─────────────────────────────────────────────────────────────────

export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "resolved";

export type Incident = {
  id: number;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_at: string;
  resolved_at: string | null;
  project_id: number;
};

export type CreateIncidentInput = {
  title: string;
  description?: string;
  severity: IncidentSeverity;
};

export async function getIncidents(projectId: string): Promise<Incident[]> {
  return apiFetch<Incident[]>(`/api/v1/projects/${projectId}/incidents`, {
    headers: authHeader(),
  });
}

export async function getIncident(
  projectId: string,
  incidentId: string
): Promise<Incident> {
  return apiFetch<Incident>(`/api/v1/projects/${projectId}/incidents/${incidentId}`, {
    headers: authHeader(),
  });
}

export async function createIncident(
  projectId: string,
  input: CreateIncidentInput
): Promise<Incident> {
  return apiFetch<Incident>(`/api/v1/projects/${projectId}/incidents`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(input),
  });
}

export async function resolveIncident(
  projectId: string,
  incidentId: string
): Promise<Incident> {
  return apiFetch<Incident>(
    `/api/v1/projects/${projectId}/incidents/${incidentId}/resolve`,
    {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({}),
    }
  );
}