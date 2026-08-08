import type { Metadata, Viewport } from 'next';
import { Albert_Sans } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { DevToolbar } from '@/components/DevToolbar';
import { RefreshOnReturn } from '@/components/RefreshOnReturn';
import { followsOf, listCars, votesOf, voteTally } from '@/lib/db/queries';
import { sessionUser } from '@/lib/session';
import { type Account, StoreProvider } from '@/lib/store';
import './globals.css';

const albert = Albert_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-albert',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'X Car Show — Cajvana',
  description:
    'Întâlnirea anuală și comunitatea de peste an a scenei auto din Bucovina. 142 de înscrieri, un premiu, un vot de persoană.',
  /*
    Kept to the home screen on iOS. The name under the icon, and the
    status bar it runs behind.

    `black-translucent` lets the app run under the status bar rather
    than beside it, which is only safe because the layout already
    expects to: app/tokens.css takes its insets from
    env(safe-area-inset-*), and PhoneNav sits below the top one.
  */
  appleWebApp: {
    capable: true,
    title: 'X Car Show',
    statusBarStyle: 'black-translucent',
  },
  /*
    `capable: true` above renders as <meta name="mobile-web-app-capable">,
    the unprefixed name every current browser reads. iOS 16.4 and later
    get standalone from app/manifest.ts anyway; iPhones older than that
    read only Apple's original spelling, and phones at a car meet are
    not all new phones. Anything that does not want it ignores it.
  */
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#08080a',
  colorScheme: 'dark',
};

/**
 * The roster is small enough that fetching it once here beats a request
 * per screen, and it means every page renders with real data on the first
 * paint — no hydration flash, and no deck that opens on the wrong card.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await sessionUser();
  const [cars, tally, votes, following] = await Promise.all([
    listCars(),
    voteTally(),
    user ? votesOf(user.id) : [],
    user ? followsOf(user.id) : {},
  ]);

  const account: Account | null = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role === 'car' ? 'car' : 'vote',
        handle: user.handle ?? '',
        image: user.image ?? undefined,
        town: user.town ?? undefined,
        instagram: user.instagram ?? undefined,
        facebook: user.facebook ?? undefined,
      }
    : null;

  return (
    <html
      lang="ro"
      className={albert.variable}
    >
      <body>
        <StoreProvider initial={{ account, votes, following, cars, tally }}>
          <RefreshOnReturn />
          <AppShell>{children}</AppShell>
        </StoreProvider>
        <DevToolbar />
      </body>
    </html>
  );
}
