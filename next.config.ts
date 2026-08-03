import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import type { NextConfig } from 'next';

/**
 * The public origin is inlined at build time and encoded into every printed
 * QR code. Getting it wrong is not a bug you notice — the app works, the
 * cards look right, and the codes point somewhere dead. A production build
 * without it is refused rather than quietly defaulting to localhost.
 */
function siteUrl(phase: string): string | undefined {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url;
  if (phase !== PHASE_PRODUCTION_BUILD) return undefined;
  throw new Error(
    'NEXT_PUBLIC_SITE_URL is not set.\n\n' +
      'It is baked into this build and encoded into every printed QR code,\n' +
      'so a production build will not guess at it. Set it to the address\n' +
      'people actually type, for example:\n\n' +
      '  NEXT_PUBLIC_SITE_URL=https://xcarshow.poligontech.ro npm run build\n',
  );
}

export default (phase: string): NextConfig => {
  const url = siteUrl(phase);

  return {
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
      /**
       * The app sits behind a proxy, so the origin it sees on a request is
       * the proxy's, not the one people typed. Server actions check that
       * origin and reject anything unfamiliar — without this every save,
       * vote and registration fails in production while working perfectly
       * on localhost.
       */
      ...(url ? { serverActions: { allowedOrigins: [new URL(url).host] } } : {}),
    },
  };
};
