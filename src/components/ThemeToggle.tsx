"use client";

import { useTheme, type ThemeMode } from "@/components/ThemeProvider";

const OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setThemeMode(option.value)}
          className={`theme-toggle-btn ${themeMode === option.value ? "theme-toggle-btn-active" : ""}`}
          aria-pressed={themeMode === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
