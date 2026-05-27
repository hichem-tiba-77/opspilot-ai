"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  analyzeProjectLogs,
  type AnalysisConversationMessage,
} from "@/lib/api";

type AIAnalysisFormProps = {
  projectId: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  model?: string;
};

const EXAMPLE_QUESTIONS = [
  "Explain the root cause in detail.",
  "What changed before the errors started?",
  "Write a full incident report.",
  "Give me a step-by-step fix plan.",
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
  return messages
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
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

export function AIAnalysisForm({ projectId }: AIAnalysisFormProps) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${projectId}`;
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(
    null
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const questionCount = messages.filter(
    (message) => message.role === "user"
  ).length;

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

  async function handleAnalyze() {
    const trimmedQuestion = question.trim();
    setError("");

    if (!trimmedQuestion) {
      setError("Please ask a question before analyzing logs.");
      return;
    }

    if (isAnalyzing) {
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

  function handleClearConversation() {
    setMessages([]);
    setError("");
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="flex min-h-[680px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900 xl:h-[760px]">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Conversation</h2>
            <p className="mt-1 text-sm text-slate-400">
              {questionCount === 0
                ? "No questions yet"
                : `${questionCount} question${questionCount === 1 ? "" : "s"}`}
            </p>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearConversation}
              className="w-fit rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 && !isAnalyzing && (
            <div className="flex h-full min-h-[280px] items-center justify-center">
              <div className="max-w-md text-center">
                <p className="text-xl font-semibold text-white">
                  Ask for a real investigation.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Gemini will use the latest project logs and the previous chat
                  messages in this thread.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <article
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-lg border px-4 py-3 shadow-sm ${
                    isUser
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-slate-800 bg-slate-950 text-slate-200"
                  }`}
                >
                  <div
                    className={`mb-2 flex items-center justify-between gap-4 text-xs ${
                      isUser ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    <span className="font-semibold">
                      {isUser ? "You" : message.model || "Gemini"}
                    </span>
                    <time dateTime={message.createdAt}>
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>
                  <div className="whitespace-pre-wrap break-words text-sm leading-7">
                    {message.content}
                  </div>
                </div>
              </article>
            );
          })}

          {isAnalyzing && (
            <article className="flex justify-start">
              <div className="max-w-[88%] rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300 shadow-sm">
                <div className="mb-2 text-xs font-semibold text-slate-500">
                  Gemini
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-300" />
                  Building a detailed analysis...
                </div>
              </div>
            </article>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-800 bg-slate-950/60 p-4">
          {error && (
            <div className="mb-3 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm leading-6 text-red-200">
              {error}
            </div>
          )}

          <label
            htmlFor="question"
            className="block text-sm font-medium text-slate-300"
          >
            Ask OpsPilot AI
          </label>
          <textarea
            id="question"
            rows={3}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Example: Explain the root cause and give me the fix plan."
            className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Detailed answers use recent logs and this conversation.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !question.trim()}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? "Analyzing..." : "Ask Gemini"}
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-sm font-semibold uppercase text-slate-400">
            Example Questions
          </h3>

          <div className="mt-4 flex flex-col gap-2">
            {EXAMPLE_QUESTIONS.map((exampleQuestion) => (
              <button
                key={exampleQuestion}
                type="button"
                onClick={() => setQuestion(exampleQuestion)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-3 text-left text-sm leading-5 text-slate-300 transition hover:border-cyan-400 hover:text-white"
              >
                {exampleQuestion}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-sm font-semibold uppercase text-slate-400">
            Answer Depth
          </h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>Full diagnostic explanation</p>
            <p>Root-cause evidence from logs</p>
            <p>Fix plan and command checklist</p>
            <p>Previous chat context included</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
