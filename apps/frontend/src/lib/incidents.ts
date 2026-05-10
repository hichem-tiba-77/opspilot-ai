export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Open" | "Investigating" | "Resolved";

export type Incident = {
  id: number;
  projectId: number;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary: string;
  createdAt: string;
};

export const incidents: Incident[] = [
  {
    id: 1,
    projectId: 1,
    title: "Database connection timeout",
    severity: "High",
    status: "Open",
    summary:
      "Backend API is failing because database connections are timing out after 5000ms.",
    createdAt: "2026-05-09 10:20:00",
  },
  {
    id: 2,
    projectId: 1,
    title: "API response time increased",
    severity: "Medium",
    status: "Investigating",
    summary:
      "Several API endpoints are responding slower than expected after the latest deployment.",
    createdAt: "2026-05-09 10:35:00",
  },
  {
    id: 3,
    projectId: 3,
    title: "AI analysis job delayed",
    severity: "Low",
    status: "Resolved",
    summary:
      "Worker service delayed AI analysis jobs because the queue was busy.",
    createdAt: "2026-05-09 11:15:00",
  },
];

export function getIncidentById(incidentId: string) {
  return incidents.find((incident) => incident.id === Number(incidentId));
}