export type LogLevel = "INFO" | "WARN" | "ERROR";

export type LogEntry = {
  id: number;
  projectId: number;
  level: LogLevel;
  source: string;
  message: string;
  timestamp: string;
};

export const logs: LogEntry[] = [
  {
    id: 1,
    projectId: 1,
    level: "ERROR",
    source: "Backend API",
    message: "Database connection timeout after 5000ms",
    timestamp: "2026-05-09 10:15:22",
  },
  {
    id: 2,
    projectId: 1,
    level: "WARN",
    source: "Backend API",
    message: "Slow response detected on /api/v1/projects",
    timestamp: "2026-05-09 10:16:03",
  },
  {
    id: 3,
    projectId: 1,
    level: "INFO",
    source: "Auth Service",
    message: "User login successful",
    timestamp: "2026-05-09 10:18:44",
  },
  {
    id: 4,
    projectId: 2,
    level: "INFO",
    source: "Frontend Dashboard",
    message: "Dashboard page loaded successfully",
    timestamp: "2026-05-09 11:02:10",
  },
  {
    id: 5,
    projectId: 3,
    level: "WARN",
    source: "Worker Service",
    message: "AI analysis job delayed because queue is busy",
    timestamp: "2026-05-09 11:10:35",
  },
];