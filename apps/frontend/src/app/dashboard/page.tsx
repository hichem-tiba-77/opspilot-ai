const stats = [
  {
    label: "Projects",
    value: "3",
    description: "Active monitored applications",
  },
  {
    label: "Logs Analyzed",
    value: "1,248",
    description: "Processed by OpsPilot AI",
  },
  {
    label: "Open Incidents",
    value: "2",
    description: "Need investigation",
  },
  {
    label: "AI Reports",
    value: "7",
    description: "Generated this week",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-medium text-slate-400">OpsPilot AI</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Monitor your projects, review incidents, and use AI to understand
            production issues faster.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-400">
                {stat.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Recent Incidents</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="font-medium">API response time increased</p>
                <p className="mt-1 text-sm text-slate-400">
                  Severity: Medium · Status: Investigating
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 p-4">
                <p className="font-medium">Database connection timeout</p>
                <p className="mt-1 text-sm text-slate-400">
                  Severity: High · Status: Open
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">AI Assistant</h2>

            <p className="mt-3 text-sm text-slate-400">
              Ask OpsPilot AI to summarize logs, explain incidents, or suggest
              what to check next.
            </p>

            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              Example: Why did my backend fail after the last deployment?
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}