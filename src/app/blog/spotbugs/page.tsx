import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-19";

const title = `SpotBugs: Static Analysis for Java Bytecode | ${APP_NAME}`;
const description =
  "SpotBugs finds bug patterns in compiled Java bytecode. How it works, Maven and Gradle setup, the Find Security Bugs plugin, and what it cannot catch.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "spotbugs",
    "spotbugs maven",
    "spotbugs gradle",
    "find security bugs",
    "findbugs successor",
    "java static analysis",
    "spotbugs sarif",
    "java bug patterns",
    "sast java",
    "spotbugs exclude filter",
  ],
  alternates: { canonical: "/blog/spotbugs" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/spotbugs",
    images: ["/blog/spotbugs.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/spotbugs.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SpotBugs: Static Analysis for Java Bytecode",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/spotbugs",
  image: "https://scanrook.io/blog/spotbugs.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is SpotBugs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SpotBugs is an open-source static analysis tool that inspects compiled Java bytecode for bug patterns - code shapes that are usually mistakes, such as a null dereference on a path the author did not consider, or an equals method with no matching hashCode. It is the maintained successor to FindBugs, which stopped receiving releases around 2015.",
      },
    },
    {
      "@type": "Question",
      name: "Is SpotBugs the same as FindBugs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SpotBugs is the continuation of the FindBugs project under a new name and new maintainers. It kept the detector architecture, bug pattern identifiers, and much of the codebase, so FindBugs knowledge transfers directly. FindBugs itself is no longer maintained and does not support modern Java versions, so new projects should use SpotBugs.",
      },
    },
    {
      "@type": "Question",
      name: "Does SpotBugs find security vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The core tool includes a small malicious-code and security category, but for real security coverage most teams add the Find Security Bugs plugin. That plugin contributes well over a hundred additional detectors mapped to CWE and OWASP categories, covering injection, weak cryptography, path traversal, XML external entities, and unsafe deserialization.",
      },
    },
    {
      "@type": "Question",
      name: "Does SpotBugs analyze source code or bytecode?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bytecode. SpotBugs runs against compiled class files, which means your project must build before it can be analyzed. Giving it access to the source directory is still worthwhile because it lets reports point at real line numbers, but the analysis itself is performed on the compiled output.",
      },
    },
    {
      "@type": "Question",
      name: "Does SpotBugs detect vulnerable dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. SpotBugs analyzes the code you wrote, not the libraries you pulled in. Finding known CVEs in third-party dependencies is software composition analysis, a separate job handled by tools such as OWASP Dependency-Check or a container and artifact scanner. Most Java teams need both.",
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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            SpotBugs: Static Analysis for Java Bytecode
          </h1>
          <p className="text-sm muted">Published October 19, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            SpotBugs is the maintained successor to FindBugs and still one of the most useful static
            analysis tools in the Java ecosystem. It reads compiled bytecode rather than source, looks
            for known <em>bug patterns</em>, and &mdash; with the right plugin &mdash; turns into a
            capable security scanner. Here is how it works, how to wire it into Maven and Gradle
            without drowning in noise, and where its coverage genuinely stops.
          </p>
        </header>

        <img
          src="/blog/spotbugs.jpg"
          alt="SpotBugs static analysis inspecting Java code structure for bug patterns"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What SpotBugs is</h2>
          <p className="text-sm muted">
            SpotBugs is an open-source static analyzer for Java that inspects{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.class</code>{" "}
            files and reports occurrences of bug patterns &mdash; code shapes that are, empirically,
            usually mistakes. A null pointer dereference on a branch the author did not think about.
            An{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">equals</code>{" "}
            override with no matching{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hashCode</code>
            . A stream opened and never closed on the exception path. A mutable array returned
            directly from a getter. None of these are syntax errors and the compiler is perfectly
            happy with all of them.
          </p>
          <p className="text-sm muted">
            The project is the direct continuation of FindBugs, which stopped shipping releases around
            2015 and does not understand modern Java class file versions. SpotBugs picked up the same
            detector architecture and the same bug pattern identifiers &mdash; strings like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NP_NULL_ON_SOME_PATH</code>{" "}
            or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">EI_EXPOSE_REP</code>{" "}
            &mdash; so anything you knew about FindBugs still applies.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Bytecode, not source</h2>
          <p className="text-sm muted">
            The defining design choice is that SpotBugs analyzes compiled bytecode. That has real
            consequences in both directions.
          </p>
          <p className="text-sm muted">
            On the plus side, bytecode is uniform. Language-level sugar &mdash; generics erasure,
            lambdas, switch expressions, records, string concatenation rewrites &mdash; has already
            been lowered by the compiler, so a detector written years ago keeps working across new
            syntax. It also means SpotBugs analyzes anything on the JVM that compiles to class files,
            though the bug patterns are tuned for javac output and produce more noise on Kotlin or
            Scala bytecode.
          </p>
          <p className="text-sm muted">
            On the minus side, your project must compile before it can be analyzed. SpotBugs cannot
            review a branch that does not build, and it cannot see anything the compiler discarded.
            Point it at the source directory as well so reports can resolve real line numbers &mdash;
            the analysis is still bytecode, but the output becomes far more navigable.
          </p>
        </section>

        <img
          src="/blog/spotbugs-2.jpg"
          alt="SpotBugs bug pattern detection highlighting defective code paths"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Categories, confidence, and rank
          </h2>
          <p className="text-sm muted">
            Every SpotBugs finding carries three orthogonal labels, and understanding them is the
            difference between a useful gate and an ignored report.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Category</strong> &mdash; what kind of problem it is: Correctness, Bad Practice,
              Performance, Multithreaded Correctness, Internationalization, Malicious Code
              Vulnerability, Security, or Dodgy Code. Correctness is where the genuine bugs cluster;
              Dodgy Code is where most of the noise lives.
            </li>
            <li>
              <strong>Confidence</strong> (historically called priority) &mdash; how sure the detector
              is, on a high / medium / low scale. Raising the reporting threshold to medium or high is
              the single most effective noise reduction available.
            </li>
            <li>
              <strong>Rank</strong> &mdash; a 1 to 20 severity scale grouped into bands, with the
              lowest numbers being the most alarming. Rank and confidence are independent: a
              high-confidence finding can still be a trivial style issue.
            </li>
          </ul>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Matrix showing how SpotBugs findings distribute across confidence and rank, with high-confidence high-severity findings in the top-left triage-first quadrant"
              className="w-full"
              style={{ minWidth: 520 }}
            >
              <text x={12} y={18} fontSize="11" fill="currentColor" fillOpacity={0.7}>
                Rank band (severity)
              </text>
              <text
                x={688}
                y={242}
                fontSize="11"
                textAnchor="end"
                fill="currentColor"
                fillOpacity={0.7}
              >
                Detector confidence &rarr;
              </text>
              {["Scariest (1-4)", "Scary (5-9)", "Troubling (10-14)", "Concern (15-20)"].map(
                (label, r) => (
                  <text
                    key={label}
                    x={12}
                    y={58 + r * 44}
                    fontSize="10.5"
                    fill="currentColor"
                    fillOpacity={0.65}
                  >
                    {label}
                  </text>
                )
              )}
              {["Low", "Medium", "High"].map((label, c) => (
                <text
                  key={label}
                  x={220 + c * 150 + 70}
                  y={228}
                  fontSize="10.5"
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity={0.65}
                >
                  {label}
                </text>
              ))}
              {[0, 1, 2, 3].map((r) =>
                [0, 1, 2].map((c) => {
                  const weight = (3 - r) * 0.9 + c * 1.4;
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={220 + c * 150}
                      y={34 + r * 44}
                      width={140}
                      height={36}
                      rx={5}
                      fill="var(--dg-accent,#2563eb)"
                      fillOpacity={0.04 + weight * 0.038}
                      stroke="currentColor"
                      strokeOpacity={0.25}
                    />
                  );
                })
              )}
              <rect
                x={370}
                y={34}
                width={290}
                height={80}
                rx={7}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.55}
                strokeDasharray="5 4"
              />
              <text
                x={515}
                y={92}
                fontSize="11"
                textAnchor="middle"
                fontWeight="600"
                fill="currentColor"
                fillOpacity={0.85}
              >
                triage here first
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              Illustrative, not measured: SpotBugs findings sort along two independent axes. Gate on
              the dashed region &mdash; medium-or-better confidence at the scarier rank bands &mdash;
              and report the rest without failing the build.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Wiring SpotBugs into a build</h2>
          <p className="text-sm muted">
            SpotBugs ships a CLI, an Ant task, a Maven plugin, a Gradle plugin, and IDE integrations.
            Almost everyone uses the build plugin. A Maven configuration that reports usefully without
            blocking every merge on style nits looks roughly like this:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`<plugin>
  <groupId>com.github.spotbugs</groupId>
  <artifactId>spotbugs-maven-plugin</artifactId>
  <configuration>
    <!-- Max effort finds more, and costs more analysis time -->
    <effort>Max</effort>
    <!-- Only report medium confidence and above -->
    <threshold>Medium</threshold>
    <failOnError>true</failOnError>
    <excludeFilterFile>spotbugs-exclude.xml</excludeFilterFile>
    <plugins>
      <plugin>
        <groupId>com.h3xstream.findsecbugs</groupId>
        <artifactId>findsecbugs-plugin</artifactId>
        <version>LATEST</version>
      </plugin>
    </plugins>
  </configuration>
  <executions>
    <execution>
      <goals><goal>check</goal></goals>
    </execution>
  </executions>
</plugin>`}
          </pre>
          <p className="text-sm muted">The Gradle equivalent is short:</p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`plugins {
    id 'java'
    id 'com.github.spotbugs'
}

dependencies {
    spotbugsPlugins 'com.h3xstream.findsecbugs:findsecbugs-plugin:1.13.0'
}

spotbugs {
    effort = com.github.spotbugs.snom.Effort.MAX
    reportLevel = com.github.spotbugs.snom.Confidence.MEDIUM
    excludeFilter = file('spotbugs-exclude.xml')
}

tasks.named('spotbugsMain') {
    reports {
        sarif { required = true }
    }
}`}
          </pre>
          <p className="text-sm muted">
            Two flags do most of the work.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">effort</code>{" "}
            trades analysis time for depth &mdash; max enables more expensive interprocedural
            reasoning and finds real bugs the default misses.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">threshold</code>{" "}
            / reportLevel controls how much low-confidence output you see. Running max effort with a
            medium threshold is the combination most teams settle on.
          </p>
          <p className="text-sm muted">
            SARIF output matters more than it looks. Emitting SARIF lets findings flow into GitHub
            code scanning and appear as annotations on the pull request diff, which is where developers
            will actually read them. That is the practical core of{" "}
            <Link href="/blog/shift-left-security" className="underline">
              shifting security left
            </Link>{" "}
            &mdash; results have to land where the work is happening.
          </p>
        </section>

        <img
          src="/blog/spotbugs-3.jpg"
          alt="Layered Java bytecode analysis performed by the SpotBugs detector engine"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Find Security Bugs: the plugin that matters
          </h2>
          <p className="text-sm muted">
            Base SpotBugs is a correctness tool with a thin security slice. Find Security Bugs
            (findsecbugs) is the community plugin that turns it into a genuine Java SAST tool. It adds
            well over a hundred detectors mapped to CWE and OWASP categories: SQL and command
            injection, path traversal, XML external entity processing, unsafe deserialization,
            hardcoded credentials, weak or misused cryptography, predictable random number generation,
            and framework-specific issues in Spring, Struts, JSP, and Android code.
          </p>
          <p className="text-sm muted">
            The detectors are taint-tracking based, which is both the strength and the weakness. They
            follow data from a source to a sink, so they can genuinely tell you that a request
            parameter reaches a JDBC statement unsanitised. They also lose the trail across reflection,
            framework magic, and custom sanitiser methods they do not recognise &mdash; producing both
            false positives on safe code and silence on unsafe code. Treat findings as leads to
            confirm, not verdicts. The tradeoffs are the same ones we describe in{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
            , and rule-based tools like{" "}
            <Link href="/blog/semgrep" className="underline">
              Semgrep
            </Link>{" "}
            attack the problem from a complementary direction.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Managing false positives</h2>
          <p className="text-sm muted">
            Every static analyzer eventually gets muted because someone bolted it to the build at
            maximum verbosity. Suppress deliberately instead:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Exclude filter files</strong> are the main mechanism &mdash; an XML file that
              matches on class, method, bug pattern, or category. Exclude generated code, test
              fixtures, and whole categories you have consciously decided not to enforce.
            </li>
            <li>
              <strong>
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                  @SuppressFBWarnings
                </code>
              </strong>{" "}
              from the spotbugs-annotations artifact suppresses at the declaration site. Always fill in
              the justification field &mdash; an unexplained suppression is indistinguishable from
              a bug someone hid.
            </li>
            <li>
              <strong>Baseline on adoption.</strong> On an existing codebase, record current findings
              and gate only on new ones. Demanding that a decade-old service reach zero findings before
              the gate turns on guarantees the gate never turns on.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What SpotBugs cannot tell you</h2>
          <p className="text-sm muted">
            SpotBugs analyzes the code you wrote. It has nothing to say about the code you imported,
            and in a typical Java service the imported code is the overwhelming majority of what
            ships. Log4Shell was not a bug in anyone&apos;s application code, and no bytecode detector
            would have flagged the call site &mdash; the problem lived in a dependency, and finding it
            required matching an installed library version against a published advisory. That is{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>
            , a fundamentally different technique.
          </p>
          <p className="text-sm muted">
            It also stops at the JAR boundary. The JRE in your base image, the OpenSSL underneath it,
            the distribution packages installed by the Dockerfile &mdash; all of that is invisible to
            SpotBugs and all of it carries CVEs. A complete picture for a Java service needs three
            layers: SpotBugs for your own code, a dependency scanner for your libraries, and an image
            scanner for everything under them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not a SpotBugs replacement and does not try to be &mdash; we do not analyze
            your bytecode for null dereferences. We cover the layers SpotBugs cannot see. Point
            ScanRook at a built container tarball or a source archive and it reads the real package
            inventory, including Maven coordinates, the JRE, and the operating system packages, then
            matches every one of them against OSV, NVD, and Red Hat OVAL in parallel, tagging each
            finding with its source and a confidence tier.
          </p>
          <p className="text-sm muted">
            The pairing is natural: SpotBugs on{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mvn verify</code>{" "}
            catching mistakes in code review, ScanRook on the resulting image catching known
            vulnerabilities in everything that code sits on top of. Neither one substitutes for the
            other, and a Java team that runs only one of them has a large blind spot.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is SpotBugs?</h3>
              <p className="text-sm muted mt-1">
                An open-source static analyzer that inspects compiled Java bytecode for bug patterns
                &mdash; code shapes that are usually mistakes. It is the maintained successor to
                FindBugs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it find security issues?</h3>
              <p className="text-sm muted mt-1">
                Only lightly on its own. Add the Find Security Bugs plugin for taint-tracking
                detectors covering injection, weak crypto, deserialization, and path traversal, mapped
                to CWE.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Source or bytecode?</h3>
              <p className="text-sm muted mt-1">
                Bytecode &mdash; the project must compile first. Supply the source directory too so
                reports resolve to real line numbers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Will it catch vulnerable dependencies?</h3>
              <p className="text-sm muted mt-1">
                No. Known CVEs in third-party libraries require composition analysis or an image
                scanner; SpotBugs only inspects the code you wrote.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the other half</h3>
          <p className="text-sm muted leading-relaxed">
            SpotBugs handles your code. Scan the built image with ScanRook to see the Maven
            dependencies, JRE, and OS packages underneath it &mdash; every finding labelled with its
            advisory source and confidence tier.
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
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/owasp-dependency-check-alternatives" className="underline">
              OWASP Dependency-Check Alternatives
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is Software Composition Analysis?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
