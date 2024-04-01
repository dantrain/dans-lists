import nextPWA from "next-pwa";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  buildExcludes: [/middleware-manifest.json$/],
});

const config = withPWA({});

export default config;
