/**
 * Shops as profiles. Every shop here has work on at least one car
 * in the roster — no paid placement, which is the whole point.
 */

export interface Partner {
  name: string;
  meta: string;
}

export const PARTNERS: Partner[] = [
  { name: 'DRAGOMIR TUNING', meta: 'SUCEAVA · DYNO + ENGINE MANAGEMENT' },
  { name: 'AUTOSTIL DETAILING', meta: 'RĂDĂUȚI · PAINT CORRECTION + PPF' },
  { name: 'NORD EXHAUST', meta: 'FĂLTICENI · CUSTOM STAINLESS' },
  { name: 'CAJVANA ANVELOPE', meta: 'CAJVANA · TYRES + ALIGNMENT' },
  { name: 'PIESE NORD', meta: 'SUCEAVA · PARTS, USED AND NEW' },
  { name: 'FOTO BUCOVINA', meta: 'SUCEAVA · EVENT PHOTOGRAPHY' },
];
