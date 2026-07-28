/**
 * Shops as profiles. Every shop here has work on at least one car
 * in the roster — no paid placement, which is the whole point.
 */

export interface Partner {
  name: string;
  meta: string;
}

export const PARTNERS: Partner[] = [
  { name: 'DRAGOMIR TUNING', meta: 'SUCEAVA · DYNO + MANAGEMENT MOTOR' },
  { name: 'AUTOSTIL DETAILING', meta: 'RĂDĂUȚI · CORECȚIE VOPSEA + FOLIE PPF' },
  { name: 'NORD EXHAUST', meta: 'FĂLTICENI · EVACUĂRI INOX PE COMANDĂ' },
  { name: 'CAJVANA ANVELOPE', meta: 'CAJVANA · ANVELOPE + GEOMETRIE' },
  { name: 'PIESE NORD', meta: 'SUCEAVA · PIESE NOI ȘI SECOND' },
  { name: 'FOTO BUCOVINA', meta: 'SUCEAVA · FOTOGRAFIE DE EVENIMENT' },
];
