import { Provider as JotaiProvider } from "jotai";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <JotaiProvider>
        <Head>
          <title>Dan&apos;s Lists</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </JotaiProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
