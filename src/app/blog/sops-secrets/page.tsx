import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-26";

const title = `SOPS Secrets: Encrypting Config Files in Git | ${APP_NAME}`;
const description =
  "How SOPS secrets work: envelope encryption with age, KMS or PGP, .sops.yaml creation rules, key rotation, and using encrypted files in Kubernetes and CI.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sops secrets",
    "mozilla sops",
    "sops encryption",
    "sops age",
    "sops kms",
    "encrypt secrets in git",
    "sops kubernetes",
    "sops.yaml creation rules",
    "gitops secrets management",
    "sops key rotation",
  ],
  alternates: { canonical: "/blog/sops-secrets" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sops-secrets",
    images: ["/blog/sops-secrets.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sops-secrets.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SOPS Secrets: Encrypting Config Files in Git",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sops-secrets",
  image: "https://scanrook.io/blog/sops-secrets.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is SOPS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SOPS (Secrets OPerationS) is an open-source editor for encrypted files. It encrypts the values in YAML, JSON, ENV, INI and binary files while leaving the keys in plaintext, so an encrypted file still diffs and reviews sensibly in Git. It was created at Mozilla and is now maintained as a CNCF project under the getsops organisation.",
      },
    },
    {
      "@type": "Question",
      name: "How does SOPS encryption work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SOPS uses envelope encryption. It generates a random data key per file, encrypts each value with that data key using AES-GCM, then encrypts the data key once for every master key you configured - AWS KMS, GCP KMS, Azure Key Vault, HashiCorp Vault, age or PGP. The wrapped data keys and a MAC over the whole file are stored in a sops metadata block at the bottom of the file.",
      },
    },
    {
      "@type": "Question",
      name: "Is it safe to commit SOPS files to Git?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Committing SOPS-encrypted files is the normal workflow, and the ciphertext is only as safe as the master keys that wrap the data key. The important caveats are that structure leaks - key names, list lengths and file shape stay in plaintext - and that history is permanent, so a value committed before encryption was set up stays in the repository until history is rewritten.",
      },
    },
    {
      "@type": "Question",
      name: "SOPS or Sealed Secrets or External Secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SOPS encrypts arbitrary config files and works anywhere, not just Kubernetes. Sealed Secrets encrypts a Kubernetes Secret specifically and needs a controller in the cluster to decrypt it. External Secrets Operator keeps no ciphertext in Git at all and instead syncs values from an external secret manager. Many teams use SOPS for GitOps config and External Secrets for high-churn runtime credentials.",
      },
    },
    {
      "@type": "Question",
      name: "How do you rotate a SOPS data key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Running sops rotate with the in-place flag generates a fresh data key, re-encrypts every value with it and re-wraps it for the configured master keys. Use sops updatekeys instead when you only changed the recipient list in .sops.yaml and want the existing data key re-wrapped for the new set of keys.",
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
            SOPS Secrets: Encrypting Config Files in Git
          </h1>
          <p className="text-sm muted">Published November 26, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            SOPS secrets solve a specific, stubborn problem: you want your configuration in Git next
            to the code it configures, but some of that configuration is a database password. SOPS
            encrypts the <em>values</em> and leaves the <em>keys</em> readable, so an encrypted file
            still reviews like a config file instead of an opaque blob. Here is how it works, how to
            set it up properly, and where it stops being the right tool.
          </p>
        </header>

        <img
          src="/blog/sops-secrets.jpg"
          alt="SOPS secrets encryption for configuration files stored in Git"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What SOPS actually does</h2>
          <p className="text-sm muted">
            SOPS &mdash; short for Secrets OPerationS &mdash; is an editor for encrypted files. It
            started at Mozilla and is now maintained as a CNCF project under the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">getsops</code>{" "}
            organisation. It understands YAML, JSON, ENV, INI and raw binary, and for the structured
            formats it walks the document and encrypts each leaf value individually.
          </p>
          <p className="text-sm muted">
            That per-value approach is the whole point. A file encrypted with something like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">gpg -c</code>{" "}
            becomes one indivisible ciphertext: every change is a total rewrite, code review is
            impossible, and merge conflicts are unresolvable. A SOPS file keeps its shape. You can see
            that <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">database.password</code>{" "}
            changed and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">database.host</code>{" "}
            did not, without either reviewer being able to read the password.
          </p>
          <p className="text-sm muted">
            The tradeoff to name up front: <strong>structure is not secret</strong>. Key names, the
            number of entries, and the general shape of your config all remain in plaintext. If the
            existence of a key called{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">stripe_live_key</code>{" "}
            is itself sensitive, SOPS is the wrong container for it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Envelope encryption, one layer down</h2>
          <p className="text-sm muted">
            SOPS never encrypts your data directly with a KMS key or a PGP key. It uses envelope
            encryption:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="SOPS envelope encryption: a random data key encrypts each value with AES-GCM, and the data key is separately wrapped by each configured master key such as AWS KMS, age and PGP"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="sops-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>

              <rect x={10} y={20} width={170} height={70} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
              <text x={95} y={48} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Plaintext values</text>
              <text x={95} y={68} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>each leaf in the YAML</text>

              <rect x={265} y={20} width={170} height={70} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
              <text x={350} y={48} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Data key</text>
              <text x={350} y={68} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>random, per file, AES-GCM</text>

              <rect x={520} y={20} width={170} height={70} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
              <text x={605} y={48} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Ciphertext file</text>
              <text x={605} y={68} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>committed to Git</text>

              <line x1={182} y1={55} x2={261} y2={55} stroke="currentColor" strokeWidth={2} markerEnd="url(#sops-arrow)" />
              <line x1={437} y1={55} x2={516} y2={55} stroke="currentColor" strokeWidth={2} markerEnd="url(#sops-arrow)" />

              {/* master keys wrapping the data key */}
              <line x1={350} y1={92} x2={350} y2={130} stroke="currentColor" strokeWidth={2} markerEnd="url(#sops-arrow)" />
              <text x={362} y={116} fontSize="10.5" fill="currentColor" fillOpacity={0.6}>wrapped once per recipient</text>

              {[
                { x: 40, label: "AWS / GCP KMS" },
                { x: 235, label: "age recipients" },
                { x: 430, label: "Vault transit" },
                { x: 590, label: "PGP" },
              ].map((k) => (
                <g key={k.label}>
                  <rect x={k.x} y={140} width={k.label === "PGP" ? 90 : 170} height={40} rx={6} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.3} />
                  <text x={k.x + (k.label === "PGP" ? 45 : 85)} y={165} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.8}>{k.label}</text>
                </g>
              ))}
              <path d="M350,130 L125,140 M350,130 L320,140 M350,130 L515,140 M350,130 L635,140" stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.45} fill="none" />

              <rect x={140} y={205} width={420} height={32} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={350} y={225} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                MAC over all values &mdash; detects tampering with the ciphertext
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              SOPS envelope encryption. One random data key encrypts the file&apos;s values; that data
              key is separately wrapped for every configured master key, so any one of them can open
              the file.
            </figcaption>
          </div>
          <p className="text-sm muted">
            Two consequences fall out of this design. First, adding or removing a recipient does not
            require re-encrypting the data &mdash; only re-wrapping the data key, which is what{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sops updatekeys</code>{" "}
            does. Second, a MAC is computed over all the encrypted values, so if someone edits a
            ciphertext by hand, decryption fails loudly instead of returning garbage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Getting started with age</h2>
          <p className="text-sm muted">
            For teams without a cloud KMS commitment,{" "}
            <a href="https://github.com/FiloSottile/age" className="underline" rel="nofollow noreferrer" target="_blank">age</a>{" "}
            is the simplest backend: small keys, no infrastructure, and it works offline. Generate a
            keypair:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`# generate an age identity (keep key.txt out of the repo)
age-keygen -o ~/.config/sops/age/keys.txt

# the public recipient is printed on the first line, e.g.
# public key: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p`}</code></pre>
          <p className="text-sm muted">
            Now encrypt a file. Everything about which keys apply to which paths belongs in a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.sops.yaml</code>{" "}
            at the repository root, so nobody has to remember flags:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`# .sops.yaml
creation_rules:
  # production secrets: cloud KMS + a break-glass age key
  - path_regex: environments/prod/.*\\.ya?ml$
    encrypted_regex: '^(data|stringData|password|token|.*_key)$'
    key_groups:
      - kms:
          - arn: arn:aws:kms:us-east-1:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab
        age:
          - age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p

  # everything else: developer age keys only
  - path_regex: .*\\.ya?ml$
    age: >-
      age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p,
      age17e6y5vzjq0d4mkxfqe6cn9nfvhk4t7zqz2u4x8w3xg9lmn5cq4ns8v2j3r`}</code></pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">encrypted_regex</code>{" "}
            field is important and frequently skipped. Without it SOPS encrypts every value, including
            things like <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apiVersion</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kind</code>, which makes a
            Kubernetes manifest unreadable to humans and to tools that only need the metadata. Scoping
            encryption to the fields that are actually secret preserves reviewability. There is also
            an <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">unencrypted_regex</code>{" "}
            for the inverse policy &mdash; pick one, not both.
          </p>
          <p className="text-sm muted">
            Day-to-day usage is three commands:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`sops encrypt --in-place environments/prod/secrets.yaml   # encrypt
sops edit environments/prod/secrets.yaml                 # decrypt to $EDITOR, re-encrypt on save
sops decrypt environments/prod/secrets.yaml              # print plaintext to stdout

# feed decrypted values to a process without ever writing plaintext to disk
sops exec-env environments/prod/secrets.yaml 'terraform apply'`}</code></pre>
        </section>

        <img
          src="/blog/sops-secrets-2.jpg"
          alt="Encrypted configuration values flowing through a SOPS decryption gateway"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using SOPS secrets in Kubernetes</h2>
          <p className="text-sm muted">
            SOPS is not Kubernetes-specific, but GitOps is where most teams meet it. The pattern is
            the same either way: the repository holds ciphertext, and something with access to the
            master key decrypts at apply time.
          </p>
          <p className="text-sm muted">
            <strong>Flux</strong> has first-class support. You store the age private key as a cluster
            Secret and point a Kustomization at it:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 10m
  path: ./environments/prod
  prune: true
  sourceRef:
    kind: GitRepository
    name: platform
  decryption:
    provider: sops
    secretRef:
      name: sops-age   # a Secret with key "age.agekey"`}</code></pre>
          <p className="text-sm muted">
            <strong>Argo CD</strong> has no built-in SOPS support; the common route is a KSOPS plugin
            or a custom management-plane image that shells out to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sops decrypt</code>{" "}
            during manifest generation. For Helm, the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm-secrets</code>{" "}
            plugin decrypts an encrypted values file before templating.
          </p>
          <p className="text-sm muted">
            Whichever route you take, the decrypted result is an ordinary Kubernetes Secret &mdash;
            base64 in etcd, mounted into pods, visible to anyone with the right RBAC. SOPS protects
            the secret <em>in the repository</em>; it does nothing for it once applied. That second
            half is covered in our guide to{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>
            , and the encryption-at-rest and RBAC work there is not optional just because your Git
            history is clean.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rotation, revocation and the hard parts</h2>
          <p className="text-sm muted">
            Two commands cover the lifecycle, and confusing them is a common source of false
            confidence:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sops updatekeys secrets.yaml</code>{" "}
              re-wraps the <em>existing</em> data key for whatever recipients{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.sops.yaml</code>{" "}
              now specifies. Use it when someone joins or leaves. Note what it does not do: a departing
              engineer who already had the data key can still decrypt every historical commit of that
              file.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sops rotate --in-place secrets.yaml</code>{" "}
              generates a fresh data key and re-encrypts every value with it. Use it when you believe
              the data key may be compromised.
            </li>
          </ul>
          <p className="text-sm muted">
            Neither command rotates the <em>underlying credential</em>. If a password was readable by
            someone who should no longer read it, rotating the SOPS key is theatre &mdash; you have to
            change the password at the database. The distinction between reducing exposure and
            actually removing it is the same one we draw in{" "}
            <Link href="/blog/remediation-vs-mitigation" className="underline">
              remediation vs mitigation
            </Link>
            .
          </p>
          <p className="text-sm muted">
            The other hard part is history. SOPS gives you a safe place to put secrets going forward;
            it does nothing about the API token committed in plaintext eighteen months ago and still
            sitting in every clone of the repository. Run a history scanner before you declare
            victory &mdash; see our{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning guide
            </Link>{" "}
            and the tool-level walkthrough in{" "}
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              Gitleaks
            </Link>
            . A pre-commit hook that rejects unencrypted values in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">*.secret.yaml</code>{" "}
            paths is a cheap, effective backstop.
          </p>
        </section>

        <img
          src="/blog/sops-secrets-3.jpg"
          alt="Git commit graph with sealed encrypted secret nodes representing SOPS-managed configuration"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">SOPS next to the alternatives</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Approach</th>
                  <th className="text-left py-2 pr-4 font-semibold">Ciphertext in Git?</th>
                  <th className="text-left py-2 pr-4 font-semibold">Best for</th>
                  <th className="text-left py-2 font-semibold">Main limitation</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>SOPS</strong></td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 pr-4 align-top">Any config file; multi-cloud; readable diffs</td>
                  <td className="py-2 align-top">Key names leak; no rotation of the underlying credential</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Sealed Secrets</strong></td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 pr-4 align-top">Kubernetes-only teams wanting zero external deps</td>
                  <td className="py-2 align-top">Needs an in-cluster controller; ciphertext is cluster-bound</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>External Secrets</strong></td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 pr-4 align-top">High-churn credentials with central rotation</td>
                  <td className="py-2 align-top">Requires an external secret manager and its availability</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>CI variables</strong></td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 pr-4 align-top">A handful of build-time credentials</td>
                  <td className="py-2 align-top">No version history, no review, poor auditability</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            These are not mutually exclusive. A common split is SOPS for the config that belongs to a
            deployment and changes with it, and{" "}
            <Link href="/blog/external-secrets-operator" className="underline">
              External Secrets Operator
            </Link>{" "}
            for credentials that rotate on their own schedule. If you are weighing the
            Kubernetes-native option specifically,{" "}
            <Link href="/blog/sealed-secrets" className="underline">
              Sealed Secrets
            </Link>{" "}
            trades SOPS&apos; portability for a simpler mental model.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A short checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>Commit a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.sops.yaml</code> so encryption policy is repository-wide, not per-developer muscle memory.</li>
            <li>Scope <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">encrypted_regex</code> to real secret fields so manifests stay reviewable.</li>
            <li>Configure at least two independent master keys &mdash; a primary and a break-glass &mdash; so a KMS outage or a lost laptop is not a lockout.</li>
            <li>Never put a private age key or a decrypted file in the repository; add both patterns to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.gitignore</code>.</li>
            <li>Prefer <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sops exec-env</code> over writing a decrypted file to disk in CI.</li>
            <li>Run a secret scanner over history before and after adopting SOPS.</li>
            <li>Rotate the credential itself, not just the data key, when access changes.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not manage secrets and does not decrypt SOPS files &mdash; that is not our
            layer. What we do sit next to is the artifact that eventually consumes those secrets.
            SOPS keeps the credentials out of your repository; a scanner tells you whether the image
            that mounts them is running a vulnerable OpenSSL or a five-year-old base layer. Both
            failure modes end with the same incident report, and neither tool substitutes for the
            other.
          </p>
          <p className="text-sm muted">
            The practical join is in CI: decrypt config with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sops exec-env</code>,
            build the image, then scan the resulting artifact before it is pushed. ScanRook matches
            every package it finds against OSV, NVD and Red Hat OVAL in parallel and reports the
            source and confidence tier for each finding, so the build-gate decision is auditable
            rather than a bare severity count. The{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>{" "}
            post covers where in the pipeline that gate belongs.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is SOPS?</h3>
              <p className="text-sm muted mt-1">
                An open-source editor for encrypted files that encrypts values while leaving keys in
                plaintext. Created at Mozilla, now a CNCF project under the getsops organisation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does SOPS encryption work?</h3>
              <p className="text-sm muted mt-1">
                Envelope encryption. A random per-file data key encrypts each value with AES-GCM, and
                that data key is wrapped once per configured master key &mdash; KMS, Vault, age or PGP.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is committing SOPS files to Git safe?</h3>
              <p className="text-sm muted mt-1">
                It is the intended workflow, with two caveats: key names and file structure stay
                readable, and anything committed before encryption remains in history permanently.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do you rotate keys?</h3>
              <p className="text-sm muted mt-1">
                Use <code className="text-xs">sops updatekeys</code> to re-wrap for a changed recipient
                list, and <code className="text-xs">sops rotate --in-place</code> to generate a new data
                key. Neither rotates the underlying credential.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Secrets encrypted. What about the image?</h3>
          <p className="text-sm muted leading-relaxed">
            A clean secrets pipeline still ships whatever CVEs are in your base layer. Scan the image
            your SOPS-managed config feeds &mdash; every ScanRook finding carries its advisory source
            and a confidence tier, so you can act on it instead of arguing about it.
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
            <Link href="/blog/sealed-secrets" className="underline">
              Sealed Secrets
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
