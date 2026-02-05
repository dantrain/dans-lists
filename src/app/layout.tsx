import { Provider as JotaiProvider } from "jotai";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import appleDeviceSpecsForLaunchImages from "pwa-asset-generator/dist/config/apple-fallback-data.json";
import { type ReactNode } from "react";
import SetTimezoneCookie from "~/components/SetTimezoneCookie";
import { TRPCReactProvider } from "~/trpc/react";

import "~/styles/globals.css";

const appleSplashImages = appleDeviceSpecsForLaunchImages.flatMap((spec) => [
  {
    url: `apple-splash-${spec.portrait.width}-${spec.portrait.height}.png`,
    media: `(device-width: ${
      spec.portrait.width / spec.scaleFactor
    }px) and (device-height: ${
      spec.portrait.height / spec.scaleFactor
    }px) and (-webkit-device-pixel-ratio: ${
      spec.scaleFactor
    }) and (orientation: portrait)`,
  },
  {
    url: `apple-splash-${spec.portrait.height}-${spec.portrait.width}.png`,
    media: `(device-width: ${
      spec.portrait.height / spec.scaleFactor
    }px) and (device-height: ${
      spec.portrait.width / spec.scaleFactor
    }px) and (-webkit-device-pixel-ratio: ${
      spec.scaleFactor
    }) and (orientation: landscape)`,
  },
]);

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    startupImage: appleSplashImages,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2e026d",
  viewportFit: "cover",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`sm:scrollbar-thin sm:scrollbar-track-violet-950
          sm:scrollbar-thumb-violet-800 sm:scrollbar-thumb-rounded-full
          bg-[#2e026d] font-sans text-white`}
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
