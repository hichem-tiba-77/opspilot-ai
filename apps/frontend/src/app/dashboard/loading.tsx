export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-10">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
          <div className="mt-2 h-9 w-48 animate-pulse rounded bg-slate-800" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>

        <div className="mt-8 h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
      </div>
    </main>
  );
}
