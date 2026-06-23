"use client";

import { useState } from "react";
import Link from "next/link";
import { uploadProjectLogs, type LogLevel } from "@/lib/api";

type LogUploadFormProps = {
  projectId: string;
};

const LEVEL_PATTERN = /^(ERROR|WARN|WARNING|INFO|DEBUG)\s+/i;

function parseRawLogs(raw: string, source: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const match = line.match(LEVEL_PATTERN);
      if (match) {
        const rawLevel = match[1].toUpperCase();
        const level: LogLevel =
          rawLevel === "WARNING" ? "WARN" : (rawLevel as LogLevel);
        const message = line.slice(match[0].length).trim();
        return { level, message, source };
      }

      return { level: "INFO" as LogLevel, message: line, source };
    });
}

export function LogUploadForm({ projectId }: LogUploadFormProps) {
  const [source, setSource] = useState("");
  const [rawLogs, setRawLogs] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linesCount = rawLogs
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!source.trim()) {
      setSource(file.name.replace(/\.(log|txt)$/i, ""));
    }

    const reader = new FileReader();
    reader.onload = () => setRawLogs(String(reader.result ?? ""));
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

    const parsedLogs = parseRawLogs(rawLogs, source.trim());
    if (parsedLogs.length === 0) {
      setError("No valid log lines detected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploaded = await uploadProjectLogs(projectId, parsedLogs);
      setSuccessMessage(
        `${uploaded.length} log line${
          uploaded.length === 1 ? "" : "s"
        } uploaded successfully.`
      );
      setRawLogs("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
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
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="source" className="label">
          Log source
        </label>
        <input
          id="source"
          name="source"
          type="text"
          required
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Example: Backend API, Auth Service, Worker Service"
          className="field mt-2"
        />
      </div>

      <div>
        <label htmlFor="logFile" className="label">
          Upload log file
        </label>
        <input
          id="logFile"
          name="logFile"
          type="file"
          accept=".log,.txt"
          onChange={handleFileChange}
          className="field mt-2 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
        />
        <p className="mt-2 text-xs font-semibold text-zinc-500">
          Accepted formats: .log and .txt
        </p>
      </div>

      <div>
        <label htmlFor="rawLogs" className="label">
          Paste logs manually
        </label>
        <textarea
          id="rawLogs"
          name="rawLogs"
          rows={10}
          value={rawLogs}
          onChange={(event) => setRawLogs(event.target.value)}
          placeholder={`ERROR Database connection timeout\nWARN Slow response detected\nINFO User login successful`}
          className="field mt-2 font-mono text-sm leading-6"
        />
      </div>

      <div className="grid gap-3 border-t border-zinc-200 pt-5 text-sm sm:grid-cols-2">
        <div>
          <p className="font-bold text-zinc-500">Source</p>
          <p className="mt-1 font-black text-zinc-950">
            {source || "No source yet"}
          </p>
        </div>
        <div>
          <p className="font-bold text-zinc-500">Detected log lines</p>
          <p className="mt-1 font-black text-zinc-950">{linesCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Uploading..." : "Upload logs"}
        </button>
        <Link href={`/projects/${projectId}/logs`} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
