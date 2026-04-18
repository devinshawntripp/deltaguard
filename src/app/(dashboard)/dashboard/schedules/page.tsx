"use client";

import { useEffect, useState } from "react";

type Schedule = {
    id: string;
    org_id: string;
    registry_config_id: string | null;
    image_ref: string;
    cron_expr: string;
    scan_mode: string;
    enabled: boolean;
    last_run_at: string | null;
    next_run_at: string | null;
    created_at: string;
    updated_at: string;
};

const COMMON_CRONS = [
    { label: "Every day at midnight", value: "0 0 * * *" },
    { label: "Every 6 hours", value: "0 */6 * * *" },
    { label: "Every 12 hours", value: "0 */12 * * *" },
    { label: "Every Monday at midnight", value: "0 0 * * 1" },
    { label: "Every hour", value: "0 * * * *" },
];

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create form
    const [imageRef, setImageRef] = useState("");
    const [cronExpression, setCronExpression] = useState("0 0 * * *");
    const [scanMode, setScanMode] = useState("light");
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Delete confirm
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [toggling, setToggling] = useState<Record<string, boolean>>({});

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/schedules", { cache: "no-store" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setSchedules(data.items || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!imageRef.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_ref: imageRef.trim(),
                    cron_expr: cronExpression.trim(),
                    scan_mode: scanMode,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setImageRef("");
            setCronExpression("0 0 * * *");
            setScanMode("light");
            setShowForm(false);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setCreating(false);
        }
    }

    async function handleToggle(id: string, enabled: boolean) {
        setToggling((p) => ({ ...p, [id]: true }));
        try {
            await fetch(`/api/schedules/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled }),
            });
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setToggling((p) => ({ ...p, [id]: false }));
        }
    }

    async function handleDelete(id: string) {
        setDeleting((p) => ({ ...p, [id]: true }));
        try {
            await fetch(`/api/schedules/${id}`, { method: "DELETE" });
            setConfirmDelete(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setDeleting((p) => ({ ...p, [id]: false }));
        }
    }

    function formatDate(d: string | null): string {
        if (!d) return "Never";
        try {
            return new Date(d).toLocaleString();
        } catch {
            return d;
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Scheduled Scans</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Automatically scan container images on a recurring schedule.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    {showForm ? "Cancel" : "New Schedule"}
                </button>
            </div>

            {error && (
                <div className="rounded bg-red-900/30 border border-red-700 p-3 text-sm text-red-300">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">dismiss</button>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-200">Create Schedule</h2>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Image Reference</label>
                        <input
                            type="text"
                            value={imageRef}
                            onChange={(e) => setImageRef(e.target.value)}
                            placeholder="e.g. nginx:1.27 or ghcr.io/org/repo:latest"
                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Schedule</label>
                        <select
                            value={COMMON_CRONS.find((c) => c.value === cronExpression) ? cronExpression : "__custom"}
                            onChange={(e) => {
                                if (e.target.value !== "__custom") setCronExpression(e.target.value);
                            }}
                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 mb-2"
                        >
                            {COMMON_CRONS.map((c) => (
                                <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
                            ))}
                            <option value="__custom">Custom</option>
                        </select>
                        <input
                            type="text"
                            value={cronExpression}
                            onChange={(e) => setCronExpression(e.target.value)}
                            placeholder="Cron expression (e.g. 0 0 * * *)"
                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 font-mono"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Standard 5-field cron: minute hour day-of-month month day-of-week</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Scan Mode</label>
                        <select
                            value={scanMode}
                            onChange={(e) => setScanMode(e.target.value)}
                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                        >
                            <option value="light">Light</option>
                            <option value="deep">Deep</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={creating || !imageRef.trim()}
                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {creating ? "Creating..." : "Create Schedule"}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Loading schedules...</div>
            ) : schedules.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    No scheduled scans yet. Create one to automatically scan images on a recurring cadence.
                </div>
            ) : (
                <div className="space-y-3">
                    {schedules.map((s) => (
                        <div
                            key={s.id}
                            className={`rounded-lg border p-4 ${
                                s.enabled
                                    ? "border-zinc-700 bg-zinc-800/50"
                                    : "border-zinc-800 bg-zinc-900/50 opacity-60"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm font-medium text-zinc-100">{s.image_ref}</code>
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                            s.enabled
                                                ? "bg-green-900/40 text-green-400 border border-green-800"
                                                : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                        }`}>
                                            {s.enabled ? "Active" : "Paused"}
                                        </span>
                                        <span className="inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 border border-zinc-700">
                                            {s.scan_mode}
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-400 space-x-4">
                                        <span>Cron: <code className="text-zinc-300">{s.cron_expr}</code></span>
                                        <span>Last run: {formatDate(s.last_run_at)}</span>
                                        <span>Next run: {formatDate(s.next_run_at)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(s.id, !s.enabled)}
                                        disabled={toggling[s.id]}
                                        className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                                    >
                                        {toggling[s.id] ? "..." : s.enabled ? "Pause" : "Resume"}
                                    </button>
                                    {confirmDelete === s.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                disabled={deleting[s.id]}
                                                className="rounded bg-red-700 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {deleting[s.id] ? "..." : "Confirm"}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(null)}
                                                className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(s.id)}
                                            className="rounded border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
