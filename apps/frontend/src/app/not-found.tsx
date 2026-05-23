import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-700">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
