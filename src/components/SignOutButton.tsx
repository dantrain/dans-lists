"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline
        transition hover:bg-white/20"
      type="button"
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/signin");
      }}
    >
      Sign out
    </button>
  );
}
