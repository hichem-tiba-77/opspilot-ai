"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";
import { cn, capitalize } from "@/lib/utils";

type Environment = "development" | "staging" | "production";

const environments: Environment[] = ["development", "staging", "production"];

export function NewProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState<Environment>("development");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!description.trim()) {
      setError("Project description is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject({ name, description, environment });
      router.push("/projects");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6 p-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="label">
          Project name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Backend API"
          className="field mt-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Example: Main API service that handles users, logs, and AI analysis."
          className="field mt-2"
        />
      </div>

      <div>
        <p className="label">Environment</p>
        <div className="mt-2 grid rounded-lg border border-zinc-200 bg-zinc-50 p-1 sm:grid-cols-3">
          {environments.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEnvironment(option)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-bold transition",
                environment === option
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-600 hover:bg-white hover:text-zinc-950"
              )}
            >
              {capitalize(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-5">
        <p className="text-sm font-bold text-zinc-500">Preview</p>
        <p className="mt-3 text-lg font-black text-zinc-950">
          {name || "Project name"}
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          {description || "Project description will appear here."}
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
          {environment}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create project"}
        </button>

        <Link href="/projects" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
