"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="btn-secondary !px-2 !py-1 text-xs"
    >
      Sign out
    </button>
  );
}
