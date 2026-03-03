import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import BrandLogo from "@/components/BrandLogo";
import PublicNavClient from "@/components/PublicNavClient";
import { APP_NAME } from "@/lib/brand";

export default async function PublicSiteShell({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    const isSignedIn = !!(session?.user?.id && !session?.revoked);

    return (
        <div className="app-shell">
            <header className="app-header">
                <div className="app-header-inner flex-wrap">
                    <Link href="/" className="app-brand">
                        <BrandLogo />
                    </Link>
                    <PublicNavClient isSignedIn={isSignedIn} />
                </div>
            </header>
            {children}
            <footer className="app-footer">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2">
                        <BrandLogo compact />
                        <span>{APP_NAME}</span>
                    </span>
                    <span>Installed-state-first vulnerability scanning</span>
                    <span className="inline-flex gap-2">
                        <Link href="/docs" className="app-nav-link">Docs</Link>
                        <Link href="/roadmap" className="app-nav-link">Roadmap</Link>
                        <Link href="/blog" className="app-nav-link">Blog</Link>
                        <a href="https://scanrook.sh" className="app-nav-link">CLI</a>
                    </span>
                </div>
            </footer>
        </div>
    );
}
