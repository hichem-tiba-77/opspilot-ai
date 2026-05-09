import Link from "next/link";

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/projects"
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to projects
        </Link>

        <header className="mt-8">
          <p className="text-sm font-medium text-slate-400">New Project</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Add a monitored application
          </h1>
          <p className="mt-3 text-slate-300">
            A project represents an app, API, service, or worker that OpsPilot AI
            will monitor and analyze.
          </p>
        </header>

        <form className="mt-8 space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300"
            >
              Project name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Example: Backend API"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Example: Main API service that handles users, logs, and AI analysis."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="environment"
              className="block text-sm font-medium text-slate-300"
            >
              Environment
            </label>
            <select
              id="environment"
              name="environment"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-400"
            >
              <option>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Create Project
            </button>

            <Link
              href="/projects"
              className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}