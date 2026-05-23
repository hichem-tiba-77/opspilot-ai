export default function ProjectsLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-10 flex justify-between">
          <div>
            <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
            <div className="mt-2 h-9 w-64 animate-pulse rounded bg-slate-800" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-800" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
