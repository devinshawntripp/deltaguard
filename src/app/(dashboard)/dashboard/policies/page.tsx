"use client";

import { useEffect, useState } from "react";

type PolicyRule = {
    type: "severity_threshold" | "license_blocklist" | "package_blocklist" | "min_scan_age";
    action: "fail" | "warn";
    severity?: string;
    max_count?: number;
    licenses?: string[];
    packages?: string[];
    max_days?: number;
};

type Policy = {
    id: string;
    name: string;
    enabled: boolean;
    rules: PolicyRule[];
    created_at: string;
    updated_at: string;
};

type PolicyResult = {
    policy_id: string;
    policy_name: string;
    passed: boolean;
    rules_evaluated: number;
    failures: { rule_type: string; message: string; details: Record<string, unknown> }[];
    warnings: { rule_type: string; message: string; details: Record<string, unknown> }[];
};

const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"];

function ruleLabel(rule: PolicyRule): string {
    switch (rule.type) {
        case "severity_threshold":
            return `${rule.severity} <= ${rule.max_count ?? 0} (${rule.action})`;
        case "license_blocklist":
            return `Block licenses: ${(rule.licenses || []).join(", ")} (${rule.action})`;
        case "package_blocklist":
            return `Block packages: ${(rule.packages || []).join(", ")} (${rule.action})`;
        case "min_scan_age":
            return `Max scan age: ${rule.max_days ?? 30} days (${rule.action})`;
        default:
            return `${rule.type} (${rule.action})`;
    }
}

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create form state
    const [showForm, setShowForm] = useState(false);
    const [policyName, setPolicyName] = useState("");
    const [draftRules, setDraftRules] = useState<PolicyRule[]>([]);
    const [creating, setCreating] = useState(false);

    // New rule builder
    const [ruleType, setRuleType] = useState<PolicyRule["type"]>("severity_threshold");
    const [ruleAction, setRuleAction] = useState<PolicyRule["action"]>("fail");
    const [ruleSeverity, setRuleSeverity] = useState("critical");
    const [ruleMaxCount, setRuleMaxCount] = useState(0);
    const [ruleLicenses, setRuleLicenses] = useState("");
    const [rulePackages, setRulePackages] = useState("");
    const [ruleMaxDays, setRuleMaxDays] = useState(30);

    // Evaluate state
    const [evalJobId, setEvalJobId] = useState("");
    const [evalResults, setEvalResults] = useState<PolicyResult[] | null>(null);
    const [evalAllPassed, setEvalAllPassed] = useState<boolean | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [evalError, setEvalError] = useState<string | null>(null);

    // Delete / toggle
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [toggling, setToggling] = useState<Record<string, boolean>>({});

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/policies", { cache: "no-store" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setPolicies(data.items || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    function addRule() {
        const rule: PolicyRule = { type: ruleType, action: ruleAction };
        switch (ruleType) {
            case "severity_threshold":
                rule.severity = ruleSeverity;
                rule.max_count = ruleMaxCount;
                break;
            case "license_blocklist":
                rule.licenses = ruleLicenses.split(",").map((s) => s.trim()).filter(Boolean);
                if (rule.licenses.length === 0) return;
                break;
            case "package_blocklist":
                rule.packages = rulePackages.split(",").map((s) => s.trim()).filter(Boolean);
                if (rule.packages.length === 0) return;
                break;
            case "min_scan_age":
                rule.max_days = ruleMaxDays;
                break;
        }
        setDraftRules((prev) => [...prev, rule]);
    }

    function removeRule(idx: number) {
        setDraftRules((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!policyName.trim() || draftRules.length === 0) return;
        setCreating(true);
        try {
            const res = await fetch("/api/policies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: policyName.trim(), rules: draftRules }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setPolicyName("");
            setDraftRules([]);
            setShowForm(false);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setCreating(false);
        }
    }

    async function togglePolicy(id: string, enabled: boolean) {
        setToggling((prev) => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`/api/policies/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !enabled }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setToggling((prev) => ({ ...prev, [id]: false }));
        }
    }

    async function deletePolicy(id: string) {
        setDeleting((prev) => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`/api/policies/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            setConfirmDelete(null);
            await load();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setDeleting((prev) => ({ ...prev, [id]: false }));
        }
    }

    async function handleEvaluate(e: React.FormEvent) {
        e.preventDefault();
        if (!evalJobId.trim()) return;
        setEvaluating(true);
        setEvalError(null);
        setEvalResults(null);
        setEvalAllPassed(null);
        try {
            const res = await fetch("/api/policies/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: evalJobId.trim() }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            setEvalResults(data.results || []);
            setEvalAllPassed(data.all_passed ?? null);
        } catch (e: unknown) {
            setEvalError(e instanceof Error ? e.message : String(e));
        } finally {
            setEvaluating(false);
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Scan Policies</h1>
                <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
                    {showForm ? "Cancel" : "New Policy"}
                </button>
            </div>

            {error && <div className="p-3 rounded bg-red-500/10 text-red-400 text-sm">{error}</div>}

            {/* Create form */}
            {showForm && (
                <form onSubmit={handleCreate} className="card p-5 space-y-4">
                    <h2 className="text-lg font-medium">Create Policy</h2>
                    <div>
                        <label className="label">Policy Name</label>
                        <input
                            className="input"
                            value={policyName}
                            onChange={(e) => setPolicyName(e.target.value)}
                            placeholder="e.g. Production Gate"
                            required
                        />
                    </div>

                    {/* Rules list */}
                    {draftRules.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium muted">Rules ({draftRules.length})</h3>
                            {draftRules.map((rule, i) => (
                                <div key={i} className="card p-3 flex items-center justify-between">
                                    <span className="text-sm">{ruleLabel(rule)}</span>
                                    <button
                                        type="button"
                                        className="btn-danger text-xs"
                                        onClick={() => removeRule(i)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add rule builder */}
                    <div className="card p-4 space-y-3">
                        <h3 className="text-sm font-medium">Add Rule</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">Type</label>
                                <select className="input" value={ruleType} onChange={(e) => setRuleType(e.target.value as PolicyRule["type"])}>
                                    <option value="severity_threshold">Severity Threshold</option>
                                    <option value="license_blocklist">License Blocklist</option>
                                    <option value="package_blocklist">Package Blocklist</option>
                                    <option value="min_scan_age">Min Scan Age</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Action</label>
                                <select className="input" value={ruleAction} onChange={(e) => setRuleAction(e.target.value as PolicyRule["action"])}>
                                    <option value="fail">Fail</option>
                                    <option value="warn">Warn</option>
                                </select>
                            </div>
                        </div>

                        {ruleType === "severity_threshold" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Severity</label>
                                    <select className="input" value={ruleSeverity} onChange={(e) => setRuleSeverity(e.target.value)}>
                                        {SEVERITY_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Max Count</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min={0}
                                        value={ruleMaxCount}
                                        onChange={(e) => setRuleMaxCount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}

                        {ruleType === "license_blocklist" && (
                            <div>
                                <label className="label">Blocked Licenses (comma-separated)</label>
                                <input
                                    className="input"
                                    value={ruleLicenses}
                                    onChange={(e) => setRuleLicenses(e.target.value)}
                                    placeholder="AGPL-3.0-only, GPL-3.0-only, SSPL-1.0"
                                />
                            </div>
                        )}

                        {ruleType === "package_blocklist" && (
                            <div>
                                <label className="label">Blocked Packages (comma-separated, e.g. lodash@&lt;4.17.21)</label>
                                <input
                                    className="input"
                                    value={rulePackages}
                                    onChange={(e) => setRulePackages(e.target.value)}
                                    placeholder="lodash@<4.17.21, event-stream"
                                />
                            </div>
                        )}

                        {ruleType === "min_scan_age" && (
                            <div>
                                <label className="label">Max Days Since Scan</label>
                                <input
                                    className="input"
                                    type="number"
                                    min={1}
                                    value={ruleMaxDays}
                                    onChange={(e) => setRuleMaxDays(Number(e.target.value))}
                                />
                            </div>
                        )}

                        <button type="button" className="btn-secondary" onClick={addRule}>
                            Add Rule
                        </button>
                    </div>

                    <button type="submit" className="btn-primary" disabled={creating || draftRules.length === 0}>
                        {creating ? "Creating..." : "Create Policy"}
                    </button>
                </form>
            )}

            {/* Evaluate against a scan */}
            <div className="card p-5 space-y-3">
                <h2 className="text-lg font-medium">Evaluate Policies Against a Scan</h2>
                <form onSubmit={handleEvaluate} className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="label">Job ID</label>
                        <input
                            className="input"
                            value={evalJobId}
                            onChange={(e) => setEvalJobId(e.target.value)}
                            placeholder="Paste scan job UUID"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={evaluating || !evalJobId.trim()}>
                        {evaluating ? "Evaluating..." : "Evaluate"}
                    </button>
                </form>

                {evalError && <div className="p-3 rounded bg-red-500/10 text-red-400 text-sm">{evalError}</div>}

                {evalResults !== null && (
                    <div className="space-y-3">
                        <div className={`p-3 rounded text-sm font-medium ${evalAllPassed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {evalAllPassed ? "All policies passed" : "One or more policies failed"}
                        </div>
                        {evalResults.length === 0 && (
                            <p className="muted text-sm">No enabled policies to evaluate.</p>
                        )}
                        {evalResults.map((result) => (
                            <div key={result.policy_id} className="card p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{result.policy_name}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${result.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                        {result.passed ? "PASSED" : "FAILED"}
                                    </span>
                                </div>
                                <p className="text-xs muted">{result.rules_evaluated} rules evaluated</p>
                                {result.failures.map((f, i) => (
                                    <div key={`f-${i}`} className="text-sm text-red-400 pl-3 border-l-2 border-red-400">
                                        {f.message}
                                    </div>
                                ))}
                                {result.warnings.map((w, i) => (
                                    <div key={`w-${i}`} className="text-sm text-yellow-400 pl-3 border-l-2 border-yellow-400">
                                        {w.message}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Policy list */}
            {loading ? (
                <p className="muted">Loading policies...</p>
            ) : policies.length === 0 ? (
                <p className="muted text-sm">No policies configured. Create one to define org-wide scan gates.</p>
            ) : (
                <div className="space-y-3">
                    {policies.map((policy) => (
                        <div key={policy.id} className="card p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">{policy.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${policy.enabled ? "bg-green-500/10 text-green-400" : "bg-neutral-500/10 text-neutral-400"}`}>
                                        {policy.enabled ? "Enabled" : "Disabled"}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="btn-secondary text-xs"
                                        disabled={toggling[policy.id]}
                                        onClick={() => togglePolicy(policy.id, policy.enabled)}
                                    >
                                        {toggling[policy.id] ? "..." : policy.enabled ? "Disable" : "Enable"}
                                    </button>
                                    {confirmDelete === policy.id ? (
                                        <button
                                            className="btn-danger text-xs"
                                            disabled={deleting[policy.id]}
                                            onClick={() => deletePolicy(policy.id)}
                                        >
                                            {deleting[policy.id] ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-danger text-xs"
                                            onClick={() => setConfirmDelete(policy.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs muted">
                                {(policy.rules || []).length} rule{(policy.rules || []).length !== 1 ? "s" : ""}
                                {" | "}Created {new Date(policy.created_at).toLocaleDateString()}
                            </div>
                            <div className="space-y-1 mt-1">
                                {(policy.rules || []).map((rule, i) => (
                                    <div key={i} className="text-sm muted pl-3 border-l-2 border-[var(--dg-border)]">
                                        {ruleLabel(rule)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
