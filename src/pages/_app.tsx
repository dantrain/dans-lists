import { Provider as JotaiProvider } from "jotai";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";

import { api } from "~/utils/api";

import { CookiesProvider } from "react-cookie";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <CookiesProvider>
        <JotaiProvider>
          <Head>
            <title>Dan&apos;s Lists</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, viewport-fit=cover"
            />
          </Head>
          <Component {...pageProps} />
        </JotaiProvider>
      </CookiesProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
