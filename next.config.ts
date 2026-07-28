import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // TypeScript 7 dropped the compiler API Next reaches for by default;
    // this routes the build's type check through `tsc` instead.
    useTypeScriptCli: true,
  },
};

export default nextConfig;
