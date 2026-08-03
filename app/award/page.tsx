'use client';

import { useRouter } from 'next/navigation';
import { ScreenTitle, TitleAside } from '@/components/StickyHeader';
import { VOTES_CAST_LABEL, byId, displayModel, standings } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { useCountUp } from '@/lib/useCountUp';
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
  const { signedIn, hydrated, vote, castVote } = useStore();

  const rows = standings(vote);
  const leader = rows[0];
  const leaderVotes = useCountUp(leader.votes, { delay: 400 });

  const onRowClick = (carId: string) => {
    if (signedIn) castVote(carId);
    else router.push('/auth?mode=register&role=vote');
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
            <TitleAside>Un vot de persoană</TitleAside>
            <TitleAside gold>Se închide la {EVENT.votingCloses}</TitleAside>
          </>
        }
      />

      <div className={`${styles.leader} a-up delay-400`}>
        <div className={styles.leaderLabel}>Pe primul loc</div>
        <div className={styles.leaderValue}>
          <span className="n-xl n-gold">{leaderVotes.toLocaleString('ro-RO')}</span>
          <span className={styles.leaderUnit}>voturi</span>
        </div>
        <div className={styles.leaderName}>{displayModel(leader.car)}</div>
        <div className={styles.leaderOwner}>
          {leader.car.owner} · {leader.pct}% din total
        </div>
      </div>

      {hydrated && !signedIn && (
        <div className={`${styles.gate} a-up delay-500`}>
          <div className={styles.gateTitle}>Conectează-te ca să votezi.</div>
          <p className={styles.gateBody}>
            Clasamentul e public. Un cont, un vot — ca să nu umple nimeni urna.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => router.push('/auth?mode=register&role=vote')}
          >
            Conectare sau cont nou
          </button>
        </div>
      )}

      {hydrated && signedIn && vote && (
        <div className={`${styles.mine} a-up delay-500`}>
          <span className={styles.mineDot} />
          <span>
            Votul tău · <b>{displayModel(byId(vote))}</b> · îl poți schimba până la {EVENT.votingCloses}
          </span>
        </div>
      )}

      <div className={styles.tower}>
        {rows.map((r, i) => (
          <button
            key={r.id}
            type="button"
            className={`${styles.row} ${r.mine ? styles.rowMine : ''} a-up`}
            style={{ animationDelay: `${0.6 + i * 0.06}s` }}
            aria-pressed={r.mine}
            onClick={() => onRowClick(r.id)}
          >
            <span
              className={`${styles.bar} ${r.mine ? styles.barMine : ''}`}
              style={{ width: `${r.pct}%`, animationDelay: `${0.6 + i * 0.06}s` }}
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
          ? 'Atinge un rând ca să votezi sau să îți schimbi votul. Participanții nu pot vota propria mașină.'
          : VOTES_CAST_LABEL}
      </p>
    </div>
  );
}
