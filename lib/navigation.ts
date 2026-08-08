/**
 * The feed, held by name rather than reached by position.
 *
 * Where it sits in the bar is a design decision and it has moved; that it
 * is the feed, and that the feed is called Spotted, has not. Anything
 * that means "the feed" points here instead of at PRIMARY_NAV[0].
 */
export const FEED = { href: '/spotted', label: 'Spotted', glyph: 'feed' } as const;

/**
 * The roster is the front door, so its href is the bare root. Everything
 * that needs to match a path against it has to test that exactly —
 * `startsWith('/')` is true of every route there has ever been.
 */
export const ROSTER = { href: '/', label: 'Înscriși', glyph: 'roster' } as const;

/**
 * The four tabs, in the order they sit in the bar, left to right.
 *
 * Înscriși is `/` — the entrants are what the app is for, and what somebody
 * scanning a card at the gate came to see. The feed is a place to post to,
 * which is a different thing and no longer the front door.
 */
export const PRIMARY_NAV = [
  ROSTER,
  FEED,
  { href: '/award', label: 'Premiu', glyph: 'award' },
  { href: '/garage', label: 'Garaj', glyph: 'garage' },
] as const;
