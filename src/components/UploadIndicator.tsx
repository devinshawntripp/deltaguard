"use client";

import { useEffect, useState } from "react";
import { useUploadStore } from "@/store/useUploadStore";

export default function UploadIndicator() {
  const uploads = useUploadStore((s) => s.uploads);
  const removeUpload = useUploadStore((s) => s.removeUpload);
  const [expanded, setExpanded] = useState(false);

  const entries = Array.from(uploads.values());
  const active = entries.filter((u) => u.phase !== "done" && u.phase !== "error");
  const done = entries.filter((u) => u.phase === "done");

  // Auto-dismiss completed uploads after 3 seconds
  useEffect(() => {
    if (done.length === 0) return;
    const timers = done.map((u) => setTimeout(() => removeUpload(u.id), 3000));
    return () => timers.forEach(clearTimeout);
  }, [done, removeUpload]);

  if (entries.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Collapsed pill */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex flex-col gap-1 rounded-2xl bg-black/90 dark:bg-white/90 text-white dark:text-black px-4 py-2 text-sm font-medium shadow-lg hover:opacity-90 transition min-w-[200px]"
        >
          {active.length > 0 ? (
            <>
              <Spinner />
              <span className="truncate max-w-[180px]">
                {active.length === 1
                  ? `${active[0].filename} ${active[0].pct}%${active[0].speed ? ` \u2022 ${active[0].speed}` : ""}`
                  : `${active.length} uploads in progress`}
              </span>
            </>
          ) : (
            <>
              <CheckIcon />
              <span>Upload complete</span>
            </>
          )}
          {active.length === 1 && (
            <div className="w-full h-1 rounded bg-white/20 dark:bg-black/20 overflow-hidden">
              <div className="h-1 bg-blue-400 rounded transition-all" style={{ width: `${active[0].pct}%` }} />
            </div>
          )}
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-black/10 dark:border-white/10">
            <span className="text-xs font-semibold">Uploads</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs muted hover:opacity-70"
              aria-label="Collapse"
            >
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
            {entries.map((u) => (
              <div key={u.id} className="px-3 py-2 grid gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate max-w-[200px]">{u.filename}</span>
                  {u.phase === "done" ? (
                    <CheckIcon />
                  ) : u.phase === "error" ? (
                    <span className="text-xs text-red-500">Failed</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => u.abort()}
                      className="text-[10px] text-red-500 hover:text-red-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {u.phase !== "done" && u.phase !== "error" && (
                  <>
                    <div className="h-1.5 rounded bg-black/10 dark:bg-white/10">
                      <div
                        className="h-1.5 bg-blue-600 rounded transition-all"
                        style={{ width: `${u.pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] muted">
                      {u.pct}%{u.speed ? ` \u2022 ${u.speed}` : ""}
                      {u.phase === "creating-job" ? " \u2022 Queueing scan\u2026" : ""}
                    </div>
                  </>
                )}
                {u.phase === "error" && u.error && (
                  <div className="text-[10px] text-red-500 truncate">{u.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="text-green-500 flex-shrink-0">
      <path d="M3 7.5l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
