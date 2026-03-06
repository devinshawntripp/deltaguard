"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Registry = {
    id: string;
    orgId: string;
    name: string;
    registryUrl: string;
    username: string | null;
    hasToken: boolean;
    createdAt: string;
    updatedAt: string;
};

type PingResult = {
    ok: boolean;
    latencyMs?: number;
    error?: string;
};

type RegistryQuota = {
    used: number;
    limit: number | null;
    allowed: boolean;
};

export default function RegistriesPage() {
    const [registries, setRegistries] = useState<Registry[]>([]);
    const [quota, setQuota] = useState<RegistryQuota | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add form state
    const [name, setName] = useState("");
    const [registryUrl, setRegistryUrl] = useState("");
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [creating, setCreating] = useState(false);

    // Test connection state (for add form)
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<PingResult | null>(null);

    // Per-row state
    const [pinging, setPinging] = useState<Record<string, boolean>>({});
    const [pingResults, setPingResults] = useState<Record<string, PingResult>>({});
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/org/registries", { cache: "no-store" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setRegistries(data.items || []);
            if (data.quota) setQuota(data.quota);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleTestConnection() {
        if (!registryUrl.trim()) return;
        setTesting(true);
        setTestResult(null);
        try {
            const res = await fetch("/api/org/registries/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registry_url: registryUrl.trim(),
                    username: username.trim() || undefined,
                    token: token.trim() || undefined,
                }),
            });
            const data: PingResult = await res.json();
            setTestResult(data);
        } catch (e: unknown) {
            setTestResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
        } finally {
            setTesting(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !registryUrl.trim()) return;
        setCreating(true);
        setError(null);
        try {
            const res = await fetch("/api/org/registries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    registry_url: registryUrl.trim(),
                    username: username.trim() || undefined,
                    token: token.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setName("");
            setRegistryUrl("");
            setUsername("");
            setToken("");
            setTestResult(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setCreating(false);
        }
    }

    async function handlePing(id: string) {
        setPinging((p) => ({ ...p, [id]: true }));
        setPingResults((p) => {
            const next = { ...p };
            delete next[id];
            return next;
        });
        try {
            const res = await fetch(`/api/org/registries/${id}/ping`, { method: "POST" });
            const data: PingResult = await res.json();
            setPingResults((p) => ({ ...p, [id]: data }));
        } catch (e: unknown) {
            setPingResults((p) => ({ ...p, [id]: { ok: false, error: e instanceof Error ? e.message : String(e) } }));
        } finally {
            setPinging((p) => ({ ...p, [id]: false }));
        }
    }

    async function handleDelete(id: string) {
        setDeleting((d) => ({ ...d, [id]: true }));
        try {
            const res = await fetch(`/api/org/registries/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setConfirmDelete(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setDeleting((d) => ({ ...d, [id]: false }));
        }
    }

    const quotaReached = quota ? !quota.allowed : false;

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Registries</h1>
                <p className="text-sm opacity-70 mt-1">
                    Manage container registry connections for your organization.
                </p>
                {quota && (
                    <p className="text-xs mt-2 opacity-60">
                        {quota.used} / {quota.limit === null ? "Unlimited" : quota.limit} registries used
                    </p>
                )}
            </div>

            {error && (
                <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm">
                    {error}
                </div>
            )}

            {quotaReached && (
                <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 text-amber-900 dark:text-amber-200 px-3 py-2 text-sm">
                    Registry limit reached for your plan. Upgrade to add more registries.
                </div>
            )}

            {/* Add Registry Form */}
            <form
                onSubmit={handleCreate}
                className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-3"
            >
                <div className="font-semibold text-sm">Add Registry</div>
                {quotaReached ? (
                    <p className="text-sm opacity-60">
                        You have reached your plan&apos;s registry limit ({quota?.limit}).
                        Delete an existing registry or upgrade your plan to add more.
                    </p>
                ) : (
                    <>
                        <div className="grid sm:grid-cols-2 gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name (e.g. Docker Hub)"
                                required
                                className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm"
                            />
                            <input
                                value={registryUrl}
                                onChange={(e) => { setRegistryUrl(e.target.value); setTestResult(null); }}
                                placeholder="URL (e.g. https://registry-1.docker.io)"
                                required
                                className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm"
                            />
                            <input
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setTestResult(null); }}
                                placeholder="Username (optional)"
                                className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm"
                            />
                            <input
                                value={token}
                                onChange={(e) => { setToken(e.target.value); setTestResult(null); }}
                                placeholder="Token / Password (optional)"
                                type="password"
                                className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={testing || !registryUrl.trim()}
                                className="rounded border border-black/20 dark:border-white/20 px-4 py-1.5 text-xs font-medium disabled:opacity-60"
                            >
                                {testing ? "Testing..." : "Test Connection"}
                            </button>
                            <button
                                type="submit"
                                disabled={creating || !name.trim() || !registryUrl.trim()}
                                className="rounded bg-black text-white dark:bg-white dark:text-black px-4 py-1.5 text-xs font-medium disabled:opacity-60"
                            >
                                {creating ? "Adding..." : "Add Registry"}
                            </button>
                            <span className="text-xs opacity-60">
                                Credentials are encrypted at rest (AES-256-GCM).
                            </span>
                        </div>
                        {testResult && (
                            <div className={`text-xs ${testResult.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                {testResult.ok
                                    ? `Connection successful (${testResult.latencyMs}ms)`
                                    : `Connection failed: ${testResult.error}`}
                            </div>
                        )}
                    </>
                )}
            </form>

            {/* Registries Table */}
            <div className="overflow-auto rounded-xl border border-black/10 dark:border-white/10">
                <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">URL</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Token</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="p-3" colSpan={5}>Loading...</td>
                            </tr>
                        ) : registries.length === 0 ? (
                            <tr>
                                <td className="p-3 opacity-60" colSpan={5}>
                                    No registries configured yet.
                                </td>
                            </tr>
                        ) : (
                            registries.map((reg) => {
                                const ping = pingResults[reg.id];
                                return (
                                    <tr
                                        key={reg.id}
                                        className="border-t border-black/5 dark:border-white/5 align-top"
                                    >
                                        <td className="p-3">
                                            <Link
                                                href={`/dashboard/registries/${reg.id}/browse`}
                                                className="font-medium hover:underline"
                                            >
                                                {reg.name}
                                            </Link>
                                        </td>
                                        <td className="p-3 font-mono text-xs">{reg.registryUrl}</td>
                                        <td className="p-3 text-xs">{reg.username || <span className="opacity-40">—</span>}</td>
                                        <td className="p-3">
                                            {reg.hasToken ? (
                                                <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-medium">
                                                    Configured
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[11px] opacity-60">
                                                    None
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                <button
                                                    onClick={() => handlePing(reg.id)}
                                                    disabled={pinging[reg.id]}
                                                    className="rounded border border-black/20 dark:border-white/20 px-2 py-1 text-xs disabled:opacity-60"
                                                >
                                                    {pinging[reg.id] ? "Testing..." : "Test"}
                                                </button>
                                                <Link
                                                    href={`/dashboard/registries/${reg.id}/browse`}
                                                    className="rounded border border-black/20 dark:border-white/20 px-2 py-1 text-xs"
                                                >
                                                    Browse
                                                </Link>
                                                {confirmDelete === reg.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleDelete(reg.id)}
                                                            disabled={deleting[reg.id]}
                                                            className="rounded bg-red-600 text-white px-2 py-1 text-xs disabled:opacity-60"
                                                        >
                                                            {deleting[reg.id] ? "Deleting..." : "Confirm"}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="rounded border border-black/20 dark:border-white/20 px-2 py-1 text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(reg.id)}
                                                        className="rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-2 py-1 text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                            {ping && (
                                                <div className={`text-xs mt-1 ${ping.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {ping.ok
                                                        ? `Connected (${ping.latencyMs}ms)`
                                                        : `Failed: ${ping.error}`}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
