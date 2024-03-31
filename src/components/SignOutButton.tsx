"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline
        transition hover:bg-white/20"
      type="button"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
