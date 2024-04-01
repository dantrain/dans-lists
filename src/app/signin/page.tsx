import { type Provider, auth, authConfig } from "~/server/auth";
import SignInList from "~/components/SignInList";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="pt-20">
      <div
        className="container mx-auto flex flex-col items-center justify-center
          gap-20 px-4"
      >
        <h1
          className="text-5xl font-extrabold tracking-tight text-white
            sm:text-[5rem]"
        >
          Dan&apos;s Lists
        </h1>
        <SignInList providers={authConfig.providers as Provider[]} />
      </div>
    </main>
  );
}
