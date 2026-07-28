/**
 * The feed is deliberately thin: follows, no likes, no comments. Two things
 * happen between editions — a build moves on, or somebody spots a car on
 * the road. (Meets are not a feature yet.)
 */

export type FeedCategory = 'PROIECTE' | 'VĂZUTE';
export type FeedFilter = 'TOATE' | FeedCategory;

export interface FeedPost {
  /** Persistence key for the photo slot. Must be unique per page. */
  slot?: string;
  kind: string;
  /** Red for what the community did, grey for ambient sightings. */
  kindAccent: boolean;
  title: string;
  time: string;
  cat: FeedCategory;
  /** The car this post belongs to, if it belongs to one. */
  carId?: string;
  body?: string;
  slotHint?: string;
}

export const FEED: FeedPost[] = [
  {
    kind: 'PROIECT ACTUALIZAT',
    kindAccent: true,
    carId: 's14',
    title: 'SILVIA S14 · #14',
    time: '2H',
    slot: 'feed-1',
    slotHint: 'Jantele întoarse de la vopsit',
    body: 'Meister-ele s-au întors de la pulverizat. Bronzul trebuia să fie temporar și acum nu mi-o mai imaginez cu altceva.',
    cat: 'PROIECTE',
  },
  {
    kind: 'VĂZUTĂ · DN2 PĂTRĂUȚI',
    kindAccent: false,
    title: 'VĂZUTĂ DE TUDOR V.',
    time: '5H',
    slot: 'feed-2',
    slotHint: 'E30 touring, pe marginea drumului',
    body: 'E30 touring pe drumul Sucevei, pe BBS, la înălțimea potrivită. Dacă e proprietarul pe aici — înscrie-o. Mai avem loc în Padocul B.',
    cat: 'VĂZUTE',
  },
  {
    kind: 'PROIECT ACTUALIZAT',
    kindAccent: true,
    carId: 'aro',
    title: 'ARO 244 · #44',
    time: '1Z',
    slot: 'feed-3',
    slotHint: 'ARO pe arcuri noi',
    body: 'Arcuri noi montate. E cu trei centimetri mai înalt și nu mai intră în propriul meu garaj. A meritat.',
    cat: 'PROIECTE',
  },
  {
    kind: 'VĂZUTĂ · CAJVANA CENTRU',
    kindAccent: false,
    carId: 'd13',
    title: 'VĂZUTĂ DE MIHAI B.',
    time: '2Z',
    slot: 'feed-4',
    slotHint: 'Dacia 1300 în fața magazinului',
    body: 'Ieșită după pâine. La fel cum face din 1978.',
    cat: 'VĂZUTE',
  },
];

export const FEED_FILTERS: readonly FeedFilter[] = ['TOATE', 'PROIECTE', 'VĂZUTE'] as const;

/** Cards scanned recently on show day. Most recent first. */
export const RECENT_SCANS: readonly [string, string][] = [
  ['sup', 'ACUM 4 MIN'],
  ['d13', 'ACUM 12 MIN'],
  ['e30', 'ACUM 36 MIN'],
] as const;
