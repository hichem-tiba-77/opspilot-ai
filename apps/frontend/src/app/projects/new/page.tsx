import Link from "next/link";
import { NewProjectForm } from "@/components/forms/NewProjectForm";

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

        <NewProjectForm />
      </div>
    </main>
  );
}