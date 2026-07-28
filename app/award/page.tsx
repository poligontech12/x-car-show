'use client';

import { useRouter } from 'next/navigation';
import { HeaderRow, StickyHeader } from '@/components/StickyHeader';
import { VOTES_CAST_LABEL, byId, standings } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { useStore } from '@/lib/store';
import styles from './award.module.css';

export default function AwardScreen() {
  const router = useRouter();
  const { signedIn, hydrated, vote, castVote } = useStore();

  const rows = standings(vote);

  const onRowClick = (carId: string) => {
    if (signedIn) castVote(carId);
    else router.push('/auth?mode=register&role=vote');
  };

  return (
    <>
      <StickyHeader>
        <div className={styles.head}>
          <h1 className="t-title">CAR OF THE SHOW</h1>
          <div className={styles.meta}>
            <span className={styles.metaLeft}>ONE AWARD · ONE VOTE EACH</span>
            <span className={styles.closes}>CLOSES {EVENT.votingCloses}</span>
          </div>
        </div>
      </StickyHeader>

      {hydrated && !signedIn && (
        <div className={styles.gate}>
          <div className={styles.gateTitle}>Sign in to vote.</div>
          <p className={styles.gateBody}>
            Standings are open to everyone. One account, one vote — so nobody stuffs the box.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            style={{ padding: 13 }}
            onClick={() => router.push('/auth?mode=register&role=vote')}
          >
            SIGN IN OR REGISTER
          </button>
        </div>
      )}

      {hydrated && signedIn && vote && (
        <div className={styles.mine}>
          <div className={styles.mineDot} />
          <div className={styles.mineLine}>
            YOUR VOTE · {byId(vote).model} · CHANGE IT UNTIL {EVENT.votingCloses}
          </div>
        </div>
      )}

      <div className={styles.colHead}>
        <div className={styles.pos} style={{ fontSize: 'inherit' }}>
          POS
        </div>
        <div className={styles.no} style={{ fontSize: 'inherit' }}>
          №
        </div>
        <div className={styles.entry}>ENTRY</div>
        <div className={styles.votes} style={{ fontSize: 'inherit' }}>
          VOTES
        </div>
        <div className={styles.share} style={{ fontSize: 'inherit' }}>
          SHARE
        </div>
      </div>

      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`${styles.row} ${r.mine ? styles.rowMine : ''}`}
          aria-pressed={r.mine}
          onClick={() => onRowClick(r.id)}
        >
          <span
            className={`${styles.bar} ${r.mine ? styles.barMine : ''}`}
            style={{ width: `${r.pct}%` }}
          />
          <span className={styles.rowInner}>
            <span className={`${styles.pos} ${r.pos === 1 ? styles.posLead : ''}`}>{r.pos}</span>
            <span className={styles.no}>{r.car.no}</span>
            <span className={styles.entry}>
              <b>{r.car.model}</b>
              <span>{r.car.owner}</span>
            </span>
            <span className={styles.votes}>{r.votes}</span>
            <span className={`${styles.share} ${r.mine ? styles.shareMine : ''}`}>{r.pct}%</span>
          </span>
        </button>
      ))}

      <p className={styles.foot}>
        {signedIn
          ? 'TAP A ROW TO CAST OR CHANGE YOUR VOTE. ENTRANTS CANNOT VOTE FOR THEIR OWN CAR.'
          : VOTES_CAST_LABEL}
      </p>
    </>
  );
}
