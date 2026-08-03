'use client';

import Link from 'next/link';
import { Chip } from '@/components/Chip';
import { ImageSlot } from '@/components/ImageSlot';
import { FilterRow, ScreenTitle, TitleAside } from '@/components/StickyHeader';
import { ROSTER_TOTAL, byId } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { FEED, FEED_FILTERS, type FeedPost } from '@/lib/feed';
import { useStore } from '@/lib/store';
import styles from './feed.module.css';

function Flag() {
  return (
    <span className={styles.flag} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function FeedScreen() {
  const { feedFilter, setFeedFilter } = useStore();

  const posts = FEED.filter((p) => feedFilter === 'Toate' || p.cat === feedFilter);

  return (
    <div className={styles.screen}>
      <ScreenTitle
        className="a-up delay-300"
        label="România"
        icon={<Flag />}
        lines={['Cajvana', 'Bucovina']}
        aside={
          <>
            <TitleAside>
              {EVENT.edition} · {EVENT.dateNumeric.split(' · ')[1]}
            </TitleAside>
            <TitleAside gold>{ROSTER_TOTAL} de înscrieri</TitleAside>
          </>
        }
      />

      <FilterRow label="Filtrează fluxul">
        {FEED_FILTERS.map((f) => (
          <Chip key={f} label={f} on={feedFilter === f} onClick={() => setFeedFilter(f)} />
        ))}
      </FilterRow>

      {posts.length === 0 && <div className={styles.empty}>Nimic aici încă.</div>}

      {posts.map((p: FeedPost, i) => {
        const car = p.carId ? byId(p.carId) : null;
        const delay = ['delay-400', 'delay-500', 'delay-600', 'delay-700'][Math.min(i, 3)];

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
          <article key={`${p.title}-${i}`} className={`${styles.post} a-up ${delay}`}
            data-spot>
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

            {p.body && <p className={styles.body}>{p.body}</p>}
          </article>
        );
      })}

      <Link href="/partners" className={`${styles.partners} a-up delay-800`}>
        <span>Parteneri &amp; ateliere</span>
        <em>→</em>
      </Link>
    </div>
  );
}
