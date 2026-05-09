"use client";

import { useState } from "react";
import Link from "next/link";
import { createProject } from "@/lib/api";
import type { Environment } from "@/lib/projects";

export function NewProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState<Environment>("Development");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!description.trim()) {
      setError("Project description is required.");
      return;
    }

    setIsSubmitting(true);

    const project = await createProject({
      name,
      description,
      environment,
    });

    setSuccessMessage(
      `Project "${project.name}" was created locally. Backend connection will be added later.`
    );

    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-900 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-300"
        >
          Project name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Backend API"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-300"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Example: Main API service that handles users, logs, and AI analysis."
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
        />
      </div>

      <div>
        <label
          htmlFor="environment"
          className="block text-sm font-medium text-slate-300"
        >
          Environment
        </label>

        <select
          id="environment"
          name="environment"
          value={environment}
          onChange={(event) =>
            setEnvironment(event.target.value as Environment)
          }
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-400"
        >
          <option>Development</option>
          <option>Staging</option>
          <option>Production</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-medium text-slate-300">Preview</p>
        <p className="mt-3 text-lg font-semibold text-white">
          {name || "Project name"}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {description || "Project description will appear here."}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Environment: {environment}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Project"}
        </button>

        <Link
          href="/projects"
          className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}