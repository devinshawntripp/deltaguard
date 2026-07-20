import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-10";

const title = `Helm Security: Charts, Values and Release Hardening | ${APP_NAME}`;
const description =
  "Helm security in practice: verify chart provenance, pin dependencies and image digests, keep secrets out of values, and scan rendered manifests before install.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "helm security",
    "helm chart security",
    "helm security best practices",
    "helm chart provenance",
    "helm secrets",
    "helm template scanning",
    "helm 3 security",
    "kubernetes helm hardening",
    "helm oci registry",
    "chart dependency pinning",
  ],
  alternates: { canonical: "/blog/helm-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/helm-security",
    images: ["/blog/helm-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/helm-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Helm Security: Charts, Values and Release Hardening",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/helm-security",
  image: "https://scanrook.io/blog/helm-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Helm 3 more secure than Helm 2?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Substantially, because Helm 3 removed Tiller. In Helm 2, a cluster-side component typically ran with broad permissions and any client that could reach it inherited them. Helm 3 is a client-side tool that acts with the caller's own kubeconfig credentials, so Kubernetes RBAC applies normally. That moves the security question from Tiller to what the chart contains and who is allowed to install it.",
      },
    },
    {
      "@type": "Question",
      name: "How do I verify a Helm chart is authentic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Helm supports provenance files: helm package --sign produces a .prov file containing a signed hash of the chart, and helm verify or helm install --verify checks it against a keyring you control. For charts stored in an OCI registry you can additionally sign the artifact with Sigstore Cosign and verify the signature before pulling. Either way the trust anchor is a key you manage, not the repository host.",
      },
    },
    {
      "@type": "Question",
      name: "Should secrets go in values.yaml?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Values files end up in version control, in CI logs, in helm get values output, and inside the release record stored in the cluster. Use an external secret manager surfaced through the External Secrets Operator, a sealed-secrets style encryption scheme, or a plugin that decrypts at install time, and have the chart reference an existing Secret by name rather than templating the value itself.",
      },
    },
    {
      "@type": "Question",
      name: "Can I scan a Helm chart for misconfigurations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, by rendering it first. Run helm template with the exact values you will install, then pass the resulting manifests to a Kubernetes configuration scanner such as Checkov, KICS, or a policy engine like Conftest. Scanning the raw templates directly is unreliable because the security-relevant fields are usually behind conditionals that only resolve once values are applied.",
      },
    },
    {
      "@type": "Question",
      name: "Does Helm check the container images a chart deploys?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Helm renders and applies manifests; it has no view into the contents of the images those manifests reference. A chart can be signed, well configured, and fully policy compliant while pulling an image with critical vulnerabilities. Image scanning is a separate control that belongs in your build pipeline and at admission.",
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
            Helm Security: Charts, Values and Release Hardening
          </h1>
          <p className="text-sm muted">Published December 10, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Helm security is easy to under-think because Helm feels like a package manager and
            packages feel inert. They are not. A chart is a template that renders arbitrary
            Kubernetes objects &mdash; RBAC bindings, host mounts, privileged pods &mdash; and
            installing one applies them with your credentials. Here is what actually needs
            controlling, in the order it matters.
          </p>
        </header>

        <img
          src="/blog/helm-security.jpg"
          alt="Helm security: hardening chart templating and Kubernetes release deployment"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What changed with Helm 3 &mdash; and what did not
          </h2>
          <p className="text-sm muted">
            The single biggest Helm security question used to be Tiller. In Helm 2, a server-side
            component ran in the cluster, commonly with cluster-admin, and anyone who could talk to
            it effectively had those rights regardless of their own Kubernetes permissions. Helm 3
            deleted that architecture. The CLI now talks to the API server directly using the
            caller&apos;s kubeconfig, so normal RBAC applies and release state is stored as Secrets in
            the release namespace.
          </p>
          <p className="text-sm muted">
            What did not change: a chart is still executable templating that produces manifests, and
            the person running <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm install</code>{" "}
            still lends the chart their authority. If your deploy identity is cluster-admin &mdash;
            which many CI service accounts quietly are &mdash; then every chart you install is
            cluster-admin for the duration of that install. Scope the deploying identity to the
            namespaces and resource kinds it genuinely needs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The four gates</h2>
          <p className="text-sm muted">
            It helps to think of a Helm release as passing through four points where a control can be
            applied. Missing gates are where incidents come from.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 260"
              role="img"
              aria-label="Layer diagram of the Helm release path: chart source, rendered manifests, admission control, and running workload, each with its associated security control"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="hs-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { y: 12, stage: "Chart source", control: "Provenance verify, pinned dependencies, trusted repo" },
                { y: 74, stage: "helm template", control: "Config scan of rendered manifests, secrets check" },
                { y: 136, stage: "Admission", control: "Pod Security Admission, policy engine, image signature" },
                { y: 198, stage: "Running release", control: "Runtime monitoring, re-scan images on new advisories" },
              ].map((r, i) => (
                <g key={r.stage}>
                  <rect
                    x={8}
                    y={r.y}
                    width={186}
                    height={46}
                    rx={8}
                    fill={i === 1 ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={i === 1 ? 0.14 : 0.05}
                    stroke="currentColor"
                    strokeOpacity={0.4}
                  />
                  <text x={101} y={r.y + 29} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                    {r.stage}
                  </text>
                  <line x1={196} y1={r.y + 23} x2={238} y2={r.y + 23} stroke="currentColor" strokeWidth={1.6} strokeOpacity={0.5} markerEnd="url(#hs-arrow)" />
                  <rect x={246} y={r.y + 6} width={440} height={34} rx={7} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.25} />
                  <text x={262} y={r.y + 28} fontSize="11.5" fill="currentColor" fillOpacity={0.8}>
                    {r.control}
                  </text>
                  {i < 3 && (
                    <line x1={101} y1={r.y + 46} x2={101} y2={r.y + 74} stroke="currentColor" strokeWidth={1.6} strokeOpacity={0.5} markerEnd="url(#hs-arrow)" />
                  )}
                </g>
              ))}
              <text x={101} y={256} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>
                each gate catches what the one above cannot
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The Helm release path. Chart signing proves origin but says nothing about configuration;
            manifest scanning catches configuration but not image contents; admission is the backstop
            for anything applied outside your pipeline.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Gate one: trust the chart you are installing
          </h2>
          <p className="text-sm muted">
            A chart pulled from a public repository is third-party code with cluster-level effects.
            Two mechanisms establish origin. Helm&apos;s built-in provenance signs a chart archive
            with a PGP key and writes a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.prov</code>{" "}
            file next to it:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`# publisher side
helm package --sign --key 'release@example.com' --keyring ~/.gnupg/secring.gpg ./mychart

# consumer side — fails the install if the signature or hash does not match
helm install app ./mychart-1.4.2.tgz --verify --keyring ./trusted.gpg

# verify an archive without installing
helm verify mychart-1.4.2.tgz --keyring ./trusted.gpg`}</code></pre>
          <p className="text-sm muted">
            For charts stored as OCI artifacts &mdash; now the common distribution path &mdash; you
            can also sign the pushed artifact with Sigstore Cosign and verify before pulling, the
            same workflow described in{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              container signing with Cosign
            </Link>
            . Either way the point is that verification uses <em>your</em> key material. Signing that
            you never check is decoration.
          </p>
          <p className="text-sm muted">
            Then pin what the chart pulls in. Chart dependencies declared in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Chart.yaml</code>{" "}
            can use version ranges; commit the generated{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Chart.lock</code>{" "}
            so a rebuild resolves the same subcharts, and prefer exact versions over{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">^</code>{" "}
            ranges for anything security-relevant. Vendoring critical charts into your own repository
            is a legitimate choice for high-blast-radius infrastructure.
          </p>
        </section>

        <img
          src="/blog/helm-security-2.jpg"
          alt="Rendering Helm chart templates into Kubernetes manifests for security review"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Gate two: scan what the chart actually renders
          </h2>
          <p className="text-sm muted">
            The security-relevant fields in a chart &mdash;{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">privileged</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostNetwork</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPath</code>{" "}
            mounts, ClusterRole rules &mdash; almost always sit behind conditionals. Reading the
            templates tells you what is possible; rendering tells you what you are about to apply.
            Always scan the rendered output with the values you will really use:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`# render exactly what will be applied
helm template app ./mychart \\
  --values values.prod.yaml \\
  --namespace payments > rendered.yaml

# see the diff against the live release before you commit to it
helm diff upgrade app ./mychart --values values.prod.yaml   # helm-diff plugin

# feed the rendered manifests to a config scanner
checkov -f rendered.yaml --framework kubernetes`}</code></pre>
          <p className="text-sm muted">
            Both{" "}
            <Link href="/blog/checkov" className="underline">
              Checkov
            </Link>{" "}
            and{" "}
            <Link href="/blog/kics" className="underline">
              KICS
            </Link>{" "}
            handle Kubernetes manifests well, and a policy engine such as Conftest lets you encode
            organisation-specific rules. Grep the rendered file for the handful of things that should
            never appear without a deliberate exception:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">securityContext.privileged: true</code> or a missing <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot</code></li>
            <li><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPath</code> volumes, especially <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code> or the containerd socket</li>
            <li><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostNetwork</code>, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPID</code>, or added capabilities such as <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SYS_ADMIN</code></li>
            <li>ClusterRoles granting <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">*</code> verbs or secrets read across all namespaces</li>
            <li>Images referenced by mutable tag rather than digest</li>
            <li>Helm hooks &mdash; they run as pods too, and are easy to overlook in review</li>
          </ul>
          <p className="text-sm muted">
            Our guide to{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              Kubernetes security contexts
            </Link>{" "}
            covers what good values look like for each of those fields.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Keep secrets out of values
          </h2>
          <p className="text-sm muted">
            Values files leak by design: they are committed, printed by{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm get values</code>,
            echoed in CI logs, and stored in the release Secret that Helm writes into the cluster.
            Kubernetes Secrets are base64-encoded, not encrypted, unless you have configured
            encryption at rest &mdash; so a database password that started in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">values.yaml</code>{" "}
            ends up readable in several places at once.
          </p>
          <p className="text-sm muted">
            The durable patterns are: have the chart reference an{" "}
            <em>existing</em> Secret by name and create that Secret out of band; pull values from a
            real secret manager with the{" "}
            <Link href="/blog/external-secrets-operator" className="underline">
              External Secrets Operator
            </Link>
            ; or encrypt the values file so the ciphertext is safe to commit, as with{" "}
            <Link href="/blog/sealed-secrets" className="underline">
              Sealed Secrets
            </Link>{" "}
            or a SOPS-based Helm plugin. Whichever you pick, add a secret scanner to the repository
            so a plaintext credential in a values file fails the pull request rather than shipping.
          </p>
        </section>

        <img
          src="/blog/helm-security-3.jpg"
          alt="Helm chart dependency tree with pinned subchart versions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Gate three and four: admission and runtime
          </h2>
          <p className="text-sm muted">
            Pipeline checks only cover what goes through the pipeline. Anyone with credentials can
            run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm install</code>{" "}
            from a laptop, and an emergency change at 2am rarely takes the scenic route. Admission
            control is the enforcement point that does not care how the manifest arrived: enable{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            at the namespace level, and add a policy engine or{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              image-scanning admission webhook
            </Link>{" "}
            for rules the built-in standards do not express.
          </p>
          <p className="text-sm muted">
            Finally, a release that was clean at install time does not stay clean. New advisories
            publish against packages already running in your cluster, which is why{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              scanning workloads in the cluster
            </Link>{" "}
            on a schedule catches what a one-off pre-install check cannot.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The image is not part of the chart
          </h2>
          <p className="text-sm muted">
            This is the gap that surprises people. Helm verifies charts; it has no visibility into
            what is inside the container images those charts reference. A chart can be signed by a
            key you trust, pass every configuration policy, and still deploy an image carrying a
            critical vulnerability in its base layer. Pin images by digest rather than tag so the
            thing you scanned is the thing that runs:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`image:
  repository: registry.example.com/payments/api
  # tag: "1.9"                      # mutable — a rebuild changes what runs
  digest: "sha256:9c1b2e7f5a...d40c"  # immutable — matches what you scanned`}</code></pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Reviewing an upstream chart before you adopt it
          </h2>
          <p className="text-sm muted">
            Adopting a third-party chart for a database, ingress controller, or monitoring stack is a
            supply chain decision, and it deserves the same review a dependency would get. A
            fifteen-minute pass over these questions catches almost everything that matters:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Who publishes it, and is it signed?</strong> A chart maintained by the project
              itself and a chart maintained by an aggregator are different trust propositions. Check
              whether a provenance file or Cosign signature exists at all before you plan to verify
              one.
            </li>
            <li>
              <strong>What cluster-scoped objects does it create?</strong> ClusterRoles,
              ClusterRoleBindings, CRDs, MutatingWebhookConfigurations and ValidatingWebhookConfigurations
              all reach beyond the release namespace. A webhook in particular sits in the path of
              every matching API request in the cluster.
            </li>
            <li>
              <strong>Does it need node-level access?</strong> DaemonSets with host mounts are common
              and often legitimate for agents, but each one is an escalation path if the image is ever
              compromised.
            </li>
            <li>
              <strong>How deep is the dependency tree?</strong> Subcharts pull in their own subcharts,
              and values flow down into templates you never read.{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm dependency list</code>{" "}
              plus the rendered output is the ground truth.
            </li>
            <li>
              <strong>What do the hooks do?</strong> Pre-install and post-install hooks are pods that
              run with the chart&apos;s service account, often before anyone is watching. They are
              also easy to skip in a diff review because they sit outside the main workload templates.
            </li>
            <li>
              <strong>Does the chart call <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">lookup</code>?</strong>{" "}
              The template function reads live cluster objects at render time, using your credentials.
              Legitimate for preserving generated passwords across upgrades, worth noticing anywhere
              else.
            </li>
          </ul>
          <p className="text-sm muted">
            Write the answers down once and re-check them when you bump the chart version. Most of
            the risk in an upgrade is not the application code &mdash; it is a new object kind or a
            widened RBAC rule that arrives quietly in the diff.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            A practical Helm security checklist
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>The identity running <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm install</code> is namespace-scoped, not cluster-admin.</li>
            <li>Charts come from a repository you control or mirror, and are verified against your keyring.</li>
            <li><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Chart.lock</code> is committed and subchart versions are pinned.</li>
            <li>Rendered manifests are scanned in CI with the production values file.</li>
            <li>No credentials in any values file; a secret scanner enforces it on every pull request.</li>
            <li>Images referenced by digest, and scanned before the release is promoted.</li>
            <li>Namespaces enforce a Pod Security Standard so a bad chart is rejected, not merely flagged.</li>
            <li>Upgrades reviewed with a rendered diff rather than a version bump alone.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook covers the layer Helm deliberately does not: the contents of the images a chart
            deploys. Extract the image references from your rendered manifests, save each image as a
            tarball, and scan it &mdash; ScanRook reads the real package databases inside the image
            and matches every component against OSV, NVD, and Red Hat OVAL, so findings arrive with a
            source and a confidence tier instead of an unattributed count. That pairs naturally with
            the config scanning above: Checkov tells you the pod is privileged, ScanRook tells you the
            OpenSSL inside it is three years old. Details are in the{" "}
            <Link href="/docs" className="underline">docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is Helm 3 safer than Helm 2?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; removing Tiller means Helm acts with the caller&apos;s own RBAC instead of
                a privileged in-cluster component. The remaining risk is what charts contain.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I verify a chart?</h3>
              <p className="text-sm muted mt-1">
                Use provenance files with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm verify</code>{" "}
                or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--verify</code>{" "}
                against your keyring, and Cosign signatures for OCI-hosted charts.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I scan the chart directly?</h3>
              <p className="text-sm muted mt-1">
                Render it first with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm template</code>{" "}
                and the real values, then scan the manifests. Raw templates hide too much behind
                conditionals.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where should secrets live?</h3>
              <p className="text-sm muted mt-1">
                Anywhere but a values file &mdash; an external secret manager, an encrypted values
                file, or a pre-created Secret the chart references by name.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the images your charts deploy</h3>
          <p className="text-sm muted leading-relaxed">
            Configuration scanning and image scanning answer different questions. Run ScanRook over
            the images referenced in your rendered manifests and see what is actually inside them.
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
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
