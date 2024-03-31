import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Lists from "~/components/Lists";
import SignOutButton from "~/components/SignOutButton";

export default async function Home() {
  const [session, data] = await Promise.all([auth(), api.list.getAll()]);

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="relative px-4 pt-12 sm:pt-20">
      <div className="mx-auto mb-10 flex w-full max-w-sm flex-col gap-4">
        <div className="flex gap-2">
          <span>Next runtime:</span>
          <pre>{process.env.NEXT_RUNTIME}</pre>
        </div>

        <SignOutButton />

        <Lists data={data} />
      </div>
    </main>
  );
}
