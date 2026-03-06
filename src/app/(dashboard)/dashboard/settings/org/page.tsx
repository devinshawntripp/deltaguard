"use client";

import { useEffect, useMemo, useState } from "react";

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
};

type OrgMember = {
  user_id: string;
  email: string;
  name: string | null;
  roles_mask: string;
  status: string;
  created_at: string;
};

type OrgPermissions = {
  can_edit_roles: boolean;
  can_manage_members: boolean;
  can_invite: boolean;
  is_super_admin?: boolean;
  max_assignable_role_bit?: number;
};

type OrgResponse = {
  org: OrgSummary;
  members: OrgMember[];
  permissions: OrgPermissions;
  error?: string;
};

type OrgListItem = {
  org_id: string;
  name: string;
  slug: string;
  roles_mask: string;
  status: string;
  active: boolean;
};

type InviteItem = {
  id: string;
  org_id: string;
  email: string;
  roles_mask: string;
  status: string;
  invited_by: string | null;
  accepted_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

type Draft = {
  rolesMask: string;
  status: "active" | "disabled";
  saving?: boolean;
  msg?: string;
};

const ADMIN_OVERRIDE = BigInt("9223372036854775807");

const ROLES: Array<{ bit: bigint; label: string; hint: string }> = [
  { bit: BigInt(1), label: "Viewer", hint: "Read-only access" },
  { bit: BigInt(2), label: "Analyst", hint: "Findings analysis" },
  { bit: BigInt(4), label: "Operator", hint: "Run/operate scans" },
  { bit: BigInt(8), label: "Scan Admin", hint: "Scanner controls" },
  { bit: BigInt(16), label: "Policy Admin", hint: "Policy/settings" },
  { bit: BigInt(32), label: "Billing Admin", hint: "Billing actions" },
  { bit: BigInt(64), label: "API Key Admin", hint: "Manage API keys" },
  { bit: BigInt(128), label: "Org Owner", hint: "Org-level admin" },
];

function parseMask(mask: string): bigint {
  try {
    return BigInt(String(mask || "0").trim() || "0");
  } catch {
    return BigInt(0);
  }
}

function roleLabels(maskStr: string): string[] {
  const mask = parseMask(maskStr);
  if (mask === ADMIN_OVERRIDE) return ["admin_override"];
  return ROLES.filter((r) => (mask & r.bit) === r.bit).map((r) => r.label.toLowerCase().replace(/\s+/g, "_"));
}

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function OrgSettingsPage() {
  const [org, setOrg] = useState<OrgSummary | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [orgs, setOrgs] = useState<OrgListItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [permissions, setPermissions] = useState<OrgPermissions>({
    can_edit_roles: false,
    can_manage_members: false,
    can_invite: false,
  });
  const [activeOrgId, setActiveOrgId] = useState("");
  const [switchingOrg, setSwitchingOrg] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteOutput, setInviteOutput] = useState<{ token?: string; invite_url?: string; message?: string }>({});
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, invitesRes, orgsRes] = await Promise.all([
        fetch("/api/org/members", { cache: "no-store" }),
        fetch("/api/org/invites", { cache: "no-store" }),
        fetch("/api/orgs", { cache: "no-store" }),
      ]);

      const membersData = await readJsonSafe<OrgResponse>(membersRes);
      if (!membersRes.ok) {
        throw new Error(membersData?.error || `HTTP ${membersRes.status}`);
      }
      setOrg(membersData?.org || null);
      setMembers(membersData?.members || []);
      setPermissions(
        membersData?.permissions || {
          can_edit_roles: false,
          can_manage_members: false,
          can_invite: false,
        },
      );

      const nextDrafts: Record<string, Draft> = {};
      for (const m of membersData?.members || []) {
        nextDrafts[m.user_id] = {
          rolesMask: m.roles_mask,
          status: (m.status === "disabled" ? "disabled" : "active") as "active" | "disabled",
        };
      }
      setDrafts(nextDrafts);

      const invitesData = await readJsonSafe<{ items?: InviteItem[] }>(invitesRes);
      setInvites(invitesRes.ok ? invitesData?.items || [] : []);

      const orgsData = await readJsonSafe<{ items?: OrgListItem[] }>(orgsRes);
      const orgItems = orgsRes.ok ? orgsData?.items || [] : [];
      setOrgs(orgItems);
      const active = orgItems.find((i) => i.active) || orgItems[0] || null;
      setActiveOrgId(active?.org_id || "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const ownerCount = useMemo(() => {
    return members.filter((m) => {
      const d = drafts[m.user_id];
      const mask = parseMask(d?.rolesMask ?? m.roles_mask);
      const status = d?.status ?? (m.status === "disabled" ? "disabled" : "active");
      return status === "active" && (mask === ADMIN_OVERRIDE || (mask & BigInt(128)) === BigInt(128));
    }).length;
  }, [members, drafts]);

  function toggleRole(userId: string, bit: bigint) {
    if (!permissions.can_edit_roles) return;
    setDrafts((prev) => {
      const d = prev[userId];
      if (!d) return prev;
      const current = parseMask(d.rolesMask);
      if (current === ADMIN_OVERRIDE) {
        return {
          ...prev,
          [userId]: { ...d, msg: "Disable admin override first to edit individual roles." },
        };
      }
      const next = (current & bit) === bit ? (current & ~bit) : (current | bit);
      return {
        ...prev,
        [userId]: { ...d, rolesMask: next.toString(), msg: undefined },
      };
    });
  }

  function toggleAdminOverride(userId: string, enabled: boolean) {
    if (!permissions.can_edit_roles) return;
    setDrafts((prev) => {
      const d = prev[userId];
      if (!d) return prev;
      return {
        ...prev,
        [userId]: {
          ...d,
          rolesMask: enabled ? ADMIN_OVERRIDE.toString() : BigInt(1).toString(),
          msg: undefined,
        },
      };
    });
  }

  async function saveMember(userId: string) {
    const draft = drafts[userId];
    if (!draft) return;

    setDrafts((prev) => ({ ...prev, [userId]: { ...draft, saving: true, msg: undefined } }));
    try {
      const payload: Record<string, unknown> = {
        user_id: userId,
        status: draft.status,
      };
      if (permissions.can_edit_roles) {
        payload.roles_mask = draft.rolesMask;
      }

      const res = await fetch("/api/org/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await readJsonSafe<{ error?: string }>(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      await load();
      setDrafts((prev) => ({ ...prev, [userId]: { ...draft, saving: false, msg: "Saved" } }));
      setTimeout(() => {
        setDrafts((prev) => {
          const now = prev[userId];
          if (!now || now.msg !== "Saved") return prev;
          return { ...prev, [userId]: { ...now, msg: undefined } };
        });
      }, 1200);
    } catch (e: unknown) {
      setDrafts((prev) => ({
        ...prev,
        [userId]: {
          ...draft,
          saving: false,
          msg: e instanceof Error ? e.message : String(e),
        },
      }));
    }
  }

  async function createInvite() {
    setInviteOutput({});
    const email = inviteEmail.trim();
    if (!email) return;
    setCreatingInvite(true);
    try {
      const res = await fetch("/api/org/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await readJsonSafe<{ error?: string; token?: string; invite_url?: string }>(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setInviteOutput({
        token: json?.token,
        invite_url: json?.invite_url,
        message: "Invite created",
      });
      setInviteEmail("");
      await load();
    } catch (e: unknown) {
      setInviteOutput({ message: e instanceof Error ? e.message : String(e) });
    } finally {
      setCreatingInvite(false);
    }
  }

  async function revokeInvite(id: string) {
    const res = await fetch(`/api/org/invites/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function switchActiveOrg() {
    if (!activeOrgId) return;
    setSwitchingOrg(true);
    try {
      const res = await fetch("/api/orgs/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: activeOrgId }),
      });
      const json = await readJsonSafe<{ error?: string }>(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setSwitchingOrg(false);
    }
  }

  async function createOrg() {
    const name = newOrgName.trim();
    if (!name) return;
    setCreatingOrg(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: newOrgSlug.trim() || undefined }),
      });
      const json = await readJsonSafe<{ error?: string }>(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setNewOrgName("");
      setNewOrgSlug("");
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setCreatingOrg(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Org Manager</h1>
        <p className="text-sm opacity-70 mt-1">Manage org members, invites, and org context.</p>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 text-sm grid gap-2">
        <div><span className="opacity-70">Org:</span> <span className="font-medium">{org?.name || "-"}</span></div>
        <div><span className="opacity-70">Slug:</span> <span className="font-mono">{org?.slug || "-"}</span></div>
        <div><span className="opacity-70">Active owners (draft-aware):</span> <span className="font-medium">{ownerCount}</span></div>
        <div>
          <span className="opacity-70">Role edits:</span>{" "}
          <span className="font-medium">{permissions.can_edit_roles ? "admin_override enabled" : "admin_override only"}</span>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-3">
        <div className="font-semibold text-sm">Org Context</div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={activeOrgId}
            onChange={(e) => setActiveOrgId(e.target.value)}
            className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1 text-sm"
          >
            {orgs.map((o) => (
              <option key={o.org_id} value={o.org_id}>
                {o.name} ({o.slug}) {o.active ? "• active" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={switchActiveOrg}
            disabled={!activeOrgId || switchingOrg}
            className="rounded bg-black text-white px-3 py-1.5 text-xs disabled:opacity-60"
          >
            {switchingOrg ? "Switching..." : "Switch Org"}
          </button>
        </div>
        <div className="text-xs opacity-70">Switching org updates API context immediately and reloads dashboard.</div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-3">
        <div className="font-semibold text-sm">Create Org</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organization name"
            className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1 text-sm min-w-[220px]"
          />
          <input
            value={newOrgSlug}
            onChange={(e) => setNewOrgSlug(e.target.value)}
            placeholder="slug (optional)"
            className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1 text-sm min-w-[180px]"
          />
          <button
            onClick={createOrg}
            disabled={creatingOrg || !newOrgName.trim()}
            className="rounded bg-black text-white px-3 py-1.5 text-xs disabled:opacity-60"
          >
            {creatingOrg ? "Creating..." : "Create Org"}
          </button>
        </div>
        <div className="text-xs opacity-70">Requires org owner or admin override. New org becomes your active org.</div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-3">
        <div className="font-semibold text-sm">Invites</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@company.com"
            className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1 text-sm min-w-[280px]"
          />
          <button
            onClick={createInvite}
            disabled={!permissions.can_invite || creatingInvite || !inviteEmail.trim()}
            className="rounded bg-black text-white px-3 py-1.5 text-xs disabled:opacity-60"
          >
            {creatingInvite ? "Creating..." : "Create Invite"}
          </button>
        </div>
        {inviteOutput.message ? <div className="text-xs">{inviteOutput.message}</div> : null}
        {inviteOutput.invite_url ? (
          <div className="text-xs break-all">
            <span className="opacity-70">Invite URL:</span> {inviteOutput.invite_url}
          </div>
        ) : null}
        {inviteOutput.token ? (
          <div className="text-xs break-all">
            <span className="opacity-70">Token:</span> {inviteOutput.token}
          </div>
        ) : null}

        <div className="overflow-auto rounded border border-black/10 dark:border-white/10">
          <table className="w-full min-w-[900px] text-xs">
            <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
              <tr>
                <th className="p-2">Email</th>
                <th className="p-2">Role Mask</th>
                <th className="p-2">Status</th>
                <th className="p-2">Expires</th>
                <th className="p-2">Created</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr><td className="p-2" colSpan={6}>No invites yet.</td></tr>
              ) : invites.map((i) => (
                <tr key={i.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="p-2">{i.email}</td>
                  <td className="p-2 font-mono">{i.roles_mask}</td>
                  <td className="p-2">{i.status}</td>
                  <td className="p-2">{new Date(i.expires_at).toLocaleString()}</td>
                  <td className="p-2">{new Date(i.created_at).toLocaleString()}</td>
                  <td className="p-2">
                    {i.status === "pending" ? (
                      <button
                        onClick={() => revokeInvite(i.id)}
                        className="rounded border border-black/20 dark:border-white/20 px-2 py-1"
                      >
                        Revoke
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm">{error}</div>}

      <div className="overflow-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
            <tr>
              <th className="p-3">Member</th>
              <th className="p-3">Status</th>
              <th className="p-3">Roles</th>
              <th className="p-3">Mask</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={5}>Loading members...</td></tr>
            ) : members.length === 0 ? (
              <tr><td className="p-3" colSpan={5}>No members found.</td></tr>
            ) : members.map((m) => {
              const d = drafts[m.user_id] || { rolesMask: m.roles_mask, status: (m.status === "disabled" ? "disabled" : "active") as "active" | "disabled" };
              const mask = parseMask(d.rolesMask);
              const isOverride = mask === ADMIN_OVERRIDE;
              const labels = roleLabels(d.rolesMask);
              return (
                <tr key={m.user_id} className="border-t border-black/5 dark:border-white/5 align-top">
                  <td className="p-3">
                    <div className="font-medium">{m.name || "(no name)"}</div>
                    <div className="font-mono text-xs opacity-80">{m.email}</div>
                    <div className="text-[11px] opacity-60 mt-1">{m.user_id}</div>
                  </td>
                  <td className="p-3">
                    <select
                      value={d.status}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [m.user_id]: { ...d, status: e.target.value === "disabled" ? "disabled" : "active" } }))}
                      className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1"
                    >
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {!permissions.can_edit_roles ? (
                      <div className="text-xs opacity-70">{labels.join(", ") || "none"}</div>
                    ) : (
                    <div className="grid gap-1">
                      {permissions.is_super_admin && (
                      <label className="inline-flex items-center gap-2 text-xs pb-1 border-b border-black/10 dark:border-white/10">
                        <input
                          type="checkbox"
                          checked={isOverride}
                          onChange={(e) => toggleAdminOverride(m.user_id, e.target.checked)}
                        />
                        <span className="font-medium">Admin Override</span>
                        <span className="opacity-70">(max-int full access)</span>
                      </label>
                      )}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {ROLES.filter((r) => permissions.is_super_admin || Number(r.bit) <= (permissions.max_assignable_role_bit || 0)).map((r) => (
                          <label key={`${m.user_id}-${r.label}`} className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              disabled={isOverride}
                              checked={isOverride || (mask & r.bit) === r.bit}
                              onChange={() => toggleRole(m.user_id, r.bit)}
                            />
                            <span>{r.label}</span>
                            <span className="opacity-60">{r.hint}</span>
                          </label>
                        ))}
                      </div>
                      <div className="text-xs opacity-70">Resolved roles: {labels.join(", ") || "none"}</div>
                    </div>
                    )}
                  </td>
                  <td className="p-3">
                    {permissions.is_super_admin ? (
                    <input
                      value={d.rolesMask}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [m.user_id]: { ...d, rolesMask: e.target.value } }))}
                      className="w-full rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1 font-mono text-xs"
                    />
                    ) : (
                    <span className="font-mono text-xs opacity-60">{d.rolesMask}</span>
                    )}
                    {d.msg ? <div className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">{d.msg}</div> : null}
                  </td>
                  <td className="p-3">
                    <button
                      disabled={Boolean(d.saving)}
                      onClick={() => saveMember(m.user_id)}
                      className="rounded bg-black text-white px-3 py-1.5 text-xs disabled:opacity-60"
                    >
                      {d.saving ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
