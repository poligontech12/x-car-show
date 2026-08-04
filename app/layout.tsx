import type { Metadata, Viewport } from 'next';
import { Albert_Sans } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { DevToolbar } from '@/components/DevToolbar';
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
          <AppShell>{children}</AppShell>
        </StoreProvider>
        <DevToolbar />
      </body>
    </html>
  );
}
