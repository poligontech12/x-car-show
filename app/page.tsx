'use client';

import Link from 'next/link';
import { ImageSlot } from '@/components/ImageSlot';
import { byId } from '@/lib/cars';
import { FEED, type FeedPost } from '@/lib/feed';
import styles from './feed.module.css';

/**
 * A plain newsfeed. No title, no filters, no counts — just what happened
 * to the cars lately, newest first. Everything that framed the show
 * belongs to the show, not to this screen.
 */
export default function FeedScreen() {
  return (
    <div className={styles.screen}>
      {FEED.map((p: FeedPost, i) => {
        const car = p.carId ? byId(p.carId) : null;
        const delay = ['delay-100', 'delay-200', 'delay-300', 'delay-400'][Math.min(i, 3)];

        const byline = (
          <>
            <span className={styles.avatar}>{car ? car.no : '·'}</span>
            <span className={styles.who}>
              <b>{p.title}</b>
              <span className={`${styles.kind} ${p.kindAccent ? styles.kindAccent : ''}`}>
                {p.kind}
              </span>
            </span>
            <span className={styles.time}>{p.time}</span>
          </>
        );

        return (
          <article key={`${p.title}-${i}`} className={`${styles.post} a-up ${delay}`} data-spot>
            {p.slot ? (
              <>
                {car ? (
                  <Link href={`/car/${car.id}`} className={styles.photo}>
                    <ImageSlot id={p.slot} hint={p.slotHint ?? ''} mode="inline" />
                    <span className="photo-scrim" />
                    <span className="photo-veil" />
                    <span className={styles.overlay}>{byline}</span>
                  </Link>
                ) : (
                  <div className={styles.photo}>
                    <ImageSlot id={p.slot} hint={p.slotHint ?? ''} />
                    <span className="photo-scrim" />
                    <span className="photo-veil" />
                    <span className={styles.overlay}>{byline}</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.headPlain}>{byline}</div>
            )}
          </article>
        );
      })}

      <Link href="/partners" className={`${styles.partners} a-up delay-500`}>
        <span>Parteneri &amp; ateliere</span>
        <em>→</em>
      </Link>
    </div>
  );
}
