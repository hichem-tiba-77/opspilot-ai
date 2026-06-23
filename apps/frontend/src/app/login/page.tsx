import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="app-surface min-h-[calc(100vh-73px)] text-zinc-950">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-800">
            <Icon name="activity" className="h-4 w-4" />
            Welcome back
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-normal text-zinc-950 sm:text-5xl">
            Login to OpsPilot AI
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600">
            Return to your dashboard, review incidents, upload logs, and ask AI
            for focused production analysis.
          </p>
          <Link href="/" className="mt-8 inline-flex font-bold text-zinc-600 hover:text-zinc-950">
            Back to overview
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="panel h-96 animate-pulse bg-white/75" />
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
