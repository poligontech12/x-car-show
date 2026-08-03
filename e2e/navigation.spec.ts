import { expect, test } from '@playwright/test';
import { PRIMARY_NAV } from '../lib/navigation';

test('the primary feed is named Spotted everywhere', () => {
  expect(PRIMARY_NAV[0]).toEqual({ href: '/', label: 'Spotted', glyph: 'feed' });
  expect(PRIMARY_NAV.map((item) => String(item.label))).not.toContain('Flux');
});
