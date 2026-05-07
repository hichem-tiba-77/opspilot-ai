export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
          AI-powered DevOps incident platform
        </p>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Understand your logs, incidents, and deployments faster with AI.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          OpsPilot AI helps teams upload logs, analyze errors, generate incident
          reports, and monitor production systems from one dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/dashboard"
            className="rounded-lg bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Open Dashboard
          </a>

          <a
            href="/projects"
            className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-900"
          >
            View Projects
          </a>
        </div>
      </section>
    </main>
  );
}