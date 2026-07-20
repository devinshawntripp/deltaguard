import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-29";

const title = `YARA Rules: How to Write Ones That Actually Work | ${APP_NAME}`;
const description =
  "A practical guide to YARA rules: rule anatomy, string types and modifiers, condition logic, PE and ELF modules, tuning for false positives, and where to get good rulesets.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "yara rules",
    "yara rule syntax",
    "how to write yara rules",
    "yara rule examples",
    "yara strings condition",
    "yara pe module",
    "yara-x",
    "malware detection rules",
    "yara ruleset",
    "yara false positives",
  ],
  alternates: { canonical: "/blog/yara-rules" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/yara-rules",
    images: ["/blog/yara-rules.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/yara-rules.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "YARA Rules: How to Write Ones That Actually Work",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/yara-rules",
  image: "https://scanrook.io/blog/yara-rules.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are YARA rules?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "YARA rules are pattern-matching descriptions used to identify and classify files, most often malware. Each rule declares a set of strings (text, hexadecimal byte sequences, or regular expressions) and a boolean condition over those strings and file properties. When the condition evaluates true for a scanned file or process memory, the rule matches and YARA reports it.",
      },
    },
    {
      "@type": "Question",
      name: "What are the three sections of a YARA rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A YARA rule has an optional meta section holding descriptive metadata such as author, description, date, and reference; an optional strings section declaring the patterns to search for; and a required condition section containing the boolean expression that decides whether the rule matches. Only the condition is mandatory, though rules without strings are rare.",
      },
    },
    {
      "@type": "Question",
      name: "How do you avoid false positives in YARA rules?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Anchor rules on strings that are specific to the sample family rather than to its compiler, packer, or libraries. Combine several independent indicators in the condition rather than relying on one. Add file-type and size guards such as a magic-byte check and a filesize limit. Then test the rule against a large corpus of known-good files before deploying it, not just against the sample it was written from.",
      },
    },
    {
      "@type": "Question",
      name: "What is YARA-X?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "YARA-X is a rewrite of YARA in Rust from the original author, intended as the successor to the C implementation. It aims for compatibility with existing rules while improving safety, error messages, and scanning performance, and it ships its own command-line tool and language bindings. Most rules written for classic YARA work unchanged, but check module behaviour before migrating a large ruleset.",
      },
    },
    {
      "@type": "Question",
      name: "Do YARA rules detect vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, not directly. YARA answers whether a file looks like something you already have a pattern for, which makes it good at malware, webshells, packers, and embedded secrets. Finding known vulnerable dependencies is a different problem solved by matching installed package versions against advisory databases such as OSV, NVD, and distribution OVAL feeds.",
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
          <div className="text-xs uppercase tracking-wide muted">Deep scanning</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            YARA Rules: How to Write Ones That Actually Work
          </h1>
          <p className="text-sm muted">Published September 29, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            YARA rules are how analysts describe what a malicious file looks like in a form a machine
            can check. The syntax takes about twenty minutes to learn and about twenty samples to
            learn to use well &mdash; the gap between a rule that fires and a rule you can deploy
            fleet-wide is almost entirely about specificity. This is a working guide to the syntax,
            the modifiers that matter, and the habits that keep false positives down.
          </p>
        </header>

        <img
          src="/blog/yara-rules.jpg"
          alt="YARA rules matching byte patterns across binary file data"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The anatomy of a YARA rule</h2>
          <p className="text-sm muted">
            Every rule is three optional-to-mandatory blocks inside a named declaration. If you have
            not met YARA at all yet, our overview of{" "}
            <Link href="/blog/what-is-yara" className="underline">what YARA is and what it is for</Link>{" "}
            covers the background; this piece assumes you want to write the rules.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`rule Example_Webshell_PHP
{
    meta:
        description = "Generic PHP webshell with obfuscated eval"
        author       = "security@example.com"
        date         = "2026-09-20"
        reference    = "internal-IR-2026-114"
        severity     = "high"

    strings:
        $php   = "<?php"
        $eval1 = "eval(base64_decode(" nocase
        $eval2 = "eval(gzinflate(" nocase
        $post  = /\\$_(POST|REQUEST)\\s*\\[/

    condition:
        filesize < 200KB
        and $php in (0..1024)
        and any of ($eval*)
        and $post
}`}
          </pre>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>meta</strong> carries no matching logic at all, but it is what makes a ruleset
              maintainable. Downstream tooling reads these fields to route alerts, so treat{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">description</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">date</code>, and a
              reference as mandatory even though YARA does not.
            </li>
            <li>
              <strong>strings</strong> declares identifiers beginning with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">$</code>. Three kinds
              exist: text strings in quotes, hexadecimal byte sequences in braces, and regular
              expressions between slashes.
            </li>
            <li>
              <strong>condition</strong> is the only required section. It is a boolean expression over
              string identifiers, counts, offsets, file properties, and module data.
            </li>
          </ul>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 700 240"
                role="img"
                aria-label="Anatomy of a YARA rule: meta, strings and condition sections combine with file properties and module data to produce a match decision"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="yr-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                {[
                  { y: 14, label: "meta", sub: "author, date, reference — no matching logic", dim: true },
                  { y: 66, label: "strings", sub: "text  |  { hex bytes }  |  /regex/" },
                  { y: 118, label: "condition", sub: "boolean over strings, filesize, offsets, modules", hot: true },
                ].map((row) => (
                  <g key={row.label}>
                    <rect
                      x={12}
                      y={row.y}
                      width={430}
                      height={42}
                      rx={8}
                      fill={row.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={row.hot ? 0.12 : row.dim ? 0.03 : 0.06}
                      stroke="currentColor"
                      strokeOpacity={row.dim ? 0.25 : 0.45}
                    />
                    <text x={30} y={40 + (row.y - 14)} fontSize="13" fontWeight="600" fill="currentColor" fillOpacity={row.dim ? 0.6 : 1}>
                      {row.label}
                    </text>
                    <text x={120} y={40 + (row.y - 14)} fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                      {row.sub}
                    </text>
                  </g>
                ))}

                <rect x={12} y={170} width={430} height={38} rx={8} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.25} strokeDasharray="4 3" />
                <text x={30} y={194} fontSize="11" fill="currentColor" fillOpacity={0.7}>
                  modules: pe, elf, math, hash — richer condition vocabulary
                </text>
                <line x1={227} y1={170} x2={227} y2={162} stroke="currentColor" strokeWidth={2} markerEnd="url(#yr-arrow)" />

                <line x1={442} y1={139} x2={512} y2={139} stroke="currentColor" strokeWidth={2} markerEnd="url(#yr-arrow)" />
                <rect x={520} y={112} width={166} height={54} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.5} />
                <text x={603} y={135} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">Match</text>
                <text x={603} y={153} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>rule name + tags</text>

                <text x={12} y={230} fontSize="10" fill="currentColor" fillOpacity={0.5}>
                  Only the condition section is required; everything above it exists to serve it.
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              Structure of a YARA rule. The condition is the decision; strings, file properties, and
              module data are the vocabulary available to it.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">String types and the modifiers that matter</h2>
          <p className="text-sm muted">
            Most of the practical power in YARA rules lives in string modifiers. A plain text string
            matches only exact ASCII bytes, which misses far more than people expect &mdash; Windows
            binaries store strings as UTF-16, and any of them may be case-shifted or lightly encoded.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`strings:
    // text with modifiers
    $a = "CreateRemoteThread" ascii wide       // match both ASCII and UTF-16
    $b = "powershell" nocase fullword          // case-insensitive, whole word only
    $c = "http://c2.example.net" xor(0x01-0xff) // single-byte XOR encoded variants
    $d = "eyJhbGciOi" base64                   // base64-encoded form of the plaintext

    // hex with wildcards and jumps
    $e = { 6A 40 68 00 30 00 00 6A 14 8D 91 }
    $f = { E8 ?? ?? ?? ?? 83 C4 08 [4-16] FF 15 }

    // regex — powerful, and the slowest option
    $g = /\\b[A-Za-z0-9._%+-]+@evil\\.example\\.com\\b/ nocase`}
          </pre>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ascii wide</code> should
              be close to a default reflex for anything targeting Windows samples.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">fullword</code> prevents
              a short string from matching inside an unrelated longer identifier &mdash; one of the
              cheapest false-positive reductions available.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">xor</code> and{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">base64</code> generate the
              encoded permutations for you, which catches the laziest obfuscation without you hand-encoding anything.
            </li>
            <li>
              In hex strings, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">??</code>{" "}
              is a wildcard byte and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">[4-16]</code>{" "}
              is a variable-length jump. That combination is what lets a rule survive recompilation
              with different addresses.
            </li>
            <li>
              Regular expressions are the last resort. They are dramatically slower than literal and
              hex strings, and a ruleset that leans on them will be the reason your scans time out.
            </li>
          </ul>
        </section>

        <img
          src="/blog/yara-rules-2.jpg"
          alt="YARA scanning layered file structure and highlighting matching byte regions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Writing better conditions</h2>
          <p className="text-sm muted">
            The condition is where a rule becomes precise or becomes noise. A few patterns do most of
            the work:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`condition:
    // 1. Gate on file type first — cheap, and it eliminates whole corpora
    uint16(0) == 0x5A4D           // MZ, a Windows PE
    and filesize < 2MB

    // 2. Require breadth, not a single lucky string
    and 3 of ($api*)
    and any of ($c2*)

    // 3. Positional constraints tighten things further
    and $marker at 0
    and $config in (filesize - 4096 .. filesize)

    // 4. Counts express intent that presence cannot
    and #retry > 4`}
          </pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">uint16(0) == 0x5A4D</code>{" "}
            idiom deserves special mention. Checking magic bytes before anything else means the rule
            is rejected almost instantly for every file of the wrong type, which matters enormously
            when you are running thousands of rules over a filesystem. The same applies to a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">filesize</code> bound: if
            the family you are describing is a 40&nbsp;KB dropper, say so.
          </p>
          <p className="text-sm muted">
            Modules extend the condition vocabulary well beyond raw bytes. The{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pe</code> module exposes
            imports, exports, sections, resources, and signature information;{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">elf</code> does the
            equivalent for Linux binaries; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">math</code>{" "}
            gives you entropy, which is the standard way to spot a packed or encrypted section.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`import "pe"
import "math"

rule Packed_Section_With_Injection_Imports
{
    condition:
        pe.is_pe
        and pe.imports("kernel32.dll", "VirtualAllocEx")
        and pe.imports("kernel32.dll", "WriteProcessMemory")
        and for any section in pe.sections : (
            math.entropy(section.raw_data_offset, section.raw_data_size) > 7.2
        )
}`}
          </pre>
          <p className="text-sm muted">
            That rule contains no strings at all &mdash; it describes behaviour-shaped structure
            rather than a specific sample, which is exactly the kind of rule that keeps working after
            the author recompiles. It is also exactly the kind of rule that needs testing against
            benign software, because plenty of legitimate installers are packed too.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running and testing rules</h2>
          <p className="text-sm muted">
            The CLI is small. Compile once if you are going to scan repeatedly; the compiled form
            loads far faster than parsing source rules on every run.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# scan a directory recursively, printing the matching strings
yara -r -s rules/webshells.yar /var/www

# compile a ruleset, then scan with the compiled form
yarac rules/*.yar compiled.yarc
yara -C compiled.yarc /opt/app

# pass an external variable a rule can reference
yara -d filepath="/opt/app/bin/agent" rules/hosts.yar /opt/app/bin/agent

# cap per-file scan time so one pathological file cannot stall a sweep
yara -r --timeout=60 rules/ /mnt/image`}
          </pre>
          <p className="text-sm muted">
            Worth knowing about: <strong>YARA-X</strong> is the Rust rewrite from YARA&apos;s original
            author, positioned as the successor to the C implementation. It targets compatibility
            with existing rules while improving error messages, memory safety, and performance, and
            it ships its own CLI and bindings. If you are starting a ruleset today it is worth
            evaluating; if you have a large existing corpus, validate module-dependent rules before
            you switch.
          </p>
          <p className="text-sm muted">
            On testing: the single most useful habit is to run every new rule against a corpus of
            known-good files before it goes anywhere near production &mdash; a few thousand binaries
            from your own base images will do. A rule that matches the sample is trivial to write. A
            rule that matches the sample and nothing in your fleet is the actual deliverable.
          </p>
        </section>

        <img
          src="/blog/yara-rules-3.jpg"
          alt="Malware detection signatures correlating across scanned artifacts"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where to get rules you did not write</h2>
          <p className="text-sm muted">
            Writing everything from scratch is not the intent. The public ecosystem is substantial:
            Florian Roth&apos;s <em>signature-base</em> is one of the most widely deployed open rule
            collections, YARA-Forge packages and normalises rules from multiple public repositories
            into consumable bundles, and the <em>Awesome YARA</em> list is the standard index of
            what else is out there. Many vendors and CERTs publish rules alongside incident reports.
          </p>
          <p className="text-sm muted">
            Two cautions when importing third-party rules. First, quality varies enormously and rule
            licences vary too &mdash; check both. Second, imported rules were tuned against someone
            else&apos;s environment; run them in report-only mode over your own artifacts for a while
            before anything acts on their output. The same discipline we recommend for{" "}
            <Link href="/blog/indicators-of-compromise" className="underline">
              working with indicators of compromise
            </Link>{" "}
            applies here: an indicator without context about where it came from and when it was valid
            is a future false positive.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What YARA rules do not tell you</h2>
          <p className="text-sm muted">
            YARA answers one question well: does this file look like something we already have a
            pattern for? That covers malware, webshells, packers, known implants, and embedded
            credentials. It does not cover the much larger everyday problem of{" "}
            <em>known-vulnerable software you installed on purpose</em>. No YARA rule will tell you
            that the OpenSSL in your base image is three patch releases behind a fix, because that is
            a version-and-advisory question, not a byte-pattern question.
          </p>
          <p className="text-sm muted">
            Detection rules are also a different discipline from log-based detection. If your interest
            is spotting attacker behaviour in telemetry rather than artefacts on disk,{" "}
            <Link href="/blog/sigma-rules" className="underline">Sigma rules</Link> are the analogous
            format for log sources, and{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">Falco</Link>{" "}
            covers runtime syscall behaviour. The three formats are complementary: YARA for files,
            Sigma for logs, Falco for runtime.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Performance at scale</h2>
          <p className="text-sm muted">
            A ruleset that runs fine against a handful of samples can become unusable against a
            filesystem sweep or a fleet of container images, and the causes are consistent enough to
            list.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Short atoms are the usual culprit.</strong> YARA extracts fixed byte sequences
              from each string to drive its fast pre-filter. A string with no distinctive run of
              bytes &mdash; a two-character literal, a regex that starts with a wildcard, a hex
              pattern that opens with several{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">??</code> wildcards
              &mdash; leaves the pre-filter with nothing to work with, and the rule ends up examined
              far more often than it should be. Compiler warnings will usually tell you; do not
              suppress them reflexively.
            </li>
            <li>
              <strong>Order your conditions cheapest-first.</strong> Boolean evaluation short-circuits,
              so a magic-byte check and a filesize bound in front of the expensive string logic
              eliminates most files before any real work happens.
            </li>
            <li>
              <strong>Compile once.</strong> Parsing thousands of source rules on every invocation is
              pure overhead. Build a compiled ruleset in CI and ship that artifact.
            </li>
            <li>
              <strong>Set a per-file timeout.</strong> A deeply nested archive or a pathological
              regex can otherwise stall an entire sweep on one file, and a scan that never finishes
              is indistinguishable from a scan that found nothing.
            </li>
            <li>
              <strong>Split rulesets by target.</strong> There is no reason to evaluate Windows PE
              rules against a Linux container filesystem. Separate files, separate runs, and both get
              faster.
            </li>
          </ul>
          <p className="text-sm muted">
            One more thing worth planning for: scanning inside container images means dealing with
            layered filesystems and archives. A file deleted in a later layer still exists in an
            earlier one, so a naive sweep over extracted layers can report matches on content that is
            not present in the running container at all. Decide up front whether you are scanning the
            flattened final filesystem or every layer independently &mdash; both are legitimate, they
            answer different questions, and confusing them produces findings nobody can reproduce.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a vulnerability scanner first: it opens a container image tarball, binary, or
            source archive, reads the real package databases inside, and matches every component
            against OSV, NVD, and Red Hat OVAL in parallel, with each finding carrying its source and
            a confidence tier. That is the version-and-advisory half of the problem &mdash; the half
            YARA structurally cannot answer.
          </p>
          <p className="text-sm muted">
            The scanner also includes an optional YARA integration behind a build feature gate, so if
            you want signature matching over the same artifact you are already inspecting, you can
            point it at your own rules rather than running a second sweep over an extracted
            filesystem. Both halves matter, and neither replaces the other: run YARA for what
            should not be there, run a vulnerability scanner for what is there but out of date. Our{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>{" "}
            guide covers how to sequence the two in a pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are YARA rules?</h3>
              <p className="text-sm muted mt-1">
                Pattern descriptions that identify and classify files. Each declares strings and a
                boolean condition; when the condition holds for a file, the rule matches.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which sections does a rule need?</h3>
              <p className="text-sm muted mt-1">
                Only <code>condition</code> is required. <code>meta</code> and <code>strings</code>{" "}
                are optional, though almost every practical rule uses both.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I cut false positives?</h3>
              <p className="text-sm muted mt-1">
                Gate on magic bytes and filesize, require several independent indicators, use{" "}
                <code>fullword</code>, and test against a large known-good corpus before deploying.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can YARA find CVEs?</h3>
              <p className="text-sm muted mt-1">
                No. Known-vulnerable dependencies are found by matching installed package versions
                against advisory databases, which is a different mechanism entirely.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the other half of the problem</h3>
          <p className="text-sm muted leading-relaxed">
            YARA finds what should not be there. ScanRook finds what is there and out of date &mdash;
            every package in an image matched against OSV, NVD, and Red Hat OVAL, with the source of
            each finding shown so you can verify it.
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
            <Link href="/blog/what-is-yara" className="underline">
              What Is YARA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/indicators-of-compromise" className="underline">
              Indicators of Compromise
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco Runtime Security Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
