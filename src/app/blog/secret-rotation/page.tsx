import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-18";

const title = `Secret Rotation: How to Do It Without Breaking Things | ${APP_NAME}`;
const description =
  "A practical guide to secret rotation: the dual-credential pattern, sensible intervals, automating rotation in Kubernetes, and what to do after a leak.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "secret rotation",
    "credential rotation",
    "automated secret rotation",
    "api key rotation",
    "kubernetes secret rotation",
    "rotate database credentials",
    "dual credential rotation",
    "secret rotation policy",
    "short lived credentials",
    "secret rotation best practices",
  ],
  alternates: { canonical: "/blog/secret-rotation" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/secret-rotation",
    images: ["/blog/secret-rotation.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/secret-rotation.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Secret Rotation: How to Do It Without Breaking Things",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/secret-rotation",
  image: "https://scanrook.io/blog/secret-rotation.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is secret rotation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Secret rotation is the practice of replacing credentials — API keys, database passwords, signing keys, service account tokens — with new values on a regular schedule or in response to an event, and retiring the old values so they can no longer be used. The goal is to bound how long a leaked credential stays useful.",
      },
    },
    {
      "@type": "Question",
      name: "How often should secrets be rotated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on blast radius and on whether rotation is automated. Short-lived credentials issued on demand, measured in minutes or hours, are the strongest option and should be the default where the platform supports them. Long-lived static credentials that cannot be automated are usually rotated on a defined periodic schedule, with the interval set by the risk of the system they protect.",
      },
    },
    {
      "@type": "Question",
      name: "How do you rotate a secret without downtime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the dual-credential pattern. Create a second valid credential alongside the first, roll consumers over to the new one, verify that the old credential has no remaining traffic, and only then revoke it. Every credential the system supports having two of can be rotated with zero downtime this way.",
      },
    },
    {
      "@type": "Question",
      name: "What should you rotate after a credential leaks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The leaked credential itself, immediately, plus anything it could have been used to read. If the exposed key had access to a secret store, treat every secret it could reach as compromised. Rotation without that second step often leaves the attacker holding a credential you never invalidated.",
      },
    },
    {
      "@type": "Question",
      name: "Does rotating a secret remove it from a container image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. If a credential was baked into an image layer, it stays in that layer forever, and deleting the file in a later layer does not remove it from the earlier one. Rotation is what makes the embedded value useless; rebuilding the image is what stops you from shipping it again.",
      },
    },
  ],
};

export default function Page() {
  if (!isPublished({ publishDate: PUBLISH_DATE })) notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">Best practices</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Secret Rotation: How to Do It Without Breaking Things
          </h1>
          <p className="text-sm muted">Published December 18, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Secret rotation is one of those controls everyone agrees with and almost nobody does
            consistently, because the first attempt usually causes an outage and the team quietly
            stops. The fix is not more discipline &mdash; it is a rotation design that allows two
            valid credentials at once, so replacing one is a routine deploy instead of a cutover.
          </p>
        </header>

        <img
          src="/blog/secret-rotation.jpg"
          alt="Secret rotation cycle replacing credentials around a secure core"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What rotation buys you</h2>
          <p className="text-sm muted">
            Rotation does not prevent a credential from leaking. It bounds the damage when one does.
            A static database password that has been in a CI variable since 2021 is useful to an
            attacker forever; the same password on a 30-day rotation is useful for at most 30 days,
            and one issued on demand with a one-hour lease is barely useful at all.
          </p>
          <p className="text-sm muted">
            That framing matters because it tells you where rotation is worth the effort. The
            question is not &ldquo;is this secret sensitive?&rdquo; but &ldquo;if this value appeared
            in a public repository tomorrow, how long would it stay dangerous, and what could it
            reach?&rdquo; Credentials with a wide blast radius &mdash; cloud provider root keys,
            registry push credentials, signing keys, anything that can read other secrets &mdash;
            deserve the shortest lifetimes and the most automation.
          </p>
          <p className="text-sm muted">
            Rotation is also the only honest response to an unknown exposure. When a laptop is lost,
            a contractor offboards, or a log aggregator turns out to have been capturing request
            headers, you cannot prove nothing leaked. Rotating is how you make the question moot.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The dual-credential pattern</h2>
          <p className="text-sm muted">
            Almost every rotation outage has the same cause: someone replaced a single credential in
            one place while consumers were still using the old value. The pattern that avoids this is
            to make two credentials valid at the same time and overlap their validity windows.
          </p>

          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 720 230"
                role="img"
                aria-label="Rotation timeline showing credential A active, then an overlap window where both A and B are valid, then A revoked and only B active"
                className="w-full"
                style={{ minWidth: 600 }}
              >
                <line x1={70} y1={186} x2={700} y2={186} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />

                {[
                  { x: 70, label: "issue B" },
                  { x: 300, label: "roll consumers" },
                  { x: 470, label: "verify no traffic" },
                  { x: 610, label: "revoke A" },
                ].map((t) => (
                  <g key={t.label}>
                    <line x1={t.x} y1={180} x2={t.x} y2={192} stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
                    <text x={t.x} y={210} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.7}>
                      {t.label}
                    </text>
                  </g>
                ))}

                {/* credential A bar */}
                <rect x={10} y={44} width={600} height={34} rx={6} fill="currentColor" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.4} />
                <text x={26} y={66} fontSize="12" fontWeight="600" fill="currentColor">
                  credential A
                </text>
                <text x={520} y={66} fontSize="10.5" fill="currentColor" fillOpacity={0.65}>
                  revoked
                </text>

                {/* credential B bar */}
                <rect
                  x={70}
                  y={98}
                  width={640}
                  height={34}
                  rx={6}
                  fill="var(--dg-accent,#2563eb)"
                  fillOpacity={0.16}
                  stroke="currentColor"
                  strokeOpacity={0.4}
                />
                <text x={86} y={120} fontSize="12" fontWeight="600" fill="currentColor">
                  credential B
                </text>

                {/* overlap band */}
                <rect x={70} y={30} width={540} height={116} fill="currentColor" fillOpacity={0.04} />
                <text x={340} y={22} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>
                  overlap window &mdash; both credentials accepted
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              The dual-credential pattern. The overlap window is the whole trick: nothing has to be
              swapped atomically, and rollback is just &ldquo;keep using A.&rdquo;
            </figcaption>
          </figure>

          <p className="text-sm muted">The sequence is always the same four steps:</p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-1.5">
            <li>
              <strong>Issue.</strong> Create the new credential. Do not touch the old one. Both are
              now valid.
            </li>
            <li>
              <strong>Distribute.</strong> Push the new value into the secret store and roll consumers
              &mdash; a deployment restart, a sidecar refresh, a config reload.
            </li>
            <li>
              <strong>Verify.</strong> Confirm the old credential has stopped being used. This is the
              step people skip, and it is the one that makes revocation safe. Most providers expose a
              last-used timestamp; databases can be checked by connection user.
            </li>
            <li>
              <strong>Revoke.</strong> Delete or disable the old credential. Until you do, rotation has
              accomplished nothing &mdash; the leaked value still works.
            </li>
          </ol>
          <p className="text-sm muted">
            Systems that only permit one credential force a hard cutover. Where that is unavoidable,
            introduce an indirection you control: a service account whose key can be rotated, or a
            proxy that holds the single credential and issues per-consumer tokens.
          </p>
        </section>

        <img
          src="/blog/secret-rotation-2.jpg"
          alt="Layered secret store distributing rotated credentials to services"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Choosing rotation intervals</h2>
          <p className="text-sm muted">
            There is no universally correct interval, and any specific number you see quoted is
            someone&apos;s policy rather than a law. What is defensible is a tiering rule: shorter
            lifetimes for wider blast radius, and dramatically shorter lifetimes wherever rotation is
            automated.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Credential type</th>
                  <th className="text-left py-2 pr-4 font-semibold">Preferred approach</th>
                  <th className="text-left py-2 font-semibold">Fallback if static</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Cloud workload identity</td>
                  <td className="py-2 pr-4 align-top">OIDC federation, no stored key at all</td>
                  <td className="py-2 align-top">Short periodic rotation, alerting on age</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Database credentials</td>
                  <td className="py-2 pr-4 align-top">Dynamic per-lease users from a secret manager</td>
                  <td className="py-2 align-top">Dual-user rotation on a fixed schedule</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Third-party API keys</td>
                  <td className="py-2 pr-4 align-top">Provider-issued key pairs with overlap</td>
                  <td className="py-2 align-top">Scheduled rotation; scope keys narrowly</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Registry pull credentials</td>
                  <td className="py-2 pr-4 align-top">Cloud IAM or a credential helper</td>
                  <td className="py-2 align-top">Rotate the pull secret; see the note below</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Signing keys</td>
                  <td className="py-2 pr-4 align-top">Keyless / ephemeral keys with a transparency log</td>
                  <td className="py-2 align-top">Long-lived in an HSM, rotated on a key ceremony</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The pattern in that table is worth stating plainly: the best rotation is the rotation you
            do not have to schedule. Workload identity federation and dynamic credentials replace
            &ldquo;rotate this every N days&rdquo; with &ldquo;this credential expires in an
            hour.&rdquo; Where the platform supports it, that is a bigger win than any interval you
            could pick.
          </p>
          <p className="text-sm muted">
            Registry credentials are a good example of the trap, because Kubernetes copies them into
            every namespace that needs them. If you maintain those by hand, rotation means finding
            every copy &mdash; which is exactly the problem covered in our guide to{" "}
            <Link href="/blog/image-pull-secrets" className="underline">
              image pull secrets
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Automating rotation in Kubernetes</h2>
          <p className="text-sm muted">
            In a cluster, the hard part of rotation is distribution: a Secret is consumed by pods that
            may not notice it changed. Environment variables sourced from a Secret are read once at
            container start and never update; mounted Secret volumes do get refreshed by the kubelet,
            but only if your application re-reads the file.
          </p>
          <p className="text-sm muted">
            The common answer is to keep the source of truth outside the cluster and let a controller
            sync it in. The{" "}
            <Link href="/blog/external-secrets-operator" className="underline">
              External Secrets Operator
            </Link>{" "}
            does this with a refresh interval, so a rotation in your secret manager propagates
            automatically:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: api-db
  namespace: payments
spec:
  refreshInterval: 15m          # re-reads the provider on this cadence
  secretStoreRef:
    name: cluster-secret-store
    kind: ClusterSecretStore
  target:
    name: api-db                # the Kubernetes Secret it manages
  data:
    - secretKey: password
      remoteRef:
        key: prod/payments/db
        property: password`}
          </pre>
          <p className="text-sm muted">
            Syncing the Secret is only half of it. Workloads still need to pick up the new value, so
            pair the sync with a restart trigger &mdash; a checksum annotation on the pod template, or
            a reloader controller that watches the Secret and rolls the Deployment. Without that, the
            Secret is current and your pods are not.
          </p>
          <p className="text-sm muted">
            If your secrets live in git rather than a manager,{" "}
            <Link href="/blog/sealed-secrets" className="underline">
              Sealed Secrets
            </Link>{" "}
            keeps them encrypted at rest, but rotation then means re-sealing and committing, which is
            a manual loop. Either way, the underlying storage caveats in{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>{" "}
            still apply: a Secret is base64-encoded, not encrypted, unless you have enabled encryption
            at rest in etcd.
          </p>
        </section>

        <img
          src="/blog/secret-rotation-3.jpg"
          alt="Overlapping credential validity windows during secret rotation"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rotation after a leak is different</h2>
          <p className="text-sm muted">
            Scheduled rotation is a slow, safe process. Incident rotation is not, and treating them
            the same is how organisations end up rotating one key while the attacker keeps using three
            others.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Revoke first, restore second.</strong> The overlap window exists to prevent
              downtime during planned work. During an incident, an outage is cheaper than continued
              access.
            </li>
            <li>
              <strong>Expand outward.</strong> Ask what the leaked credential could read. If it had
              access to a secret store, CI variables, or a cloud metadata endpoint, everything it could
              reach is now suspect too.
            </li>
            <li>
              <strong>Check where it was used, not just where it was stored.</strong> Credentials
              spread into logs, CI caches, container layers, backups, and developer shells. Rotation
              invalidates all of those copies at once, which is precisely why it is the right first
              move.
            </li>
            <li>
              <strong>Then find how it got out.</strong> Repository history scanning with{" "}
              <Link href="/blog/gitleaks-secret-scanning" className="underline">
                Gitleaks
              </Link>{" "}
              or{" "}
              <Link href="/blog/trufflehog-secret-scanning" className="underline">
                TruffleHog
              </Link>{" "}
              usually tells you whether the exposure was a commit, and our{" "}
              <Link href="/blog/secret-scanning-guide" className="underline">
                secret scanning guide
              </Link>{" "}
              covers putting detection in front of the next one.
            </li>
          </ul>
          <p className="text-sm muted">
            One detail catches people repeatedly: a credential baked into a container image layer is
            permanent. Removing the file in a later layer does not remove it from the earlier one, and
            anyone who can pull the image can extract it. Rotation is what neutralises the embedded
            value; rebuilding the image is what stops you from distributing it again.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A rotation programme that survives contact</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Inventory before policy.</strong> You cannot rotate what you have not written
              down. Start with a list of every credential, its owner, and where it is consumed.
            </li>
            <li>
              <strong>Automate the top tier first.</strong> Rotating the ten highest-blast-radius
              credentials automatically beats a manual policy covering four hundred.
            </li>
            <li>
              <strong>Alert on age, not on schedule.</strong> A monitor that fires when any credential
              exceeds its maximum age catches drift; a calendar reminder does not.
            </li>
            <li>
              <strong>Practise it.</strong> Rotate in staging on the same cadence so the runbook is
              exercised before you need it under pressure.
            </li>
            <li>
              <strong>Make revocation the definition of done.</strong> A rotation that stops at
              &ldquo;new credential issued&rdquo; has changed nothing about your exposure.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a vulnerability scanner, not a secret manager &mdash; we are not going to
            pretend it rotates your database passwords. Where it helps is the artifact side of the
            problem. When you scan an image or a source archive, ScanRook builds a full file inventory
            alongside the package findings, so after a rotation event you can check which of your
            images actually contain the config file or credential path in question, rather than
            guessing which builds need to be rebuilt and re-promoted.
          </p>
          <p className="text-sm muted">
            That pairs naturally with a{" "}
            <Link href="/blog/image-promotion" className="underline">
              promotion pipeline
            </Link>
            : rotate the credential, rebuild the affected images, and promote the new digests, with a
            scan at each gate. The rotation makes the old value useless; the rebuild makes sure you are
            not still shipping it.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is secret rotation?</h3>
              <p className="text-sm muted mt-1">
                Replacing credentials with new values on a schedule or in response to an event, and
                revoking the old values so a leaked credential has a bounded useful life.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I rotate without downtime?</h3>
              <p className="text-sm muted mt-1">
                Issue a second credential, roll consumers onto it, verify the old one has no remaining
                traffic, then revoke. The overlap window removes the need for an atomic cutover.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is a short interval better than automation?</h3>
              <p className="text-sm muted mt-1">
                No. Automated short-lived credentials beat any manual interval, because the failure
                mode of a manual policy is that it silently stops being followed.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does rotation fix a secret in an image layer?</h3>
              <p className="text-sm muted mt-1">
                It neutralises the value, but the bytes stay in the layer. You still need to rebuild
                and re-promote the image so the embedded credential is no longer distributed.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what is actually inside your images</h3>
          <p className="text-sm muted leading-relaxed">
            Scan an image with ScanRook to get a full file and package inventory alongside findings
            from OSV, NVD, and Red Hat OVAL &mdash; useful when a rotation event turns into &ldquo;which
            builds do we have to rebuild?&rdquo;
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">Read the docs</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/external-secrets-operator" className="underline">
              External Secrets Operator
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              Secret Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
