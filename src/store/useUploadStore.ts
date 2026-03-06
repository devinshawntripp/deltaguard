"use client";
import { create } from "zustand";

export type UploadEntry = {
  id: string;
  filename: string;
  pct: number;
  speed: string;
  phase: "uploading" | "creating-job" | "done" | "error" | "cancelled";
  error?: string;
  abort: () => void;
};

type UploadStore = {
  uploads: Map<string, UploadEntry>;
  addUpload: (entry: UploadEntry) => void;
  updateUpload: (id: string, patch: Partial<UploadEntry>) => void;
  removeUpload: (id: string) => void;
};

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: new Map(),
  addUpload: (entry) =>
    set((s) => {
      const next = new Map(s.uploads);
      next.set(entry.id, entry);
      return { uploads: next };
    }),
  updateUpload: (id, patch) =>
    set((s) => {
      const cur = s.uploads.get(id);
      if (!cur) return s;
      const next = new Map(s.uploads);
      next.set(id, { ...cur, ...patch });
      return { uploads: next };
    }),
  removeUpload: (id) =>
    set((s) => {
      const next = new Map(s.uploads);
      next.delete(id);
      return { uploads: next };
    }),
}));
