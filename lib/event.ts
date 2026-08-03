/** The show itself. One meet a year, plus whatever happens in between. */

export const EVENT = {
  edition: 'X CAR SHOW 04',
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

/** Voting is open until the moment above, and closed after it. */
export const votingOpen = (now: Date = new Date()): boolean =>
  now.getTime() < new Date(EVENT.votingClosesAt).getTime();
