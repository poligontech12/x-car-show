import type { NextConfig } from 'next';

/**
 * The app sits behind the server's existing reverse proxy, so the origin
 * it sees on a request is the proxy's, not the one people typed. Server
 * actions check that origin and reject anything unfamiliar — without this
 * every save, vote and registration fails in production while working
 * perfectly on localhost.
 */
const siteHost = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ships a self-contained server bundle, so the runtime image carries
  // node_modules for what actually runs rather than the whole install.
  output: 'standalone',
  // The dev badge parks itself over the top-left of the frame, which is
  // exactly where the marque sits.
  devIndicators: false,
  experimental: {
    // TypeScript 7 dropped the compiler API Next reaches for by default;
    // this routes the build's type check through `tsc` instead.
    useTypeScriptCli: true,
    ...(siteHost ? { serverActions: { allowedOrigins: [siteHost] } } : {}),
  },
};

export default nextConfig;
