import type { MetadataRoute } from 'next';

/**
 * What a phone needs in order to keep the app.
 *
 * This is the whole of "installable": a name, an icon, and a request to
 * open without the browser's chrome. Next serves it at
 * /manifest.webmanifest and injects the <link> itself.
 *
 * Deliberately absent: a service worker. The obvious next step is to
 * have one cache pages so the app opens offline, and on this app that
 * would be a bug rather than a feature — every screen is rendered on
 * the server against Postgres, and the roster and the vote tally are
 * the point. A cached page is a photograph of a past tally, and it
 * wins over the real one, so the phone shows a stale count that no
 * amount of pulling to refresh will shift. SHOWDAY.md would send
 * someone to /api/health, which would say the database is up, because
 * it is. Nothing here changes how a page is fetched.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'X Car Show — Cajvana',
    /* Home screens give a label about twelve characters before they
       truncate it, and "X Car Show" is ten. */
    short_name: 'X Car Show',
    description:
      'Întâlnirea anuală și comunitatea de peste an a scenei auto din Bucovina. 142 de înscrieri, un premiu, un vot de persoană.',
    lang: 'ro',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    /* Both from app/tokens.css. background_color is the field Android
       paints while the app is opening, so it matching --ink is what
       makes the launch read as the app rather than as a white flash. */
    background_color: '#08080a',
    theme_color: '#08080a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      /* Android masks the icon to the launcher's shape. Declaring the
         same file maskable is honest here only because the X is drawn
         inside the safe area — see scripts/make-icons.ts. */
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
