export default function ProjectsLoading() {
  return (
    <main className="app-surface min-h-screen text-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-10 w-72 animate-pulse rounded bg-zinc-200" />
          </div>
          <div className="h-11 w-36 animate-pulse rounded-lg bg-zinc-200" />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-lg border border-zinc-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
