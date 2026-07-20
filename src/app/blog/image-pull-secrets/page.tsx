import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-20";

const title = `Image Pull Secrets in Kubernetes: Setup and Pitfalls | ${APP_NAME}`;
const description =
  "How Kubernetes image pull secrets work: creating dockerconfigjson secrets, attaching them via service accounts, credential resolution order, and rotation.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "image pull secrets",
    "kubernetes image pull secret",
    "imagePullSecrets",
    "dockerconfigjson secret",
    "private registry kubernetes",
    "kubectl create secret docker-registry",
    "service account image pull secret",
    "ImagePullBackOff private registry",
    "kubelet credential provider",
    "registry authentication kubernetes",
  ],
  alternates: { canonical: "/blog/image-pull-secrets" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/image-pull-secrets",
    images: ["/blog/image-pull-secrets.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/image-pull-secrets.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Image Pull Secrets in Kubernetes: Setup, Scope, and Pitfalls",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/image-pull-secrets",
  image: "https://scanrook.io/blog/image-pull-secrets.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are image pull secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Image pull secrets are Kubernetes Secrets of type kubernetes.io/dockerconfigjson that hold registry credentials. The kubelet uses them to authenticate when pulling a container image from a private registry. A pod references them through its imagePullSecrets field, or inherits them from its service account.",
      },
    },
    {
      "@type": "Question",
      name: "Why does my pod get ImagePullBackOff even though the secret exists?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most common cause is scope: Secrets are namespaced, so a pull secret in the default namespace does nothing for a pod in another namespace. The next most common causes are a registry hostname in the secret that does not match the image reference exactly, and a pod that never references the secret because it uses a different service account.",
      },
    },
    {
      "@type": "Question",
      name: "Should I attach pull secrets to pods or to service accounts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Service accounts, in most cases. Adding imagePullSecrets to a service account means every pod using it inherits the credential without each manifest repeating it, which makes rotation a single edit per namespace instead of an edit per workload.",
      },
    },
    {
      "@type": "Question",
      name: "Are image pull secrets encrypted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not by default. Like any Kubernetes Secret, the registry credential is stored base64-encoded in etcd, which is encoding rather than encryption. Enabling encryption at rest for Secrets, and restricting who can read them with RBAC, are separate steps you have to take deliberately.",
      },
    },
    {
      "@type": "Question",
      name: "Can a pod use an image it has no credentials for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, if the image is already cached on the node and the pull policy allows reuse. Any pod scheduled to that node can then run it without presenting credentials. The AlwaysPullImages admission controller closes this gap by forcing a pull, and therefore an authorization check, for every pod.",
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
            Image Pull Secrets in Kubernetes: Setup, Scope, and Pitfalls
          </h1>
          <p className="text-sm muted">Published December 20, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Image pull secrets are how a Kubernetes cluster authenticates to a private container
            registry. They are conceptually simple &mdash; a Secret holding a Docker config file
            &mdash; and they are still one of the more reliable sources of a confusing
            ImagePullBackOff, because their scoping rules and resolution order are not obvious from
            the manifest.
          </p>
        </header>

        <img
          src="/blog/image-pull-secrets.jpg"
          alt="Kubernetes nodes authenticating to a private container registry with image pull secrets"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What an image pull secret actually is</h2>
          <p className="text-sm muted">
            An image pull secret is a Kubernetes Secret with the type{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              kubernetes.io/dockerconfigjson
            </code>
            . Its single data key,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              .dockerconfigjson
            </code>
            , contains the same JSON structure that{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              ~/.docker/config.json
            </code>{" "}
            uses: a map of registry hostnames to credentials.
          </p>
          <p className="text-sm muted">
            The important detail is who consumes it. The Secret is not read by your application and
            not read by the API server for authorization &mdash; it is read by the{" "}
            <strong>kubelet</strong> on the node where the pod is scheduled, at the moment it asks the
            container runtime to pull the image. That is why a pull secret failure surfaces as an
            event on the pod rather than an error from{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl apply</code>.
          </p>
          <p className="text-sm muted">
            An older type,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              kubernetes.io/dockercfg
            </code>
            , still exists and holds the legacy pre-1.7 Docker config format. New work should use{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dockerconfigjson</code>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Creating one</h2>
          <p className="text-sm muted">
            The imperative form is the least error-prone, because kubectl assembles the JSON and
            base64 encoding for you:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`kubectl create secret docker-registry regcred \\
  --namespace payments \\
  --docker-server=registry.example.com \\
  --docker-username=ci-puller \\
  --docker-password="$REGISTRY_TOKEN"`}
          </pre>
          <p className="text-sm muted">
            If you already have a working{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">config.json</code>{" "}
            you can wrap it directly, which is handy when the registry uses a credential format that
            the flags do not express cleanly:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`kubectl create secret generic regcred \\
  --namespace payments \\
  --from-file=.dockerconfigjson=$HOME/.docker/config.json \\
  --type=kubernetes.io/dockerconfigjson`}
          </pre>
          <p className="text-sm muted">
            Two things go wrong here often enough to call out. First, the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--docker-server</code>{" "}
            value has to match the registry host in your image reference. An image referenced as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">registry.example.com/team/api:1.4</code>{" "}
            will not match a secret written for{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">https://registry.example.com/v1/</code>{" "}
            in every runtime configuration. Second, if your local config uses a credential helper, the
            file may contain no credential at all &mdash; just a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">credsStore</code>{" "}
            reference that means nothing inside the cluster.
          </p>
        </section>

        <img
          src="/blog/image-pull-secrets-2.jpg"
          alt="Registry credential flowing through authentication during a container image pull"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the kubelet finds a credential</h2>
          <p className="text-sm muted">
            Attaching the secret is where most of the confusion lives, because there are several
            places credentials can come from and they are consulted in order.
          </p>

          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 700 268"
                role="img"
                aria-label="Credential resolution order for a container image pull: pod imagePullSecrets, then service account imagePullSecrets, then node level credential provider, otherwise an anonymous pull"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="ips-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                {[
                  { y: 8, label: "pod.spec.imagePullSecrets", sub: "most specific — per workload", hot: true },
                  { y: 68, label: "serviceAccount.imagePullSecrets", sub: "inherited by every pod using it" },
                  { y: 128, label: "node credential provider", sub: "kubelet plugin / cloud IAM" },
                  { y: 188, label: "anonymous pull", sub: "public images only" },
                ].map((r, i) => (
                  <g key={r.label}>
                    <rect
                      x={40}
                      y={r.y}
                      width={430}
                      height={46}
                      rx={8}
                      fill={r.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={r.hot ? 0.13 : 0.05}
                      stroke="currentColor"
                      strokeOpacity={0.4}
                    />
                    <text x={58} y={30 + r.y - 8} fontSize="13" fontWeight="600" fill="currentColor">
                      {r.label}
                    </text>
                    <text x={58} y={r.y + 38} fontSize="10.5" fill="currentColor" fillOpacity={0.62}>
                      {r.sub}
                    </text>
                    {i < 3 ? (
                      <line
                        x1={255}
                        y1={r.y + 46}
                        x2={255}
                        y2={r.y + 66}
                        stroke="currentColor"
                        strokeWidth={2}
                        markerEnd="url(#ips-arrow)"
                      />
                    ) : null}
                    <text x={488} y={r.y + 30} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                      {i < 3 ? "not found ↓" : "fails if private"}
                    </text>
                  </g>
                ))}

                <line
                  x1={22}
                  y1={12}
                  x2={22}
                  y2={230}
                  stroke="currentColor"
                  strokeOpacity={0.28}
                  strokeWidth={1.5}
                />
                <text
                  x={14}
                  y={130}
                  fontSize="10.5"
                  fill="currentColor"
                  fillOpacity={0.55}
                  transform="rotate(-90 14 130)"
                  textAnchor="middle"
                >
                  checked in order
                </text>
                <text x={255} y={252} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>
                  Illustrative ordering; exact provider behaviour varies by runtime and cloud.
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              Where the kubelet looks for registry credentials, from most specific to least. A pod
              that inherits nothing and hits a private registry produces ImagePullBackOff.
            </figcaption>
          </figure>

          <p className="text-sm muted">The per-pod form is the one you see in most examples:</p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: payments
spec:
  template:
    spec:
      imagePullSecrets:
        - name: regcred
      containers:
        - name: api
          image: registry.example.com/team/api@sha256:9f2c1a...`}
          </pre>
          <p className="text-sm muted">
            The service account form is usually better. Patch the namespace&apos;s service account
            once and every pod that uses it inherits the credential, so a rotation is one edit rather
            than one edit per Deployment:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`kubectl patch serviceaccount default \\
  --namespace payments \\
  -p '{"imagePullSecrets":[{"name":"regcred"}]}'`}
          </pre>
          <p className="text-sm muted">
            Note that this only affects pods created <em>after</em> the patch, and only pods that
            actually use that service account. A workload with its own service account will not pick
            it up, which is a common reason &ldquo;I already set it&rdquo; turns out not to be true.
          </p>
        </section>

        <img
          src="/blog/image-pull-secrets-3.jpg"
          alt="Namespace boundary containing image pull secret copies in a Kubernetes cluster"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The namespace problem</h2>
          <p className="text-sm muted">
            Secrets are namespaced, and there is no built-in way to make one visible cluster-wide.
            That means every namespace that pulls from your private registry needs its own copy of the
            credential &mdash; and every rotation needs to update all of them. On a cluster with forty
            namespaces this is where hand-managed pull secrets stop being viable.
          </p>
          <p className="text-sm muted">There are three reasonable ways out:</p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Node-level credentials.</strong> On managed clusters, the node&apos;s cloud
              identity frequently grants registry read access already, so no Secret is required at
              all. This is the norm for a cloud-native registry such as{" "}
              <Link href="/blog/ecr-image-scanning" className="underline">
                ECR
              </Link>
              , where the node role can be given pull permission directly. Kubernetes also supports
              kubelet credential provider plugins that fetch a short-lived token per pull, which
              removes the stored credential entirely.
            </li>
            <li>
              <strong>A sync controller.</strong> Tools that replicate a Secret into matching
              namespaces keep one source of truth. The{" "}
              <Link href="/blog/external-secrets-operator" className="underline">
                External Secrets Operator
              </Link>{" "}
              can do this from an external secret manager, which also gives you a rotation path.
            </li>
            <li>
              <strong>Robot accounts per team.</strong> If you run{" "}
              <Link href="/blog/harbor-registry" className="underline">
                Harbor
              </Link>{" "}
              or a similar registry, issuing a scoped, read-only robot account per project narrows the
              blast radius of any one leaked pull secret and makes revocation surgical.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Security properties worth knowing</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Base64 is not encryption.</strong> Anyone with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">get secrets</code>{" "}
              in the namespace can decode the registry password in one command. Restrict that verb
              with RBAC and enable encryption at rest, as covered in{" "}
              <Link href="/blog/kubernetes-secrets-security" className="underline">
                Kubernetes secrets security
              </Link>
              .
            </li>
            <li>
              <strong>Cached images bypass the check.</strong> Once an image is present on a node, a
              pod scheduled there can use it without presenting credentials, depending on pull policy.
              The{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">AlwaysPullImages</code>{" "}
              admission controller forces a pull &mdash; and therefore an authorization check &mdash;
              for every pod, at the cost of registry traffic. On multi-tenant clusters it is the right
              trade.
            </li>
            <li>
              <strong>Pull credentials should be read-only.</strong> A pull secret that also has push
              rights turns a compromised workload into a supply-chain problem: the attacker can
              replace the image everyone else pulls.
            </li>
            <li>
              <strong>Never bake registry credentials into an image.</strong> A credential in a layer
              stays in that layer permanently, and deleting the file in a later layer does not remove
              it from the earlier one.
            </li>
            <li>
              <strong>Rotate them like any other credential.</strong> Long-lived registry tokens
              copied into dozens of namespaces are exactly the scenario the{" "}
              <Link href="/blog/secret-rotation" className="underline">
                dual-credential rotation pattern
              </Link>{" "}
              exists for.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Debugging ImagePullBackOff</h2>
          <p className="text-sm muted">
            When a pull fails, the pod events carry the actual error and are the only place worth
            starting:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`kubectl describe pod api-7d9f8-abcde -n payments | tail -20

# confirm the secret exists in the right namespace and has the right type
kubectl get secret regcred -n payments -o jsonpath='{.type}'

# inspect the registry hosts the secret actually covers
kubectl get secret regcred -n payments \\
  -o jsonpath='{.data.\\.dockerconfigjson}' | base64 -d`}
          </pre>
          <p className="text-sm muted">
            Read the message carefully, because the failure modes are distinguishable. &ldquo;401
            Unauthorized&rdquo; means the credential was presented and rejected &mdash; wrong password,
            expired token, or a rotation that revoked it. &ldquo;403 Forbidden&rdquo; means the
            credential is valid but lacks access to that repository. &ldquo;Not found&rdquo; on a
            private registry usually means no credential was sent at all, which points at scope: wrong
            namespace, wrong service account, or a hostname mismatch.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Pull secrets are an access-control mechanism, not a safety one &mdash; they decide whether
            an image can be fetched, never whether it should run. Those are separate questions, and
            the second one needs a scan.
          </p>
          <p className="text-sm muted">
            The pattern we recommend is to scan the artifact before it ever reaches the repository the
            cluster pulls from, so that the credential only ever unlocks images that already passed a
            gate. That fits naturally into an{" "}
            <Link href="/blog/image-promotion" className="underline">
              image promotion pipeline
            </Link>
            : scan the digest, promote it into the production repository, and let the cluster&apos;s
            pull credential be scoped to that repository alone. ScanRook reports every finding with its
            advisory source and a confidence tier, which makes the gate decision reviewable rather than
            a bare pass or fail. If you also enforce policy at the cluster edge, our guide to{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control for image scanning
            </Link>{" "}
            covers that side.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is an image pull secret?</h3>
              <p className="text-sm muted mt-1">
                A Kubernetes Secret of type <code className="text-xs">kubernetes.io/dockerconfigjson</code>{" "}
                holding registry credentials, read by the kubelet when it pulls a private image.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is my pull secret being ignored?</h3>
              <p className="text-sm muted mt-1">
                Usually scope: it is in a different namespace, the pod uses a service account that does
                not reference it, or the registry hostname does not match the image reference.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Pod-level or service-account-level?</h3>
              <p className="text-sm muted mt-1">
                Service account, in most cases. Every pod using it inherits the credential, so rotation
                is one change per namespace instead of one per workload.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I avoid pull secrets entirely?</h3>
              <p className="text-sm muted mt-1">
                On managed clusters, often yes &mdash; node identity or a kubelet credential provider
                plugin can authenticate pulls with short-lived tokens and no stored Secret.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Gate the images your cluster is allowed to pull</h3>
          <p className="text-sm muted leading-relaxed">
            Scan an image with ScanRook before it lands in the repository your pull secret unlocks.
            Findings come with their advisory source and a confidence tier, so a blocked release is one
            you can explain.
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
            <Link href="/blog/secret-rotation" className="underline">
              Secret Rotation
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Admission Control for Image Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
