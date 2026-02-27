"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { APP_NAME } from "@/lib/brand";

export default function RegisterPage() {
    const router = useRouter();
    const [inviteToken, setInviteToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        try {
            const token = new URLSearchParams(window.location.search).get("invite") || "";
            setInviteToken(token.trim());
        } catch {
            setInviteToken("");
        }
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") || "").trim();
        const name = String(form.get("name") || "").trim();
        const password = String(form.get("password") || "");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password, invite_token: inviteToken || undefined }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
            const inviteNotice = json?.invite?.accepted
              ? " Invite accepted."
              : json?.invite?.error
                ? ` Invite not applied: ${json.invite.error}.`
                : "";
            setSuccess(`Account created.${inviteNotice} Redirecting to sign in...`);
            setTimeout(() => router.push("/signin"), 900);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-shell">
            <div className="fixed right-4 top-4 z-20">
                <ThemeToggle />
            </div>
            <div className="auth-card grid gap-6">
                <div>
                    <BrandLogo markClassName="h-10 w-10 rounded-lg" nameClassName="text-lg" />
                    <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                    <p className="text-sm muted mt-1">Register with email/password for your {APP_NAME} organization.</p>
                    {inviteToken ? <p className="text-xs mt-2 text-emerald-700 dark:text-emerald-300">Invite token detected. This account will be added to the invited org after registration.</p> : null}
                </div>

                <form onSubmit={onSubmit} className="grid gap-3">
                    <label className="form-label">
                        <span>Name</span>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                        />
                    </label>
                    <label className="form-label">
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            required
                            className="form-input"
                        />
                    </label>
                    <label className="form-label">
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={10}
                            className="form-input"
                        />
                    </label>
                    <button disabled={loading} className="btn-primary">
                        {loading ? "Creating..." : "Create account"}
                    </button>
                </form>

                {error && <div className="text-sm text-red-700 bg-red-100 rounded px-3 py-2">{error}</div>}
                {success && <div className="text-sm text-emerald-700 bg-emerald-100 rounded px-3 py-2">{success}</div>}

                <div className="text-sm muted">
                    Already have an account? <Link href="/signin" className="underline underline-offset-4">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
