import type { Metadata, Viewport } from 'next';
import { Albert_Sans } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { StoreProvider } from '@/lib/store';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ro"
      className={albert.variable}
    >
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
