"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublicImageScan() {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = image.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registry/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Scan failed (${res.status})`);

      // Wait until the job row is visible to the detail page (up to 3 s).
      const deadline = Date.now() + 3000;
      while (Date.now() < deadline) {
        const check = await fetch(`/api/jobs/${data.id}`, { method: "GET" });
        if (check.ok) break;
        await new Promise((r) => setTimeout(r, 200));
      }

      router.push(`/dashboard/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-card p-6 backdrop-blur grid gap-4">
      <div className="font-semibold tracking-tight">Scan public image</div>
      <div className="flex gap-3">
        <input
          type="text"
          value={image}
          onChange={(e) => { setImage(e.target.value); setError(null); }}
          placeholder="nginx:latest, alpine:3.20, ghcr.io/org/app:v1"
          className="flex-1 px-3 py-2 rounded-md border border-[var(--dg-border)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!image.trim() || loading}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:pointer-events-none whitespace-nowrap"
        >
          {loading ? "Scanning\u2026" : "Scan Image"}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      <p className="text-[11px] muted">
        Enter a public container image reference. No credentials needed for Docker Hub, GHCR, or Quay public images.
      </p>
    </form>
  );
}
