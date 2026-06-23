import Link from "next/link";
import { Icon } from "@/components/Icon";

const previewStats = [
  { label: "Open incidents", value: "3", tone: "rose" },
  { label: "Logs processed", value: "128k", tone: "cyan" },
  { label: "Services healthy", value: "18", tone: "green" },
];

const timeline = [
  {
    level: "ERROR",
    source: "api-gateway",
    message: "Auth latency exceeded threshold after deploy",
  },
  {
    level: "WARN",
    source: "payments-worker",
    message: "Queue depth rising in production",
  },
  {
    level: "INFO",
    source: "ops-ai",
    message: "Root-cause summary generated for incident #42",
  },
];

export default function HomePage() {
  return (
    <main className="app-surface min-h-[calc(100vh-73px)] text-zinc-950">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            <Icon name="sparkles" className="h-4 w-4" />
            AI-powered DevOps incident platform
          </p>

          <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-normal text-zinc-950 sm:text-6xl">
            OpsPilot AI
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            Monitor applications, centralize logs, triage incidents, and ask AI
            for evidence-based root-cause analysis from one calm operations
            workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" prefetch={false} className="btn-primary">
              Open dashboard
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>

            <Link href="/projects" prefetch={false} className="btn-secondary">
              View projects
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {previewStats.map((stat) => (
              <div
                key={stat.label}
                className={`panel-muted p-4 metric-accent-${stat.tone}`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-black text-zinc-950">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <p className="text-sm font-black text-zinc-950">
                Production command
              </p>
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                Live incident intelligence
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              Healthy
            </span>
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="border-b border-zinc-200 p-5 lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-bold text-zinc-500">MTTR</p>
                  <p className="mt-2 text-2xl font-black">18m</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-rose-50 p-4">
                  <p className="text-xs font-bold text-rose-600">Critical</p>
                  <p className="mt-2 text-2xl font-black text-rose-700">1</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-white">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-cyan-200">
                  <Icon name="bot" className="h-4 w-4" />
                  AI analysis
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-200">
                  Auth errors correlate with the latest gateway deployment.
                  Roll back build 2026.05.27-18 and verify token cache pressure.
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-zinc-950">Recent logs</p>
                <Icon name="logs" className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="mt-4 space-y-3">
                {timeline.map((item) => (
                  <div
                    key={`${item.level}-${item.source}`}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs font-black text-zinc-700">
                        {item.level}
                      </span>
                      <span className="truncate text-xs font-semibold text-zinc-500">
                        {item.source}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
