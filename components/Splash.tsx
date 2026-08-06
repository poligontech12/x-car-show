'use client';

import { useEffect, useState } from 'react';
import { Mark } from './Mark';
import styles from './Splash.module.css';

/**
 * How long the marque holds before it starts getting out of the way.
 * Short on purpose: this sits in front of a person standing next to a
 * car they want to look up, on showground wifi.
 */
const HOLD_MS = 850;
const FADE_MS = 320;

/**
 * The opening frame — the show's marque, and who built the app.
 *
 * It lives in the shell rather than a page, so it plays once when the app
 * is opened and never again as you move around inside it. It is also
 * `pointer-events: none` throughout, so it is a thing you see rather than
 * a thing you have to get past.
 */
export function Splash() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Someone who has asked for less motion has asked for less of this.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduce ? 0 : HOLD_MS;
    const out = setTimeout(() => setLeaving(true), hold);
    const end = setTimeout(() => setGone(true), hold + FADE_MS);
    return () => {
      clearTimeout(out);
      clearTimeout(end);
    };
  }, []);

  // Off the page entirely once it has gone, not just transparent on top of it.
  if (gone) return null;

  return (
    <div className={`${styles.splash} ${leaving ? styles.leaving : ''}`} aria-hidden="true">
      <Mark className={styles.mark} />
      <div className={styles.credit}>
        <span>DEZVOLTAT DE</span>
        <b>POLIGON TECH</b>
      </div>
    </div>
  );
}
