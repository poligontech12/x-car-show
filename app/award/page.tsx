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
          <h1 className="t-title">MAȘINA SHOW-ULUI</h1>
          <div className={styles.meta}>
            <span className={styles.metaLeft}>UN PREMIU · UN VOT DE PERSOANĂ</span>
            <span className={styles.closes}>SE ÎNCHIDE LA {EVENT.votingCloses}</span>
          </div>
        </div>
      </StickyHeader>

      {hydrated && !signedIn && (
        <div className={styles.gate}>
          <div className={styles.gateTitle}>Conectează-te ca să votezi.</div>
          <p className={styles.gateBody}>
            Clasamentul e public. Un cont, un vot — ca să nu umple nimeni urna.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            style={{ padding: 13 }}
            onClick={() => router.push('/auth?mode=register&role=vote')}
          >
            CONECTARE SAU CONT NOU
          </button>
        </div>
      )}

      {hydrated && signedIn && vote && (
        <div className={styles.mine}>
          <div className={styles.mineDot} />
          <div className={styles.mineLine}>
            VOTUL TĂU · {byId(vote).model} · ÎL POȚI SCHIMBA PÂNĂ LA {EVENT.votingCloses}
          </div>
        </div>
      )}

      <div className={styles.colHead}>
        <div className={styles.pos} style={{ fontSize: 'inherit' }}>
          LOC
        </div>
        <div className={styles.no} style={{ fontSize: 'inherit' }}>
          №
        </div>
        <div className={styles.entry}>ÎNSCRIERE</div>
        <div className={styles.votes} style={{ fontSize: 'inherit' }}>
          VOTURI
        </div>
        <div className={styles.share} style={{ fontSize: 'inherit' }}>
          COTĂ
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
          ? 'ATINGE UN RÂND CA SĂ VOTEZI SAU SĂ ÎȚI SCHIMBI VOTUL. PARTICIPANȚII NU POT VOTA PROPRIA MAȘINĂ.'
          : VOTES_CAST_LABEL}
      </p>
    </>
  );
}
