"use client";

import { signIn } from "next-auth/react";
import { type Provider } from "~/server/auth";
import Button from "./Button";
import { useState } from "react";
import Spinner from "./Spinner";

export default function SignInList({ providers }: { providers: Provider[] }) {
  const [signingIn, setSigningIn] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {providers.map((provider) => (
        <div key={provider.name}>
          <Button
            className="flex w-60 justify-center rounded-full px-10 py-3"
            disabled={signingIn}
            onPress={async () => {
              try {
                setSigningIn(true);
                await signIn(provider.id);
              } catch {
                setSigningIn(false);
              }
            }}
          >
            {signingIn ? (
              <Spinner className="m-1" />
            ) : (
              <>Sign in with {provider.name}</>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
