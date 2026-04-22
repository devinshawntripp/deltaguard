"use client";

import React, { useCallback, useEffect, useState } from "react";

type AuditEntry = {
  id: string;
  action: string;
  category: string;
  severity: string;
  target_type: string | null;
  target_id: string | null;
  detail: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
};

type AuditResponse = {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
};

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "auth", label: "Auth" },
  { value: "scans", label: "Scans" },
  { value: "registries", label: "Registries" },
  { value: "schedules", label: "Schedules" },
  { value: "notifications", label: "Notifications" },
  { value: "policies", label: "Policies" },
  { value: "org", label: "Organization" },
  { value: "api_keys", label: "API Keys" },
  { value: "billing", label: "Billing" },
  { value: "scanner", label: "Scanner" },
  { value: "reports", label: "Reports" },
];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (category) params.set("category", category);
      const res = await fetch(`/api/org/audit-log?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: AuditResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [page, category, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Audit Log</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 6,
            border: "1px solid var(--border-color, #333)",
            background: "var(--card-bg, #1a1a2e)",
            color: "inherit",
            fontSize: "0.875rem",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <span style={{ fontSize: "0.875rem", opacity: 0.6 }}>
          {total} event{total !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: 6, marginBottom: "1rem", color: "#ff6b6b" }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color, #333)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0.75rem", fontWeight: 500, whiteSpace: "nowrap" }}>Time</th>
              <th style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>User</th>
              <th style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>Action</th>
              <th style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>Target</th>
              <th style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>Detail</th>
              <th style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {loading && !items.length ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-color, #222)" }}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} style={{ padding: "0.6rem 0.75rem" }}>
                      <div style={{ height: 14, borderRadius: 4, background: "var(--border-color, #333)", opacity: 0.4, width: `${50 + Math.random() * 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
                  No audit events found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid var(--border-color, #222)",
                    background: item.severity === "warn" ? "rgba(255,200,50,0.04)" : "transparent",
                  }}
                >
                  <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {formatTime(item.created_at)}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {item.user_email || <span style={{ opacity: 0.4 }}>system</span>}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      background: item.severity === "warn" ? "rgba(255,200,50,0.15)" : "rgba(100,180,255,0.1)",
                      color: item.severity === "warn" ? "#f0c040" : "var(--text-muted, #aaa)",
                    }}>
                      {item.action}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontFamily: "monospace", opacity: 0.7 }}>
                    {item.target_type ? `${item.target_type}${item.target_id ? `:${item.target_id.slice(0, 8)}` : ""}` : ""}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.detail}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontFamily: "monospace", opacity: 0.5 }}>
                    {item.ip || ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", alignItems: "center" }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 4, border: "1px solid var(--border-color, #333)", background: "transparent", color: "inherit", cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.3 : 1 }}
          >
            Prev
          </button>
          <span style={{ fontSize: "0.85rem" }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 4, border: "1px solid var(--border-color, #333)", background: "transparent", color: "inherit", cursor: page >= totalPages ? "default" : "pointer", opacity: page >= totalPages ? 0.3 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
