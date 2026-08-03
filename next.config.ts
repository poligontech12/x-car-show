import type { NextConfig } from 'next';

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
  },
};

export default nextConfig;
