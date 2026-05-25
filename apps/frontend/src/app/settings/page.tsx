"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [aiReportAlerts, setAiReportAlerts] = useState(false);

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
          {/* Profile */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Profile</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="mt-1 font-medium">
                  {user?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-1 font-medium">
                  {user?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Account Status</p>
                <p className="mt-1 font-medium">
                  {user?.is_active ? (
                    <span className="text-emerald-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* AI Provider */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">AI Provider</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Provider</p>
                <p className="mt-1 font-medium">Google Gemini</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Model</p>
                <p className="mt-1 font-medium">gemini-2.5-flash</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                AI secrets are stored in the backend environment variables
                (<code className="text-slate-300">GEMINI_API_KEY</code>).
                They are never exposed to the frontend.
              </div>
            </div>
          </div>

          {/* Notifications */}
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
                <input
                  type="checkbox"
                  checked={incidentAlerts}
                  onChange={(e) => setIncidentAlerts(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <span>
                  <span className="block font-medium">AI report alerts</span>
                  <span className="text-sm text-slate-400">
                    Notify when an AI report is generated.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={aiReportAlerts}
                  onChange={(e) => setAiReportAlerts(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* API Configuration */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">API Configuration</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Backend URL</p>
                <p className="mt-1 font-mono text-sm">
                  {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Environment variable</p>
                <p className="mt-1 font-mono text-sm text-slate-300">
                  NEXT_PUBLIC_API_URL
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
