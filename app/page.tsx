import { RosterDeck } from './roster/RosterDeck';

/**
 * The entrants are the app.
 *
 * Opening this used to land on the Spotted feed, which is the thing people
 * post to rather than the thing they came for — somebody scanning a card at
 * the gate wants the cars. The feed keeps its own address at /spotted and
 * its own place in the bar.
 *
 * The deck itself reads the roster out of the store, which the root layout
 * filled, so there is nothing to fetch here.
 */
export default function HomePage() {
  return <RosterDeck />;
}
