'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { displayModel, ownerOf, socialUrl } from '@/lib/cars';
import { leadPhoto } from '@/lib/photos';
import { useStore } from '@/lib/store';
import { useCars } from '@/lib/useCars';
import styles from './owner.module.css';

/**
 * A person's public page: who they are, where they are, where to find
 * them, and everything they brought.
 */
export default function OwnerScreen() {
  const { handle } = useParams<{ handle: string }>();
  const { hydrated } = useStore();
  const cars = useCars();
  const owner = ownerOf(decodeURIComponent(handle), cars);

  if (!hydrated) return <div className={styles.screen} />;

  if (!owner) {
    return (
      <div className={styles.screen}>
        <div className={styles.missing}>
          <h1>Profilul nu există.</h1>
          <Link href="/roster" className="btn btn--glass">
            Vezi înscrișii
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={`${styles.head} a-up delay-200`}>
        <div className={styles.avatar} />
        <h1 className={styles.name}>{owner.name || 'Fără nume'}</h1>
        <p className={styles.meta}>
          {[owner.handle && `@${owner.handle}`, owner.town].filter(Boolean).join(' · ')}
        </p>
      </div>

      {(owner.instagram || owner.facebook) && (
        <div className={`${styles.socials} a-up delay-300`}>
          {owner.instagram && (
            <a
              className={styles.social}
              href={socialUrl('instagram', owner.instagram)}
              target="_blank"
              rel="noreferrer noopener"
            >
              Instagram
              <em>@{owner.instagram.replace(/^@+/, '')}</em>
            </a>
          )}
          {owner.facebook && (
            <a
              className={styles.social}
              href={socialUrl('facebook', owner.facebook)}
              target="_blank"
              rel="noreferrer noopener"
            >
              Facebook
              <em>{owner.facebook.replace(/^@+/, '')}</em>
            </a>
          )}
        </div>
      )}

      <div className={styles.count}>
        {owner.cars.length === 1 ? 'O mașină înscrisă' : `${owner.cars.length} mașini înscrise`}
      </div>

      <div className={styles.list}>
        {owner.cars.map((c, i) => (
          <Link
            key={c.id}
            href={`/car/${c.id}`}
            className={`${styles.row} a-up`}
            data-spot
            style={{ animationDelay: `${0.35 + i * 0.07}s` }}
          >
            <span className={styles.thumb}>
              <ImageSlot src={leadPhoto(c.photos)} hint={displayModel(c)} mode="inline" readOnly />
            </span>
            <span className={styles.rowBody}>
              <b>{displayModel(c) || 'Fără nume'}</b>
              <span>
                {[c.year || null, c.power ? `${c.power} CP` : null].filter(Boolean).join(' · ') ||
                  'Detalii necompletate'}
              </span>
            </span>
            <span className={styles.arrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
