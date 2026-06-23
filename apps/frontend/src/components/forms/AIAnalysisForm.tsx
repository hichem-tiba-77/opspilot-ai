"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import {
  analyzeProjectLogs,
  type AnalysisConversationMessage,
} from "@/lib/api";
import { capitalize, cn, formatDateTime } from "@/lib/utils";

type AIAnalysisFormProps = {
  projectId: string;
  projectName: string;
  environment: string;
  logsCount: number;
  incidentsCount: number;
  openIncidents: number;
  lastLogAt?: string | null;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  model?: string;
  thinkingMode?: string;
};

type PromptPreset = {
  label: string;
  prompt: string;
  icon: "alert" | "activity" | "terminal" | "logs" | "sparkles";
};

const PROMPT_PRESETS: PromptPreset[] = [
  {
    label: "Root cause",
    icon: "activity",
    prompt:
      "Find the most likely root cause. Rank alternatives and cite the exact log evidence.",
  },
  {
    label: "Mitigation",
    icon: "alert",
    prompt:
      "Give me the safest mitigation plan, rollback criteria, and validation checks.",
  },
  {
    label: "Incident report",
    icon: "sparkles",
    prompt:
      "Write a concise incident report with impact, timeline, root cause, remediation, and follow-ups.",
  },
  {
    label: "Commands",
    icon: "terminal",
    prompt:
      "List the commands, dashboards, and checks I should run next, ordered by priority.",
  },
];

const HISTORY_LIMIT = 10;
const STORAGE_KEY_PREFIX = "opspilot-ai-chat";

function createMessageId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<ChatMessage>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    typeof message.createdAt === "string"
  );
}

function readStoredMessages(storageKey: string): ChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawMessages = window.localStorage.getItem(storageKey);
    if (!rawMessages) {
      return [];
    }

    const parsedMessages = JSON.parse(rawMessages);
    return Array.isArray(parsedMessages)
      ? parsedMessages.filter(isChatMessage)
      : [];
  } catch {
    return [];
  }
}

function toApiHistory(messages: ChatMessage[]): AnalysisConversationMessage[] {
  return messages.slice(-HISTORY_LIMIT).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function formatMessageTime(timestamp: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

function summarizeContent(content: string): string {
  const firstLine = content.split("\n").find((line) => line.trim());
  if (!firstLine) {
    return "Investigation response";
  }

  return firstLine.length > 96 ? `${firstLine.slice(0, 96)}...` : firstLine;
}

export function AIAnalysisForm({
  projectId,
  projectName,
  environment,
  logsCount,
  incidentsCount,
  openIncidents,
  lastLogAt,
}: AIAnalysisFormProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${projectId}`;
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(
    null
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const questionCount = messages.filter(
    (message) => message.role === "user"
  ).length;
  const latestAssistantMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant"),
    [messages]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setMessages(readStoredMessages(storageKey));
      setHydratedStorageKey(storageKey);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [storageKey]);

  useEffect(() => {
    if (hydratedStorageKey !== storageKey || typeof window === "undefined") {
      return;
    }

    if (messages.length === 0) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [hydratedStorageKey, messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isAnalyzing]);

  async function handleAnalyze(nextQuestion = question) {
    const trimmedQuestion = nextQuestion.trim();
    setError("");

    if (!trimmedQuestion || isAnalyzing) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedQuestion,
      createdAt: new Date().toISOString(),
    };
    const history = toApiHistory(messages);

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setQuestion("");
    setIsAnalyzing(true);

    try {
      const result = await analyzeProjectLogs(
        projectId,
        trimmedQuestion,
        history
      );
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: result.answer,
        createdAt: new Date().toISOString(),
        model: result.model || result.provider,
        thinkingMode: result.thinking_mode,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleAnalyze();
    }
  }

  async function handleCopyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setError("Could not copy the answer.");
    }
  }

  function handleClearConversation() {
    setMessages([]);
    setError("");
    setCopiedMessageId(null);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="panel flex h-[calc(100dvh-22rem)] min-h-[26rem] max-h-[38rem] flex-col overflow-hidden xl:sticky xl:top-24">
        <div className="border-b border-zinc-200 bg-white/70 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-950 text-white">
                <Icon name="bot" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-zinc-950">
                  Investigation console
                </h2>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  {questionCount === 0
                    ? "Ready"
                    : `${questionCount} question${
                        questionCount === 1 ? "" : "s"
                      }`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">Logs</p>
                <p className="mt-1 font-black text-zinc-950">
                  {logsCount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">Open</p>
                <p className="mt-1 font-black text-zinc-950">
                  {openIncidents.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <p className="text-xs font-bold text-zinc-500">Env</p>
                <p className="mt-1 truncate font-black text-zinc-950">
                  {capitalize(environment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/40 px-4 py-5 sm:px-6">
          {messages.length === 0 && !isAnalyzing && (
            <div className="mx-auto flex min-h-[360px] max-w-3xl flex-col justify-center">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700">
                    <Icon name="sparkles" className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-950">
                      Start with the question you would ask during an incident.
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {projectName} has {logsCount.toLocaleString()} log
                      {logsCount === 1 ? "" : "s"} available for analysis.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {PROMPT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuestion(preset.prompt)}
                      className="group rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-emerald-300 hover:bg-white"
                    >
                      <div className="flex items-center gap-2 text-sm font-black text-zinc-950">
                        <Icon
                          name={preset.icon}
                          className="h-4 w-4 text-emerald-700"
                        />
                        {preset.label}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {preset.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <article
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isUser && (
                    <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-950 text-white">
                      <Icon name="bot" className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[min(100%,48rem)] rounded-lg border px-4 py-3 shadow-sm",
                      isUser
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-zinc-200 bg-white text-zinc-800"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 flex flex-wrap items-center justify-between gap-3 text-xs font-bold",
                        isUser ? "text-emerald-50" : "text-zinc-500"
                      )}
                    >
                      <span>
                        {isUser ? "You" : message.model || "Gemini"}
                        {!isUser && message.thinkingMode
                          ? ` - ${message.thinkingMode}`
                          : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <time dateTime={message.createdAt}>
                          {formatMessageTime(message.createdAt)}
                        </time>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => void handleCopyMessage(message)}
                            className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-black text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
                          >
                            {copiedMessageId === message.id ? "Copied" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm leading-7">
                      {message.content}
                    </div>
                  </div>
                </article>
              );
            })}

            {isAnalyzing && (
              <article className="flex gap-3">
                <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-950 text-white">
                  <Icon name="bot" className="h-4 w-4" />
                </div>
                <div className="max-w-[min(100%,48rem)] rounded-lg border border-zinc-200 bg-white px-4 py-4 text-zinc-700 shadow-sm">
                  <div className="mb-3 flex items-center gap-3 text-sm font-black">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-700" />
                    Analyzing evidence
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-64 max-w-full animate-pulse rounded bg-zinc-200" />
                    <div className="h-3 w-96 max-w-full animate-pulse rounded bg-zinc-200" />
                    <div className="h-3 w-52 max-w-full animate-pulse rounded bg-zinc-200" />
                  </div>
                </div>
              </article>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-white p-3 shadow-[0_-18px_40px_rgba(16,24,40,0.08)] sm:p-4">
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            <textarea
              id="question"
              rows={2}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask a follow-up, request commands, or turn this into an incident report."
              className="max-h-36 min-h-16 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-zinc-950 outline-none placeholder:text-zinc-500"
            />

            <div className="flex flex-col gap-3 border-t border-zinc-200 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {PROMPT_PRESETS.slice(0, 3).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setQuestion(preset.prompt)}
                    className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-black text-zinc-600 transition hover:text-zinc-950"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearConversation}
                    className="btn-secondary min-h-10 px-3"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleAnalyze()}
                  disabled={isAnalyzing || !question.trim()}
                  className="btn-primary min-h-10 px-4 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="sparkles" className="h-4 w-4" />
                  Ask AI
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="activity" className="h-5 w-5 text-emerald-700" />
            <h3 className="text-lg font-black text-zinc-950">Briefing</h3>
          </div>

          <dl className="mt-5 grid gap-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500">
                Latest log
              </dt>
              <dd className="mt-1 text-sm font-black text-zinc-950">
                {formatDateTime(lastLogAt)}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs font-bold text-zinc-500">Incidents</dt>
                <dd className="mt-1 text-2xl font-black text-zinc-950">
                  {incidentsCount.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <dt className="text-xs font-bold text-zinc-500">Open</dt>
                <dd className="mt-1 text-2xl font-black text-zinc-950">
                  {openIncidents.toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="panel p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.08em] text-zinc-500">
            Presets
          </h3>
          <div className="mt-4 space-y-2">
            {PROMPT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setQuestion(preset.prompt)}
                className="flex w-full items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left transition hover:border-emerald-300 hover:bg-white"
              >
                <Icon
                  name={preset.icon}
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                />
                <span>
                  <span className="block text-sm font-black text-zinc-950">
                    {preset.label}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-600">
                    {preset.prompt}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="logs" className="h-5 w-5 text-cyan-700" />
            <h3 className="text-lg font-black text-zinc-950">Latest answer</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {latestAssistantMessage
              ? summarizeContent(latestAssistantMessage.content)
              : "No answer yet."}
          </p>
          <Link
            href={`/projects/${projectId}/logs`}
            className="btn-secondary mt-5 w-full"
          >
            Open logs
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </section>
      </aside>
    </div>
  );
}
