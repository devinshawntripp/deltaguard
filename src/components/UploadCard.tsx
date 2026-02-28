"use client";
import { useState, useCallback } from "react";
import { useUploadStore } from "@/store/useUploadStore";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"light" | "deep">("deep");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const addUpload = useUploadStore((s) => s.addUpload);
  const updateUpload = useUploadStore((s) => s.updateUpload);

  const human = useCallback((n: number) => {
    const u = ["B/s", "KB/s", "MB/s", "GB/s"];
    let i = 0;
    let x = n;
    while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
    return `${x.toFixed(1)} ${u[i]}`;
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage(null);

    const uploadId = crypto.randomUUID();

    const uploadViaXhr = async (p: any, abortRef: { abort: () => void }) => {
      await new Promise<void>((resolve, reject) => {
        try {
          const method = String(p.method || "PUT").toUpperCase();
          const xhr = new XMLHttpRequest();
          xhr.open(method, String(p.url));
          xhr.timeout = 60 * 60 * 1000;
          if (method === "PUT") {
            const headers = (p.headers || {}) as Record<string, string>;
            Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, String(v)));
            if (!headers["Content-Type"]) xhr.setRequestHeader("Content-Type", file!.type || "application/octet-stream");
          }
          let lastLoaded = 0;
          let lastTs = Date.now();
          xhr.upload.onprogress = (ev) => {
            if (!ev.lengthComputable) return;
            const now = Date.now();
            const loaded = ev.loaded;
            const total = ev.total || file!.size;
            const deltaBytes = loaded - lastLoaded;
            const deltaMs = Math.max(1, now - lastTs);
            const bps = (deltaBytes * 1000) / deltaMs;
            const pct = Math.round((loaded / total) * 100);
            const spd = human(bps);
            updateUpload(uploadId, { pct, speed: spd });
            lastLoaded = loaded;
            lastTs = now;
          };
          xhr.onerror = () => reject(new Error(`S3 upload failed${xhr.status ? ` (${xhr.status})` : ""}`));
          xhr.onabort = () => reject(new Error("Upload canceled"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              updateUpload(uploadId, { pct: 100 });
              resolve();
              return;
            }
            const raw = String(xhr.responseText || "").trim();
            const detail = raw ? `: ${raw.slice(0, 200)}` : "";
            reject(new Error(`S3 upload failed (${xhr.status})${detail}`));
          };
          abortRef.abort = () => { try { xhr.abort(); } catch {} };
          if (method === "POST" && p.fields) {
            const form = new FormData();
            Object.entries(p.fields || {}).forEach(([k, v]) => form.append(k, String(v)));
            if (!("Content-Type" in (p.fields || {}))) form.append("Content-Type", file!.type || "application/octet-stream");
            form.append("file", file!);
            xhr.send(form);
          } else {
            xhr.send(file);
          }
        } catch (e) {
          reject(e as any);
        }
      });
    };

    try {
      const abortRef = { abort: () => {} };

      // Register in global store
      addUpload({
        id: uploadId,
        filename: file.name,
        pct: 0,
        speed: "",
        phase: "uploading",
        abort: () => abortRef.abort(),
      });

      // 1) Presign PUT
      const presignPut = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", method: "PUT" }),
      });
      const putPayload = await presignPut.json();
      if (!presignPut.ok) throw new Error(putPayload.error || "Presign failed");
      if (!putPayload?.url || !putPayload?.key || !putPayload?.bucket) throw new Error("Presign response missing url/key/bucket");

      // 2) Upload with fallback
      try {
        await uploadViaXhr(putPayload, abortRef);
      } catch {
        const presignPost = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", method: "POST" }),
        });
        const postPayload = await presignPost.json();
        if (!presignPost.ok) throw new Error(postPayload.error || "Presign fallback failed");
        await uploadViaXhr(postPayload, abortRef);
        putPayload.key = postPayload.key;
      }

      // 3) Create job
      updateUpload(uploadId, { phase: "creating-job", pct: 100 });
      const start = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: putPayload.bucket, object_key: putPayload.key, mode, format: "json", refs: false }),
      });
      const d = await start.json();
      if (!start.ok) throw new Error(d.error || "Job create failed");

      updateUpload(uploadId, { phase: "done" });
      setMessage("Job queued: " + d.id);
      try { window.dispatchEvent(new CustomEvent('jobs-refresh')); } catch {}
    } catch (err: any) {
      const msg = err.message || String(err);
      updateUpload(uploadId, { phase: "error", error: msg });
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-card p-6 backdrop-blur grid gap-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold tracking-tight">Upload artifact</div>
        <div className="flex items-center gap-2 text-xs muted">
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
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-transparent file:text-sm file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800"
        />
      </label>
      <div className="flex items-center gap-3">
        <button disabled={!file || loading} className="btn-primary inline-flex items-center justify-center gap-2 disabled:pointer-events-none">
          {loading ? "Uploading\u2026" : "Upload & Scan"}
        </button>
      </div>
      {message && <div className="text-sm muted">{message}</div>}
    </form>
  );
}
