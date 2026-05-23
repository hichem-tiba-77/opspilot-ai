"use client";

import { useState } from "react";
import { analyzeProjectLogs } from "@/lib/api";

type AIAnalysisFormProps = {
  projectId: string;
};

const EXAMPLE_QUESTIONS = [
  "Summarize the latest errors.",
  "What is the possible root cause?",
  "Generate an incident report.",
  "What should I check next?",
];

export function AIAnalysisForm({ projectId }: AIAnalysisFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleAnalyze() {
    setError("");
    setAnswer("");

    if (!question.trim()) {
      setError("Please ask a question before analyzing logs.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeProjectLogs(projectId, question);
      setAnswer(result.answer);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        {error && (
          <div className="rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-slate-300"
          >
            Ask OpsPilot AI
          </label>
          <textarea
            id="question"
            rows={8}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Why is my backend failing?"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-slate-400"
          />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm font-medium text-slate-300">Example questions</p>
          <div className="mt-3 space-y-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuestion(q)}
                className="block w-full text-left text-sm text-slate-400 transition hover:text-white"
              >
                • {q}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing ? "Analyzing…" : "Analyze Logs"}
        </button>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">AI Response</h2>

        {isAnalyzing && (
          <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
              Analyzing project logs…
            </div>
          </div>
        )}

        {!isAnalyzing && answer && (
          <pre className="mt-5 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
            {answer}
          </pre>
        )}

        {!isAnalyzing && !answer && !error && (
          <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">
            Ask a question about this project&apos;s logs. The AI response will
            appear here.
          </div>
        )}
      </section>
    </div>
  );
}