'use client';

import { ScreenTitle } from '@/components/StickyHeader';
import { PARTNERS } from '@/lib/partners';
import styles from './partners.module.css';

function Wrench() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M11.6 2.6a4 4 0 0 0-4.9 5l-4 4a1.4 1.4 0 0 0 2 2l4-4a4 4 0 0 0 5-4.9L15 7l-2-.4-.6-2 1.9-1.7-2.7-.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PartnersScreen() {
  return (
    <div className={styles.screen}>
      <ScreenTitle
        className="a-up delay-200"
        label="Ateliere"
        icon={<Wrench />}
        lines={['Parteneri']}
      />

      <p className={`${styles.note} a-up delay-300`}>
        Fiecare atelier de aici a lucrat la cel puțin o mașină din listă. Fără plasări plătite.
      </p>

      <div className={styles.list}>
        {PARTNERS.map((p, i) => (
          <div
            key={p.name}
            className={`${styles.partner} a-up`}
            data-spot
            style={{ animationDelay: `${0.35 + i * 0.07}s` }}
          >
            <div className={styles.logo} />
            <div className={styles.body}>
              <b>{p.name}</b>
              <span>{p.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
