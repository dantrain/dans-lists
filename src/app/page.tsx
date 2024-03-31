import { CreatePost } from "~/app/_components/create-post";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import SignOutButton from "./SignOutButton";
import { redirect } from "next/navigation";

export default async function Home() {
  const [hello, session] = await Promise.all([
    api.post.hello({ text: "from tRPC" }),
    auth(),
  ]);

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="relative px-4 pt-12 sm:pt-20">
      <div className="mx-auto mb-10 flex w-full max-w-sm flex-col gap-12">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Dan&apos;s Lists Next
        </h1>
        <div className="flex gap-2">
          <span>Next runtime:</span>
          <pre>{process.env.NEXT_RUNTIME}</pre>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">{hello.greeting}</p>

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
              <span>Logged in as {session.user?.name}</span>
            </p>
            <SignOutButton />
          </div>
        </div>

        <CrudShowcase />
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.post.getLatest();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreatePost />
    </div>
  );
}
