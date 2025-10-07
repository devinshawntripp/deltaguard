"use client";
import { useState } from "react";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"light" | "deep">("light");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pct, setPct] = useState<number>(0);
  const [speed, setSpeed] = useState<string>("");
  const [aborter, setAborter] = useState<() => void>(() => () => { });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      // 1) Presign upload (choose POST for very large files)
      const wantsPost = file.size >= 50 * 1024 * 1024; // 50MB threshold
      const presign = await fetch("/api/uploads/presign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", method: wantsPost ? "POST" : "PUT" }) });
      const p = await presign.json();
      if (!presign.ok) throw new Error(p.error || "Presign failed");
      if (!p || !p.url || !p.key || !p.bucket) throw new Error("Presign response missing url/key/bucket");
      // 2) Upload with progress
      if (String(p.method || '').toUpperCase() === 'POST' && p.fields) {
        await new Promise<void>((resolve, reject) => {
          try {
            const form = new FormData();
            Object.entries(p.fields || {}).forEach(([k, v]) => form.append(k, String(v)));
            // Ensure Content-Type field exists if presigned policy expects it
            if (!('Content-Type' in (p.fields || {}))) form.append('Content-Type', file.type || 'application/octet-stream');
            form.append('file', file);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', String(p.url));
            let lastLoaded = 0; let lastTs = Date.now();
            xhr.upload.onprogress = (ev) => {
              if (!ev.lengthComputable) return;
              const now = Date.now(); const loaded = ev.loaded; const total = ev.total || file.size;
              const deltaBytes = loaded - lastLoaded; const deltaMs = Math.max(1, now - lastTs);
              const bps = (deltaBytes * 1000) / deltaMs;
              const human = (n: number) => { const u = ["B/s", "KB/s", "MB/s", "GB/s"]; let i = 0; let x = n; while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; } return `${x.toFixed(1)} ${u[i]}`; };
              setPct(Math.round((loaded / total) * 100)); setSpeed(human(bps)); lastLoaded = loaded; lastTs = now;
            };
            xhr.onerror = () => reject(new Error('S3 upload failed'));
            xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { setPct(100); resolve(); } else reject(new Error(`S3 upload failed (${xhr.status})`)); };
            xhr.send(form);
            setAborter(() => () => { try { xhr.abort(); } catch { } });
          } catch (e) { reject(e as any); }
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', String(p.url));
            const headers = (p.headers || {}) as Record<string, string>;
            Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, String(v)));
            if (!headers['Content-Type']) xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            let lastLoaded = 0; let lastTs = Date.now();
            xhr.upload.onprogress = (ev) => {
              if (!ev.lengthComputable) return;
              const now = Date.now(); const loaded = ev.loaded; const total = ev.total || file.size;
              const deltaBytes = loaded - lastLoaded; const deltaMs = Math.max(1, now - lastTs);
              const bps = (deltaBytes * 1000) / deltaMs;
              const human = (n: number) => { const u = ["B/s", "KB/s", "MB/s", "GB/s"]; let i = 0; let x = n; while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; } return `${x.toFixed(1)} ${u[i]}`; };
              setPct(Math.round((loaded / total) * 100)); setSpeed(human(bps)); lastLoaded = loaded; lastTs = now;
            };
            xhr.onerror = () => reject(new Error('S3 upload failed'));
            xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { setPct(100); resolve(); } else reject(new Error(`S3 upload failed (${xhr.status})`)); };
            xhr.send(file);
            setAborter(() => () => { try { xhr.abort(); } catch { } });
          } catch (e) { reject(e as any); }
        });
      }
      // 3) Create job
      const start = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: p.bucket, object_key: p.key, mode, format: "json", refs: false }) });
      const d = await start.json();
      if (!start.ok) throw new Error(d.error || "Job create failed");
      setMessage("Job queued: " + d.id);
      try { window.dispatchEvent(new CustomEvent('jobs-refresh')); } catch { }
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
      setTimeout(() => { setPct(0); setSpeed(""); }, 1500);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-black/10 dark:border-white/10 p-6 bg-white/60 dark:bg-black/30 backdrop-blur grid gap-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Upload file</div>
        <div className="flex items-center gap-2 text-xs opacity-80">
          <label>
            <input type="radio" name="mode" value="light" checked={mode === "light"} onChange={() => setMode("light")} /> Light
          </label>
          <label>
            <input type="radio" name="mode" value="deep" checked={mode === "deep"} onChange={() => setMode("deep")} /> Deep
          </label>
        </div>
      </div>
      <label className="block">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black/80 file:text-white hover:file:bg-black"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          disabled={!file || loading}
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Uploading…" : "Upload & Scan"}
        </button>
        {loading && (
          <button type="button" onClick={() => aborter()} className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Cancel</button>
        )}
      </div>
      {loading && (
        <div className="grid gap-1">
          <div className="h-2 bg-black/10 dark:bg-white/10 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs opacity-70">{pct}% • {speed}</div>
        </div>
      )}
      {message && <div className="text-sm opacity-80">{message}</div>}
    </form>
  );
}


