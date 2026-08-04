import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import ThemeProvider from "@/components/ThemeProvider";
import PostHogProvider from "@/components/PostHogProvider";
import { authOptions } from "@/lib/authOptions";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawAppUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://scanrook.io").trim();
const normalizedAppUrl = /^https?:\/\//i.test(rawAppUrl) ? rawAppUrl : `https://${rawAppUrl}`;
const appUrl = (() => {
  try {
    return new URL(normalizedAppUrl);
  } catch {
    return new URL("https://scanrook.io");
  }
})();

export const metadata: Metadata = {
  metadataBase: appUrl,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "SBOM scanner",
    "software bill of materials",
    "container vulnerability scanner",
    "ISO vulnerability scanning",
    "DevSecOps",
    "ScanRook",
  ],
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: appUrl.toString(),
    siteName: APP_NAME,
    type: "website",
    images: [
      {
        url: "/brand/scanrook-lockup.svg",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/brand/scanrook-lockup.svg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/icon.svg" }],
  },
};

const themeInitScript = `
(() => {
  try {
    const raw = localStorage.getItem("dg.theme.mode");
    const mode = raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = mode === "system" ? (isDark ? "dark" : "light") : mode;
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch {}
})();
`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: appUrl.toString(),
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, macOS, Windows",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Container vulnerability scanning",
    "Binary analysis (ELF, PE, Mach-O)",
    "Source tarball scanning",
    "ISO image scanning",
    "SBOM import (CycloneDX, SPDX, Syft)",
    "OSV and NVD enrichment",
    "Red Hat OVAL advisory filtering",
    "EPSS exploit prediction scoring",
    "CISA KEV tagging",
    "Confidence tiers (installed-state-first)",
  ],
  softwareVersion: "1.4.0",
  author: {
    "@type": "Organization",
    name: "ScanRook",
    url: appUrl.toString(),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read at request time, not build time. NEXT_PUBLIC_* is inlined into the client bundle when the
  // image is built, but this deployment supplies env vars in the pod — so the key is resolved here
  // and handed down, which also means rotating it is a restart rather than a rebuild.
  const posthogKey = (process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY || "").trim();
  // Defaults to our own /ingest proxy (see next.config rewrites) rather than PostHog directly.
  const posthogHost = (process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest").trim();

  // Identify the signed-in account so replays and events attach to a real person rather than an
  // anonymous id. Never fatal: analytics must not be able to take the site down.
  let phUser: { id: string; email?: string | null; name?: string | null } | null = null;
  try {
    const session = await getServerSession(authOptions);
    const u = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
    if (u?.id || u?.email) phUser = { id: u.id || u.email!, email: u.email, name: u.name };
  } catch { /* not signed in, or auth unavailable — track anonymously */ }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {posthogKey ? (
          <PostHogProvider apiKey={posthogKey} apiHost={posthogHost} user={phUser}>
            <ThemeProvider>{children}</ThemeProvider>
          </PostHogProvider>
        ) : (
          <ThemeProvider>{children}</ThemeProvider>
        )}
      </body>
    </html>
  );
}
