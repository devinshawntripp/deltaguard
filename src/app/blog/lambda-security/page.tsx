import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-28";

const title = `Lambda Security: Hardening AWS Serverless Functions | ${APP_NAME}`;
const description =
  "A practical Lambda security guide: least-privilege execution roles, dependency and layer vulnerabilities, secrets handling, runtime upkeep, and what to scan.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "lambda security",
    "aws lambda security",
    "serverless security",
    "lambda execution role least privilege",
    "lambda layer vulnerabilities",
    "lambda container image scanning",
    "lambda secrets management",
    "serverless attack surface",
    "lambda runtime deprecation",
    "aws lambda best practices",
  ],
  alternates: { canonical: "/blog/lambda-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/lambda-security",
    images: ["/blog/lambda-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/lambda-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Lambda Security: Hardening AWS Serverless Functions",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/lambda-security",
  image: "https://scanrook.io/blog/lambda-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the biggest Lambda security risks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In practice the recurring problems are over-broad execution roles, vulnerable third-party dependencies bundled into the deployment package or a layer, secrets stored in plaintext environment variables, unauthenticated function URLs, and functions left on runtimes that no longer receive security patches. Injection through untrusted event payloads is real but less common than permission sprawl.",
      },
    },
    {
      "@type": "Question",
      name: "Does AWS patch my Lambda dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Under the shared responsibility model AWS maintains the execution environment and the managed runtime, but everything you upload is yours. The libraries in your deployment package, the contents of your layers, and any base image you use for a container-packaged function are all your responsibility to patch and rebuild.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan a Lambda function for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scan the artifact you deploy. For zip-packaged functions that is the deployment bundle including vendored dependencies; for container-packaged functions it is the image in ECR. A manifest-only check such as npm audit or pip-audit catches direct dependency issues but not what was actually copied into the bundle at build time.",
      },
    },
    {
      "@type": "Question",
      name: "Should each Lambda function have its own IAM role?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A per-function execution role is the single most valuable Lambda security control, because it bounds the blast radius of any code-level compromise. Shared roles accumulate the union of every function's permissions, which means the least trusted function ends up holding the most sensitive grants.",
      },
    },
    {
      "@type": "Question",
      name: "Are Lambda layers a security risk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They can be. A layer is opaque compiled or vendored code that is attached at runtime and often published by a third party, updated on someone else's schedule, and rarely re-reviewed. Treat layer ARNs as dependencies: pin the version, record where it came from, and scan the extracted contents rather than trusting the publisher.",
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
            Lambda Security: Hardening AWS Serverless Functions
          </h1>
          <p className="text-sm muted">Published December 28, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Lambda security is less about the things serverless removed and more about the things it
            kept. You no longer patch a kernel or manage an SSH key, but you still own every library
            you bundle, every permission you attach, and every event source you expose. This is a
            practical walk through the parts of a function that actually get exploited, in rough
            order of how often we see them go wrong.
          </p>
        </header>

        <img
          src="/blog/lambda-security.jpg"
          alt="AWS Lambda security concept showing ephemeral serverless functions protected by layered controls"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What you own and what AWS owns</h2>
          <p className="text-sm muted">
            The shared responsibility line moves with the service, and Lambda moves it a long way.
            AWS operates the hypervisor, the Firecracker microVM, the host operating system, and the
            managed language runtimes. You do not patch any of that, and you cannot.
          </p>
          <p className="text-sm muted">
            Everything above that line is yours: your function code, every dependency you vendor into
            the deployment package, the contents of any layer you attach, the base image if you
            package as a container, the IAM execution role, the resource policy that decides who can
            invoke you, the environment variables, and the network placement. That list is where
            essentially all real Lambda incidents originate. Serverless removed a category of work;
            it did not remove the application security work.
          </p>
          <p className="text-sm muted">
            One subtlety catches teams out: AWS patches the <em>managed runtime</em>, but only while
            that runtime version is supported. Once a runtime reaches end of support it stops
            receiving security updates, and functions still pointed at it are running unpatched
            interpreter and system-library code. Runtime upkeep is a standing maintenance task, not a
            one-time choice.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The Lambda attack surface, layer by layer</h2>
          <p className="text-sm muted">
            It helps to picture a function as a stack of independently-owned layers, each with its
            own failure mode:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 300"
              role="img"
              aria-label="Layer diagram of the AWS Lambda attack surface, from event source and resource policy at the top through function code, dependencies and layers, managed runtime, to the execution role and downstream services"
              className="w-full"
              style={{ minWidth: 520 }}
            >
              {[
                { y: 10, label: "Event source + resource policy", sub: "who can invoke, and with what payload", owner: "you" },
                { y: 58, label: "Function code", sub: "input handling, injection, logging hygiene", owner: "you" },
                { y: 106, label: "Dependencies + layers", sub: "vendored libraries, third-party layer ARNs", owner: "you", hot: true },
                { y: 154, label: "Runtime / base image", sub: "managed runtime version, or your container image", owner: "shared" },
                { y: 202, label: "Execution environment", sub: "microVM, host OS, isolation", owner: "AWS" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={20}
                    y={b.y}
                    width={520}
                    height={40}
                    rx={7}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={b.hot ? 0.14 : 0.04}
                    stroke="currentColor"
                    strokeOpacity={0.45}
                  />
                  <text x={34} y={b.y + 18} fontSize="13" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={34} y={b.y + 33} fontSize="10.5" fill="currentColor" fillOpacity={0.62}>
                    {b.sub}
                  </text>
                  <text x={560} y={b.y + 25} fontSize="11" fill="currentColor" fillOpacity={0.7}>
                    {b.owner}
                  </text>
                </g>
              ))}
              <text x={560} y={264} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                owner
              </text>
              <rect x={20} y={252} width={520} height={34} rx={7} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="4 3" />
              <text x={34} y={273} fontSize="12" fill="currentColor" fillOpacity={0.8}>
                Execution role &rarr; S3, DynamoDB, Secrets Manager, other accounts
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The Lambda attack surface. AWS owns the bottom layer outright and shares the runtime
            layer; the highlighted dependency layer is where most exploitable findings live, and the
            execution role at the base determines how far a compromise travels.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">1. Scope the execution role tightly</h2>
          <p className="text-sm muted">
            Every function gets its own role. Shared roles are the most common serious misconfiguration
            we see, because a shared role accumulates the union of every attached function&apos;s
            needs &mdash; so the small unauthenticated webhook handler ends up holding the same
            database write permissions as the batch job.
          </p>
          <p className="text-sm muted">
            Scope to concrete resource ARNs rather than{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">&quot;Resource&quot;: &quot;*&quot;</code>,
            and prefer specific actions over service-level wildcards:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-uploads/incoming/*"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem"],
      "Resource": "arn:aws:dynamodb:us-east-1:111122223333:table/receipts"
    }
  ]
}`}
          </pre>
          <p className="text-sm muted">
            Use IAM Access Analyzer, or the access-advisor data on the role, to find granted actions
            the function has never called, and remove them. This is unglamorous work with an
            outsized payoff: it is the control that turns &ldquo;a dependency had an RCE&rdquo; into
            a contained incident rather than an account-wide one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">2. Treat the deployment package as an artifact</h2>
          <p className="text-sm muted">
            A zip-packaged Node or Python function ships with its dependency tree flattened into the
            bundle. Whatever the build machine resolved is what runs &mdash; not what your manifest
            says, and not what a fresh install would produce today. That gap is the single most
            reliable source of Lambda vulnerabilities, and it is invisible to a manifest-only check.
          </p>
          <p className="text-sm muted">
            Run{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit
            </Link>{" "}
            or{" "}
            <Link href="/blog/pip-audit-python-dependency-scanning" className="underline">
              pip-audit
            </Link>{" "}
            in the build &mdash; they are fast and catch the obvious cases &mdash; but scan the built
            bundle too. The distinction between reading a manifest and reading what is actually
            installed is exactly the one we unpack in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Layers deserve the same treatment and rarely get it. A layer ARN is a dependency with an
            opaque payload, frequently published by a third party, updated on their schedule, and
            attached to dozens of functions at once. Pin the layer version explicitly, keep a record
            of what each one contains, and extract and scan it like any other bundle. A compromised
            or simply stale shared layer is a supply-chain problem with a broad blast radius &mdash;
            the same category of risk covered in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/lambda-security-2.jpg"
          alt="Least privilege permission scoping for an AWS Lambda execution role"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">3. Keep secrets out of environment variables</h2>
          <p className="text-sm muted">
            Lambda environment variables are convenient and encrypted at rest, but they are visible
            to anyone with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">lambda:GetFunctionConfiguration</code>,
            they show up in infrastructure-as-code repositories, and they leak into logs and error
            reports with depressing regularity. They are configuration, not a secret store.
          </p>
          <p className="text-sm muted">
            Fetch secrets at runtime from Secrets Manager or SSM Parameter Store, cache them for the
            life of the execution environment rather than per invocation, and grant the execution
            role read access to those specific parameter paths only. Pair that with a{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning
            </Link>{" "}
            pass over the repository, because the credential most likely to hurt you is the one
            somebody committed to source two years ago and forgot.
          </p>
          <p className="text-sm muted">
            Where a service supports it, skip the static credential entirely and use IAM
            authentication &mdash; RDS IAM auth, for example &mdash; so there is no long-lived secret
            to leak in the first place.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">4. Control who can invoke, and validate what arrives</h2>
          <p className="text-sm muted">
            A Lambda function URL with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">AuthType: NONE</code>{" "}
            is a public HTTPS endpoint into your account. Sometimes that is intentional. Often it was
            a debugging convenience that shipped. Audit function URLs and resource policies the same
            way you audit security groups, and prefer putting an API Gateway or ALB in front where
            you need authentication, throttling, and WAF rules.
          </p>
          <p className="text-sm muted">
            On the code side, the event payload is untrusted input regardless of where it came from.
            An S3 object key, an SQS message body, a DynamoDB stream record &mdash; all of it can
            carry attacker-controlled content. Validate against a schema at the boundary, never
            interpolate event data into a shell command or a query, and be careful about logging raw
            payloads, since that is how sensitive data ends up permanently in CloudWatch.
          </p>
          <p className="text-sm muted">
            Set a timeout and a memory limit that match reality rather than the maximum. Generous
            limits turn a slow-path bug into a cost and availability incident, and reserved or
            provisioned concurrency stops one noisy function from starving every other function in
            the account.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">5. Container-packaged functions are container security</h2>
          <p className="text-sm muted">
            If you package a function as a container image, everything you know about image security
            applies unchanged. The base image carries OS packages with their own CVEs, the image
            needs rebuilding on a cadence to pick up upstream fixes, and the registry copy is what
            actually runs. Enabling{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR image scanning
            </Link>{" "}
            is the baseline; a minimal base image and a rebuild schedule do more, as we cover in{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              the minimal Docker images guide
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Code signing is worth the setup for functions that matter. AWS Signer lets you require
            that a deployment package carries a valid signature from a trusted profile, which closes
            the &ldquo;someone with deploy access pushed unreviewed code&rdquo; path. The reasoning
            mirrors what we describe in{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              container signing with Sigstore and Cosign
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/lambda-security-3.jpg"
          alt="Scanning a Lambda deployment package to reveal bundled library dependencies"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A working checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li><strong>One execution role per function</strong>, scoped to named resource ARNs.</li>
            <li><strong>Scan the built artifact</strong> &mdash; the zip bundle or the ECR image &mdash; not only the manifest.</li>
            <li><strong>Pin and scan layer versions</strong>; treat third-party layers as untrusted dependencies.</li>
            <li><strong>Secrets from Secrets Manager or SSM</strong>, cached per execution environment, never in plaintext env vars.</li>
            <li><strong>Inventory function URLs</strong> and remove any unintended <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">AuthType: NONE</code> endpoint.</li>
            <li><strong>Track runtime end-of-support dates</strong> and migrate before the patch stream stops.</li>
            <li><strong>Validate event payloads</strong> against a schema; assume every field is attacker-controlled.</li>
            <li><strong>Right-size timeout, memory, and concurrency</strong> to bound cost and availability damage.</li>
            <li><strong>Rebuild on a schedule</strong>, not only when code changes &mdash; advisories publish independently of your commits.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Most of the list above is IAM and configuration work that belongs in your
            infrastructure-as-code review and in tools built for cloud posture. We do not do that
            part, and we would rather say so than pretend otherwise.
          </p>
          <p className="text-sm muted">
            What ScanRook covers is the dependency layer &mdash; the one highlighted in the diagram,
            and the one that keeps producing exploitable findings. Point it at the artifact you
            actually deploy: the zip bundle with its vendored dependencies, an extracted layer, or
            the container image for an image-packaged function. It reads the real package databases
            and file contents rather than trusting a manifest, and matches every package against OSV,
            NVD, and Red Hat OVAL in parallel, so a finding tells you which source reported it and
            how well corroborated it is. That matters when you are deciding whether a result in a
            layer somebody else published is worth an emergency redeploy.
          </p>
          <p className="text-sm muted">
            The workflow that fits Lambda well: run the ecosystem auditor in the build for fast
            feedback, scan the packaged artifact before it is published, and re-scan on a schedule so
            functions that have not changed in months still surface newly published advisories.
            Nothing about serverless makes that second scan optional &mdash; it mostly makes it
            easier to forget.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does AWS patch my Lambda dependencies?</h3>
              <p className="text-sm muted mt-1">
                No. AWS maintains the execution environment and supported managed runtimes. Your
                bundled libraries, layers, and container base images are yours to patch and redeploy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What should I scan for a Lambda function?</h3>
              <p className="text-sm muted mt-1">
                The deployed artifact: the zip package including vendored dependencies, the extracted
                contents of each attached layer, and the ECR image for container-packaged functions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are Lambda layers risky?</h3>
              <p className="text-sm muted mt-1">
                They can be. Layers are opaque, often third-party, and attached across many
                functions. Pin versions, record provenance, and scan the extracted contents.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should every function have its own IAM role?</h3>
              <p className="text-sm muted mt-1">
                Yes. Per-function roles bound the blast radius of a compromise. Shared roles hold the
                union of every function&apos;s permissions, which is always more than any one
                function needs.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan what you actually deploy</h3>
          <p className="text-sm muted leading-relaxed">
            Point ScanRook at a Lambda deployment package or the container image behind an
            image-packaged function. Every finding names its advisory source and confidence tier, so
            you can tell a corroborated hit from a single-database one.
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
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
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
