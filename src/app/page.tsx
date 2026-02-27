import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { APP_DESCRIPTION } from "@/lib/brand";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && !session.revoked) {
    redirect("/dashboard");
  }

  const installCmd = "curl -fsSL https://scanrook.sh/install | bash";
  const authCmd = "scanrook auth login --base https://scanrook.io";
  const scanCmd = "scanrook scan ./artifact.tar --mode deep";

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 grid gap-10">
      <section className="surface-card p-8 grid gap-5">
        <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
          Free CLI + paid platform
        </div>
        <h1>
          <BrandLogo markClassName="h-12 w-12 rounded-xl" nameClassName="text-4xl font-semibold tracking-tight" />
        </h1>
        <p className="text-base muted max-w-3xl">{APP_DESCRIPTION}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/signin" className="btn-primary">Sign in</Link>
          <Link href="/docs" className="btn-secondary">Docs</Link>
          <a href="https://scanrook.sh" className="btn-secondary">CLI home</a>
        </div>
      </section>

      <section className="surface-card p-8 grid gap-5">
        <h2 className="text-2xl font-semibold tracking-tight">Install Free Scanner</h2>
        <p className="text-sm muted">Run locally with no login required. Authenticate only for cloud enrichment and org workflows.</p>
        <div className="grid gap-3">
          <CommandBlock label="Install">{installCmd}</CommandBlock>
          <CommandBlock label="Run a scan">{scanCmd}</CommandBlock>
          <CommandBlock label="Optional auth for cloud features">{authCmd}</CommandBlock>
        </div>
      </section>

      <section className="surface-card p-8 grid gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">What You Get</h2>
        <ul className="grid gap-1 text-sm muted">
          <li>Installed-state-first findings for containers and ISO artifacts.</li>
          <li>Workflow timeline with stage-by-stage visibility.</li>
          <li>Paginated findings, file tree, package explorer, and org API keys.</li>
        </ul>
      </section>
    </main>
  );
}

function CommandBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="text-xs font-semibold uppercase tracking-wide muted">{label}</div>
      <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}
