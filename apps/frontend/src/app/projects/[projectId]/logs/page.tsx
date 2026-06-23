import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";
import { serverFetch } from "@/lib/api-server";
import { formatDateTime } from "@/lib/utils";
import type { ProjectDetail, LogEntry } from "@/lib/api";

type ProjectLogsPageProps = {
  params: Promise<{ projectId: string }>;
};

function getLevelTone(level: string): "danger" | "warning" | "info" | "neutral" {
  if (level === "ERROR") return "danger";
  if (level === "WARN") return "warning";
  if (level === "INFO") return "info";
  return "neutral";
}

export default async function ProjectLogsPage({ params }: ProjectLogsPageProps) {
  const { projectId } = await params;

  let project: ProjectDetail;
  try {
    project = await serverFetch<ProjectDetail>(`/api/v1/projects/${projectId}`);
  } catch {
    notFound();
  }

  let logs: LogEntry[] = [];
  try {
    logs = await serverFetch<LogEntry[]>(`/api/v1/projects/${projectId}/logs`);
  } catch {
    logs = [];
  }

  return (
    <PageShell
      actions={
        <>
          <Link href={`/projects/${projectId}/logs/upload`} className="btn-primary">
            <Icon name="upload" className="h-4 w-4" />
            Upload logs
          </Link>
          <Link href={`/projects/${projectId}/ai`} className="btn-secondary">
            <Icon name="bot" className="h-4 w-4" />
            Ask AI
          </Link>
        </>
      }
      backHref={`/projects/${projectId}`}
      backLabel="Back to project"
      description={`${logs.length.toLocaleString()} log${
        logs.length === 1 ? "" : "s"
      } stored for this project.`}
      eyebrow="Project Logs"
      title={project.name}
    >
      {logs.length === 0 ? (
        <EmptyState
          actionHref={`/projects/${projectId}/logs/upload`}
          actionLabel="Upload logs"
          description="Add log evidence before running AI analysis or incident triage."
          icon="logs"
          title="No logs found"
        />
      ) : (
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <h2 className="text-lg font-black text-zinc-950">Recent logs</h2>
            <span className="text-sm font-semibold text-zinc-500">
              Latest first
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.08em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-black">Level</th>
                  <th className="px-5 py-4 font-black">Source</th>
                  <th className="px-5 py-4 font-black">Message</th>
                  <th className="px-5 py-4 font-black">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {logs.map((log) => (
                  <tr key={log.id} className="bg-white/70 hover:bg-zinc-50">
                    <td className="px-5 py-4">
                      <StatusBadge tone={getLevelTone(log.level)}>
                        {log.level}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4 font-semibold text-zinc-700">
                      {log.source}
                    </td>
                    <td className="max-w-xl px-5 py-4 font-mono text-xs leading-6 text-zinc-700">
                      {log.message}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-zinc-500">
                      {formatDateTime(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageShell>
  );
}
