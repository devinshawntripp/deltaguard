"use client";

import { getProviders, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import BrandLogo from "@/components/BrandLogo";

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (!active) return;
        setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (!active) return;
        setGoogleEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: next,
    });
    if (!res || res.error) {
      setLoading(false);
      setError("Invalid credentials");
      return;
    }
    // Keep loading=true during redirect — don't flash back to the form
    // res.url from NextAuth is absolute; extract pathname for client-side navigation
    let target = next;
    try {
      const u = new URL(res.url || next, window.location.origin);
      target = u.pathname + u.search;
    } catch { /* fallback to next */ }
    router.push(target);
    router.refresh();
  }

  async function onGoogle() {
    if (!googleEnabled) return;
    setLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: next });
  }

  return (
    <div className="auth-card grid gap-6 relative">
      {/* Loading bar at top */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-xl">
          <div className="h-full bg-[var(--dg-accent,#2563eb)] animate-[loading-bar_1.5s_ease-in-out_infinite]"
            style={{ width: "40%", animation: "loading-bar 1.5s ease-in-out infinite" }} />
          <style>{`
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(150%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
        </div>
      )}

      <div>
        <BrandLogo markClassName="h-10 w-10 rounded-lg" nameClassName="text-lg" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm muted mt-1">Access your {APP_NAME} organization workspace.</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="form-label">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input disabled:opacity-50"
          />
        </label>
        <label className="form-label">
          <span>Password</span>
          <input
            type="password"
            name="password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input disabled:opacity-50"
          />
        </label>
        <button disabled={loading} className="btn-primary disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
            </svg>
          )}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        disabled={loading || !googleEnabled}
        onClick={onGoogle}
        title={!googleEnabled ? "Feature coming soon" : undefined}
        className="btn-secondary w-full disabled:opacity-50"
      >
        Continue with Google
      </button>

      {error && <div className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded px-3 py-2">{error}</div>}
    </div>
  );
}
