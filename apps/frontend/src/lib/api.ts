// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── HTTP helper ───────────────────────────────────────────────────────────────

function formatValidationLocation(loc: unknown): string {
  if (!Array.isArray(loc)) {
    return "";
  }

  return loc
    .filter((part) => part !== "body")
    .map(String)
    .join(".");
}

function formatApiErrorDetail(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const issue = item as { loc?: unknown; msg?: unknown };
        const location = formatValidationLocation(issue.loc);
        const message = typeof issue.msg === "string" ? issue.msg : null;

        if (!message) {
          return null;
        }

        return location ? `${location}: ${message}` : message;
      })
      .filter(Boolean);

    return messages.length > 0 ? messages.join("; ") : null;
  }

  if (detail && typeof detail === "object") {
    const body = detail as {
      detail?: unknown;
      error?: unknown;
      message?: unknown;
      msg?: unknown;
    };

    return (
      formatApiErrorDetail(body.detail) ??
      (typeof body.error === "string" ? body.error : null) ??
      (typeof body.message === "string" ? body.message : null) ??
      (typeof body.msg === "string" ? body.msg : null)
    );
  }

  return null;
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const { headers, ...fetchOptions } = options;
  const mergedHeaders = new Headers(headers);
  mergedHeaders.set("Content-Type", "application/json");

  const res = await fetch(url, {
    ...fetchOptions,
    headers: mergedHeaders,
  });
  const body = await parseResponseBody(res);

  if (!res.ok) {
    throw new Error(
      formatApiErrorDetail(body) ?? `Request failed: ${res.status}`
    );
  }

  return body as T;
}

// ── Token helpers ────────────────────────────────────────────────────────────
// Token is stored in sessionStorage for client fetches and in a cookie for
// Next.js proxy/server-rendered routes. Keep both writes synchronous so the
// first navigation after login cannot outrun cookie persistence.

const AUTH_TOKEN_KEY = "auth_token";
const DEFAULT_TOKEN_MAX_AGE_SECONDS = 60 * 60;

function getTokenMaxAgeSeconds(token: string): number {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return DEFAULT_TOKEN_MAX_AGE_SECONDS;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "="
    );
    const decodedPayload = JSON.parse(atob(paddedPayload)) as {
      exp?: unknown;
    };

    if (typeof decodedPayload.exp !== "number") {
      return DEFAULT_TOKEN_MAX_AGE_SECONDS;
    }

    const secondsUntilExpiry = Math.floor(decodedPayload.exp - Date.now() / 1000);
    return Math.max(secondsUntilExpiry, 0);
  } catch {
    return DEFAULT_TOKEN_MAX_AGE_SECONDS;
  }
}

function shouldUseSecureCookie(): boolean {
  return (
    process.env.NEXT_PUBLIC_SECURE_COOKIES === "true" &&
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  );
}

function writeAuthCookie(token: string): void {
  const maxAge = getTokenMaxAgeSeconds(token);
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteAuthCookie(): void {
  const secure = shouldUseSecureCookie() ? "; Secure" : "";
  document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Primary: sessionStorage (fast, synchronous, no Secure-flag issues)
  try {
    const stored = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (stored) return stored;
  } catch {
    // Fall back to the cookie below.
  }
  // Fallback: cookie (for SSR cookie read via proxy.ts)
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    writeAuthCookie(token);
    try {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // The cookie is the source of truth for protected route access.
    }
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    deleteAuthCookie();
    try {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // Cookie removal above is enough to lock protected routes again.
    }
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
