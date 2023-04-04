import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";
import { authOptions } from "~/server/auth";

const SignIn = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <main className="pt-20">
      <div className="container flex flex-col items-center justify-center gap-20 px-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Dan&apos;s Lists
        </h1>
        <div className="flex flex-col items-center justify-center gap-4">
          {providers
            ? Object.values(providers).map((provider) => (
                <div key={provider.name}>
                  <button
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                    onClick={() => void signIn(provider.id)}
                  >
                    Sign in with {provider.name}
                  </button>
                </div>
              ))
            : null}
        </div>
      </div>
    </main>
  );
};

export default SignIn;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers },
  };
}
