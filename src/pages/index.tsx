import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import { Suspense } from "react";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Dan&apos;s Lists
        </h1>
        <div className="flex flex-col items-center gap-2">
          <Suspense fallback={<></>}>
            <AuthShowcase />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default Home;

const AuthShowcase = () => {
  const [lists] = api.example.getLists.useSuspenseQuery();

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <ul className="list-disc text-white">
        {lists.map(({ id, title, items }) => (
          <li key={id} className="mb-4">
            <div className="mb-1">{title}</div>
            <ul className="ml-6 list-disc">
              {items.map(({ id, title }) => (
                <li key={id}>{title}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
    </div>
  );
};
