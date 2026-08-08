/**
 * The same list, dealt differently for each visitor, and identically every
 * time that visitor asks.
 *
 * Deterministic on purpose. `Math.random()` here would deal a new order on
 * the server and a second one when React hydrated, and the two would not
 * match; it would also reshuffle on every re-render of the root layout,
 * which happens each time somebody votes. Seeded from the visit cookie, the
 * order is decided once and everything downstream agrees about it.
 */

/** xmur3 — string to a well-mixed 32-bit number. */
function seedFrom(text: string): number {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 — small, fast, and good enough to order a car park. */
function generator(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates, on a copy. Every ordering equally likely, which is the
 * whole point: a shuffle that favours anybody is the thing being fixed.
 */
export function shuffled<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const next = generator(seedFrom(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Hold the front of the list where it is and shuffle the rest.
 *
 * A feed is read as a timeline: post a sighting, open the feed, and not
 * finding it at the top reads as a post that failed. The newest few keep
 * their place for that reason; everything behind them is old enough that
 * order is arbitrary anyway, and shuffling it is what makes the feed worth
 * scrolling twice.
 */
export function shuffledAfter<T>(items: readonly T[], keep: number, seed: string): T[] {
  if (items.length <= keep) return items.slice();
  return [...items.slice(0, keep), ...shuffled(items.slice(keep), seed)];
}
