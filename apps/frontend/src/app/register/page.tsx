import Link from "next/link";
import { Icon } from "@/components/Icon";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="app-surface min-h-[calc(100vh-73px)] text-zinc-950">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
            <Icon name="sparkles" className="h-4 w-4" />
            Create account
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-normal text-zinc-950 sm:text-5xl">
            Start using OpsPilot AI
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600">
            Create a workspace for projects, logs, incident review, and
            evidence-based AI troubleshooting.
          </p>
          <Link href="/" className="mt-8 inline-flex font-bold text-zinc-600 hover:text-zinc-950">
            Back to overview
          </Link>
        </div>

        <RegisterForm />
      </section>
    </main>
  );
}
