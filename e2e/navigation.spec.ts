import { expect, test } from '@playwright/test';
import { FEED, PRIMARY_NAV } from '../lib/navigation';

test('the primary feed is named Spotted everywhere', () => {
  // By identity, not by index — the feed used to be the first tab and is
  // now the second, which says nothing about what it is called.
  expect(FEED).toEqual({ href: '/spotted', label: 'Spotted', glyph: 'feed' });
  expect(PRIMARY_NAV).toContainEqual(FEED);
  expect(PRIMARY_NAV.map((item) => String(item.label))).not.toContain('Flux');
});

test('the tab bar reads left to right the way the design asks', () => {
  expect(PRIMARY_NAV.map((item) => String(item.label))).toEqual([
    'Înscriși',
    'Spotted',
    'Premiu',
    'Garaj',
  ]);
});
