'use client';

import { useRouter } from 'next/navigation';
import { ScreenTitle, TitleAside } from '@/components/StickyHeader';
import { displayModel, standings, votesCastLabel } from '@/lib/cars';
import { EVENT, VOTE_LIMIT } from '@/lib/event';
import { useStore } from '@/lib/store';
import styles from './award.module.css';

function Trophy() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.5 2.5h9v4a4.5 4.5 0 0 1-9 0v-4Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 11v3M6 15.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AwardScreen() {
  const router = useRouter();
  const { signedIn, hydrated, votes, toggleVote, votesLeft, cars, tally, myCars } = useStore();

  const rows = standings(cars, tally, votes);
  const owned = new Set(myCars.map((c) => c.id));

  const onRowClick = (carId: string) => {
    if (!signedIn) return router.push('/auth?mode=register');
    // The server refuses it anyway; better not to offer it.
    if (owned.has(carId)) return;
    toggleVote(carId);
  };

  return (
    <div className={styles.screen}>
      <ScreenTitle
        className="a-up delay-300"
        label="Premiul ediției"
        icon={<Trophy />}
        lines={['Mașina', 'show-ului']}
        aside={
          <>
            <TitleAside>{VOTE_LIMIT} voturi de persoană</TitleAside>
            <TitleAside gold>Se închide la {EVENT.votingCloses}</TitleAside>
          </>
        }
      />

      {hydrated && !signedIn && (
        <div className={`${styles.gate} a-up delay-400`}>
          <div className={styles.gateTitle}>Conectează-te ca să votezi.</div>
          <p className={styles.gateBody}>
            Clasamentul e public. Un cont, {VOTE_LIMIT} voturi — ca să nu umple nimeni urna.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => router.push('/auth?mode=register')}
          >
            Conectare sau cont nou
          </button>
        </div>
      )}

      {hydrated && signedIn && (
        <div className={`${styles.mine} a-up delay-400`}>
          <span className={styles.mineDot} />
          <span>
            {votes.length === 0 ? (
              <>
                Ai <b>{VOTE_LIMIT} voturi</b> · atinge mașinile care îți plac, până la{' '}
                {EVENT.votingCloses}
              </>
            ) : (
              <>
                Voturile tale ·{' '}
                <b>
                  {votes
                    .map((id) => cars.find((c) => c.id === id))
                    .filter(Boolean)
                    .map((c) => displayModel(c!))
                    .join(', ')}
                </b>
                {votesLeft > 0
                  ? ` · îți mai rămân ${votesLeft}`
                  : ' · atinge din nou ca să retragi unul'}
              </>
            )}
          </span>
        </div>
      )}

      <div className={styles.tower}>
        {rows.map((r, i) => (
          <button
            key={r.id}
            type="button"
            className={`${styles.row} ${r.mine ? styles.rowMine : ''} a-up`}
            data-spot
            style={{ animationDelay: `${0.45 + i * 0.06}s` }}
            aria-pressed={r.mine}
            disabled={owned.has(r.id) || (signedIn && !r.mine && votesLeft === 0)}
            onClick={() => onRowClick(r.id)}
          >
            <span
              className={`${styles.bar} ${r.mine ? styles.barMine : ''}`}
              style={{ width: `${r.pct}%`, animationDelay: `${0.45 + i * 0.06}s` }}
            />
            <span className={styles.rowInner}>
              <span className={`${styles.pos} ${r.pos === 1 ? styles.posLead : ''}`}>{r.pos}</span>
              <span className={styles.entry}>
                <b>{displayModel(r.car)}</b>
                <span>
                  Nr. {r.car.no} · {r.car.owner}
                </span>
              </span>
              <span className={styles.votes}>
                <b className={r.mine ? styles.shareMine : undefined}>{r.votes}</b>
                <span>{r.pct}%</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className={styles.foot}>
        {signedIn
          ? `Atinge un rând ca să votezi, din nou ca să retragi. ${VOTE_LIMIT} voturi de persoană; participanții nu pot vota propria mașină.`
          : votesCastLabel(tally)}
      </p>
    </div>
  );
}
