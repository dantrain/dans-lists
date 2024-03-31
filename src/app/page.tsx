import { redirect } from "next/navigation";
import AddList from "~/components/AddList";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import SignOutButton from "./SignOutButton";

export default async function Home() {
  const [session] = await Promise.all([auth()]);

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

        <Lists />
      </div>
    </main>
  );
}

async function Lists() {
  const data = await api.list.getAll();

  return (
    <div>
      <AddList />
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </div>
  );
}
