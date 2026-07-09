"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";

type CryptoLibrary = {
    name: string;
    version: string | null;
    source: string;
    paths: string[];
    cve_ids: string[];
};

type CertificateAsset = {
    path: string;
    subject: string;
    issuer: string;
    not_after: string;
    sig_algorithm: string;
    key_algorithm: string;
    key_bits: number | null;
    flags: string[];
};

type PrivateKeyAsset = {
    path: string;
    kind: string;
};

type ProtocolHint = {
    path: string;
    protocol: string;
    setting: string;
    confidence: string;
};

type CbomSummary = {
    crypto_libs: number;
    certificates: number;
    expired_certs: number;
    weak_certs: number;
    private_keys: number;
};

type CbomSection = {
    spec: string;
    crypto_libraries?: CryptoLibrary[];
    certificates?: CertificateAsset[];
    private_keys?: PrivateKeyAsset[];
    protocol_hints?: ProtocolHint[];
    summary?: Partial<CbomSummary>;
    truncated?: boolean;
};

class CbomFetchError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

const fetcher = async (url: string): Promise<CbomSection> => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new CbomFetchError(
            typeof body?.error === "string" ? body.error : `Request failed (${res.status})`,
            res.status,
        );
    }
    return res.json();
};

const DAY_MS = 24 * 60 * 60 * 1000;

function subjectCN(subject: string): string {
    const m = /CN\s*=\s*([^,/]+)/.exec(subject || "");
    return m ? m[1].trim() : (subject || "(unknown subject)");
}

function expiryClass(cert: CertificateAsset): string {
    const flags = cert.flags || [];
    const notAfter = Date.parse(cert.not_after);
    const expired = flags.includes("expired") || (Number.isFinite(notAfter) && notAfter < Date.now());
    if (expired) return "text-red-600 dark:text-red-400 font-medium";
    const soon = flags.includes("expires-soon") || (Number.isFinite(notAfter) && notAfter - Date.now() < 90 * DAY_MS);
    if (soon) return "text-amber-600 dark:text-amber-400 font-medium";
    return "";
}

function formatExpiry(notAfter: string): string {
    const t = Date.parse(notAfter);
    if (!Number.isFinite(t)) return notAfter || "unknown";
    return new Date(t).toISOString().slice(0, 10);
}

function RedBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
            {children}
        </span>
    );
}

function StatCard({ label, count, danger, warn }: { label: string; count: number; danger?: boolean; warn?: boolean }) {
    const accent = danger
        ? "bg-red-50 dark:bg-red-950/40"
        : warn
        ? "bg-amber-50 dark:bg-amber-950/40"
        : "bg-black/5 dark:bg-white/5";
    const text = danger
        ? "text-red-700 dark:text-red-300"
        : warn
        ? "text-amber-700 dark:text-amber-300"
        : "";
    return (
        <div className={`rounded-lg p-3 ${accent}`}>
            <div className={`text-xs ${text || "muted"}`}>{label}</div>
            <div className={`text-xl font-bold tabular-nums ${text}`}>{count}</div>
        </div>
    );
}

export default function CbomTabView({ jobId }: { jobId: string }) {
    const { data, error, isLoading } = useSWR<CbomSection>(
        jobId ? `/api/jobs/${jobId}/cbom` : null,
        fetcher,
        { revalidateOnFocus: false },
    );

    if (isLoading) {
        return (
            <div className="surface-card p-8">
                <div className="flex items-center gap-3 text-sm muted">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading CBOM...
                </div>
            </div>
        );
    }

    if (error) {
        const status = error instanceof CbomFetchError ? error.status : 0;
        if (status === 404) {
            return (
                <div className="surface-card p-8">
                    <h3 className="text-sm font-semibold mb-2">No CBOM available</h3>
                    <p className="text-sm muted">{error.message}</p>
                </div>
            );
        }
        return (
            <div className="surface-card p-8 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                Failed to load CBOM: {error.message}
            </div>
        );
    }

    if (!data) return null;

    const libs = data.crypto_libraries ?? [];
    const certs = data.certificates ?? [];
    const keys = data.private_keys ?? [];
    const hints = data.protocol_hints ?? [];
    const summary: CbomSummary = {
        crypto_libs: data.summary?.crypto_libs ?? libs.length,
        certificates: data.summary?.certificates ?? certs.length,
        expired_certs: data.summary?.expired_certs ?? 0,
        weak_certs: data.summary?.weak_certs ?? 0,
        private_keys: data.summary?.private_keys ?? keys.length,
    };

    return (
        <div className="grid gap-5">
            {/* Summary stat cards */}
            <div className="surface-card p-5">
                <h3 className="text-sm font-semibold mb-3">Cryptography Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <StatCard label="Crypto Libraries" count={summary.crypto_libs} />
                    <StatCard label="Certificates" count={summary.certificates} />
                    <StatCard label="Expired Certs" count={summary.expired_certs} danger={summary.expired_certs > 0} />
                    <StatCard label="Weak Certs" count={summary.weak_certs} warn={summary.weak_certs > 0} />
                    <StatCard label="Private Keys" count={summary.private_keys} danger={summary.private_keys > 0} />
                </div>
                {data.truncated === true && (
                    <div className="mt-3 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                        Certificate scan was truncated — this image had more crypto-asset candidates than the scan cap. Results may be incomplete.
                    </div>
                )}
            </div>

            {/* Certificates table */}
            <div className="surface-card p-5">
                <h3 className="text-sm font-semibold mb-3">
                    Certificates
                    {certs.length > 0 && <span className="ml-2 text-xs font-normal muted">({certs.length})</span>}
                </h3>
                {certs.length === 0 ? (
                    <p className="text-sm muted">No certificates found in this image.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-black/10 dark:border-white/10">
                                    <th className="text-left py-2 px-2 font-medium muted">Subject</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Expires</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Signature</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Key</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certs.map((cert, i) => {
                                    const flags = cert.flags ?? [];
                                    const sha1 = flags.includes("sha1-signature");
                                    const weak = flags.some((f) => f.startsWith("weak-"));
                                    return (
                                        <tr key={`${cert.path}-${i}`} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                                            <td className="py-1.5 px-2">
                                                <div className="font-mono text-xs">{subjectCN(cert.subject)}</div>
                                                <div className="text-xs muted truncate max-w-[24rem]" title={cert.path}>{cert.path}</div>
                                            </td>
                                            <td className={`py-1.5 px-2 text-xs tabular-nums ${expiryClass(cert)}`}>
                                                {formatExpiry(cert.not_after)}
                                            </td>
                                            <td className="py-1.5 px-2 text-xs">
                                                {sha1 ? <RedBadge>{cert.sig_algorithm}</RedBadge> : cert.sig_algorithm}
                                            </td>
                                            <td className="py-1.5 px-2 text-xs">
                                                {weak ? (
                                                    <RedBadge>{cert.key_algorithm}{cert.key_bits ? ` ${cert.key_bits}` : ""}</RedBadge>
                                                ) : (
                                                    <>{cert.key_algorithm}{cert.key_bits ? ` ${cert.key_bits}` : ""}</>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Crypto libraries table */}
            <div className="surface-card p-5">
                <h3 className="text-sm font-semibold mb-3">
                    Crypto Libraries
                    {libs.length > 0 && <span className="ml-2 text-xs font-normal muted">({libs.length})</span>}
                </h3>
                {libs.length === 0 ? (
                    <p className="text-sm muted">No cryptographic libraries detected.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-black/10 dark:border-white/10">
                                    <th className="text-left py-2 px-2 font-medium muted">Library</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Version</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Source</th>
                                    <th className="text-left py-2 px-2 font-medium muted">CVEs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {libs.map((lib, i) => {
                                    const cves = lib.cve_ids ?? [];
                                    return (
                                        <tr key={`${lib.name}-${i}`} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                                            <td className="py-1.5 px-2 font-mono text-xs">{lib.name}</td>
                                            <td className="py-1.5 px-2 font-mono text-xs tabular-nums">{lib.version || "unknown"}</td>
                                            <td className="py-1.5 px-2">
                                                <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-black/5 dark:bg-white/10">
                                                    {lib.source}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2 text-xs">
                                                {cves.length > 0 ? (
                                                    <Link
                                                        href={`/dashboard/${jobId}/findings`}
                                                        className="text-red-600 dark:text-red-400 hover:underline font-medium"
                                                        title={cves.join(", ")}
                                                    >
                                                        {cves.length} CVE{cves.length === 1 ? "" : "s"}
                                                    </Link>
                                                ) : (
                                                    <span className="muted">0</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Private keys */}
            <div className="surface-card p-5">
                <h3 className="text-sm font-semibold mb-3">
                    Private Keys
                    {keys.length > 0 && <span className="ml-2 text-xs font-normal muted">({keys.length})</span>}
                </h3>
                {keys.length === 0 ? (
                    <p className="text-sm muted">No private key material found. Good.</p>
                ) : (
                    <ul className="grid gap-2">
                        {keys.map((key, i) => (
                            <li
                                key={`${key.path}-${i}`}
                                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800"
                            >
                                <span className="font-mono text-xs text-red-800 dark:text-red-200 break-all">{key.path}</span>
                                <RedBadge>{key.kind}</RedBadge>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Protocol hints (collapsed) */}
            {hints.length > 0 && (
                <details className="surface-card p-5">
                    <summary className="text-sm font-semibold cursor-pointer select-none">
                        Protocol Hints
                        <span className="ml-2 text-xs font-normal muted">({hints.length})</span>
                        <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            heuristic
                        </span>
                    </summary>
                    <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-black/10 dark:border-white/10">
                                    <th className="text-left py-2 px-2 font-medium muted">Protocol</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Setting</th>
                                    <th className="text-left py-2 px-2 font-medium muted">Config File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hints.map((hint, i) => (
                                    <tr key={`${hint.path}-${i}`} className="border-b border-black/5 dark:border-white/5">
                                        <td className="py-1.5 px-2 text-xs">{hint.protocol}</td>
                                        <td className="py-1.5 px-2 font-mono text-xs">{hint.setting}</td>
                                        <td className="py-1.5 px-2 text-xs muted break-all">{hint.path}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </details>
            )}
        </div>
    );
}
