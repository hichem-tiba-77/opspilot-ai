"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "opspilot-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function readInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const initialTheme = readInitialTheme();
      applyTheme(initialTheme);
      setTheme(initialTheme);
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div
      aria-label="Color mode"
      className="theme-toggle inline-flex shrink-0 items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5"
      role="group"
    >
      <button
        type="button"
        onClick={() => selectTheme("light")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-black transition",
          isReady && theme === "light"
            ? "bg-white text-zinc-950 shadow-sm"
            : "text-zinc-500 hover:bg-white hover:text-zinc-950"
        )}
        title="White mode"
      >
        <Icon name="sun" className="h-3.5 w-3.5" />
        White
      </button>
      <button
        type="button"
        onClick={() => selectTheme("dark")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-black transition",
          isReady && theme === "dark"
            ? "bg-zinc-950 text-white shadow-sm"
            : "text-zinc-500 hover:bg-white hover:text-zinc-950"
        )}
        title="Black mode"
      >
        <Icon name="moon" className="h-3.5 w-3.5" />
        Black
      </button>
    </div>
  );
}
