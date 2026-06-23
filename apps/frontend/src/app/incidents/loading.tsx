export default function IncidentsLoading() {
  return (
    <main className="app-surface min-h-screen text-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-8">
          <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-10 w-64 animate-pulse rounded bg-zinc-200" />
        </div>

        <div className="space-y-5">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-lg border border-zinc-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
