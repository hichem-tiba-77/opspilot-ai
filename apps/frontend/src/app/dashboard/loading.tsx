export default function DashboardLoading() {
  return (
    <main className="app-surface min-h-screen text-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-8">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-10 w-56 animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-lg border border-zinc-200 bg-white"
            />
          ))}
        </div>

        <div className="mt-6 h-72 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      </div>
    </main>
  );
}
