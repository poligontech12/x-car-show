'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { ScreenTitle } from '@/components/StickyHeader';
import { displayModel } from '@/lib/cars';
import { atWidth, leadPhoto } from '@/lib/photos';
import { useStore } from '@/lib/store';
import { useCars } from '@/lib/useCars';
import styles from './garage.module.css';

function Wheel() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * One person, many cars. People turn up with two or three, so the garage
 * is a list rather than a single "my car" slot.
 */
export default function GarageScreen() {
  const router = useRouter();
  const { account, hydrated, myCars } = useStore();
  const cars = useCars().filter((c) => myCars.some((m) => m.id === c.id));

  if (!hydrated) return <div className={styles.screen} />;

  return (
    <div className={styles.screen}>
      <ScreenTitle
        className="a-up delay-200"
        label={account ? account.name : 'Garajul tău'}
        icon={<Wheel />}
        lines={['Garajul', 'meu']}
      />

      {!account && (
        <div className={`${styles.empty} a-up delay-300`}>
          <p className={styles.emptyLead}>Ai nevoie de un cont ca să înscrii o mașină.</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => router.push('/auth?mode=register&role=car')}
          >
            Creează contul
          </button>
        </div>
      )}

      {account && cars.length === 0 && (
        <div className={`${styles.empty} a-up delay-300`}>
          <p className={styles.emptyLead}>Încă nu ai nicio mașină înscrisă.</p>
          <p className={styles.emptyNote}>
            Poți înscrie oricâte — mulți vin cu două sau trei.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => router.push('/onboard')}
          >
            Înscrie o mașină
          </button>
        </div>
      )}

      {cars.length > 0 && (
        <>
          <div className={styles.list}>
            {cars.map((c, i) => (
              <Link
                key={c.id}
                href={`/car/${c.id}`}
                className={`${styles.row} a-up`}
                data-spot
                style={{ animationDelay: `${0.3 + i * 0.07}s` }}
              >
                <span className={styles.thumb}>
                  {/* Drawn at 76px. The full picture is 1200 wide. */}
                  <ImageSlot
                    src={atWidth(leadPhoto(c.photos), 240)}
                    hint={displayModel(c)}
                    mode="inline"
                    readOnly
                  />
                </span>
                <span className={styles.rowBody}>
                  <b>{displayModel(c) || 'Fără nume'}</b>
                  <span>
                    {[c.year || null, c.power ? `${c.power} CP` : null]
                      .filter(Boolean)
                      .join(' · ') || 'Detalii necompletate'}
                  </span>
                  <span className={styles.stand}>
                    {c.stand ? `Stand ${c.stand}` : 'Stand nealocat încă'}
                  </span>
                </span>
                <span className={styles.edit}>→</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className={`btn btn--glass ${styles.add}`}
            onClick={() => router.push('/onboard')}
          >
            Înscrie încă o mașină
          </button>
        </>
      )}
    </div>
  );
}
