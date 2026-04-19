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

const RULE_TYPE_LABELS: Record<PolicyRule["type"], { label: string; icon: string }> = {
    severity_threshold: { label: "Severity", icon: "S" },
    license_blocklist: { label: "License", icon: "L" },
    package_blocklist: { label: "Package", icon: "P" },
    min_scan_age: { label: "Scan Age", icon: "A" },
};

function ruleLabel(rule: PolicyRule): string {
    switch (rule.type) {
        case "severity_threshold":
            return `${(rule.severity || "").charAt(0).toUpperCase() + (rule.severity || "").slice(1)} <= ${rule.max_count ?? 0}`;
        case "license_blocklist":
            return `Block ${(rule.licenses || []).join(", ")}`;
        case "package_blocklist":
            return `Block ${(rule.packages || []).join(", ")}`;
        case "min_scan_age":
            return `Max age ${rule.max_days ?? 30}d`;
        default:
            return rule.type;
    }
}

function rulePillColor(rule: PolicyRule): string {
    if (rule.action === "fail") {
        return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dg-accent)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                checked ? "bg-emerald-500" : "bg-zinc-600"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? "translate-x-[18px]" : "translate-x-[2px]"
                }`}
            />
        </button>
    );
}

function PillTabs<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
    return (
        <div className="inline-flex rounded-lg p-0.5 bg-[var(--dg-bg-muted)] border border-[var(--dg-border)]">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        value === opt.value
                            ? "bg-[var(--dg-accent)] text-white shadow-sm"
                            : "text-[var(--dg-text-muted)] hover:text-[var(--dg-text)]"
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--dg-text-muted)] opacity-40">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
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

    // Expand/collapse
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [evalExpanded, setEvalExpanded] = useState<Record<string, boolean>>({});

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editRules, setEditRules] = useState<PolicyRule[]>([]);
    const [editSaving, setEditSaving] = useState(false);

    // Edit rule builder (separate from create rule builder)
    const [editRuleType, setEditRuleType] = useState<PolicyRule["type"]>("severity_threshold");
    const [editRuleAction, setEditRuleAction] = useState<PolicyRule["action"]>("fail");
    const [editRuleSeverity, setEditRuleSeverity] = useState("critical");
    const [editRuleMaxCount, setEditRuleMaxCount] = useState(0);
    const [editRuleLicenses, setEditRuleLicenses] = useState("");
    const [editRulePackages, setEditRulePackages] = useState("");
    const [editRuleMaxDays, setEditRuleMaxDays] = useState(30);

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

    function startEditPolicy(policy: Policy) {
        setEditingId(policy.id);
        setEditName(policy.name);
        setEditRules([...policy.rules]);
        setEditRuleType("severity_threshold");
        setEditRuleAction("fail");
        setEditRuleSeverity("critical");
        setEditRuleMaxCount(0);
        setEditRuleLicenses("");
        setEditRulePackages("");
        setEditRuleMaxDays(30);
    }

    function cancelEditPolicy() {
        setEditingId(null);
    }

    function addEditRule() {
        const rule: PolicyRule = { type: editRuleType, action: editRuleAction };
        switch (editRuleType) {
            case "severity_threshold":
                rule.severity = editRuleSeverity;
                rule.max_count = editRuleMaxCount;
                break;
            case "license_blocklist":
                rule.licenses = editRuleLicenses.split(",").map((s) => s.trim()).filter(Boolean);
                if (rule.licenses.length === 0) return;
                break;
            case "package_blocklist":
                rule.packages = editRulePackages.split(",").map((s) => s.trim()).filter(Boolean);
                if (rule.packages.length === 0) return;
                break;
            case "min_scan_age":
                rule.max_days = editRuleMaxDays;
                break;
        }
        setEditRules((prev) => [...prev, rule]);
    }

    function removeEditRule(idx: number) {
        setEditRules((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleSavePolicy(id: string) {
        if (!editName.trim() || editRules.length === 0) return;
        setEditSaving(true);
        try {
            const res = await fetch(`/api/policies/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), rules: editRules }),
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
            setEditSaving(false);
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

    const ruleTypeOptions: { value: PolicyRule["type"]; label: string }[] = [
        { value: "severity_threshold", label: "Severity" },
        { value: "license_blocklist", label: "License" },
        { value: "package_blocklist", label: "Package" },
        { value: "min_scan_age", label: "Scan Age" },
    ];

    const actionOptions: { value: PolicyRule["action"]; label: string }[] = [
        { value: "fail", label: "Fail" },
        { value: "warn", label: "Warn" },
    ];

    return (
        <section className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scan Policies</h1>
                    <p className="text-sm text-[var(--dg-text-muted)] mt-1">
                        Define quality gates that scans must pass before deployment
                    </p>
                </div>
                <button
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        showForm
                            ? "border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] text-[var(--dg-text)] hover:bg-[var(--dg-bg-muted)]"
                            : "btn-primary"
                    }`}
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? (
                        <>
                            <XIcon /> Cancel
                        </>
                    ) : (
                        <>
                            <PlusIcon /> New Policy
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">
                        <XIcon />
                    </button>
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <form onSubmit={handleCreate} className="rounded-xl border border-[var(--dg-border)] bg-[color-mix(in_srgb,var(--dg-bg-elevated)_84%,transparent)] shadow-[var(--dg-shadow)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--dg-border)] bg-[var(--dg-bg-muted)]/30">
                        <h2 className="text-lg font-semibold">Create Policy</h2>
                        <p className="text-xs text-[var(--dg-text-muted)] mt-0.5">Add rules to define pass/fail criteria for scans</p>
                    </div>

                    <div className="p-6 space-y-5">
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

                        {/* Draft rules as pills */}
                        {draftRules.length > 0 && (
                            <div>
                                <h3 className="text-xs font-medium text-[var(--dg-text-muted)] uppercase tracking-wider mb-2">
                                    Rules ({draftRules.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {draftRules.map((rule, i) => (
                                        <span
                                            key={i}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${rulePillColor(rule)}`}
                                        >
                                            {ruleLabel(rule)}
                                            <button
                                                type="button"
                                                onClick={() => removeRule(i)}
                                                className="opacity-60 hover:opacity-100 transition-opacity"
                                            >
                                                <XIcon />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rule builder */}
                        <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg)]/50 p-4 space-y-4">
                            <h3 className="text-sm font-medium">Add Rule</h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="label mb-1.5">Type</label>
                                    <PillTabs options={ruleTypeOptions} value={ruleType} onChange={setRuleType} />
                                </div>

                                <div>
                                    <label className="label mb-1.5">Action</label>
                                    <PillTabs options={actionOptions} value={ruleAction} onChange={setRuleAction} />
                                </div>
                            </div>

                            {ruleType === "severity_threshold" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Severity</label>
                                        <select className="input" value={ruleSeverity} onChange={(e) => setRuleSeverity(e.target.value)}>
                                            {SEVERITY_OPTIONS.map((s) => (
                                                <option key={s} value={s}>
                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                </option>
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
                                    <label className="label">Blocked Packages (comma-separated)</label>
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

                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] text-[var(--dg-text)] hover:bg-[var(--dg-bg-muted)] transition-colors"
                                onClick={addRule}
                            >
                                <PlusIcon /> Add Rule
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-2.5 text-sm font-medium rounded-lg"
                            disabled={creating || draftRules.length === 0}
                        >
                            {creating ? "Creating..." : "Create Policy"}
                        </button>
                    </div>
                </form>
            )}

            {/* Policy list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 border-2 border-[var(--dg-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShieldIcon />
                    <h3 className="mt-4 text-base font-medium text-[var(--dg-text)]">No policies yet</h3>
                    <p className="mt-1 text-sm text-[var(--dg-text-muted)] max-w-xs">
                        Create your first policy to define org-wide scan quality gates and compliance rules.
                    </p>
                    {!showForm && (
                        <button
                            className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
                            onClick={() => setShowForm(true)}
                        >
                            <PlusIcon /> Create Policy
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {policies.map((policy) => {
                        const rules = policy.rules || [];
                        const isExpanded = expanded[policy.id] ?? false;
                        const isEditing = editingId === policy.id;

                        return (
                            <div
                                key={policy.id}
                                className="rounded-xl border border-[var(--dg-border)] bg-[color-mix(in_srgb,var(--dg-bg-elevated)_84%,transparent)] shadow-[var(--dg-shadow)] overflow-hidden transition-all duration-200"
                            >
                                {isEditing ? (
                                    <div className="p-5 space-y-5">
                                        <div>
                                            <label className="label">Policy Name</label>
                                            <input
                                                className="input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="e.g. Production Gate"
                                            />
                                        </div>

                                        {/* Edit draft rules as pills */}
                                        {editRules.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-medium text-[var(--dg-text-muted)] uppercase tracking-wider mb-2">
                                                    Rules ({editRules.length})
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {editRules.map((rule, i) => (
                                                        <span
                                                            key={i}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${rulePillColor(rule)}`}
                                                        >
                                                            {ruleLabel(rule)}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEditRule(i)}
                                                                className="opacity-60 hover:opacity-100 transition-opacity"
                                                            >
                                                                <XIcon />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Edit rule builder */}
                                        <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg)]/50 p-4 space-y-4">
                                            <h3 className="text-sm font-medium">Add Rule</h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="label mb-1.5">Type</label>
                                                    <PillTabs options={ruleTypeOptions} value={editRuleType} onChange={setEditRuleType} />
                                                </div>

                                                <div>
                                                    <label className="label mb-1.5">Action</label>
                                                    <PillTabs options={actionOptions} value={editRuleAction} onChange={setEditRuleAction} />
                                                </div>
                                            </div>

                                            {editRuleType === "severity_threshold" && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="label">Severity</label>
                                                        <select className="input" value={editRuleSeverity} onChange={(e) => setEditRuleSeverity(e.target.value)}>
                                                            {SEVERITY_OPTIONS.map((s) => (
                                                                <option key={s} value={s}>
                                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="label">Max Count</label>
                                                        <input
                                                            className="input"
                                                            type="number"
                                                            min={0}
                                                            value={editRuleMaxCount}
                                                            onChange={(e) => setEditRuleMaxCount(Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {editRuleType === "license_blocklist" && (
                                                <div>
                                                    <label className="label">Blocked Licenses (comma-separated)</label>
                                                    <input
                                                        className="input"
                                                        value={editRuleLicenses}
                                                        onChange={(e) => setEditRuleLicenses(e.target.value)}
                                                        placeholder="AGPL-3.0-only, GPL-3.0-only, SSPL-1.0"
                                                    />
                                                </div>
                                            )}

                                            {editRuleType === "package_blocklist" && (
                                                <div>
                                                    <label className="label">Blocked Packages (comma-separated)</label>
                                                    <input
                                                        className="input"
                                                        value={editRulePackages}
                                                        onChange={(e) => setEditRulePackages(e.target.value)}
                                                        placeholder="lodash@<4.17.21, event-stream"
                                                    />
                                                </div>
                                            )}

                                            {editRuleType === "min_scan_age" && (
                                                <div>
                                                    <label className="label">Max Days Since Scan</label>
                                                    <input
                                                        className="input"
                                                        type="number"
                                                        min={1}
                                                        value={editRuleMaxDays}
                                                        onChange={(e) => setEditRuleMaxDays(Number(e.target.value))}
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] text-[var(--dg-text)] hover:bg-[var(--dg-bg-muted)] transition-colors"
                                                onClick={addEditRule}
                                            >
                                                <PlusIcon /> Add Rule
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleSavePolicy(policy.id)}
                                                disabled={editSaving || editRules.length === 0 || !editName.trim()}
                                                className="btn-primary px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50"
                                            >
                                                {editSaving ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                                onClick={cancelEditPolicy}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] text-[var(--dg-text)] hover:bg-[var(--dg-bg-muted)] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Card header */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-base font-semibold truncate">{policy.name}</h3>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--dg-bg-muted)] text-[var(--dg-text-muted)] border border-[var(--dg-border)]">
                                                            {rules.length} rule{rules.length !== 1 ? "s" : ""}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                            policy.enabled
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                                                        }`}>
                                                            {policy.enabled ? "Active" : "Disabled"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--dg-text-muted)] mt-1">
                                                        Updated {timeAgo(policy.updated_at)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button
                                                        className="p-1.5 rounded-md text-[var(--dg-text-muted)] hover:text-[var(--dg-accent)] hover:bg-[var(--dg-accent)]/10 transition-all duration-200"
                                                        onClick={() => startEditPolicy(policy)}
                                                        title="Edit policy"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    <Toggle
                                                        checked={policy.enabled}
                                                        onChange={() => togglePolicy(policy.id, policy.enabled)}
                                                        disabled={toggling[policy.id]}
                                                    />
                                                    {confirmDelete === policy.id ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                className="px-2 py-1 text-xs font-medium rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                                                disabled={deleting[policy.id]}
                                                                onClick={() => deletePolicy(policy.id)}
                                                            >
                                                                {deleting[policy.id] ? "..." : "Confirm"}
                                                            </button>
                                                            <button
                                                                className="px-2 py-1 text-xs font-medium rounded-md text-[var(--dg-text-muted)] hover:text-[var(--dg-text)] transition-colors"
                                                                onClick={() => setConfirmDelete(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="p-1.5 rounded-md text-[var(--dg-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                                                            onClick={() => setConfirmDelete(policy.id)}
                                                            title="Delete policy"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Rule summary pills */}
                                            {rules.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {rules.slice(0, isExpanded ? rules.length : 4).map((rule, i) => (
                                                        <span
                                                            key={i}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${rulePillColor(rule)}`}
                                                        >
                                                            {ruleLabel(rule)}
                                                        </span>
                                                    ))}
                                                    {!isExpanded && rules.length > 4 && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--dg-bg-muted)] text-[var(--dg-text-muted)]">
                                                            +{rules.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Expand toggle */}
                                            {rules.length > 0 && (
                                                <button
                                                    className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--dg-text-muted)] hover:text-[var(--dg-text)] transition-colors"
                                                    onClick={() => setExpanded((prev) => ({ ...prev, [policy.id]: !isExpanded }))}
                                                >
                                                    <ChevronIcon expanded={isExpanded} />
                                                    {isExpanded ? "Hide details" : "Show details"}
                                                </button>
                                            )}
                                        </div>

                                        {/* Expanded rule details */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg)]/50 divide-y divide-[var(--dg-border)]">
                                                    {rules.map((rule, i) => (
                                                        <div key={i} className="px-4 py-3 flex items-center gap-3">
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[var(--dg-bg-muted)] text-[var(--dg-text-muted)] text-xs font-bold shrink-0">
                                                                {RULE_TYPE_LABELS[rule.type]?.icon || "?"}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium">{RULE_TYPE_LABELS[rule.type]?.label || rule.type}</p>
                                                                <p className="text-xs text-[var(--dg-text-muted)]">{ruleLabel(rule)}</p>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                                rule.action === "fail"
                                                                    ? "bg-red-500/10 text-red-400"
                                                                    : "bg-yellow-500/10 text-yellow-400"
                                                            }`}>
                                                                {rule.action}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Evaluate against a scan */}
            <div className="rounded-xl border border-[var(--dg-border)] bg-[color-mix(in_srgb,var(--dg-bg-elevated)_84%,transparent)] shadow-[var(--dg-shadow)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--dg-border)] bg-[var(--dg-bg-muted)]/30">
                    <h2 className="text-lg font-semibold">Evaluate Against Scan</h2>
                    <p className="text-xs text-[var(--dg-text-muted)] mt-0.5">
                        Test your policies against a completed scan to check compliance
                    </p>
                </div>

                <div className="p-6 space-y-4">
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
                        <button
                            type="submit"
                            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2"
                            disabled={evaluating || !evalJobId.trim()}
                        >
                            <PlayIcon />
                            {evaluating ? "Running..." : "Run"}
                        </button>
                    </form>

                    {evalError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {evalError}
                        </div>
                    )}

                    {evalResults !== null && (
                        <div className="space-y-3">
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold border ${
                                evalAllPassed
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {evalAllPassed ? (
                                        <>
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </>
                                    ) : (
                                        <>
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="15" y1="9" x2="9" y2="15" />
                                            <line x1="9" y1="9" x2="15" y2="15" />
                                        </>
                                    )}
                                </svg>
                                {evalAllPassed ? "All policies passed" : "One or more policies failed"}
                            </div>

                            {evalResults.length === 0 && (
                                <p className="text-[var(--dg-text-muted)] text-sm">No enabled policies to evaluate.</p>
                            )}

                            {evalResults.map((result) => {
                                const isEvalExpanded = evalExpanded[result.policy_id] ?? false;
                                const hasDetails = result.failures.length > 0 || result.warnings.length > 0;

                                return (
                                    <div
                                        key={result.policy_id}
                                        className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg)]/50 overflow-hidden"
                                    >
                                        <div
                                            className={`flex items-center justify-between px-4 py-3 ${hasDetails ? "cursor-pointer" : ""}`}
                                            onClick={() => hasDetails && setEvalExpanded((prev) => ({ ...prev, [result.policy_id]: !isEvalExpanded }))}
                                        >
                                            <div className="flex items-center gap-3">
                                                {hasDetails && <ChevronIcon expanded={isEvalExpanded} />}
                                                <span className="font-medium text-sm">{result.policy_name}</span>
                                                <span className="text-xs text-[var(--dg-text-muted)]">
                                                    {result.rules_evaluated} rules
                                                </span>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                result.passed
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                                {result.passed ? "Passed" : "Failed"}
                                            </span>
                                        </div>

                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            isEvalExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                                        }`}>
                                            <div className="px-4 pb-3 space-y-1.5">
                                                {result.failures.map((f, i) => (
                                                    <div key={`f-${i}`} className="text-sm text-red-400 pl-4 border-l-2 border-red-500/40 py-1">
                                                        {f.message}
                                                    </div>
                                                ))}
                                                {result.warnings.map((w, i) => (
                                                    <div key={`w-${i}`} className="text-sm text-yellow-400 pl-4 border-l-2 border-yellow-500/40 py-1">
                                                        {w.message}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
