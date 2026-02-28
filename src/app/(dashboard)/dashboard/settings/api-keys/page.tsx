"use client";

import { useEffect, useState } from "react";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  roles_mask: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
};

const ROLE_PRESETS = [
  { label: "Viewer", value: "1", description: "Read-only access" },
  { label: "Operator", value: "4", description: "Upload & scan" },
  { label: "Scan Admin", value: "8", description: "Full scan management" },
  { label: "Org Owner", value: "128", description: "Full access" },
] as const;

const ROLE_BITS: Array<{ mask: number; label: string }> = [
  { mask: 1, label: "viewer" },
  { mask: 2, label: "analyst" },
  { mask: 4, label: "operator" },
  { mask: 8, label: "scan_admin" },
  { mask: 16, label: "policy_admin" },
  { mask: 32, label: "billing_admin" },
  { mask: 64, label: "api_key_admin" },
  { mask: 128, label: "org_owner" },
];

function decodeRoles(mask: string): string {
  const n = parseInt(mask, 10);
  if (!n || isNaN(n)) return "none";
  const labels = ROLE_BITS.filter((r) => (n & r.mask) !== 0).map((r) => r.label);
  return labels.length > 0 ? labels.join(", ") : `mask:${mask}`;
}

function CodeExample({
  title,
  language,
  code,
  onCopy,
}: {
  title: string;
  language?: string;
  code: string;
  onCopy: (value: string) => Promise<void>;
}) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
      <div className="px-3 py-2 text-xs border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-2">
          {language ? <span className="opacity-70 uppercase tracking-wide">{language}</span> : null}
          <button
            onClick={() => onCopy(code)}
            className="rounded border border-black/20 dark:border-white/20 px-2 py-0.5 text-[11px] hover:bg-black/5 dark:hover:bg-white/5"
          >
            Copy
          </button>
        </div>
      </div>
      <pre className="p-3 text-xs overflow-auto bg-black/5 dark:bg-white/5 whitespace-pre-wrap break-words">{code}</pre>
    </div>
  );
}

export default function ApiKeysPage() {
  const [items, setItems] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("8");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://scanrook.io");
  const [docsOpen, setDocsOpen] = useState(true);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  async function copyText(value: string) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopyMsg("Copied");
      setTimeout(() => setCopyMsg(null), 1200);
    } catch (e: unknown) {
      setCopyMsg(e instanceof Error ? e.message : "Copy failed");
      setTimeout(() => setCopyMsg(null), 1800);
    }
  }

  async function reload() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/org/api-keys", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function createKey() {
    setMsg(null);
    setCreatedToken(null);
    try {
      const res = await fetch("/api/org/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roles_mask: selectedRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setCreatedToken(json.token || null);
      setName("");
      await reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  async function revoke(id: string) {
    setMsg(null);
    try {
      const res = await fetch(`/api/org/api-keys/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      if (!json?.ok) throw new Error("failed to revoke key");
      await reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const token = createdToken || "<API_KEY>";
  const sampleJobId = "<JOB_ID>";

  const authNotes = `Supported auth headers (either one):
- Authorization: Bearer ${token}
- x-api-key: ${token}

API keys are organization-scoped and constrained by roles_mask.`;

  const listJobsBearer = `curl -sS '${origin}/api/jobs' \\
  -H 'Authorization: Bearer ${token}'`;

  const listJobsXApiKey = `curl -sS '${origin}/api/jobs' \\
  -H 'x-api-key: ${token}'`;

  const presignUploadQueue = `# 1) Request a presigned upload URL
RESP=$(curl -sS -X POST '${origin}/api/uploads/presign' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  -d '{"filename":"centos-7.tar","contentType":"application/x-tar","method":"PUT"}')

echo "$RESP"
# Expect fields similar to: url, object_key, bucket
UPLOAD_URL=$(echo "$RESP" | jq -r '.url')
OBJECT_KEY=$(echo "$RESP" | jq -r '.object_key')
BUCKET=$(echo "$RESP" | jq -r '.bucket')

# 2) Upload file directly to object storage
curl -sS -X PUT "$UPLOAD_URL" \\
  -H 'Content-Type: application/x-tar' \\
  --data-binary @./centos-7.tar

# 3) Queue scan from S3/MinIO object
curl -sS -X POST '${origin}/api/scan/from-s3' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  -d "{\\"bucket\\":\\"$BUCKET\\",\\"key\\":\\"$OBJECT_KEY\\",\\"mode\\":\\"deep\\"}"`;

  const monitorAndFetch = `# Live/near-live status
curl -sS '${origin}/api/jobs/${sampleJobId}/events/list?limit=500'

# Paginated findings
curl -sS '${origin}/api/jobs/${sampleJobId}/findings?page=1&page_size=50&tier=confirmed'

# Paginated file entries
curl -sS '${origin}/api/jobs/${sampleJobId}/files?page=1&page_size=100'

# Paginated package inventory
curl -sS '${origin}/api/jobs/${sampleJobId}/packages?page=1&page_size=100'`;

  const jsFetchExample = `const API_KEY = "${token}";
const base = "${origin}";

const presign = await fetch(\`\${base}/api/uploads/presign\`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
  body: JSON.stringify({
    filename: "centos-7.tar",
    contentType: "application/x-tar",
    method: "PUT",
  }),
});
const { url, object_key, bucket } = await presign.json();

await fetch(url, {
  method: "PUT",
  headers: { "Content-Type": "application/x-tar" },
  body: await (await fetch("/centos-7.tar")).blob(),
});

const queued = await fetch(\`\${base}/api/scan/from-s3\`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
  body: JSON.stringify({ bucket, key: object_key, mode: "deep" }),
});
console.log(await queued.json());`;

  const errorsExample = `401 Unauthorized
{"error":"Unauthorized"}

403 Forbidden (role-based)
{
  "error":"your roles [viewer] do not allow you to use create API key. required roles [api_key_admin, org_owner].",
  "code":"forbidden_role",
  "roles":["viewer"],
  "required_roles":["api_key_admin","org_owner"],
  "roles_mask":"1",
  "feature":"create API key"
}`;

  const cliBootstrap = `# Check current CLI cloud-enrichment limits
curl -sS '${origin}/api/cli/limits' \\
  -H 'Authorization: Bearer ${token}'

# Consume one enrichment token before scan
curl -sS -X POST '${origin}/api/cli/enrich' \\
  -H 'Authorization: Bearer ${token}'`;

  const deviceFlow = `# 1) Start device flow
START=$(curl -sS -X POST '${origin}/api/cli/auth/device/start')
echo "$START"
DEVICE_CODE=$(echo "$START" | jq -r '.device_code')

# 2) Approve with existing API key
curl -sS -X POST '${origin}/api/cli/auth/device/complete' \\
  -H 'Authorization: Bearer ${token}' \\
  -H 'Content-Type: application/json' \\
  -d "{\\"device_code\\":\\"$DEVICE_CODE\\",\\"approve\\":true,\\"name\\":\\"scanrook-cli\\"}"

# 3) Poll until authorized
curl -sS -X POST '${origin}/api/cli/auth/device/complete' \\
  -H 'Content-Type: application/json' \\
  -d "{\\"device_code\\":\\"$DEVICE_CODE\\"}"`;

  return (
    <div className="grid gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-sm opacity-70 mt-1">Create and revoke organization API keys for scanner automation.</p>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-4">
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          >
            {ROLE_PRESETS.map((r) => (
              <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
            ))}
          </select>
          <button
            onClick={createKey}
            disabled={!name.trim()}
            className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/90 disabled:opacity-60"
          >
            Create key
          </button>
        </div>

        {createdToken && (
          <div className="rounded-md border border-emerald-400 bg-emerald-100 text-emerald-900 px-3 py-2 text-sm">
            <div className="font-semibold">Copy this API key now (shown once)</div>
            <div className="font-mono break-all mt-1">{createdToken}</div>
          </div>
        )}

        {msg && <div className="text-sm text-red-700 bg-red-100 rounded px-3 py-2">{msg}</div>}

        <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          <button
            onClick={() => setDocsOpen((v) => !v)}
            className="w-full px-3 py-2 text-left text-sm font-medium bg-black/[.04] dark:bg-white/[.04] flex items-center justify-between"
          >
            <span>How to use this API key</span>
            <span className="text-xs opacity-70">{docsOpen ? "Hide" : "Show"}</span>
          </button>
          {docsOpen ? (
            <div className="p-3 grid gap-3">
              <div className="text-xs opacity-80">
                Use these examples to upload, queue, and retrieve scan results.
                <span className="ml-1 font-medium">Base URL:</span> <span className="font-mono">{origin}</span>
                {copyMsg ? <span className="ml-2 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5">{copyMsg}</span> : null}
              </div>

              <CodeExample title="Auth header options" language="txt" code={authNotes} onCopy={copyText} />
              <CodeExample title="List jobs (Bearer auth)" language="bash" code={listJobsBearer} onCopy={copyText} />
              <CodeExample title="List jobs (x-api-key header)" language="bash" code={listJobsXApiKey} onCopy={copyText} />
              <CodeExample title="Upload + queue scan flow (presign -> upload -> from-s3)" language="bash" code={presignUploadQueue} onCopy={copyText} />
              <CodeExample title="Monitor workflow and fetch findings/files" language="bash" code={monitorAndFetch} onCopy={copyText} />
              <CodeExample title="CLI cloud-enrichment limits" language="bash" code={cliBootstrap} onCopy={copyText} />
              <CodeExample title="CLI device auth flow" language="bash" code={deviceFlow} onCopy={copyText} />
              <CodeExample title="JavaScript fetch example" language="js" code={jsFetchExample} onCopy={copyText} />
              <CodeExample title="Error response examples (401/403)" language="json" code={errorsExample} onCopy={copyText} />

              <div className="rounded border border-amber-300/60 bg-amber-100/70 text-amber-900 px-3 py-2 text-xs">
                Keep API keys secret. Tokens are shown once at creation time and are scoped to your org and role mask.
                For full endpoint docs, open <span className="font-medium">Settings → API Docs</span>.
              </div>
            </div>
          ) : null}
        </div>

        <div className="overflow-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Prefix</th>
                <th className="p-3">Roles</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Used</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3 opacity-70" colSpan={6}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="p-3 opacity-70" colSpan={6}>No API keys</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 font-mono">{item.prefix}</td>
                  <td className="p-3">{decodeRoles(item.roles_mask)}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3 opacity-70">{item.last_used_at ? new Date(item.last_used_at).toLocaleString() : "never"}</td>
                  <td className="p-3 text-right">
                    <button
                      disabled={item.status !== "active"}
                      onClick={() => revoke(item.id)}
                      className="rounded-md bg-red-600 text-white px-3 py-1 text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
