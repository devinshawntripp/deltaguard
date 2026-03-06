"use client";
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadStore } from "@/store/useUploadStore";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"light" | "deep">("light");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activeUploadId = useRef<string | null>(null);

  const addUpload = useUploadStore((s) => s.addUpload);
  const updateUpload = useUploadStore((s) => s.updateUpload);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
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

  function handleCancel() {
    const id = activeUploadId.current;
    if (!id) return;
    const entry = useUploadStore.getState().uploads.get(id);
    if (entry) entry.abort();
    updateUpload(id, { phase: "cancelled" });
    setLoading(false);
    setMessage("Upload cancelled");
    activeUploadId.current = null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const MAX_SIZE = 15 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setMessage("File exceeds 15 GB limit");
      return;
    }
    setLoading(true);
    setMessage(null);

    const uploadId = crypto.randomUUID();
    activeUploadId.current = uploadId;

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
        await uploadViaXhr(putPayload, abortRef);
      } catch (err: any) {
        if (err.message === "Upload cancelled") throw err;
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
      activeUploadId.current = null;
      try { window.dispatchEvent(new CustomEvent('jobs-refresh')); } catch {}
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg === "Upload cancelled") {
        updateUpload(uploadId, { phase: "cancelled" });
        setMessage("Upload cancelled");
      } else {
        updateUpload(uploadId, { phase: "error", error: msg });
        setMessage(msg);
      }
      activeUploadId.current = null;
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

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            : isDragReject
            ? "border-red-400 bg-red-50 dark:bg-red-950/30"
            : file
            ? "border-teal-600/50 bg-teal-50/50 dark:bg-teal-950/20"
            : "border-[var(--dg-border)] hover:border-teal-500/50"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Drop file here</p>
        ) : file ? (
          <div className="text-sm">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-[11px] muted mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB — click or drag to replace</p>
          </div>
        ) : (
          <div className="text-sm muted">
            <p>Drag & drop a file here, or click to browse</p>
            <p className="text-[11px] mt-1">Max file size: 15 GB</p>
          </div>
        )}
      </div>

      {file?.name?.toLowerCase().endsWith(".iso") && (
        <div className="text-xs px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
          This is an ISO image. For more accurate results, we recommend <strong>deep mode</strong> which analyzes the default installation profile.
        </div>
      )}
      <div className="flex items-center gap-3">
        <button disabled={!file || loading} className="btn-primary inline-flex items-center justify-center gap-2 disabled:pointer-events-none">
          {loading ? "Uploading\u2026" : "Upload & Scan"}
        </button>
        {loading && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      {message && <div className="text-sm muted">{message}</div>}
    </form>
  );
}
