import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <header className="text-center">
          <p className="text-sm font-medium text-slate-400">Welcome back</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Login to OpsPilot AI
          </h1>

          <p className="mt-3 text-slate-300">
            Access your dashboard, projects, logs, and incidents.
          </p>
        </header>

        <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}