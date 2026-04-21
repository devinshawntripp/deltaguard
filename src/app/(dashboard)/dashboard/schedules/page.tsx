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

    // Image picker state
    const [registries, setRegistries] = useState<{id: string; name: string; registry_url: string}[]>([]);
    const [selectedRegistry, setSelectedRegistry] = useState("");
    const [repos, setRepos] = useState<string[]>([]);
    const [selectedRepo, setSelectedRepo] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState("");
    const [imageMode, setImageMode] = useState<"registry" | "manual">("registry");
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [loadingTags, setLoadingTags] = useState(false);

    // Delete confirm
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [toggling, setToggling] = useState<Record<string, boolean>>({});

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ image_ref: "", cron_expr: "", scan_mode: "light" });
    const [saving, setSaving] = useState(false);

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

    // Fetch registries on mount
    useEffect(() => {
        fetch("/api/org/registries")
            .then(r => r.json())
            .then(data => {
                const items = data.items || data.registries || data || [];
                setRegistries(Array.isArray(items) ? items : []);
                if (!Array.isArray(items) || items.length === 0) setImageMode("manual");
            })
            .catch(() => setImageMode("manual"));
    }, []);

    // Fetch repos when registry selected
    useEffect(() => {
        if (!selectedRegistry) { setRepos([]); return; }
        setLoadingRepos(true);
        setSelectedRepo("");
        setSelectedTag("");
        fetch(`/api/registries/${selectedRegistry}/repos`)
            .then(r => r.json())
            .then(data => setRepos(data.repositories || []))
            .catch(() => setRepos([]))
            .finally(() => setLoadingRepos(false));
    }, [selectedRegistry]);

    // Fetch tags when repo selected
    useEffect(() => {
        if (!selectedRegistry || !selectedRepo) { setTags([]); return; }
        setLoadingTags(true);
        setSelectedTag("");
        fetch(`/api/registries/${selectedRegistry}/tags?repo=${encodeURIComponent(selectedRepo)}`)
            .then(r => r.json())
            .then(data => setTags(data.tags || []))
            .catch(() => setTags([]))
            .finally(() => setLoadingTags(false));
    }, [selectedRegistry, selectedRepo]);

    // Update imageRef when registry selections change
    useEffect(() => {
        if (imageMode === "registry" && selectedRepo && selectedTag) {
            setImageRef(`${selectedRepo}:${selectedTag}`);
        }
    }, [imageMode, selectedRepo, selectedTag]);

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
                    ...(imageMode === "registry" && selectedRegistry ? { registry_config_id: selectedRegistry } : {}),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setImageRef("");
            setCronExpression("0 0 * * *");
            setScanMode("light");
            setSelectedRegistry("");
            setSelectedRepo("");
            setSelectedTag("");
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

    function startEdit(s: Schedule) {
        setEditingId(s.id);
        setEditForm({ image_ref: s.image_ref, cron_expr: s.cron_expr, scan_mode: s.scan_mode });
    }

    function cancelEdit() {
        setEditingId(null);
    }

    async function handleSave(id: string) {
        setSaving(true);
        try {
            const res = await fetch(`/api/schedules/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setEditingId(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setSaving(false);
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
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Image</label>

                        {/* Mode toggle — hidden if no registries */}
                        {registries.length > 0 && (
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setImageMode("registry")}
                                    className={`px-3 py-1 text-xs rounded-full border transition ${
                                        imageMode === "registry"
                                            ? "bg-indigo-600 text-white border-transparent"
                                            : "border-zinc-600 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                                >
                                    From Registry
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageMode("manual")}
                                    className={`px-3 py-1 text-xs rounded-full border transition ${
                                        imageMode === "manual"
                                            ? "bg-indigo-600 text-white border-transparent"
                                            : "border-zinc-600 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                                >
                                    Manual Entry
                                </button>
                            </div>
                        )}

                        {imageMode === "registry" ? (
                            <div className="grid gap-3">
                                {/* Registry selector */}
                                <select
                                    value={selectedRegistry}
                                    onChange={e => setSelectedRegistry(e.target.value)}
                                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                                >
                                    <option value="">Select a registry...</option>
                                    {registries.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.registry_url})</option>
                                    ))}
                                </select>

                                {/* Repo selector */}
                                {selectedRegistry && (
                                    <div>
                                        {loadingRepos ? (
                                            <div className="text-xs text-zinc-500 py-2">Loading repositories...</div>
                                        ) : repos.length > 0 ? (
                                            <select
                                                value={selectedRepo}
                                                onChange={e => setSelectedRepo(e.target.value)}
                                                className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                                            >
                                                <option value="">Select a repository...</option>
                                                {repos.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-xs text-zinc-500 py-2">No repositories found in this registry.</div>
                                        )}
                                    </div>
                                )}

                                {/* Tag selector */}
                                {selectedRepo && (
                                    <div>
                                        {loadingTags ? (
                                            <div className="text-xs text-zinc-500 py-2">Loading tags...</div>
                                        ) : tags.length > 0 ? (
                                            <select
                                                value={selectedTag}
                                                onChange={e => setSelectedTag(e.target.value)}
                                                className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                                            >
                                                <option value="">Select a tag...</option>
                                                {tags.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-xs text-zinc-500 py-2">No tags found for this repository.</div>
                                        )}
                                    </div>
                                )}

                                {/* Computed image ref preview */}
                                {selectedRepo && selectedTag && (
                                    <div className="text-xs text-zinc-400">
                                        Image: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">{selectedRepo}:{selectedTag}</code>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={imageRef}
                                onChange={(e) => setImageRef(e.target.value)}
                                placeholder="e.g. nginx:1.27 or ghcr.io/org/repo:latest"
                                className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                            />
                        )}
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
                        disabled={creating || (imageMode === "registry" ? !selectedTag : !imageRef.trim())}
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
                            {editingId === s.id ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Image Reference</label>
                                        <input
                                            type="text"
                                            value={editForm.image_ref}
                                            onChange={(e) => setEditForm((f) => ({ ...f, image_ref: e.target.value }))}
                                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Schedule</label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {COMMON_CRONS.map((c) => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    onClick={() => setEditForm((f) => ({ ...f, cron_expr: c.value }))}
                                                    className={`rounded px-2 py-1 text-xs transition-colors ${
                                                        editForm.cron_expr === c.value
                                                            ? "bg-indigo-600 text-white"
                                                            : "border border-zinc-600 text-zinc-400 hover:bg-zinc-700"
                                                    }`}
                                                >
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            value={editForm.cron_expr}
                                            onChange={(e) => setEditForm((f) => ({ ...f, cron_expr: e.target.value }))}
                                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Scan Mode</label>
                                        <select
                                            value={editForm.scan_mode}
                                            onChange={(e) => setEditForm((f) => ({ ...f, scan_mode: e.target.value }))}
                                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                                        >
                                            <option value="light">Light</option>
                                            <option value="deep">Deep</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSave(s.id)}
                                            disabled={saving || !editForm.image_ref.trim()}
                                            className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="rounded border border-zinc-600 px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
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
                                            onClick={() => startEdit(s)}
                                            className="rounded border border-zinc-600 p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                                            title="Edit schedule"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
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
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
