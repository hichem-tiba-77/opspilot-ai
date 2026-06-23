"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/auth-context";

function Toggle({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <span>
        <span className="block font-bold text-zinc-950">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-zinc-600">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-emerald-700"
      />
    </label>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [aiReportAlerts, setAiReportAlerts] = useState(false);

  return (
    <PageShell
      description="Manage account preferences, AI configuration, notifications, and API settings for this workspace."
      eyebrow="Settings"
      title="Workspace settings"
    >
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="user" className="h-5 w-5 text-emerald-700" />
            <h2 className="text-xl font-black text-zinc-950">Profile</h2>
          </div>

          <dl className="mt-6 grid gap-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">Name</dt>
              <dd className="mt-1 font-black text-zinc-950">
                {user?.name ?? "-"}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">Email</dt>
              <dd className="mt-1 break-all font-black text-zinc-950">
                {user?.email ?? "-"}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">
                Account status
              </dt>
              <dd className="mt-1 font-black">
                {user?.is_active ? (
                  <span className="text-emerald-700">Active</span>
                ) : (
                  <span className="text-rose-700">Inactive</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="bot" className="h-5 w-5 text-cyan-700" />
            <h2 className="text-xl font-black text-zinc-950">AI provider</h2>
          </div>

          <dl className="mt-6 grid gap-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">Provider</dt>
              <dd className="mt-1 font-black text-zinc-950">Google Gemini</dd>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">Model</dt>
              <dd className="mt-1 font-mono text-sm font-black text-zinc-950">
                gemini-3.5-flash
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">
                Reasoning mode
              </dt>
              <dd className="mt-1 font-mono text-sm font-black text-zinc-950">
                high thinking
              </dd>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              AI secrets stay in backend environment variables. The frontend
              never receives the Gemini API key.
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="alert" className="h-5 w-5 text-amber-700" />
            <h2 className="text-xl font-black text-zinc-950">Notifications</h2>
          </div>

          <div className="mt-6 space-y-4">
            <Toggle
              checked={incidentAlerts}
              description="Notify when a new incident is detected."
              label="Incident alerts"
              onChange={setIncidentAlerts}
            />
            <Toggle
              checked={aiReportAlerts}
              description="Notify when an AI investigation report is generated."
              label="AI report alerts"
              onChange={setAiReportAlerts}
            />
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="settings" className="h-5 w-5 text-zinc-700" />
            <h2 className="text-xl font-black text-zinc-950">
              API configuration
            </h2>
          </div>

          <dl className="mt-6 grid gap-4">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">Backend URL</dt>
              <dd className="mt-1 break-all font-mono text-sm font-black text-zinc-950">
                {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
              </dd>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <dt className="text-sm font-bold text-zinc-500">
                Environment variable
              </dt>
              <dd className="mt-1 font-mono text-sm font-black text-zinc-950">
                NEXT_PUBLIC_API_URL
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </PageShell>
  );
}
