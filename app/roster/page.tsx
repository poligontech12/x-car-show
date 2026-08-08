import { permanentRedirect } from 'next/navigation';

/**
 * The roster used to live here and now leads the app from /. Kept as a
 * redirect rather than deleted: a link shared in the group chat, a phone
 * with it bookmarked, a card printed before the move — none of those know
 * the address changed, and none of them should land on a 404.
 */
export default function RosterMoved(): never {
  permanentRedirect('/');
}
