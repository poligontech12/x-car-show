'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { ImageSlot } from '@/components/ImageSlot';
import { ROSTER_TOTAL, displayModel } from '@/lib/cars';
import { useStore } from '@/lib/store';
import { useCars } from '@/lib/useCars';
import styles from './roster.module.css';

/**
 * The roster as a deck: one car per screen, snapped, swiped through.
 * No filters and no class — you are looking at cars, not querying a
 * database. Tap a card and the profile carries the rest.
 */
export default function RosterScreen() {
  const [index, setIndex] = useState(0);
  // Whatever the member registered rides at the front of the deck.
  const cars = useCars();
  const { hydrated } = useStore();
  const deck = useRef<HTMLDivElement>(null);

  /**
   * Those cars arrive a tick after the first paint, and the browser keeps
   * the pixel offset rather than the card — so the deck would open on the
   * second car. Pin it back to the first.
   */
  useLayoutEffect(() => {
    if (!hydrated) return;
    deck.current?.scrollTo({ top: 0 });
    setIndex(0);
  }, [hydrated]);

  return (
    <div
      ref={deck}
      className={styles.deck}
      onScroll={(e) => {
        const el = e.currentTarget;
        const i = Math.round(el.scrollTop / el.clientHeight);
        if (i !== index) setIndex(i);
      }}
    >
      {cars.map((c) => (
        <Link key={c.id} href={`/car/${c.id}`} className={styles.panel}>
          <ImageSlot id={`car-${c.id}`} hint={`${c.year} ${c.model}`} mode="inline" />
          <span className="photo-scrim" />
          <span className="photo-veil" />

          {/* Entry numbers are handed out at the gate — no chip until then. */}
          {c.no && <span className={styles.no}>Nr. {c.no}</span>}

          <span className={styles.caption}>
            <span className={styles.name}>
              <h2>{displayModel(c)}</h2>
              <span className={styles.spec}>
                {c.make} · {c.power} CP
              </span>
              <span className={styles.owner}>
                {c.owner} · {c.town}
              </span>
            </span>
            <span className={styles.year}>{c.year}</span>
          </span>

        </Link>
      ))}

      {/* Only the first page is modelled; say so rather than just stopping. */}
      <div className={styles.tail}>
        <div className={styles.tailCount}>{Math.max(ROSTER_TOTAL - cars.length, 0)}</div>
        <p className={styles.tailLabel}>
          de mașini încă nu sunt în aplicație. Le adăugăm până pe 8 august.
        </p>
      </div>

      <div className={styles.rail} aria-hidden="true">
        {cars.map((c, i) => (
          <i key={c.id} data-on={i === index} />
        ))}
      </div>
    </div>
  );
}
