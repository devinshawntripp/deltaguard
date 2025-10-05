"use client";
import useSWR from "swr";
import React from "react";
import ProgressGraph from "@/components/ProgressGraph";

type Job = {
  id: string;
  object_key?: string;
  status: "queued" | "running" | "done" | "failed";
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  progress_pct: number;
  progress_msg?: string | null;
};

export default function PackagesTable() {
  const [list, setList] = React.useState<Job[]>([]);
  React.useEffect(() => {
    const es = new EventSource("/api/jobs/events");
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "snapshot" && Array.isArray(msg.items)) setList(msg.items);
        if (msg.type === "changed" && msg.item) {
          setList((prev) => {
            const map = new Map<string, Job>();
            for (const j of prev) map.set(j.id, j);
            const cur = map.get(msg.item.id) || ({} as Job);
            map.set(msg.item.id, { ...cur, ...msg.item });
            const arr = Array.from(map.values());
            arr.sort((a, b) => {
              const rank = (s: string) => (s === 'running' ? 0 : s === 'queued' ? 1 : 2);
              const r = rank(a.status) - rank(b.status);
              return r !== 0 ? r : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            return arr.slice(0, 100);
          });
        }
      } catch { }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
          <tr>
            <th className="p-3">Job</th>
            <th className="p-3">File</th>
            <th className="p-3">Status</th>
            <th className="p-3">Progress</th>
            <th className="p-3">Started</th>
            <th className="p-3">Finished</th>
          </tr>
        </thead>
        <tbody>
          {list.map((j) => {
            const pct = j.status === "done" ? 100 : Math.min(100, j.progress_pct || 0);
            return (
              <React.Fragment key={j.id}>
                <tr className="border-t border-black/5 dark:border-white/5">
                  <td className="p-3 font-mono text-xs">{j.id}</td>
                  <td className="p-3 opacity-80 break-all text-xs">{j.object_key || ""}</td>
                  <td className="p-3 opacity-80">{j.status}</td>
                  <td className="p-3">
                    <div className="h-2 bg-black/10 dark:bg-white/10 rounded">
                      <div className={`h-2 rounded ${j.status === "failed" ? "bg-red-600" : j.status === "done" ? "bg-green-600" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs opacity-70 mt-1">{j.progress_msg || ""}</div>
                  </td>
                  <td className="p-3 opacity-70 text-xs">{j.started_at ? new Date(j.started_at).toLocaleString() : ""}</td>
                  <td className="p-3 opacity-70 text-xs">{j.finished_at ? new Date(j.finished_at).toLocaleString() : ""}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`/api/jobs/${j.id}`, { method: "DELETE" });
                          setList((prev) => prev.filter((x) => x.id !== j.id));
                        } catch { }
                      }}
                      className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {(j.status === "running" || j.status === "queued") && (
                  <tr className="border-t border-black/5 dark:border-white/5">
                    <td className="p-3" colSpan={6}>
                      <div className="grid gap-2">
                        <div className="text-sm font-medium">Workflow</div>
                        <ProgressGraph scanId={j.id} eventsPath={`/api/jobs/${j.id}/events`} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


