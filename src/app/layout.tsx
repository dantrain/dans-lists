import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { Provider as JotaiProvider } from "jotai";

import "~/styles/globals.css";
import SetTimezoneCookie from "~/components/SetTimezoneCookie";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Dan's Lists",
  description: "Track daily and other checklists",
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#2e026d" },
    ],
  },
  appleWebApp: { statusBarStyle: "black" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2e026d",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} bg-[#2e026d] text-white
        sm:scrollbar-thin sm:scrollbar-track-violet-950
        sm:scrollbar-thumb-violet-800 sm:scrollbar-thumb-rounded-full`}
      >
        <div
          className="fixed -z-50 h-screen w-screen bg-gradient-to-b
            from-[#2e026d] to-[#15162c]"
        />
        <TRPCReactProvider>
          <JotaiProvider>{children}</JotaiProvider>
        </TRPCReactProvider>
        <SetTimezoneCookie />
      </body>
    </html>
  );
}

export const runtime = "edge";
