type CanonicalHttpsState = 'safe' | 'redirected' | 'blocked';

function canonicalOrigin(configuredSiteUrl: string | undefined): URL | null {
  if (!configuredSiteUrl) return null;

  try {
    const canonical = new URL(configuredSiteUrl);
    if (
      canonical.protocol !== 'https:' ||
      canonical.username ||
      canonical.password ||
      canonical.pathname !== '/' ||
      canonical.search ||
      canonical.hash
    ) {
      return null;
    }
    return canonical;
  } catch {
    return null;
  }
}

/**
 * Loopback is already a secure context — the browser's own definition
 * says so, and a password typed at http://localhost never crosses a
 * wire. Blocking it protects nobody and makes signing in impossible on
 * every development machine and in every end-to-end run.
 *
 * A LAN address is a different thing entirely and is still upgraded:
 * http://192.168.x.x does cross a network, which is exactly the phone
 * on the showground wifi this guard was written for.
 */
function isLoopback(url: URL): boolean {
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '::1'
  );
}

function canonicalDestination(canonical: URL, current: URL): string {
  const destination = new URL(canonical.origin);
  destination.pathname = current.pathname;
  destination.search = current.search;
  destination.hash = current.hash;
  return destination.href;
}

export function canonicalHttpsUrl(
  currentHref: string,
  configuredSiteUrl: string | undefined,
): string | null {
  try {
    const current = new URL(currentHref);
    const canonical = canonicalOrigin(configuredSiteUrl);

    // Nothing to upgrade on loopback, and bouncing a developer to the
    // production origin is the last thing this should do.
    if (!canonical || current.protocol !== 'http:' || isLoopback(current)) {
      return null;
    }

    return canonicalDestination(canonical, current);
  } catch {
    return null;
  }
}

export function enforceCanonicalHttps(
  location: { href: string; replace(url: string): void },
  configuredSiteUrl: string | undefined,
): CanonicalHttpsState {
  let current: URL;
  try {
    current = new URL(location.href);
  } catch {
    return 'blocked';
  }

  if (current.protocol === 'https:') return 'safe';
  if (current.protocol !== 'http:') return 'blocked';
  if (isLoopback(current)) return 'safe';

  const canonical = canonicalOrigin(configuredSiteUrl);
  if (!canonical) return 'blocked';

  location.replace(
    canonicalDestination(canonical, current),
  );
  return 'redirected';
}
