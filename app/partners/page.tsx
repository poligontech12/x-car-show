'use client';

import { ScreenTitle } from '@/components/StickyHeader';
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

      {/* The shops are held back until they are real ones. The list
          itself is still in lib/partners.ts and the panel styles below
          are still here, so putting it back is the map that used to
          stand where this section does. */}
      <section className={`${styles.empty} a-up delay-300`}>
        <span aria-hidden="true">◎</span>
        <h2>Atelierele se adună.</h2>
        <p>
          Fiecare atelier care ajunge aici a lucrat la cel puțin o mașină din listă. Fără plasări
          plătite.
        </p>
      </section>
    </div>
  );
}
