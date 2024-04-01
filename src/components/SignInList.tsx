"use client";

import { signIn } from "next-auth/react";
import { type Provider } from "~/server/auth";

export default function SignInList({ providers }: { providers: Provider[] }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {providers.map((provider) => (
        <div key={provider.name}>
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold
              text-white no-underline transition hover:bg-white/20"
            onClick={() => void signIn(provider.id)}
          >
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}
