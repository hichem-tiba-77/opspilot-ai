export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-10">
          <p className="text-sm font-medium text-slate-400">Settings</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Workspace Settings
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Manage account preferences, AI configuration, notifications, and API
            settings for OpsPilot AI.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Profile</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="mt-1 font-medium">Demo User</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-1 font-medium">demo@opspilot.ai</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Role</p>
                <p className="mt-1 font-medium">Developer</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">AI Provider</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Provider</p>
                <p className="mt-1 font-medium">OpenAI</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Model</p>
                <p className="mt-1 font-medium">Configured later in backend</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                AI secrets must not be stored in the frontend. Later, the
                OpenAI API key will be stored in the backend environment
                variables.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Notifications</h2>

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <span>
                  <span className="block font-medium">Incident alerts</span>
                  <span className="text-sm text-slate-400">
                    Notify when a new incident is detected.
                  </span>
                </span>

                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <span>
                  <span className="block font-medium">AI report alerts</span>
                  <span className="text-sm text-slate-400">
                    Notify when an AI report is generated.
                  </span>
                </span>

                <input type="checkbox" className="h-4 w-4" />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">API Configuration</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Frontend API URL</p>
                <p className="mt-1 font-mono text-sm">
                  NEXT_PUBLIC_API_URL
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Current value</p>
                <p className="mt-1 font-mono text-sm">
                  http://localhost:8000
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Later, this will point to the real FastAPI backend.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}