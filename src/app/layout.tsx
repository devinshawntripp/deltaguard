import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
