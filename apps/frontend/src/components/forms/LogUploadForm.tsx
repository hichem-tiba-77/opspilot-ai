"use client";

import { useState } from "react";
import Link from "next/link";
import { uploadProjectLogs } from "@/lib/api";

type LogUploadFormProps = {
  projectId: string;
};

export function LogUploadForm({ projectId }: LogUploadFormProps) {
  const [source, setSource] = useState("");
  const [rawLogs, setRawLogs] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linesCount = rawLogs
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  setFileName(file.name);

  if (!source.trim()) {
    setSource(file.name.replace(/\.(log|txt)$/i, ""));
  }

  const reader = new FileReader();

  reader.onload = () => {
    const content = String(reader.result ?? "");
    setRawLogs(content);
  };

  reader.readAsText(file);
}
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!source.trim()) {
      setError("Log source is required.");
      return;
    }

    if (!rawLogs.trim()) {
      setError("Please paste logs or upload a log file.");
      return;
    }

    setIsSubmitting(true);

    const result = await uploadProjectLogs({
      projectId,
      source,
      rawLogs,
    });

    if (result.success) {
      setSuccessMessage(
        `${result.linesCount} log lines were uploaded locally. Backend connection will be added later.`
      );
    }

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
          htmlFor="source"
          className="block text-sm font-medium text-slate-300"
        >
          Log source
        </label>

        <input
          id="source"
          name="source"
          type="text"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Example: Backend API, Auth Service, Worker Service"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
        />
      </div>

      <div>
        <label
          htmlFor="logFile"
          className="block text-sm font-medium text-slate-300"
        >
          Upload log file
        </label>

        <input
          id="logFile"
          name="logFile"
          type="file"
          accept=".log,.txt"
          onChange={handleFileChange}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950"
        />

        <p className="mt-2 text-xs text-slate-500">
          Accepted formats for now: .log and .txt
        </p>
      </div>

      <div>
        <label
          htmlFor="rawLogs"
          className="block text-sm font-medium text-slate-300"
        >
          Paste logs manually
        </label>

        <textarea
          id="rawLogs"
          name="rawLogs"
          rows={10}
          value={rawLogs}
          onChange={(event) => setRawLogs(event.target.value)}
          placeholder={`ERROR Database connection timeout
WARN Slow response detected
INFO User login successful`}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
        />
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm font-medium text-slate-300">Upload preview</p>

        <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-slate-500">Source</p>
            <p className="mt-1 text-white">{source || "No source yet"}</p>
          </div>

          <div>
            <p className="text-slate-500">Detected log lines</p>
            <p className="mt-1 text-white">{linesCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Uploading..." : "Upload Logs"}
        </button>

        <Link
          href={`/projects/${projectId}/logs`}
          className="rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}