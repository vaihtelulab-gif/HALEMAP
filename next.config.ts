import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  /* config options here */
};

const nextConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  // Aggressive caching can cause ChunkLoadError for third-party split chunks (e.g. Clerk).
  aggressiveFrontEndNavCaching: false,
  // Keep default Workbox runtimeCaching rules, and add our own on top.
  extendDefaultRuntimeCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      // Never cache Clerk scripts/chunks; always fetch fresh.
      {
        urlPattern: /^https:\/\/.*\.clerk\.accounts\.dev\/.*$/i,
        handler: "NetworkOnly",
        options: {
          cacheName: "clerk-network-only",
        },
      },
      {
        urlPattern: /^https:\/\/.*\.clerk\.dev\/.*$/i,
        handler: "NetworkOnly",
        options: {
          cacheName: "clerk-network-only-2",
        },
      },
    ],
  },
})(config);

export default nextConfig;
