import type { Metadata } from "next";
import Link from "next/link";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "MCP Server Integration",
  description:
    "Connect ScanRook to AI assistants like Claude, GPT, and others using the Model Context Protocol (MCP). Scan images, check CVEs, and analyze licenses from any MCP-compatible client.",
};

const claudeCodeGlobal = `{
  "mcpServers": {
    "scanrook": {
      "command": "scanrook-mcp",
      "env": {
        "SCANROOK_API_KEY": "your-api-key-here"
      }
    }
  }
}`;

const claudeCodeNpx = `{
  "mcpServers": {
    "scanrook": {
      "command": "npx",
      "args": ["-y", "scanrook-mcp"],
      "env": {
        "SCANROOK_API_KEY": "your-api-key-here"
      }
    }
  }
}`;

const claudeDesktopConfig = `{
  "mcpServers": {
    "scanrook": {
      "command": "npx",
      "args": ["-y", "scanrook-mcp"],
      "env": {
        "SCANROOK_API_KEY": "your-api-key-here"
      }
    }
  }
}`;

export default function McpIntegrationPage() {
  return (
    <article className="grid gap-6">
      {/* What is MCP? */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          MCP Server Integration
        </h1>
        <p className="muted text-sm max-w-3xl">
          The Model Context Protocol (MCP) is an open standard created by
          Anthropic for connecting AI assistants to external tools and data
          sources. Instead of building separate plugins for every AI platform, a
          single MCP server works with any compatible client.
        </p>
        <p className="muted text-sm max-w-3xl">
          ScanRook publishes an MCP server that gives any AI assistant the
          ability to scan Docker and OCI images for vulnerabilities, look up
          specific CVEs, check packages for known issues, and analyze license
          compliance — all through natural conversation.
        </p>
        <p className="text-sm">
          npm package:{" "}
          <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
            scanrook-mcp
          </code>
        </p>
      </section>

      {/* Available Tools */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Available tools"
          blurb="The MCP server exposes these tools to any connected AI assistant."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-current/10 text-left">
                <th className="py-2 pr-4 font-semibold">Tool</th>
                <th className="py-2 pr-4 font-semibold">Description</th>
                <th className="py-2 font-semibold">Auth Required</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">scan_image</td>
                <td className="py-2 pr-4">Scan a Docker/OCI image for vulnerabilities</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">scan_status</td>
                <td className="py-2 pr-4">Check scan progress and results</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">get_findings</td>
                <td className="py-2 pr-4">Get detailed vulnerability findings</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">search_cve</td>
                <td className="py-2 pr-4">Look up a specific CVE</td>
                <td className="py-2">No</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">list_scans</td>
                <td className="py-2 pr-4">List recent scans</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">analyze_licenses</td>
                <td className="py-2 pr-4">Check license compliance</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b border-current/10">
                <td className="py-2 pr-4 font-mono text-xs">compare_scans</td>
                <td className="py-2 pr-4">Compare findings between scans</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">check_package</td>
                <td className="py-2 pr-4">Check a package for known vulnerabilities</td>
                <td className="py-2">No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm muted">
          Tools marked <strong>No</strong> under Auth Required work without an
          API key. This means anyone can use{" "}
          <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
            search_cve
          </code>{" "}
          and{" "}
          <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
            check_package
          </code>{" "}
          for free, without creating an account.
        </p>
      </section>

      {/* Setup with Claude Code */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Setup with Claude Code"
          blurb="Add ScanRook as an MCP server in Claude Code to scan images and check CVEs from your terminal."
        />
        <div className="grid gap-3 text-sm muted">
          <p>
            <strong style={{ color: "var(--dg-text)" }}>Step 1:</strong> Install
            the MCP server globally.
          </p>
          <CodeCopyBlock label="Install" code="npm install -g scanrook-mcp" />
          <p>
            <strong style={{ color: "var(--dg-text)" }}>Step 2:</strong> Add the
            server to your Claude Code settings. Open{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              ~/.claude/settings.json
            </code>{" "}
            (global) or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              .claude/settings.json
            </code>{" "}
            (project) and add the following:
          </p>
          <CodeCopyBlock label="~/.claude/settings.json" code={claudeCodeGlobal} />
          <p>
            Alternatively, run directly with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              npx
            </code>{" "}
            without a global install:
          </p>
          <CodeCopyBlock label="npx alternative" code={claudeCodeNpx} />
          <p>
            Replace{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              your-api-key-here
            </code>{" "}
            with your ScanRook API key. See the Getting an API Key section below.
          </p>
        </div>
      </section>

      {/* Setup with Claude Desktop */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Setup with Claude Desktop"
          blurb="Use ScanRook tools directly in the Claude Desktop app."
        />
        <div className="grid gap-3 text-sm muted">
          <p>
            Add the following to your Claude Desktop configuration file:
          </p>
          <ul className="list-disc ml-5 grid gap-1">
            <li>
              <strong>macOS:</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </code>
            </li>
            <li>
              <strong>Windows:</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                %APPDATA%\Claude\claude_desktop_config.json
              </code>
            </li>
          </ul>
          <CodeCopyBlock label="claude_desktop_config.json" code={claudeDesktopConfig} />
          <p>
            Restart Claude Desktop after saving. The ScanRook tools will appear in
            the tools menu.
          </p>
        </div>
      </section>

      {/* Setup with Other AI Tools */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Setup with other AI tools"
          blurb="Any MCP-compatible client can connect to ScanRook."
        />
        <div className="grid gap-3 text-sm muted">
          <p>
            The ScanRook MCP server uses the standard stdio transport, which
            means any client that supports MCP can connect to it. Point your
            client at the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              scanrook-mcp
            </code>{" "}
            command (or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              npx -y scanrook-mcp
            </code>
            ) and configure these environment variables:
          </p>
          <ul className="list-disc ml-5 grid gap-1">
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                SCANROOK_API_KEY
              </code>{" "}
              — your API key (required for authenticated tools)
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                SCANROOK_API_URL
              </code>{" "}
              — API base URL (optional, defaults to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                https://scanrook.io
              </code>
              )
            </li>
          </ul>
        </div>
      </section>

      {/* Getting an API Key */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Getting an API key"
          blurb="Create an API key from the ScanRook dashboard."
        />
        <ol className="text-sm muted list-decimal ml-5 grid gap-2">
          <li>
            Sign in at{" "}
            <Link href="https://scanrook.io" className="underline">
              scanrook.io
            </Link>
          </li>
          <li>
            Go to{" "}
            <strong>Dashboard</strong> {"->"} <strong>API Keys</strong> (or
            navigate to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              /dashboard/settings/api-keys
            </code>
            )
          </li>
          <li>Click <strong>Create API Key</strong></li>
          <li>
            Copy the key — it starts with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              dgk_
            </code>
          </li>
          <li>
            Set it as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              SCANROOK_API_KEY
            </code>{" "}
            in your MCP configuration
          </li>
        </ol>
        <p className="text-sm muted">
          You do not need an API key for{" "}
          <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
            search_cve
          </code>{" "}
          and{" "}
          <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
            check_package
          </code>
          . These public tools work without authentication.
        </p>
      </section>

      {/* Example Conversations */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Example conversations"
          blurb="Once connected, you can ask your AI assistant things like:"
        />
        <ul className="text-sm muted list-disc ml-5 grid gap-2">
          <li>&ldquo;Scan nginx:1.27 for vulnerabilities&rdquo;</li>
          <li>&ldquo;What&apos;s the status of my last scan?&rdquo;</li>
          <li>&ldquo;Show me critical findings from my nginx scan&rdquo;</li>
          <li>&ldquo;Is CVE-2024-6387 in my image?&rdquo;</li>
          <li>&ldquo;Check if lodash 4.17.20 has any known vulnerabilities&rdquo;</li>
          <li>&ldquo;Analyze the licenses in my last scan&rdquo;</li>
          <li>&ldquo;Compare my last two scans — what changed?&rdquo;</li>
          <li>&ldquo;What are the most exploited CVEs right now?&rdquo;</li>
        </ul>
        <p className="text-sm muted">
          The AI assistant calls the appropriate ScanRook tools behind the
          scenes. You see the results inline in the conversation — no need to
          switch between tools or dashboards.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Troubleshooting"
          blurb="Common issues and how to fix them."
        />
        <div className="grid gap-3 text-sm muted">
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>
              &ldquo;Connection refused&rdquo;
            </h3>
            <p>
              Make sure{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                SCANROOK_API_KEY
              </code>{" "}
              is set in the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                env
              </code>{" "}
              block of your MCP configuration. The server will not start without
              a reachable API endpoint.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>
              &ldquo;Unauthorized&rdquo;
            </h3>
            <p>
              Your API key may be invalid or revoked. Verify it at{" "}
              <Link href="/dashboard/settings/api-keys" className="underline">
                /dashboard/settings/api-keys
              </Link>
              . Generate a new key if needed.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>
              &ldquo;Command not found&rdquo;
            </h3>
            <p>
              The{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                scanrook-mcp
              </code>{" "}
              binary is not installed or not on your PATH. Run{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                npm install -g scanrook-mcp
              </code>{" "}
              or use the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                npx
              </code>{" "}
              configuration instead.
            </p>
          </div>
        </div>
      </section>

      {/* Source Code */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Source code"
          blurb="The MCP server is open source."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            className="btn-secondary"
            href="https://github.com/devinshawntripp/scanrook-mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </Link>
          <Link
            className="btn-secondary"
            href="https://www.npmjs.com/package/scanrook-mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm package
          </Link>
        </div>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}
