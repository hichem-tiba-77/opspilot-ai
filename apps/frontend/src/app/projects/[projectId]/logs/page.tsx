import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjectLogs } from "@/lib/api";

type ProjectLogsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function getLevelClass(level: string) {
  if (level === "ERROR") {
    return "border-red-900 bg-red-950 text-red-300";
  }

  if (level === "WARN") {
    return "border-yellow-900 bg-yellow-950 text-yellow-300";
  }

  return "border-slate-700 bg-slate-950 text-slate-300";
}

export default async function ProjectLogsPage({
  params,
}: ProjectLogsPageProps) {
  const { projectId } = await params;

  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const logs = await getProjectLogs(projectId);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to project
        </Link>

        <header className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Project Logs
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Review recent logs from this project. Later, these logs will come
              from the backend and can be analyzed by AI.
            </p>
          </div>

          <Link
            href={`/projects/${projectId}/logs/upload`}
            className="rounded-lg bg-white px-5 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Upload Logs
          </Link>
        </header>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold">Recent Logs</h2>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400">
              No logs found for this project.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Level</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 font-medium">Message</th>
                    <th className="px-6 py-4 font-medium">Timestamp</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-800">
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getLevelClass(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {log.source}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {log.message}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}