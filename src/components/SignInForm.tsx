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
    setLoading(false);
    if (!res || res.error) {
      setError("Invalid credentials");
      return;
    }
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
    <div className="auth-card grid gap-6">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </label>
        <label className="form-label">
          <span>Password</span>
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </label>
        <button disabled={loading} className="btn-primary">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        disabled={loading || !googleEnabled}
        onClick={onGoogle}
        title={!googleEnabled ? "Feature coming soon" : undefined}
        className="btn-secondary w-full"
      >
        Continue with Google
      </button>

      {error && <div className="text-sm text-red-700 bg-red-100 rounded px-3 py-2">{error}</div>}
    </div>
  );
}
