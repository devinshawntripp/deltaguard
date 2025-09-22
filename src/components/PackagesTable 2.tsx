"use client";
import useSWR, { useSWRConfig } from "swr";
import React from "react";
import Link from "next/link";

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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PackagesTable() {
  const { mutate: globalMutate } = useSWRConfig();
  const { data, error, isLoading, mutate } = useSWR<Package[]>("/api/packages", fetcher, {
    refreshInterval: 0,
  });

  React.useEffect(() => {
    const es = new EventSource("/api/packages/events");
    es.onmessage = () => {
      // collapse rapid updates
      const t = setTimeout(() => { mutate(); globalMutate("/api/packages"); }, 200);
      return () => clearTimeout(t);
    };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, [mutate, globalMutate]);

  if (error) return <div className="text-sm text-red-500">Failed to load</div>;
  if (isLoading) return <div className="opacity-60">Loading…</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
            <th className="p-3">Last scan</th>
            <th className="p-3 text-right">Size</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((pkg) => {
            const lastScan = pkg.scans[0];
            return (
              <tr key={pkg.id} className="border-t border-black/5 dark:border-white/5">
                <td className="p-3 font-medium">
                  <Link className="hover:underline" href={`/dashboard/${pkg.id}`}>{pkg.originalName}</Link>
                </td>
                <td className="p-3 opacity-80">{pkg.packageType}</td>
                <td className="p-3">
                  <StatusBadge status={pkg.status} />
                </td>
                <td className="p-3 opacity-80">{lastScan ? `${lastScan.scanType} • ${lastScan.status}` : "—"}</td>
                <td className="p-3 text-right tabular-nums">{formatBytes(pkg.sizeBytes)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Package["status"] }) {
  const colors: Record<Package["status"], string> = {
    UPLOADED: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    SCANNING: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100",
    COMPLETED: "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100",
    FAILED: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100",
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[status]}`}>{status}</span>;
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}


