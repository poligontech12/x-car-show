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
            aria-label="Înapoi"
            onClick={() => router.back()}
          >
            ←
          </button>
          <h1 className="t-title" style={{ flex: 1 }}>
            PARTENERI
          </h1>
        </div>
        <p className={styles.note}>
          FIECARE ATELIER DE AICI A LUCRAT LA CEL PUȚIN
          <br />
          O MAȘINĂ DIN LISTĂ. FĂRĂ PLASĂRI PLĂTITE.
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
