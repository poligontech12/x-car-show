/**
 * The feed is deliberately thin: follows, no likes, no comments.
 * Three kinds of thing happen between meets — a build moves on,
 * someone spots a car on the road, or a local meet gets called.
 */

export type FeedCategory = 'BUILDS' | 'SPOTTED' | 'MEETS';
export type FeedFilter = 'ALL' | FeedCategory;

interface FeedBase {
  /** Persistence key for the photo slot. Must be unique per page. */
  slot?: string;
  kind: string;
  /** Red for things the community did, grey for ambient sightings. */
  kindAccent: boolean;
  title: string;
  time: string;
  cat: FeedCategory;
  /** Car this post belongs to, if it belongs to one. */
  carId?: string;
  body?: string;
  slotHint?: string;
}

export interface FeedMeet extends FeedBase {
  cat: 'MEETS';
  day: string;
  month: string;
  meetTitle: string;
  meetMeta: string;
}

export type FeedPost = FeedBase | FeedMeet;

export const isMeet = (p: FeedPost): p is FeedMeet => p.cat === 'MEETS';

export const FEED: FeedPost[] = [
  {
    kind: 'BUILD UPDATE',
    kindAccent: true,
    carId: 's14',
    title: 'SILVIA S14 · #14',
    time: '2H',
    slot: 'feed-1',
    slotHint: 'Wheels back from powder coat',
    body: 'Meisters back from the powder coater. Bronze was supposed to be temporary and now I cannot imagine anything else on it.',
    cat: 'BUILDS',
  },
  {
    kind: 'SPOTTED · DN2 PĂTRĂUȚI',
    kindAccent: false,
    title: 'SPOTTED BY TUDOR V.',
    time: '5H',
    slot: 'feed-2',
    slotHint: 'E30 touring, roadside',
    body: 'E30 touring on the Suceava road, on BBS, sitting right. Owner — if you are on here, register it. We have space in Paddock B.',
    cat: 'SPOTTED',
  },
  {
    kind: 'LOCAL MEET · SUNDAY',
    kindAccent: true,
    title: 'COFFEE RUN',
    time: '1D',
    cat: 'MEETS',
    day: '02',
    month: 'AUG',
    meetTitle: 'COFFEE RUN — GURA HUMORULUI',
    meetMeta: '07:30 · OMV PARKING · 34 GOING',
  } as FeedMeet,
  {
    kind: 'BUILD UPDATE',
    kindAccent: true,
    carId: 'aro',
    title: 'ARO 244 · #44',
    time: '1D',
    slot: 'feed-3',
    slotHint: 'ARO on new leaf packs',
    body: 'New leaf packs in. It is three centimetres taller and no longer fits in my own garage. Worth it.',
    cat: 'BUILDS',
  },
  {
    kind: 'SPOTTED · CAJVANA CENTRU',
    kindAccent: false,
    carId: 'd13',
    title: 'SPOTTED BY MIHAI B.',
    time: '2D',
    slot: 'feed-4',
    slotHint: 'Dacia 1300 outside the shop',
    body: 'Out for bread. Same as it has been since 1978.',
    cat: 'SPOTTED',
  },
];

export const FEED_FILTERS: readonly FeedFilter[] = ['ALL', 'BUILDS', 'SPOTTED', 'MEETS'] as const;

/** Cards recently scanned on the day. Ordered most recent first. */
export const RECENT_SCANS: readonly [string, string][] = [
  ['sup', '4 MIN AGO'],
  ['d13', '12 MIN AGO'],
  ['e30', '36 MIN AGO'],
] as const;
