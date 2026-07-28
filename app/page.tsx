'use client';

import Link from 'next/link';
import { Chip } from '@/components/Chip';
import { ImageSlot } from '@/components/ImageSlot';
import {
  FilterRow,
  HeaderRow,
  StickyHeader,
} from '@/components/StickyHeader';
import { byId } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { FEED, FEED_FILTERS, isMeet, type FeedPost } from '@/lib/feed';
import { useStore } from '@/lib/store';
import styles from './feed.module.css';

/** Builds are warm-toned, sightings are cooler — a tell you read without reading. */
const tone = (p: FeedPost) => (p.cat === 'SPOTTED' ? '#17181A' : '#1A1B1D');

export default function FeedScreen() {
  const { feedFilter, setFeedFilter, account, joinedMeet, toggleJoinMeet } = useStore();

  const posts = FEED.filter((p) => feedFilter === 'ALL' || p.cat === feedFilter);

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
            {account ? account.name : 'SIGN IN'}
          </Link>
        </HeaderRow>

        <FilterRow label="Filter the feed">
          {FEED_FILTERS.map((f) => (
            <Chip key={f} label={f} on={feedFilter === f} onClick={() => setFeedFilter(f)} />
          ))}
        </FilterRow>
      </StickyHeader>

      {posts.length === 0 && <div className={styles.empty}>NOTHING HERE YET</div>}

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

            {isMeet(p) && (
              <div className={styles.meet}>
                <div className={styles.date}>
                  <b>{p.day}</b>
                  <span>{p.month}</span>
                </div>
                <div className={styles.meetBody}>
                  <b>{p.meetTitle}</b>
                  <span>{p.meetMeta}</span>
                </div>
                <button
                  type="button"
                  className={`${styles.join} ${joinedMeet ? styles.joinOn : ''}`}
                  aria-pressed={joinedMeet}
                  onClick={toggleJoinMeet}
                >
                  {joinedMeet ? 'GOING' : 'I’M IN'}
                </button>
              </div>
            )}

            {p.body && <p className={styles.body}>{p.body}</p>}
          </article>
        );
      })}

      <Link href="/partners" className={styles.partners}>
        <span>PARTNERS &amp; SHOPS</span>
        <em>→</em>
      </Link>
    </>
  );
}
