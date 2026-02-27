"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dg.theme.mode";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  ready: boolean;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.setAttribute("data-theme-mode", mode);
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
  return resolved;
}

async function persistThemeRemote(mode: ThemeMode) {
  try {
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme: mode }),
    });
  } catch {
    // Ignore preference sync failures; local preference is still applied.
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const setThemeMode = useCallback((next: ThemeMode) => {
    setThemeModeState(next);
    const resolved = applyTheme(next);
    setResolvedTheme(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // noop
    }
    void persistThemeRemote(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemeMode]);

  useEffect(() => {
    let active = true;

    let initialMode: ThemeMode = "system";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isThemeMode(stored)) {
        initialMode = stored;
      }
    } catch {
      // noop
    }

    const initialResolved = applyTheme(initialMode);
    if (active) {
      setThemeModeState(initialMode);
      setResolvedTheme(initialResolved);
      setReady(true);
    }

    fetch("/api/user/preferences", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then((json) => {
        if (!active || !json || !isThemeMode(json.theme)) return;
        const remoteMode = json.theme as ThemeMode;
        if (remoteMode === initialMode) return;
        try {
          localStorage.setItem(STORAGE_KEY, remoteMode);
        } catch {
          // noop
        }
        const remoteResolved = applyTheme(remoteMode);
        setThemeModeState(remoteMode);
        setResolvedTheme(remoteResolved);
      })
      .catch(() => {
        // noop
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (themeMode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = applyTheme("system");
      setResolvedTheme(next);
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [themeMode]);

  const value = useMemo(
    () => ({ ready, themeMode, resolvedTheme, setThemeMode, toggleTheme }),
    [ready, themeMode, resolvedTheme, setThemeMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
