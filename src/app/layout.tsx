import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { Provider as JotaiProvider } from "jotai";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Dan's Lists",
  description: "Track daily and other checklists",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  appleWebApp: { statusBarStyle: "black" },
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
      </body>
    </html>
  );
}

export const runtime = "edge";
