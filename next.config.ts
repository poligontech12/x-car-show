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

/**
 * Hosts the app is legitimately reached at. The public domain plus
 * anything in TRUSTED_ORIGINS — the same list Better Auth checks, so a
 * doorway that can log you in can also register a car.
 */
function allowedHosts(url: string | undefined): string[] {
  return [url, ...(process.env.TRUSTED_ORIGINS?.split(',') ?? [])]
    .map((o) => o?.trim())
    .filter((o): o is string => Boolean(o))
    .flatMap((o) => {
      try {
        return [new URL(o).host];
      } catch {
        // Bare host, no scheme — usable as-is.
        return [o.replace(/^https?:\/\//, '').replace(/\/+$/, '')];
      }
    });
}

export default (phase: string): NextConfig => {
  const url = siteUrl(phase);
  const hosts = allowedHosts(url);

  return {
    reactStrictMode: true,
    // Ships a self-contained server bundle, so the runtime image carries
    // node_modules for what actually runs rather than the whole install.
    output: 'standalone',
    // The dev badge parks itself over the top-left of the frame, which is
    // exactly where the marque sits.
    devIndicators: false,
    experimental: {
      // Keep build-time checking on the same explicit `tsc` gate used in CI.
      useTypeScriptCli: true,
      /**
       * The app sits behind a proxy, so the origin it sees on a request is
       * the proxy's, not the one people typed. Server actions check that
       * origin and reject anything unfamiliar — without this every save,
       * vote and registration fails in production while working perfectly
       * on localhost.
       */
      serverActions: {
        // Camera photos are compressed client-side and capped again on the server.
        bodySizeLimit: '2mb',
        ...(hosts.length ? { allowedOrigins: hosts } : {}),
      },
    },
  };
};
