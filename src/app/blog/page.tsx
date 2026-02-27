import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Blog | ${APP_NAME}`,
  description: "Product notes, launch updates, and technical posts from ScanRook.",
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14 grid gap-8">
      <section className="surface-card p-8 grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">ScanRook Blog</h1>
        <p className="text-sm muted">
          Product updates, launch notes, and technical deep-dives.
        </p>
      </section>

      <section className="surface-card p-8 grid gap-2">
        <div className="text-xs uppercase tracking-wide muted">Launch</div>
        <h2 className="text-2xl font-semibold tracking-tight">
          <Link href="/blog/why-we-built-scanrook" className="hover:underline">
            Why We Built ScanRook
          </Link>
        </h2>
        <p className="text-sm muted">
          Why we chose a local-first scanner architecture with optional cloud enrichment.
        </p>
        <div>
          <Link href="/blog/why-we-built-scanrook" className="btn-secondary inline-flex">
            Read post
          </Link>
        </div>
      </section>
    </main>
  );
}
