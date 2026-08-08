'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { ImageSlot } from '@/components/ImageSlot';
import { displayModel } from '@/lib/cars';
import { leadPhoto } from '@/lib/photos';
import { useStore } from '@/lib/store';
import { useCars } from '@/lib/useCars';
import styles from './roster.module.css';

/**
 * The roster as a deck: one car per screen, snapped, swiped through.
 * No filters and no class — you are looking at cars, not querying a
 * database. Tap a card and the profile carries the rest.
 */
export function RosterDeck() {
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

  /**
   * Nothing registered yet. The deck is scroll-snap panels over
   * photographs, so with no cars it collapses to a black screen that
   * reads as broken rather than as empty — and this is the front door,
   * so that is the first thing a visitor sees. Say it instead, in the
   * same voice the feed uses when it has nothing either.
   *
   * The cars are fetched on the server and handed to the store, so this
   * is already right on the first paint — no populated roster ever
   * flashes this on its way in.
   */
  if (cars.length === 0) {
    return (
      <div className={styles.blank}>
        <section className={`${styles.empty} a-up delay-200`}>
          <span aria-hidden="true">◎</span>
          <h2>Prima apariție e încă pe drum.</h2>
          <p>Înscrierile sunt deschise. Prima mașină din listă poate fi a ta.</p>
        </section>
      </div>
    );
  }

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
          {/* The deck shows the picture the owner leads with; it is edited
              on the car itself, never from inside a link to it. */}
          <ImageSlot
            src={leadPhoto(c.photos)}
            hint={[c.year || null, c.model].filter(Boolean).join(' ')}
            mode="inline"
            readOnly
          />
          <span className="photo-scrim" />
          <span className="photo-veil" />

          {/* Entry numbers are handed out at the gate — no chip until then. */}
          {c.no && <span className={styles.no}>Nr. {c.no}</span>}

          <span className={styles.caption}>
            <span className={styles.name}>
              <h2>{displayModel(c)}</h2>
              <span className={styles.spec}>
                {[c.make, c.power && `${c.power} CP`].filter(Boolean).join(' · ')}
              </span>
              <span className={styles.owner}>
                {c.owner} · {c.town}
              </span>
            </span>
            {/* A car registered this morning has no year yet; better blank than 0. */}
            <span className={styles.year}>{c.year || ''}</span>
          </span>

        </Link>
      ))}

      <div className={styles.rail} aria-hidden="true">
        {cars.map((c, i) => (
          <i key={c.id} data-on={i === index} />
        ))}
      </div>
    </div>
  );
}
