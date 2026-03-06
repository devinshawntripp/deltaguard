"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    jobId: string;
    status: string;
};

export default function JobActions({ jobId, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canCancel = status === "queued" || status === "running";
    const canRetry = status === "failed" || status === "cancelled";

    if (!canCancel && !canRetry) return null;

    async function handleCancel() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || "Cancel failed");
            router.refresh();
            try { window.dispatchEvent(new CustomEvent("jobs-refresh")); } catch {}
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleRetry() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/jobs/${jobId}/requeue`, { method: "POST" });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || "Requeue failed");
            router.refresh();
            try { window.dispatchEvent(new CustomEvent("jobs-refresh")); } catch {}
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            {canCancel && (
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="text-sm px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? "Cancelling\u2026" : "Cancel Scan"}
                </button>
            )}
            {canRetry && (
                <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="text-sm px-3 py-1.5 rounded-md bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? "Re-queuing\u2026" : "Retry Scan"}
                </button>
            )}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
