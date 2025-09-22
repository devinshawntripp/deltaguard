"use client";
import { create } from "zustand";

type Scan = {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  scanType: "BIN" | "CONTAINER" | "LICENSE" | "VULN" | "REDHAT";
  createdAt: string;
  finishedAt?: string;
};

type Package = {
  id: string;
  createdAt: string;
  originalName: string;
  sizeBytes: number;
  packageType: "BINARY" | "CONTAINER";
  status: "UPLOADED" | "SCANNING" | "COMPLETED" | "FAILED";
  scans: Scan[];
};

type PackagesState = {
  packages: Package[];
  setPackages: (items: Package[]) => void;
};

export const usePackagesStore = create<PackagesState>((set) => ({
  packages: [],
  setPackages: (items) => set({ packages: items }),
}));


