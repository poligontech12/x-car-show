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

    if (!canonical || current.protocol !== 'http:') {
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

  const canonical = canonicalOrigin(configuredSiteUrl);
  if (!canonical) return 'blocked';

  location.replace(
    canonicalDestination(canonical, current),
  );
  return 'redirected';
}
