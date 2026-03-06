"use client";
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadStore } from "@/store/useUploadStore";

export default function UploadCard() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"light" | "deep">("light");
  const [summaryOnly, setSummaryOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activeUploads = useRef<Map<string, { abort: () => void }>>(new Map());

  const addUpload = useUploadStore((s) => s.addUpload);
  const updateUpload = useUploadStore((s) => s.updateUpload);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
      setMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const human = useCallback((n: number) => {
    const u = ["B/s", "KB/s", "MB/s", "GB/s"];
    let i = 0;
    let x = n;
    while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
    return `${x.toFixed(1)} ${u[i]}`;
  }, []);

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleCancelAll() {
    activeUploads.current.forEach((ref, id) => {
      ref.abort();
      updateUpload(id, { phase: "cancelled" });
    });
    activeUploads.current.clear();
    setLoading(false);
    setMessage("Uploads cancelled");
  }

  async function uploadSingleFile(file: File): Promise<string | null> {
    const MAX_SIZE = 15 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) return `${file.name}: exceeds 15 GB limit`;

    const uploadId = crypto.randomUUID();
    const abortRef = { abort: () => {} };
    activeUploads.current.set(uploadId, abortRef);

    const uploadViaXhr = async (p: any) => {
      await new Promise<void>((resolve, reject) => {
        try {
          const method = String(p.method || "PUT").toUpperCase();
          const xhr = new XMLHttpRequest();
          xhr.open(method, String(p.url));
          xhr.timeout = 60 * 60 * 1000;
          if (method === "PUT") {
            const headers = (p.headers || {}) as Record<string, string>;
            Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, String(v)));
            if (!headers["Content-Type"]) xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          }
          let lastLoaded = 0;
          let lastTs = Date.now();
          xhr.upload.onprogress = (ev) => {
            if (!ev.lengthComputable) return;
            const now = Date.now();
            const loaded = ev.loaded;
            const total = ev.total || file.size;
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
          xhr.onabort = () => reject(new Error("Upload cancelled"));
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
            if (!("Content-Type" in (p.fields || {}))) form.append("Content-Type", file.type || "application/octet-stream");
            form.append("file", file);
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
      addUpload({
        id: uploadId,
        filename: file.name,
        pct: 0,
        speed: "",
        phase: "uploading",
        abort: () => abortRef.abort(),
      });

      const presignPut = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", method: "PUT" }),
      });
      const putPayload = await presignPut.json();
      if (!presignPut.ok) throw new Error(putPayload.error || "Presign failed");
      if (!putPayload?.url || !putPayload?.key || !putPayload?.bucket) throw new Error("Presign response missing url/key/bucket");

      try {
        await uploadViaXhr(putPayload);
      } catch (err: any) {
        if (err.message === "Upload cancelled") throw err;
        const presignPost = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", method: "POST" }),
        });
        const postPayload = await presignPost.json();
        if (!presignPost.ok) throw new Error(postPayload.error || "Presign fallback failed");
        await uploadViaXhr(postPayload);
        putPayload.key = postPayload.key;
      }

      updateUpload(uploadId, { phase: "creating-job", pct: 100 });
      const start = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: putPayload.bucket,
          object_key: putPayload.key,
          mode,
          format: "json",
          refs: false,
          summary_only: summaryOnly,
        }),
      });
      const d = await start.json();
      if (!start.ok) throw new Error(d.error || "Job create failed");

      updateUpload(uploadId, { phase: "done" });
      activeUploads.current.delete(uploadId);
      return null;
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg === "Upload cancelled") {
        updateUpload(uploadId, { phase: "cancelled" });
      } else {
        updateUpload(uploadId, { phase: "error", error: msg });
      }
      activeUploads.current.delete(uploadId);
      return `${file.name}: ${msg}`;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    setMessage(null);

    const results = await Promise.allSettled(files.map((f) => uploadSingleFile(f)));
    const errors: string[] = [];
    let successCount = 0;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value === null) {
        successCount++;
      } else if (r.status === "fulfilled" && r.value) {
        errors.push(r.value);
      } else if (r.status === "rejected") {
        errors.push(String(r.reason));
      }
    }

    activeUploads.current.clear();
    setLoading(false);
    setFiles([]);

    if (errors.length === 0) {
      setMessage(`${successCount}/${results.length} uploads complete`);
    } else {
      setMessage(`${successCount}/${results.length} succeeded. Errors: ${errors.join("; ")}`);
    }

    try { window.dispatchEvent(new CustomEvent('jobs-refresh')); } catch {}
  }

  const hasIso = files.some((f) => f.name.toLowerCase().endsWith(".iso"));

  return (
    <form onSubmit={onSubmit} className="surface-card p-6 backdrop-blur grid gap-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold tracking-tight">Upload artifact</div>
        <div className="flex items-center gap-3 text-xs muted">
          <div className="flex items-center gap-2">
            <label>
              <input type="radio" name="mode" value="light" checked={mode === "light"} onChange={() => setMode("light")} /> Light
            </label>
            <label>
              <input type="radio" name="mode" value="deep" checked={mode === "deep"} onChange={() => setMode("deep")} /> Deep
            </label>
          </div>
          <label className="flex items-center gap-1 cursor-pointer" title="Show only severity counts instead of the full report">
            <input type="checkbox" checked={summaryOnly} onChange={(e) => setSummaryOnly(e.target.checked)} className="accent-teal-600" />
            Quick Summary
          </label>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            : isDragReject
            ? "border-red-400 bg-red-50 dark:bg-red-950/30"
            : files.length > 0
            ? "border-teal-600/50 bg-teal-50/50 dark:bg-teal-950/20"
            : "border-[var(--dg-border)] hover:border-teal-500/50"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Drop files here</p>
        ) : files.length > 0 ? (
          <p className="text-sm muted">Drop more files, or click to browse</p>
        ) : (
          <div className="text-sm muted">
            <p>Drag & drop files here, or click to browse</p>
            <p className="text-[11px] mt-1">Max 15 GB per file. Multiple files supported.</p>
          </div>
        )}
      </div>

      {files.length > 0 && !loading && (
        <div className="grid gap-1 max-h-40 overflow-y-auto">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/5">
              <span className="truncate max-w-[220px]">{f.name}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="muted">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-500 hover:text-red-600"
                  aria-label={`Remove ${f.name}`}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasIso && (
        <div className="text-xs px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
          ISO image detected. For more accurate results, we recommend <strong>deep mode</strong> which analyzes the default installation profile.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button disabled={files.length === 0 || loading} className="btn-primary inline-flex items-center justify-center gap-2 disabled:pointer-events-none">
          {loading ? `Uploading ${files.length} file${files.length !== 1 ? "s" : ""}\u2026` : `Upload & Scan${files.length > 1 ? ` (${files.length})` : ""}`}
        </button>
        {loading && (
          <button
            type="button"
            onClick={handleCancelAll}
            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Cancel All
          </button>
        )}
      </div>
      {message && <div className="text-sm muted">{message}</div>}
    </form>
  );
}
