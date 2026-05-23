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

// ── Token helpers ────────────────────────────────────────────────────────────
// Token is stored in sessionStorage (set at login) AND as a cookie (for SSR middleware).
// sessionStorage is always readable synchronously; cookies may not be if Secure flag is set.

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Primary: sessionStorage (fast, synchronous, no Secure-flag issues)
  const stored = sessionStorage.getItem("auth_token");
  if (stored) return stored;
  // Fallback: cookie (for SSR cookie read via proxy.ts)
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("auth_token", token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_token");
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

export type UserInfo = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
};

export async function loginUser(
  input: LoginInput
): Promise<{ access_token: string }> {
  const data = await apiFetch<{ access_token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  // Store token in cookie (for SSR proxy middleware)
  await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: data.access_token }),
  });

  // Also store in sessionStorage for immediate client-side use
  setToken(data.access_token);

  return data;
}

export async function registerUser(
  input: RegisterInput
): Promise<{ access_token: string }> {
  const data = await apiFetch<{ access_token: string }>(
    "/api/v1/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  // Store token in cookie (for SSR proxy middleware)
  await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: data.access_token }),
  });

  // Also store in sessionStorage for immediate client-side use
  setToken(data.access_token);

  return data;
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    return await apiFetch<UserInfo>("/api/v1/auth/me", {
      headers: authHeader(),
    });
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await fetch("/api/auth", { method: "DELETE" });
  clearToken();
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type Project = {
  id: number;
  name: string;
  description: string;
  environment: string;
  status: string;
  created_at: string;
  owner_id: number;
};

export type ProjectDetail = Project & {
  logs_count: number;
  incidents_count: number;
};

export type CreateProjectInput = {
  name: string;
  description: string;
  environment: string;
};

export async function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/v1/projects", {
    headers: authHeader(),
  });
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/v1/projects/${projectId}`, {
    headers: authHeader(),
  });
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  return apiFetch<Project>("/api/v1/projects", {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(input),
  });
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export type LogEntry = {
  id: number;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
  project_id: number;
};

export type LogLineInput = {
  level: string;
  message: string;
  source: string;
  timestamp?: string;
};

export async function getProjectLogs(projectId: string): Promise<LogEntry[]> {
  return apiFetch<LogEntry[]>(`/api/v1/projects/${projectId}/logs`, {
    headers: authHeader(),
  });
}

export async function uploadProjectLogs(
  projectId: string,
  logs: LogLineInput[]
): Promise<LogEntry[]> {
  return apiFetch<LogEntry[]>(`/api/v1/projects/${projectId}/logs`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ logs }),
  });
}

// ── AI Analysis ───────────────────────────────────────────────────────────────

export async function analyzeProjectLogs(
  projectId: string,
  question: string
): Promise<{ answer: string }> {
  return apiFetch<{ answer: string }>(
    `/api/v1/projects/${projectId}/analysis`,
    {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ question }),
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

/** List all incidents across all the user's projects */
export async function getAllIncidents(): Promise<Incident[]> {
  return apiFetch<Incident[]>("/api/v1/incidents", {
    headers: authHeader(),
  });
}

/** Get a single incident by ID (no projectId needed) */
export async function getIncidentById(
  incidentId: string
): Promise<Incident> {
  return apiFetch<Incident>(`/api/v1/incidents/${incidentId}`, {
    headers: authHeader(),
  });
}

/** List incidents for a specific project */
export async function getProjectIncidents(
  projectId: string
): Promise<Incident[]> {
  return apiFetch<Incident[]>(`/api/v1/projects/${projectId}/incidents`, {
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export type DashboardStats = {
  projects_count: number;
  total_logs: number;
  open_incidents: number;
  resolved_incidents: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/v1/dashboard/stats", {
    headers: authHeader(),
  });
}

export async function getRecentIncidents(): Promise<Incident[]> {
  return apiFetch<Incident[]>("/api/v1/dashboard/recent-incidents", {
    headers: authHeader(),
  });
}