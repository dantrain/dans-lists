import { Head, Html, Main, NextScript } from "next/document";
import { appleDeviceSpecsForLaunchImages } from "pwa-asset-generator";
import { Fragment } from "react";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Track daily and other checklists" />
        <meta name="theme-color" content="#2e026d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg"
          color="#2e026d"
        ></link>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        {appleDeviceSpecsForLaunchImages.map((spec, i) => {
          return (
            <Fragment key={i}>
              <link
                key={`apple-splash-${spec.portrait.width}-${spec.portrait.height}`}
                rel="apple-touch-startup-image"
                href={`apple-splash-${spec.portrait.width}-${spec.portrait.height}.png`}
                media={`(device-width: ${
                  spec.portrait.width / spec.scaleFactor
                }px) and (device-height: ${
                  spec.portrait.height / spec.scaleFactor
                }px) and (-webkit-device-pixel-ratio: ${
                  spec.scaleFactor
                }) and (orientation: portrait)`}
              />
              <link
                key={`apple-splash-${spec.portrait.width}-${spec.portrait.height}`}
                rel="apple-touch-startup-image"
                href={`apple-splash-${spec.portrait.width}-${spec.portrait.height}.png`}
                media={`(device-width: ${
                  spec.portrait.height / spec.scaleFactor
                }px) and (device-height: ${
                  spec.portrait.width / spec.scaleFactor
                }px) and (-webkit-device-pixel-ratio: ${
                  spec.scaleFactor
                }) and (orientation: landscape)`}
              />
            </Fragment>
          );
        })}
      </Head>
      <body className="bg-[#2e026d]">
        <div className="fixed -z-50 h-screen w-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
