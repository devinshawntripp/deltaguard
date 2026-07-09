"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import type { CalendarEntry, CalendarStatus } from "@/lib/contentCalendar";

type CalendarResponse = { items: CalendarEntry[] };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_CHIP: Record<CalendarStatus, { label: string; className: string }> = {
  published: {
    label: "Published",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  queued: {
    label: "Queued",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  drafting: {
    label: "Drafting",
    className:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400",
  },
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return body as CalendarResponse;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export default function ContentCalendarClient() {
  const { data, error, isLoading, mutate } = useSWR<CalendarResponse>(
    "/api/admin/content-calendar",
    fetcher,
  );

  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draftDifficulty, setDraftDifficulty] = useState("");
  const [draftVolume, setDraftVolume] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const items = useMemo(() => data?.items ?? [], [data]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const item of items) {
      if (!item.publish_date) continue;
      const list = map.get(item.publish_date) || [];
      list.push(item);
      map.set(item.publish_date, list);
    }
    return map;
  }, [items]);

  const unscheduled = useMemo(
    () => items.filter((item) => !item.publish_date),
    [items],
  );

  const goMonth = (delta: number) => {
    setView((v) => {
      const d = new Date(Date.UTC(v.year, v.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  };

  const startEdit = (entry: CalendarEntry) => {
    setEditingSlug(entry.slug);
    setDraftDifficulty(entry.difficulty == null ? "" : String(entry.difficulty));
    setDraftVolume(entry.monthly_volume == null ? "" : String(entry.monthly_volume));
    setSaveError("");
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setSaveError("");
  };

  const saveEdit = async (slug: string) => {
    const difficulty = draftDifficulty.trim() === "" ? undefined : Number(draftDifficulty);
    const monthlyVolume = draftVolume.trim() === "" ? undefined : Number(draftVolume);
    if (difficulty !== undefined && (!Number.isInteger(difficulty) || difficulty < 0 || difficulty > 100)) {
      setSaveError("Difficulty must be an integer between 0 and 100.");
      return;
    }
    if (monthlyVolume !== undefined && (!Number.isInteger(monthlyVolume) || monthlyVolume < 0)) {
      setSaveError("Monthly volume must be a non-negative integer.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/admin/content-calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          ...(difficulty !== undefined ? { difficulty } : {}),
          ...(monthlyVolume !== undefined ? { monthly_volume: monthlyVolume } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      await mutate();
      setEditingSlug(null);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  /* Build grid cells for the viewed month (UTC). */
  const cells = useMemo(() => {
    const firstDow = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
    const result: Array<{ day: number; dateStr: string } | null> = [];
    for (let i = 0; i < firstDow; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        day,
        dateStr: `${view.year}-${pad2(view.month + 1)}-${pad2(day)}`,
      });
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [view]);

  const renderCard = (entry: CalendarEntry) => {
    const chip = STATUS_CHIP[entry.status];
    const editing = editingSlug === entry.slug;
    return (
      <div
        key={entry.slug}
        onClick={() => !editing && startEdit(entry)}
        className={`rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.03] p-2 text-left transition-colors ${
          editing ? "" : "cursor-pointer hover:bg-black/[.04] dark:hover:bg-white/[.06]"
        }`}
      >
        <Link
          href={`/blog/${entry.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-xs font-medium leading-snug hover:underline"
        >
          {entry.title || entry.slug}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${chip.className}`}
          >
            {chip.label}
          </span>
          {!editing && (
            <span className="text-[10px] opacity-70">
              KD {entry.difficulty ?? "?"} · {entry.monthly_volume ?? "?"}/mo
            </span>
          )}
        </div>
        {editing && (
          <div className="mt-2 grid gap-1.5" onClick={(e) => e.stopPropagation()}>
            <label className="grid gap-0.5 text-[10px] opacity-80">
              Difficulty (0–100)
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={draftDifficulty}
                onChange={(e) => setDraftDifficulty(e.target.value)}
                className="rounded border border-black/15 dark:border-white/15 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black/40 dark:focus:border-white/40"
              />
            </label>
            <label className="grid gap-0.5 text-[10px] opacity-80">
              Volume (/mo)
              <input
                type="number"
                min={0}
                step={1}
                value={draftVolume}
                onChange={(e) => setDraftVolume(e.target.value)}
                className="rounded border border-black/15 dark:border-white/15 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black/40 dark:focus:border-white/40"
              />
            </label>
            {saveError && (
              <p className="text-[10px] text-red-500">{saveError}</p>
            )}
            <div className="flex gap-1.5">
              <button
                onClick={() => saveEdit(entry.slug)}
                disabled={saving}
                className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="rounded border border-black/15 dark:border-white/15 px-2 py-1 text-[10px] font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Content Calendar</h1>
          <p className="text-sm opacity-70">
            Drip campaign publish schedule. Click a card to edit keyword
            difficulty and monthly search volume.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
            className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            ←
          </button>
          <span className="min-w-36 text-center text-sm font-semibold">
            {MONTH_NAMES[view.month]} {view.year}
          </span>
          <button
            onClick={() => goMonth(1)}
            aria-label="Next month"
            className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            →
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Month grid */}
      <div className="surface-card overflow-x-auto p-3">
        <div className="min-w-[840px]">
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((name) => (
              <div
                key={name}
                className="px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide opacity-60"
              >
                {name}
              </div>
            ))}
            {cells.map((cell, i) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="min-h-24 rounded-lg border border-transparent"
                  />
                );
              }
              const dayEntries = byDate.get(cell.dateStr) || [];
              return (
                <div
                  key={cell.dateStr}
                  className="min-h-24 rounded-lg border border-black/5 dark:border-white/5 p-1.5"
                >
                  <div className="mb-1 text-[11px] font-medium opacity-60">
                    {cell.day}
                  </div>
                  <div className="space-y-1.5">
                    {dayEntries.map((entry) => renderCard(entry))}
                  </div>
                </div>
              );
            })}
          </div>
          {isLoading && (
            <div className="py-8 text-center text-sm opacity-60">
              Loading calendar…
            </div>
          )}
        </div>
      </div>

      {/* Unscheduled / drafting posts with no registry entry */}
      {unscheduled.length > 0 && (
        <div className="surface-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Unscheduled</h2>
          <p className="mb-3 text-xs opacity-70">
            Tracked articles without a publish date in the blog registry.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unscheduled.map((entry) => renderCard(entry))}
          </div>
        </div>
      )}
    </div>
  );
}
