/** The show itself. One meet a year, plus whatever happens in between. */

/**
 * Which running of the show this is. Kept on its own because the cards
 * carry the marque as a logotype and only need the number beside it —
 * writing "X CAR SHOW 03" next to a lockup that already says X CAR SHOW
 * says it twice.
 */
const EDITION_NO = '03';

export const EVENT = {
  editionNo: EDITION_NO,
  edition: `X CAR SHOW ${EDITION_NO}`,
  place: 'CAJVANA',
  county: 'SUCEAVA',
  dateShort: 'CAJVANA · 8–9 AUG 2026',
  dateNumeric: 'CAJVANA · 8–9.08.2026',
  votingCloses: '18:00',
  /**
   * The deadline the server actually enforces. Romania is on EEST in
   * August, so the offset is +03:00 — writing it out beats trusting the
   * server's own timezone, which on an office box is anyone's guess.
   */
  votingClosesAt: '2026-08-09T18:00:00+03:00',
} as const;

/**
 * How many cars one account may vote for. Three spreads the field better
 * than one — people back a favourite and two they would not have picked
 * first — and the database enforces it through the vote slots.
 */
export const VOTE_LIMIT = 3;

/** Voting is open until the moment above, and closed after it. */
export const votingOpen = (now: Date = new Date()): boolean =>
  now.getTime() < new Date(EVENT.votingClosesAt).getTime();
