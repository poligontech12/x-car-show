'use client';

import Link from 'next/link';
import { Chip } from '@/components/Chip';
import { ImageSlot } from '@/components/ImageSlot';
import { FilterRow, HeaderRow, StickyHeader } from '@/components/StickyHeader';
import { byId } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { FEED, FEED_FILTERS, type FeedPost } from '@/lib/feed';
import { useStore } from '@/lib/store';
import styles from './feed.module.css';

/** Builds run warm, sightings cooler — a tell you read without reading. */
const tone = (p: FeedPost) => (p.cat === 'VĂZUTE' ? '#17181A' : '#1A1B1D');

export default function FeedScreen() {
  const { feedFilter, setFeedFilter, account } = useStore();

  const posts = FEED.filter((p) => feedFilter === 'TOATE' || p.cat === feedFilter);

  return (
    <>
      <StickyHeader>
        <HeaderRow align="center">
          <div className={styles.mark} aria-hidden="true">
            X
          </div>
          <div className={styles.wordmark}>
            <b>CAR SHOW</b>
            <span>{EVENT.dateShort}</span>
          </div>
          <div className="spacer" />
          <Link
            href={account ? '/auth' : '/auth?mode=register&role=car'}
            className={`${styles.account} ${account ? styles.accountIn : ''}`}
          >
            {account ? account.name : 'CONECTARE'}
          </Link>
        </HeaderRow>

        <FilterRow label="Filtrează fluxul">
          {FEED_FILTERS.map((f) => (
            <Chip key={f} label={f} on={feedFilter === f} onClick={() => setFeedFilter(f)} />
          ))}
        </FilterRow>
      </StickyHeader>

      {posts.length === 0 && <div className={styles.empty}>NIMIC AICI ÎNCĂ</div>}

      {posts.map((p, i) => {
        const car = p.carId ? byId(p.carId) : null;

        return (
          <article key={`${p.title}-${i}`} className={styles.post}>
            <div className={styles.postHead}>
              <div className={styles.avatar} style={{ background: tone(p) }}>
                {car ? car.no : '·'}
              </div>
              <div className={styles.postTitle}>
                <b>{p.title}</b>
                <span className={`${styles.kind} ${p.kindAccent ? styles.kindAccent : ''}`}>
                  {p.kind}
                </span>
              </div>
              <div className="spacer" />
              <div className={styles.time}>{p.time}</div>
            </div>

            {p.slot &&
              (car ? (
                <Link href={`/car/${car.id}`} className={styles.photo}>
                  <ImageSlot id={p.slot} hint={p.slotHint ?? ''} mode="inline" />
                </Link>
              ) : (
                <div className={styles.photo}>
                  <ImageSlot id={p.slot} hint={p.slotHint ?? ''} />
                </div>
              ))}

            {p.body && <p className={styles.body}>{p.body}</p>}
          </article>
        );
      })}

      <Link href="/partners" className={styles.partners}>
        <span>PARTENERI &amp; ATELIERE</span>
        <em>→</em>
      </Link>
    </>
  );
}
