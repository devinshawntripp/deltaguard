import Link from "next/link";

async function getData(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/packages/${id}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
}

export default async function PackageDetails({ params }: { params: { id: string } }) {
    const data = await getData(params.id);
    if (!data) {
        return (
            <div className="grid gap-4">
                <div className="opacity-80">Package not found.</div>
                <Link href="/dashboard" className="text-sm underline">Back to dashboard</Link>
            </div>
        );
    }
    const last = data.scans?.[0];
    const findings = last?.output?.findings ?? [];
    return (
        <div className="grid gap-6">
            <div>
                <Link href="/dashboard" className="text-sm underline">← Back</Link>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">{data.originalName}</h1>
                <span className="text-sm opacity-70">{data.packageType} • {data.status}</span>
            </div>
            <div className="grid gap-3">
                <div className="text-sm opacity-80">SHA256: {data.sha256}</div>
                <div className="text-sm opacity-80">Size: {data.sizeBytes} bytes</div>
            </div>
            <div className="grid gap-2">
                <div className="font-medium">Findings</div>
                {findings.length === 0 ? (
                    <div className="opacity-70 text-sm">No findings.</div>
                ) : (
                    <ul className="grid gap-2">
                        {findings.map((f: any) => (
                            <li key={f.id} className="rounded-md border border-black/10 dark:border-white/10 p-3">
                                <div className="font-mono text-sm">{f.id}</div>
                                {f.description && <div className="text-sm opacity-80 mt-1">{f.description}</div>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {last?.rawOutput && (
                <details className="rounded-md border border-black/10 dark:border-white/10 p-3">
                    <summary className="cursor-pointer font-medium">Raw output</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-sm opacity-80">{last.rawOutput}</pre>
                </details>
            )}
        </div>
    );
}




