import type { Metadata } from 'next';
import Link from 'next/link';
import { headline } from '@/lib/cars';
import { listCars } from '@/lib/db/queries';
import { EVENT } from '@/lib/event';
import styles from './cards.module.css';

export const metadata: Metadata = {
  title: 'Cartonașe de parbriz — X Car Show',
};

/**
 * What a marshal opens on the morning of the show: every entry on the
 * page, one tap to the three printable cards for that car.
 */
export default async function CardsIndex() {
  // Entry order, because that is the order a marshal works down the list.
  const cars = (await listCars()).sort((a, b) =>
    (a.no || '\uffff').localeCompare(b.no || '\uffff', undefined, { numeric: true }),
  );

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <b>CARTONAȘE DE PARBRIZ</b>
          <span>
            {EVENT.edition} · {EVENT.dateNumeric} · {cars.length} ÎNSCRIERI PE PAGINA ASTA
          </span>
        </div>
        <Link href="/" className={styles.toolbarLink}>
          ← APLICAȚIA
        </Link>
      </div>

      <div className={styles.index}>
        {cars.map((c) => (
          <Link key={c.id} href={`/cards/${c.id}`} className={styles.entry}>
            <span className={styles.entryNumber}>{c.no || '—'}</span>
            <span className={styles.entryName}>
              <b>{headline(c)}</b>
              <span>
                {c.owner} · {c.cls}
              </span>
            </span>
            <span className={styles.entryStand}>{c.stand || '—'}</span>
            <span className={styles.entryArrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
