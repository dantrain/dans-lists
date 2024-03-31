"use client";

import { redirect } from "next/navigation";

type ErrorProps = {
  error: Error & { digest?: string };
};

export default function Error({ error }: ErrorProps) {
  if (error.message === "UNAUTHORIZED") {
    redirect("/signin");
  }

  return (
    <div>
      <h2>Something went wrong!</h2>
      <pre>{error.name}</pre>
      <pre>{error.message}</pre>
    </div>
  );
}
