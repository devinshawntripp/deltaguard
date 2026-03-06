import SwaggerDocs from "@/components/SwaggerDocs";

export const dynamic = "force-dynamic";

export default function ApiDocsPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Docs</h1>
        <p className="text-sm opacity-70 mt-1">
          Interactive OpenAPI docs for org-scoped scan APIs.
        </p>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-2 text-sm">
        <div className="font-medium">Authorize with your API key</div>
        <div className="opacity-80">
          Click <span className="font-medium">Authorize</span> and set either:
        </div>
        <ul className="list-disc ml-5 grid gap-1 opacity-90">
          <li>
            <span className="font-mono">bearerAuth</span>: enter full key value (without the word
            &nbsp;<span className="font-mono">Bearer</span>).
          </li>
          <li>
            <span className="font-mono">apiKeyAuth</span>: same key value in
            &nbsp;<span className="font-mono">x-api-key</span>.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 grid gap-2 text-sm">
        <div className="font-medium">ScanRook CLI quickstart</div>
        <pre className="text-xs rounded border border-black/10 dark:border-white/10 p-3 overflow-auto bg-black/5 dark:bg-white/5">{`scanrook auth login --api-key <API_KEY>
scanrook limits
scanrook scan --file ./artifact.tar --format json --out report.json`}</pre>
      </div>

      <SwaggerDocs />
    </div>
  );
}
