'use client';

import { useRouter } from 'next/navigation';
import { PARTNERS } from '@/lib/partners';
import styles from './partners.module.css';

export default function PartnersScreen() {
  const router = useRouter();

  return (
    <>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <button
            type="button"
            className={styles.back}
            aria-label="Back"
            onClick={() => router.back()}
          >
            ←
          </button>
          <h1 className="t-title" style={{ flex: 1 }}>
            PARTNERS
          </h1>
        </div>
        <p className={styles.note}>
          EVERY SHOP HERE HAS WORK ON AT LEAST
          <br />
          ONE CAR IN THE ROSTER. NO PAID PLACEMENT.
        </p>
      </div>

      <div className={styles.list}>
        {PARTNERS.map((p) => (
          <div key={p.name} className={styles.partner}>
            <div className={styles.logo} />
            <div className={styles.body}>
              <b>{p.name}</b>
              <span>{p.meta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tail} />
    </>
  );
}
