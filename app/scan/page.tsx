'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SectionRule } from '@/components/SectionRule';
import { byId, headline } from '@/lib/cars';
import { RECENT_SCANS } from '@/lib/feed';
import styles from './scan.module.css';

/**
 * There is no camera here yet. Tapping the viewfinder stands in for a
 * successful read of a windshield card — the point of the screen is what
 * happens after the match, not the decode.
 */
const MATCH = 's14';

export default function ScanScreen() {
  const router = useRouter();
  const [found, setFound] = useState(false);
  const car = byId(MATCH);

  return (
    <div className={styles.screen}>
      <button
        type="button"
        className={styles.viewfinder}
        aria-label={found ? 'Renunță la potrivire' : 'Simulează scanarea unui cartonaș de parbriz'}
        onClick={() => setFound((f) => !f)}
      >
        <span className={styles.card} />
        <span className={styles.reticle}>
          <i />
          <i />
          <i />
          <i />
          <span className={styles.line} />
        </span>
        <span className={styles.label}>SCANEAZĂ UN CARTONAȘ DE PARBRIZ</span>
        <span className={`${styles.hint} ${found ? styles.hintFound : ''}`}>
          {found ? `CARTONAȘ ${car.no} · GĂSIT` : 'ATINGE VIZORUL PENTRU O SCANARE DEMO'}
        </span>
      </button>

      {found ? (
        <button
          type="button"
          className={styles.match}
          onClick={() => router.push(`/car/${car.id}`)}
        >
          <span className={styles.thumb} />
          <span className={styles.matchBody}>
            <span className={styles.matchKind}>POTRIVIRE · CARTONAȘ {car.no}</span>
            <span className={styles.matchName}>{headline(car)}</span>
            <span className={styles.matchMeta}>
              {car.owner} · STAND {car.stand}
            </span>
          </span>
          <span className={styles.matchArrow}>→</span>
        </button>
      ) : (
        <div className={styles.recents}>
          <div className={styles.recentsHead}>
            <SectionRule label="SCANATE RECENT" />
          </div>
          {RECENT_SCANS.map(([id, ago]) => {
            const c = byId(id);
            return (
              <button
                key={id}
                type="button"
                className={styles.recent}
                onClick={() => router.push(`/car/${c.id}`)}
              >
                <span className={styles.recentNo}>{c.no}</span>
                <b>{c.model}</b>
                <span>{ago}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
