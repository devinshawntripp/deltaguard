"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ADMIN_CONTENT_KEYS } from "@/lib/adminContent";

type Totals = {
  orgs: number;
  users: number;
  memberships: number;
  api_keys_active: number;
  jobs_total: number;
  jobs_queued: number;
  jobs_running: number;
  jobs_done: number;
  jobs_failed: number;
};

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  members: number;
  jobs: number;
};

type AdminOverview = {
  totals: Totals;
  orgs: OrgRow[];
  error?: string;
};

type AdminContentItem = {
  key: string;
  content_md: string;
  updated_at: string;
  updated_by: string | null;
  updated_by_email: string | null;
};

type TargetAccountItem = {
  id: string;
  account_key: string;
  account_name: string;
  account_domain: string;
  industry: string | null;
  company_size: string | null;
  devsecops_contact_name: string | null;
  devsecops_contact_title: string | null;
  devsecops_contact_email: string | null;
  compliance_contact_name: string | null;
  compliance_contact_title: string | null;
  compliance_contact_email: string | null;
  fit_score: number;
  status: string;
  next_action: string | null;
  owner: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const CONTENT_KEYS = [
  ADMIN_CONTENT_KEYS.SALES_DEMO_SCRIPT,
  ADMIN_CONTENT_KEYS.BETA_LAUNCH_PLAN,
  ADMIN_CONTENT_KEYS.TARGET_LIST_PLAYBOOK,
  ADMIN_CONTENT_KEYS.TECH_POSTING_CHANNELS,
  ADMIN_CONTENT_KEYS.NAMING_SCORECARD_SEO,
  ADMIN_CONTENT_KEYS.REBRAND_DOMAIN_SHORTLIST,
] as const;

async function readJsonResponse<T>(res: Response, context: string): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) {
    throw new Error(`${context}: HTTP ${res.status} returned empty response body`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${context}: HTTP ${res.status} returned non-JSON payload`);
  }
}

export default function MasterAdminPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [contentByKey, setContentByKey] = useState<Record<string, AdminContentItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [savingScript, setSavingScript] = useState(false);
  const [scriptDraft, setScriptDraft] = useState("");
  const [scriptSaveError, setScriptSaveError] = useState<string | null>(null);
  const [targets, setTargets] = useState<TargetAccountItem[]>([]);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [targetsBusy, setTargetsBusy] = useState(false);
  const [targetsMsg, setTargetsMsg] = useState<string | null>(null);
  const [targetsErr, setTargetsErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setContentError(null);
      try {
        const [overviewRes, contentPayload, targetsRes] = await Promise.all([
          fetch("/api/admin/overview", { cache: "no-store" }),
          Promise.all(
            CONTENT_KEYS.map(async (key) => {
              const res = await fetch(`/api/admin/content?key=${encodeURIComponent(key)}`, { cache: "no-store" });
              const json = await readJsonResponse<{ item?: AdminContentItem; error?: string }>(
                res,
                `admin content (${key})`,
              );
              if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
              return json.item;
            }),
          ),
          fetch("/api/admin/targets", { cache: "no-store" }),
        ]);

        const overviewJson = await readJsonResponse<AdminOverview>(overviewRes, "admin overview");
        if (!overviewRes.ok) throw new Error(overviewJson?.error || `HTTP ${overviewRes.status}`);
        setData(overviewJson);

        const nextByKey: Record<string, AdminContentItem> = {};
        for (const item of contentPayload) {
          if (item) nextByKey[item.key] = item;
        }
        setContentByKey(nextByKey);
        const targetsJson = await readJsonResponse<{ items?: TargetAccountItem[]; error?: string }>(
          targetsRes,
          "admin targets",
        );
        if (!targetsRes.ok) throw new Error(targetsJson?.error || `HTTP ${targetsRes.status}`);
        setTargets(targetsJson.items || []);
        const script = nextByKey[ADMIN_CONTENT_KEYS.SALES_DEMO_SCRIPT];
        setScriptDraft(script?.content_md || "");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setContentError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scriptItem = contentByKey[ADMIN_CONTENT_KEYS.SALES_DEMO_SCRIPT] || null;
  const betaLaunchPlan = contentByKey[ADMIN_CONTENT_KEYS.BETA_LAUNCH_PLAN] || null;
  const targetPlaybook = contentByKey[ADMIN_CONTENT_KEYS.TARGET_LIST_PLAYBOOK] || null;
  const postingChannels = contentByKey[ADMIN_CONTENT_KEYS.TECH_POSTING_CHANNELS] || null;
  const namingScorecard = contentByKey[ADMIN_CONTENT_KEYS.NAMING_SCORECARD_SEO] || null;
  const rebrandDomains = contentByKey[ADMIN_CONTENT_KEYS.REBRAND_DOMAIN_SHORTLIST] || null;
  const previewContent = editingScript ? scriptDraft : scriptItem?.content_md || "";

  async function saveScript() {
    if (!editingScript) return;
    setSavingScript(true);
    setScriptSaveError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key: ADMIN_CONTENT_KEYS.SALES_DEMO_SCRIPT,
          content_md: scriptDraft,
        }),
      });
      const json = await readJsonResponse<{ ok?: boolean; item?: AdminContentItem; error?: string }>(
        res,
        "save admin content",
      );
      if (!res.ok || !json?.item) throw new Error(json?.error || `HTTP ${res.status}`);
      setContentByKey((prev) => ({ ...prev, [json.item!.key]: json.item! }));
      setScriptDraft(json.item.content_md);
      setEditingScript(false);
    } catch (e: unknown) {
      setScriptSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingScript(false);
    }
  }

  async function importTargetsCsv() {
    if (!targetFile) return;
    setTargetsBusy(true);
    setTargetsErr(null);
    setTargetsMsg(null);
    try {
      const form = new FormData();
      form.append("file", targetFile);
      const res = await fetch("/api/admin/targets", {
        method: "POST",
        body: form,
      });
      const json = await readJsonResponse<{
        ok?: boolean;
        imported?: number;
        updated?: number;
        skipped?: number;
        total?: number;
        items?: TargetAccountItem[];
        error?: string;
      }>(res, "import targets csv");
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setTargets(json.items || []);
      setTargetsMsg(
        `Imported ${json.imported || 0}, updated ${json.updated || 0}, skipped ${json.skipped || 0}. Total ${json.total || 0}.`,
      );
      setTargetFile(null);
    } catch (e: unknown) {
      setTargetsErr(e instanceof Error ? e.message : String(e));
    } finally {
      setTargetsBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Master Admin</h1>
        <p className="text-sm opacity-70 mt-1">Platform-wide administrative view (admin override only).</p>
      </div>

      {error && <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 text-sm">Loading...</div>
      ) : data ? (
        <>
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Sales Demo Script</h2>
                <p className="text-xs opacity-70">Super-admin managed script for customer demos.</p>
              </div>
              <div className="flex items-center gap-2">
                {editingScript ? (
                  <>
                    <button
                      className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm"
                      onClick={() => {
                        setEditingScript(false);
                        setScriptDraft(scriptItem?.content_md || "");
                        setScriptSaveError(null);
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm disabled:opacity-60"
                      disabled={savingScript || !scriptDraft.trim()}
                      onClick={saveScript}
                      type="button"
                    >
                      {savingScript ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm"
                    onClick={() => {
                      setEditingScript(true);
                      setScriptSaveError(null);
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {scriptSaveError ? (
              <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-xs">
                {scriptSaveError}
              </div>
            ) : null}
            {contentError ? (
              <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-xs">
                {contentError}
              </div>
            ) : null}

            {editingScript ? (
              <textarea
                className="w-full min-h-56 rounded-lg border border-black/10 dark:border-white/10 p-3 text-sm font-mono bg-transparent"
                onChange={(e) => setScriptDraft(e.target.value)}
                value={scriptDraft}
              />
            ) : null}

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.02] dark:bg-white/[.02]">
              <div className="text-xs opacity-70 mb-2">Markdown Preview (read-only)</div>
              <MarkdownPreview content={previewContent} />
            </div>

            <div className="text-xs opacity-70">
              Last updated:{" "}
              {scriptItem?.updated_at ? new Date(scriptItem.updated_at).toLocaleString() : "-"}
              {" · "}
              By: {scriptItem?.updated_by_email || "system"}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card title="Orgs" value={data.totals.orgs} />
            <Card title="Users" value={data.totals.users} />
            <Card title="Memberships" value={data.totals.memberships} />
            <Card title="Active API Keys" value={data.totals.api_keys_active} />
            <Card title="Jobs" value={data.totals.jobs_total} />
            <Card title="Queued" value={data.totals.jobs_queued} />
            <Card title="Running" value={data.totals.jobs_running} />
            <Card title="Done" value={data.totals.jobs_done} />
            <Card title="Failed" value={data.totals.jobs_failed} />
          </div>

          <div className="overflow-auto rounded-xl border border-black/10 dark:border-white/10">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
                <tr>
                  <th className="p-3">Org</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Members</th>
                  <th className="p-3">Jobs</th>
                  <th className="p-3">Org ID</th>
                </tr>
              </thead>
              <tbody>
                {data.orgs.map((o) => (
                  <tr key={o.id} className="border-t border-black/5 dark:border-white/5">
                    <td className="p-3 font-medium">{o.name}</td>
                    <td className="p-3 font-mono text-xs">{o.slug}</td>
                    <td className="p-3">{o.members}</td>
                    <td className="p-3">{o.jobs}</td>
                    <td className="p-3 font-mono text-xs">{o.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid lg:grid-cols-4 gap-3">
            <ReadOnlyMarkdownCard
              title="Beta Launch Plan"
              subtitle="Operational + commercial gates before public beta."
              content={betaLaunchPlan?.content_md || ""}
            />
            <ReadOnlyMarkdownCard
              title="100-account Target List Playbook"
              subtitle="Repeatable dual-persona account build workflow."
              content={targetPlaybook?.content_md || ""}
            />
            <ReadOnlyMarkdownCard
              title="Technical Posting Channels"
              subtitle="Primary and secondary channels locked for beta."
              content={postingChannels?.content_md || ""}
            />
            <ReadOnlyMarkdownCard
              title="Naming Scorecard + SEO"
              subtitle="Weighted scoring for naming and domain cutover."
              content={namingScorecard?.content_md || ""}
            />
            <ReadOnlyMarkdownCard
              title="Rebrand Domain Shortlist"
              subtitle="Ranked domain candidates with primary + fallback options."
              content={rebrandDomains?.content_md || ""}
            />
          </div>

          <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Target Accounts (CSV)</h2>
                <p className="text-xs opacity-70">
                  Import/export your 100-account list. Seeded with a starter enterprise set.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm"
                  href="/api/admin/targets?format=csv"
                >
                  Export CSV
                </a>
                <a
                  className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 text-sm"
                  href="/api/admin/targets?format=csv&template=enrichment"
                >
                  Export Enrichment Template
                </a>
                <input
                  accept=".csv,text/csv"
                  className="text-xs"
                  onChange={(e) => setTargetFile(e.target.files?.[0] || null)}
                  type="file"
                />
                <button
                  className="px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm disabled:opacity-60"
                  disabled={targetsBusy || !targetFile}
                  onClick={importTargetsCsv}
                  type="button"
                >
                  {targetsBusy ? "Importing..." : "Import CSV"}
                </button>
              </div>
            </div>

            {targetsMsg ? (
              <div className="rounded-md border border-green-300 bg-green-100 text-green-900 px-3 py-2 text-xs">
                {targetsMsg}
              </div>
            ) : null}
            {targetsErr ? (
              <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-xs">
                {targetsErr}
              </div>
            ) : null}

            <div className="text-xs opacity-70">Showing {Math.min(targets.length, 25)} of {targets.length} accounts.</div>
            <div className="overflow-auto rounded-xl border border-black/10 dark:border-white/10">
              <table className="w-full min-w-[1024px] text-sm">
                <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
                  <tr>
                    <th className="p-3">Account</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Industry</th>
                    <th className="p-3">Fit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.slice(0, 25).map((t) => (
                    <tr className="border-t border-black/5 dark:border-white/5" key={t.id}>
                      <td className="p-3 font-medium">{t.account_name}</td>
                      <td className="p-3 text-xs font-mono">{t.account_domain || "-"}</td>
                      <td className="p-3">{t.industry || "-"}</td>
                      <td className="p-3">{t.fit_score}</td>
                      <td className="p-3">{t.status}</td>
                      <td className="p-3">{t.owner || "-"}</td>
                      <td className="p-3">{t.next_action || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function ReadOnlyMarkdownCard({
  title,
  subtitle,
  content,
}: {
  title: string;
  subtitle: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-2">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-xs opacity-70">{subtitle}</p>
      </div>
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-3 bg-black/[.02] dark:bg-white/[.02] max-h-80 overflow-auto">
        <MarkdownPreview content={content} />
      </div>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let blockKey = 0;

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ol className="list-decimal pl-6 space-y-1" key={`ol-${blockKey++}`}>
        {listItems.map((item, idx) => (
          <li key={`oli-${idx}`}>{renderInline(item, `oli-${idx}`)}</li>
        ))}
      </ol>,
    );
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      blocks.push(<div className="h-2" key={`sp-${blockKey++}`} />);
      continue;
    }
    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      listItems.push(ordered[1]);
      continue;
    }

    flushList();
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h3 className="text-base font-semibold" key={`h1-${blockKey++}`}>
          {renderInline(trimmed.slice(2), `h1-${blockKey}`)}
        </h3>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h4 className="text-sm font-semibold" key={`h2-${blockKey++}`}>
          {renderInline(trimmed.slice(3), `h2-${blockKey}`)}
        </h4>,
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h5 className="text-sm font-semibold" key={`h3-${blockKey++}`}>
          {renderInline(trimmed.slice(4), `h3-${blockKey}`)}
        </h5>,
      );
      continue;
    }
    if (trimmed.startsWith("- ")) {
      blocks.push(
        <div className="pl-4 relative" key={`dash-${blockKey++}`}>
          <span className="absolute left-0">-</span>
          {renderInline(trimmed.slice(2), `dash-${blockKey}`)}
        </div>,
      );
      continue;
    }
    blocks.push(
      <p className="text-sm leading-relaxed" key={`p-${blockKey++}`}>
        {renderInline(trimmed, `p-${blockKey}`)}
      </p>,
    );
  }
  flushList();

  return <div className="text-sm">{blocks.length ? blocks : <span className="opacity-60">No content.</span>}</div>;
}

function renderInline(text: string, keyPrefix: string) {
  const pieces = text.split(/(`[^`]+`)/g).filter(Boolean);
  return pieces.map((piece, idx) => {
    if (piece.startsWith("`") && piece.endsWith("`") && piece.length >= 2) {
      return (
        <code
          className="font-mono text-xs rounded px-1 py-0.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10"
          key={`${keyPrefix}-${idx}`}
        >
          {piece.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-${idx}`}>{piece}</span>;
  });
}
