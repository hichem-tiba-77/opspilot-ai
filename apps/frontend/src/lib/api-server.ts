import { cookies } from "next/headers";

// INTERNAL_API_URL is for server-side (SSR) requests inside Docker (e.g. http://backend:8000).
// NEXT_PUBLIC_API_URL is the browser-visible URL (e.g. http://localhost:8000) — baked in at build time.
const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/**
 * Server-side API fetcher that reads the auth token from cookies.
 * Use this in Server Components and Route Handlers.
 */
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
