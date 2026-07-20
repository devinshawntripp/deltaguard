import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-09";

const title = `mTLS Explained: How Mutual TLS Authentication Works | ${APP_NAME}`;
const description =
  "What mTLS is, how the mutual TLS handshake differs from ordinary TLS, real nginx and Istio config, certificate rotation, and the failure modes that bite teams.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "mtls",
    "mutual tls",
    "mtls authentication",
    "how mtls works",
    "mutual tls handshake",
    "client certificate authentication",
    "mtls istio",
    "mtls nginx",
    "zero trust mtls",
    "spiffe svid",
  ],
  alternates: { canonical: "/blog/mtls-mutual-tls" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/mtls-mutual-tls",
    images: ["/blog/mtls-mutual-tls.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/mtls-mutual-tls.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "mTLS Explained: How Mutual TLS Authentication Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/mtls-mutual-tls",
  image: "https://scanrook.io/blog/mtls-mutual-tls.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is mTLS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "mTLS, or mutual TLS, is ordinary TLS with one addition: the client also presents an X.509 certificate and proves it holds the matching private key. Both sides authenticate each other instead of only the client verifying the server. It is a standard part of TLS, not a separate protocol, and it is enabled by configuration on both ends.",
      },
    },
    {
      "@type": "Question",
      name: "How does the mutual TLS handshake differ from normal TLS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The server sends a CertificateRequest message. The client responds with its own Certificate and a CertificateVerify signed with its private key. The server validates that chain against a trusted certificate authority and checks revocation and validity before completing the handshake. Everything else about the handshake is unchanged.",
      },
    },
    {
      "@type": "Question",
      name: "Is mTLS the same as zero trust?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. mTLS is one mechanism a zero trust architecture uses to establish workload identity on the wire. Zero trust also requires authorization decisions, policy, least privilege and continuous verification. mTLS answers who is calling; it does not answer whether that caller should be allowed to do what it is asking.",
      },
    },
    {
      "@type": "Question",
      name: "What is the hardest part of running mTLS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Certificate lifecycle. Issuing, distributing, rotating and revoking certificates for every workload is the operational cost, and expired certificates are the most common cause of outages in mTLS deployments. Service meshes and SPIFFE-based identity systems exist mainly to automate that lifecycle with short-lived certificates.",
      },
    },
    {
      "@type": "Question",
      name: "Does mTLS protect against vulnerable dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. mTLS authenticates and encrypts the connection between two workloads. It says nothing about whether the software running inside those workloads contains known vulnerabilities. A fully mTLS-secured mesh of containers with unpatched libraries is still exploitable through the calls mTLS just authenticated.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            mTLS Explained: How Mutual TLS Authentication Works
          </h1>
          <p className="text-sm muted">Published September 9, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            mTLS is the reason a service can know, cryptographically, which service is calling it
            &mdash; not which IP address, not which header claims to be a service. It is not a new
            protocol; it is the client-certificate half of TLS that most public web traffic simply
            never turns on. Here is what the mutual TLS handshake actually does, how to configure
            it, and the operational cost nobody warns you about.
          </p>
        </header>

        <img
          src="/blog/mtls-mutual-tls.jpg"
          alt="mTLS mutual authentication between two services over an encrypted channel"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What mTLS actually is</h2>
          <p className="text-sm muted">
            In ordinary TLS &mdash; the kind your browser does thousands of times a day &mdash;
            authentication runs in one direction. The server presents a certificate, the client
            checks it chains to a trusted certificate authority and matches the hostname, and a
            secure channel is established. The server has no idea who the client is. It finds out
            afterwards, from a password, an API key, or a bearer token carried inside the encrypted
            channel.
          </p>
          <p className="text-sm muted">
            mTLS closes that gap. The client also presents an X.509 certificate and proves
            possession of the corresponding private key, so both ends authenticate each other
            before a single byte of application data flows. The identity is bound to the connection
            itself rather than to a credential sent over it, and that is the whole point: a stolen
            bearer token can be replayed from anywhere, while a client certificate is useless
            without the private key that never leaves the workload.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The mutual TLS handshake, step by step</h2>
          <p className="text-sm muted">
            Only two messages separate mTLS from regular TLS. Everything else &mdash; key exchange,
            cipher negotiation, the encrypted record layer &mdash; is identical.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 300"
              role="img"
              aria-label="Sequence diagram of a mutual TLS handshake between client and server, highlighting the CertificateRequest and client Certificate plus CertificateVerify messages that are unique to mTLS"
              className="w-full"
              style={{ minWidth: 600 }}
            >
              <defs>
                <marker id="mtls-arr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <text x={100} y={22} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                Client
              </text>
              <text x={600} y={22} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                Server
              </text>
              <line x1={100} y1={34} x2={100} y2={288} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
              <line x1={600} y1={34} x2={600} y2={288} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
              {[
                { y: 62, right: true, label: "ClientHello", mutual: false },
                { y: 102, right: false, label: "ServerHello · Certificate", mutual: false },
                { y: 142, right: false, label: "CertificateRequest", mutual: true },
                { y: 190, right: true, label: "Certificate · CertificateVerify", mutual: true },
                { y: 234, right: true, label: "Finished", mutual: false },
                { y: 272, right: false, label: "Finished → application data", mutual: false },
              ].map((s) => (
                <g key={s.label}>
                  <line
                    x1={s.right ? 104 : 596}
                    y1={s.y}
                    x2={s.right ? 594 : 106}
                    y2={s.y}
                    stroke="currentColor"
                    strokeOpacity={s.mutual ? 0.95 : 0.45}
                    strokeWidth={s.mutual ? 2.4 : 1.6}
                    strokeDasharray={s.mutual ? undefined : "6 4"}
                    markerEnd="url(#mtls-arr)"
                  />
                  <text
                    x={350}
                    y={s.y - 8}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight={s.mutual ? 600 : 400}
                    fill="currentColor"
                    fillOpacity={s.mutual ? 0.95 : 0.62}
                  >
                    {s.label}
                  </text>
                </g>
              ))}
              <rect x={210} y={124} width={280} height={84} rx={8} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.25} />
              <text x={350} y={216} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                solid lines = the mTLS-only exchange
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              A mutual TLS handshake. Only the boxed messages distinguish mTLS from one-way TLS;
              the rest of the handshake is unchanged.
            </figcaption>
          </div>
          <p className="text-sm muted">
            The server&apos;s <strong>CertificateRequest</strong> tells the client that a
            certificate is expected, and typically constrains which certificate authorities are
            acceptable. The client answers with its <strong>Certificate</strong> chain and a{" "}
            <strong>CertificateVerify</strong>: a signature over the handshake transcript made with
            the client&apos;s private key. That signature is the proof of possession. Presenting a
            certificate is public information and worth nothing on its own; signing the transcript
            with the matching key is what authenticates.
          </p>
          <p className="text-sm muted">
            The server then validates the chain against its trusted CA bundle, checks validity
            dates, and &mdash; if configured &mdash; consults revocation via CRL or OCSP. Only then
            does the handshake complete. In TLS 1.3 these messages are themselves encrypted, so the
            client certificate is not exposed to passive observers the way it was in TLS 1.2.
          </p>
        </section>

        <img
          src="/blog/mtls-mutual-tls-2.jpg"
          alt="Sequential handshake stages of mutual TLS certificate exchange"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Configuring mTLS in practice</h2>
          <p className="text-sm muted">
            Terminating mTLS at a reverse proxy is the most common pattern, because it keeps
            certificate handling out of application code. In nginx the whole thing is four
            directives:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`server {
    listen 443 ssl;
    server_name api.internal.example.com;

    ssl_certificate      /etc/nginx/tls/server.crt;
    ssl_certificate_key  /etc/nginx/tls/server.key;

    # trust anchor used to validate client certificates
    ssl_client_certificate /etc/nginx/tls/client-ca.crt;
    ssl_verify_client      on;      # "optional" to allow but not require
    ssl_verify_depth       2;

    location / {
        # pass the verified identity to the upstream app
        proxy_set_header X-Client-DN     $ssl_client_s_dn;
        proxy_set_header X-Client-Verify $ssl_client_verify;
        proxy_pass http://backend;
    }
}`}
          </pre>
          <p className="text-sm muted">
            Two things to note. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ssl_client_certificate</code>{" "}
            is a trust anchor, not a list of allowed clients &mdash; any certificate issued by that
            CA will pass. Authorisation is a separate decision you make from the subject DN or SAN,
            in the app or in the proxy. And{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">optional</code>{" "}
            mode is the standard migration path: allow both, log which clients are not yet
            presenting certificates, then flip to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">on</code>.
          </p>
          <p className="text-sm muted">
            Testing it needs nothing exotic:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# curl, with a client certificate
curl --cert client.crt --key client.key --cacert ca.crt \\
  https://api.internal.example.com/health

# inspect the full handshake, including the CertificateRequest
openssl s_client -connect api.internal.example.com:443 \\
  -cert client.crt -key client.key -CAfile ca.crt

# check what a certificate actually claims before you trust it
openssl x509 -in client.crt -noout -subject -dates -ext subjectAltName`}
          </pre>
          <p className="text-sm muted">
            In Kubernetes, a service mesh usually takes over. Istio, for example, issues a
            certificate to every workload sidecar and can enforce mTLS namespace-wide with a single
            policy object:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: payments
spec:
  mtls:
    mode: STRICT   # PERMISSIVE while migrating, STRICT once every client is ready`}
          </pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">PERMISSIVE</code>{" "}
            is the same idea as nginx&apos;s <em>optional</em>: accept both plaintext and mTLS while
            you roll out, then tighten. This is complementary to, not a replacement for,{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              network policies
            </Link>{" "}
            &mdash; policies decide which pods may connect at all, mTLS decides who they prove
            themselves to be once connected.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Certificate lifecycle is the real work</h2>
          <p className="text-sm muted">
            Enabling mTLS takes an afternoon. Running it takes an ongoing commitment, and every
            genuinely painful mTLS story is a certificate lifecycle story.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Expiry is the number one outage cause.</strong> A certificate nobody was
              tracking expires at 03:00 and an entire service tier stops answering. Alert on
              remaining validity, not on failure.
            </li>
            <li>
              <strong>Revocation rarely works the way people assume.</strong> CRL distribution and
              OCSP checking are often silently disabled or fail open. The modern answer is not
              better revocation but shorter lifetimes &mdash; certificates valid for hours make
              revocation mostly moot.
            </li>
            <li>
              <strong>Private keys must be issued to workloads, not baked into images.</strong> A
              key committed to a repository or built into a container layer is a credential leak
              waiting to be found by a{" "}
              <Link href="/blog/secret-scanning-guide" className="underline">
                secret scanner
              </Link>
              . Deliver them at runtime &mdash;{" "}
              <Link href="/blog/external-secrets-operator" className="underline">
                External Secrets Operator
              </Link>{" "}
              and mesh-issued identities both solve this.
            </li>
            <li>
              <strong>Identity needs a schema.</strong> SPIFFE standardises this: a workload gets an
              SVID whose URI SAN encodes trust domain and workload path, so authorisation rules can
              be written against a stable identity rather than a hand-managed common name.
            </li>
          </ul>
          <p className="text-sm muted">
            This is why service meshes are the default answer at scale. They automate issuance,
            rotation and distribution with short-lived certificates so that the failure mode above
            mostly stops existing.
          </p>
        </section>

        <img
          src="/blog/mtls-mutual-tls-3.jpg"
          alt="Service mesh with mutual TLS encrypted tunnels between workload identities"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What mTLS does not do</h2>
          <p className="text-sm muted">
            mTLS is a strong control with a narrow scope, and being clear about the boundary keeps
            it from becoming a false comfort.
          </p>
          <p className="text-sm muted">
            It authenticates and encrypts a connection. It does not authorise the request &mdash;
            proving a service is <em>billing-api</em> says nothing about whether{" "}
            <em>billing-api</em> should be allowed to delete customer records. It does not validate
            input, so an injection flaw is just as exploitable over a mutually authenticated
            channel. And it does not care what software is running behind the certificate: a
            perfectly configured STRICT mesh full of containers with an unpatched TLS library or a
            vulnerable serialisation package is exactly as exploitable as before, because the attack
            arrives through the calls mTLS just authenticated. That layered thinking is the subject
            of{" "}
            <Link href="/blog/defense-in-depth" className="underline">
              defense in depth
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            mTLS secures the wire between workloads. ScanRook looks at what is inside them. We scan
            container image tarballs, binaries and source archives, read the real installed package
            state rather than guessing from manifests, and match every package against OSV, NVD and
            Red Hat OVAL in parallel &mdash; so the TLS library terminating your mutual
            authentication is itself checked for known CVEs, with the source of each finding and a
            confidence tier attached.
          </p>
          <p className="text-sm muted">
            The two controls compose. Transport identity keeps unknown callers out; artifact
            scanning keeps known-vulnerable code from being what answers the authenticated call. If
            you are building the second half of that, the{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            and{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            are the right next reads.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does the m in mTLS stand for?</h3>
              <p className="text-sm muted mt-1">
                Mutual. Both the client and the server present certificates and prove key
                possession, rather than only the server being authenticated.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is mTLS slower than TLS?</h3>
              <p className="text-sm muted mt-1">
                Marginally, and only at handshake time &mdash; one extra signature and one extra
                chain validation. With session resumption and connection reuse the steady-state cost
                is negligible.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I use mTLS on a public website?</h3>
              <p className="text-sm muted mt-1">
                Technically yes, practically no. Distributing certificates to arbitrary browsers is
                unmanageable. mTLS belongs to service-to-service, B2B API, device and admin-access
                traffic.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I still need authorisation with mTLS?</h3>
              <p className="text-sm muted mt-1">
                Yes. mTLS establishes identity. What that identity is permitted to do is a separate
                policy decision you still have to make and enforce.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Check what is behind the certificate</h3>
          <p className="text-sm muted leading-relaxed">
            A mutually authenticated call still reaches whatever software you deployed. Scan the
            image with ScanRook and see every package matched against OSV, NVD and Red Hat OVAL,
            each finding tagged with its source and confidence.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              Kubernetes Network Policies
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/defense-in-depth" className="underline">
              Defense in Depth
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
