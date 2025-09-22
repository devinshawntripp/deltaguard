"use client";
import { useState } from "react";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"BINARY" | "CONTAINER">("BINARY");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("packageType", type);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage("Upload queued: " + data.id);
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-black/10 dark:border-white/10 p-6 bg-white/60 dark:bg-black/30 backdrop-blur grid gap-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Upload package</div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="px-2 py-1 rounded-md border border-black/10 bg-background"
        >
          <option value="BINARY">Binary</option>
          <option value="CONTAINER">Container (.tar)</option>
        </select>
      </div>
      <label className="block">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black/80 file:text-white hover:file:bg-black"
        />
      </label>
      <button
        disabled={!file || loading}
        className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Uploading…" : "Upload & Scan"}
      </button>
      {message && <div className="text-sm opacity-80">{message}</div>}
    </form>
  );
}


