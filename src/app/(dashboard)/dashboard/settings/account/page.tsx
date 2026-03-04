"use client";

import { useState } from "react";

export default function AccountSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      setMessage({ text: "Current password is required.", error: true });
      return;
    }
    if (!newPassword) {
      setMessage({ text: "New password is required.", error: true });
      return;
    }
    if (newPassword.length < 10) {
      setMessage({ text: "New password must be at least 10 characters.", error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New password and confirmation do not match.", error: true });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      setMessage({ text: "Password updated successfully. You may need to sign in again.", error: false });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : String(err),
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm opacity-70 mt-1">Manage your account credentials.</p>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="current-password" className="text-sm font-medium">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <p className="text-xs opacity-60">Minimum 10 characters.</p>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {message && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                message.error
                  ? "border-red-300 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
