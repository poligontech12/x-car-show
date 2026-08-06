/**
 * The feed, held by name rather than reached by position.
 *
 * Where it sits in the bar is a design decision and it has moved; that it
 * is the feed, and that the feed is called Spotted, has not. Anything
 * that means "the feed" points here instead of at PRIMARY_NAV[0].
 */
export const FEED = { href: '/', label: 'Spotted', glyph: 'feed' } as const;

/** The four tabs, in the order they sit in the bar, left to right. */
export const PRIMARY_NAV = [
  { href: '/roster', label: 'Înscriși', glyph: 'roster' },
  FEED,
  { href: '/award', label: 'Premiu', glyph: 'award' },
  { href: '/garage', label: 'Garaj', glyph: 'garage' },
] as const;
