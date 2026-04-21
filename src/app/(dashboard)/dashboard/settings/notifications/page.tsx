"use client";

import { useEffect, useState } from "react";

type Channel = {
    id: string;
    org_id: string;
    channel_type: string;
    name: string;
    config: Record<string, any>;
    enabled: boolean;
    created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
    slack: "Slack",
    discord: "Discord",
    webhook: "Webhook",
    email: "Email",
};

const TYPE_ICONS: Record<string, string> = {
    slack: "#",
    discord: "D",
    webhook: "W",
    email: "@",
};

export default function NotificationsPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Create form
    const [channelType, setChannelType] = useState("slack");
    const [name, setName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [webhookSecret, setWebhookSecret] = useState("");
    const [emailAddresses, setEmailAddresses] = useState("");
    const [creating, setCreating] = useState(false);

    // Per-row state
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [testing, setTesting] = useState<Record<string, boolean>>({});
    const [testResults, setTestResults] = useState<Record<string, { ok: boolean; error?: string }>>({});

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/notifications", { cache: "no-store" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setChannels(data.items || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    function buildConfig(): Record<string, any> {
        switch (channelType) {
            case "slack":
            case "discord":
                return { webhook_url: webhookUrl.trim() };
            case "webhook":
                return {
                    url: webhookUrl.trim(),
                    ...(webhookSecret.trim() ? { secret: webhookSecret.trim() } : {}),
                };
            case "email":
                return {
                    addresses: emailAddresses.split(",").map((a) => a.trim()).filter(Boolean),
                };
            default:
                return {};
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setCreating(true);
        setError(null);
        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channel_type: channelType,
                    name: name.trim(),
                    config: buildConfig(),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setName("");
            setWebhookUrl("");
            setWebhookSecret("");
            setEmailAddresses("");
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
            await fetch(`/api/notifications/${id}`, {
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

    async function handleTest(id: string) {
        setTesting((p) => ({ ...p, [id]: true }));
        setTestResults((p) => {
            const copy = { ...p };
            delete copy[id];
            return copy;
        });
        try {
            const res = await fetch(`/api/notifications/${id}/test`, { method: "POST" });
            const data = await res.json();
            setTestResults((p) => ({ ...p, [id]: data }));
        } catch (e: unknown) {
            setTestResults((p) => ({ ...p, [id]: { ok: false, error: e instanceof Error ? e.message : String(e) } }));
        } finally {
            setTesting((p) => ({ ...p, [id]: false }));
        }
    }

    async function handleDelete(id: string) {
        setDeleting((p) => ({ ...p, [id]: true }));
        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" });
            setConfirmDelete(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setDeleting((p) => ({ ...p, [id]: false }));
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Notifications</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Get notified when scans complete via Slack, Discord, webhooks, or email.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    {showForm ? "Cancel" : "Add Channel"}
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
                    <h2 className="text-lg font-semibold text-zinc-200">Add Notification Channel</h2>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Type</label>
                        <select
                            value={channelType}
                            onChange={(e) => setChannelType(e.target.value)}
                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                        >
                            <option value="slack">Slack</option>
                            <option value="discord">Discord</option>
                            <option value="webhook">Webhook</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Security Team Slack"
                            className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    {channelType === "slack" && (
                        <div className="grid gap-3">
                            <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-3 grid gap-2 text-xs muted">
                                <p className="font-semibold text-blue-400">How to get a Slack Webhook URL:</p>
                                <ol className="list-decimal pl-4 grid gap-1">
                                    <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">api.slack.com/apps</a> and click <strong>Create New App</strong> → <strong>From scratch</strong></li>
                                    <li>Name it &quot;ScanRook&quot; and select your workspace</li>
                                    <li>Click <strong>Incoming Webhooks</strong> in the left sidebar → toggle it <strong>On</strong></li>
                                    <li>Click <strong>Add New Webhook to Workspace</strong> → select the channel to post to</li>
                                    <li>Copy the webhook URL (starts with <code className="bg-black/10 dark:bg-white/10 px-1 rounded">https://hooks.slack.com/services/...</code>)</li>
                                </ol>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Webhook URL</label>
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="Paste your Slack webhook URL here"
                                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {channelType === "discord" && (
                        <div className="grid gap-3">
                            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/15 p-3 grid gap-2 text-xs muted">
                                <p className="font-semibold text-indigo-400">How to get a Discord Webhook URL:</p>
                                <ol className="list-decimal pl-4 grid gap-1">
                                    <li>Open Discord and go to the channel you want notifications in</li>
                                    <li>Click the <strong>gear icon</strong> (Edit Channel) next to the channel name</li>
                                    <li>Go to <strong>Integrations</strong> → <strong>Webhooks</strong> → <strong>New Webhook</strong></li>
                                    <li>Name it &quot;ScanRook&quot; and click <strong>Copy Webhook URL</strong></li>
                                    <li>The URL looks like <code className="bg-black/10 dark:bg-white/10 px-1 rounded">https://discord.com/api/webhooks/...</code></li>
                                </ol>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Webhook URL</label>
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {channelType === "webhook" && (
                        <>
                            <div className="rounded-lg bg-zinc-500/5 border border-zinc-500/15 p-3 grid gap-2 text-xs muted">
                                <p className="font-semibold text-zinc-300">Generic Webhook</p>
                                <p>ScanRook will POST a JSON payload to your URL when a scan completes. The payload includes the image name, finding counts by severity, and a link to the dashboard.</p>
                                <p>If you provide an HMAC secret, the request includes an <code className="bg-black/10 dark:bg-white/10 px-1 rounded">X-Scanrook-Signature</code> header (SHA-256 HMAC of the body) for verification.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Endpoint URL</label>
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://your-server.com/webhook"
                                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">
                                    HMAC Secret <span className="text-zinc-500">(optional)</span>
                                </label>
                                <input
                                    type="password"
                                    value={webhookSecret}
                                    onChange={(e) => setWebhookSecret(e.target.value)}
                                    placeholder="Used for X-Scanrook-Signature header"
                                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                                />
                            </div>
                        </>
                    )}

                    {channelType === "email" && (
                        <div className="grid gap-3">
                            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3 grid gap-2 text-xs muted">
                                <p className="font-semibold text-emerald-400">Email Notifications</p>
                                <p>ScanRook sends a formatted email with severity counts, image name, and a link to the full results when a scan completes. Emails are sent from <strong>info@scanrook.io</strong>.</p>
                                <p>Add any email addresses — team members, distribution lists, or ticketing system inboxes (e.g., Jira, PagerDuty email integration).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Email Addresses</label>
                                <input
                                    type="text"
                                    value={emailAddresses}
                                    onChange={(e) => setEmailAddresses(e.target.value)}
                                    placeholder="security-team@company.com, dev@company.com"
                                    className="w-full rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                                    required
                                />
                                <p className="text-xs text-zinc-500 mt-1">Comma-separated. Each address receives the scan notification.</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={creating || !name.trim()}
                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                    >
                        {creating ? "Creating..." : "Add Channel"}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-center py-12 text-zinc-400">Loading channels...</div>
            ) : channels.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    No notification channels configured. Add one to receive alerts when scans complete.
                </div>
            ) : (
                <div className="space-y-3">
                    {channels.map((ch) => (
                        <div
                            key={ch.id}
                            className={`rounded-lg border p-4 ${
                                ch.enabled
                                    ? "border-zinc-700 bg-zinc-800/50"
                                    : "border-zinc-800 bg-zinc-900/50 opacity-60"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-zinc-700 text-xs font-bold text-zinc-300">
                                            {TYPE_ICONS[ch.channel_type] || "?"}
                                        </span>
                                        <span className="text-sm font-medium text-zinc-100">{ch.name}</span>
                                        <span className="text-xs text-zinc-400">
                                            {TYPE_LABELS[ch.channel_type] || ch.channel_type}
                                        </span>
                                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                            ch.enabled
                                                ? "bg-green-900/40 text-green-400 border border-green-800"
                                                : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                        }`}>
                                            {ch.enabled ? "Active" : "Disabled"}
                                        </span>
                                    </div>
                                    {testResults[ch.id] && (
                                        <div className={`text-xs mt-1 ${testResults[ch.id].ok ? "text-green-400" : "text-red-400"}`}>
                                            {testResults[ch.id].ok ? "Test notification sent successfully" : `Failed: ${testResults[ch.id].error}`}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleTest(ch.id)}
                                        disabled={testing[ch.id]}
                                        className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                                    >
                                        {testing[ch.id] ? "Sending..." : "Test"}
                                    </button>
                                    <button
                                        onClick={() => handleToggle(ch.id, !ch.enabled)}
                                        disabled={toggling[ch.id]}
                                        className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                                    >
                                        {toggling[ch.id] ? "..." : ch.enabled ? "Disable" : "Enable"}
                                    </button>
                                    {confirmDelete === ch.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDelete(ch.id)}
                                                disabled={deleting[ch.id]}
                                                className="rounded bg-red-700 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {deleting[ch.id] ? "..." : "Confirm"}
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
                                            onClick={() => setConfirmDelete(ch.id)}
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
