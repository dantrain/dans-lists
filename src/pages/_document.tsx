import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Track daily and other checklists" />
        <meta name="theme-color" content="#181818" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
