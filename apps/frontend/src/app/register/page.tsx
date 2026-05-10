import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <header className="text-center">
          <p className="text-sm font-medium text-slate-400">Create account</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Start using OpsPilot AI
          </h1>

          <p className="mt-3 text-slate-300">
            Create an account to manage projects, logs, and AI analysis.
          </p>
        </header>

        <RegisterForm />
      </div>
    </main>
  );
}