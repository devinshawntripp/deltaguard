"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type RegistryInfo = {
    id: string;
    name: string;
    registryUrl: string;
};

export default function RegistryBrowsePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const registryId = params.id;

    const [registry, setRegistry] = useState<RegistryInfo | null>(null);
    const [repos, setRepos] = useState<string[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [repoError, setRepoError] = useState<string | null>(null);

    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [tagError, setTagError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [scanning, setScanning] = useState<Record<string, boolean>>({});
    const [scanError, setScanError] = useState<string | null>(null);

    // Load registry info
    useEffect(() => {
        fetch(`/api/org/registries/${registryId}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                if (data.item) setRegistry(data.item);
            })
            .catch(() => {});
    }, [registryId]);

    // Load repos
    useEffect(() => {
        setLoadingRepos(true);
        setRepoError(null);
        fetch(`/api/registries/${registryId}/repos`, { cache: "no-store" })
            .then(async (r) => {
                if (!r.ok) {
                    const data = await r.json().catch(() => ({}));
                    throw new Error(data.error || `HTTP ${r.status}`);
                }
                return r.json();
            })
            .then((data) => {
                setRepos(data.repositories || []);
            })
            .catch((e) => {
                setRepoError(e instanceof Error ? e.message : String(e));
            })
            .finally(() => setLoadingRepos(false));
    }, [registryId]);

    // Load tags when a repo is selected
    useEffect(() => {
        if (!selectedRepo) {
            setTags([]);
            return;
        }
        setLoadingTags(true);
        setTagError(null);
        fetch(`/api/registries/${registryId}/tags?repo=${encodeURIComponent(selectedRepo)}`, { cache: "no-store" })
            .then(async (r) => {
                if (!r.ok) {
                    const data = await r.json().catch(() => ({}));
                    throw new Error(data.error || `HTTP ${r.status}`);
                }
                return r.json();
            })
            .then((data) => {
                setTags(data.tags || []);
            })
            .catch((e) => {
                setTagError(e instanceof Error ? e.message : String(e));
            })
            .finally(() => setLoadingTags(false));
    }, [registryId, selectedRepo]);

    async function handleScan(tag: string) {
        if (!selectedRepo) return;
        const key = `${selectedRepo}:${tag}`;
        setScanning((s) => ({ ...s, [key]: true }));
        setScanError(null);
        try {
            const res = await fetch("/api/registry/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registry_config_id: registryId,
                    repo: selectedRepo,
                    tag,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            const job = await res.json();
            router.push(`/dashboard/${job.id}`);
        } catch (e: unknown) {
            setScanError(e instanceof Error ? e.message : String(e));
            setScanning((s) => ({ ...s, [key]: false }));
        }
    }

    const filtered = search
        ? repos.filter((r) => r.toLowerCase().includes(search.toLowerCase()))
        : repos;

    return (
        <div className="grid gap-6">
            <div>
                <div className="flex items-center gap-2 text-sm opacity-60 mb-1">
                    <Link href="/dashboard/settings/registries" className="hover:underline">
                        Registries
                    </Link>
                    <span>/</span>
                    <span>{registry?.name || registryId}</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Browse {registry?.name || "Registry"}
                </h1>
                {registry?.registryUrl && (
                    <p className="text-sm font-mono opacity-60 mt-1">{registry.registryUrl}</p>
                )}
            </div>

            {repoError && (
                <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm">
                    {repoError}
                </div>
            )}

            {scanError && (
                <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm">
                    {scanError}
                </div>
            )}

            <div className="grid lg:grid-cols-[320px_1fr] gap-4">
                {/* Repositories panel */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 grid gap-2 content-start">
                    <div className="font-semibold text-sm">Repositories</div>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter repositories..."
                        className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm w-full"
                    />
                    <div className="max-h-[500px] overflow-auto grid gap-0.5">
                        {loadingRepos ? (
                            <div className="text-xs opacity-60 p-2">Loading repositories...</div>
                        ) : filtered.length === 0 ? (
                            <div className="text-xs opacity-60 p-2">
                                {repos.length === 0
                                    ? "No repositories found. The registry may not support catalog listing."
                                    : "No matching repositories."}
                            </div>
                        ) : (
                            filtered.map((repo) => (
                                <button
                                    key={repo}
                                    onClick={() => setSelectedRepo(repo)}
                                    className={`text-left text-sm px-2 py-1.5 rounded transition-colors ${
                                        selectedRepo === repo
                                            ? "bg-black/10 dark:bg-white/10 font-medium"
                                            : "hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                                >
                                    {repo}
                                </button>
                            ))
                        )}
                    </div>
                    <div className="text-[11px] opacity-50">
                        {repos.length} repositor{repos.length === 1 ? "y" : "ies"}
                    </div>
                </div>

                {/* Tags panel */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 grid gap-2 content-start">
                    <div className="font-semibold text-sm">
                        {selectedRepo ? (
                            <>Tags for <span className="font-mono">{selectedRepo}</span></>
                        ) : (
                            "Tags"
                        )}
                    </div>
                    {!selectedRepo ? (
                        <div className="text-sm opacity-60 p-2">Select a repository to view tags.</div>
                    ) : tagError ? (
                        <div className="rounded-md border border-red-300 bg-red-100 text-red-900 px-3 py-2 text-sm">
                            {tagError}
                        </div>
                    ) : loadingTags ? (
                        <div className="text-xs opacity-60 p-2">Loading tags...</div>
                    ) : tags.length === 0 ? (
                        <div className="text-xs opacity-60 p-2">No tags found.</div>
                    ) : (
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
                                    <tr>
                                        <th className="p-2">Tag</th>
                                        <th className="p-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tags.map((tag) => {
                                        const key = `${selectedRepo}:${tag}`;
                                        return (
                                            <tr
                                                key={tag}
                                                className="border-t border-black/5 dark:border-white/5"
                                            >
                                                <td className="p-2 font-mono text-xs">{tag}</td>
                                                <td className="p-2 text-right">
                                                    <button
                                                        onClick={() => handleScan(tag)}
                                                        disabled={scanning[key]}
                                                        className="rounded bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-xs font-medium disabled:opacity-40"
                                                    >
                                                        {scanning[key] ? "Scanning..." : "Scan"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {selectedRepo && tags.length > 0 && (
                        <div className="text-[11px] opacity-50">
                            {tags.length} tag{tags.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
