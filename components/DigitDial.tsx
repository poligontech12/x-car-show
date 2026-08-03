'use client';

import { useEffect, useRef } from 'react';
import styles from './DigitDial.module.css';

/** One row of the dial. The scroll maths depends on this matching the CSS. */
const ROW = 46;

/**
 * One column of a combination lock: scroll it to a digit, or use the
 * arrow keys. A control that only responds to scrolling is unreachable
 * from a keyboard, so it reports itself as a spinbutton and handles
 * both.
 */
export function DigitDial({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (digit: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);

  // Follow the value when something else moves it — the +/- of another
  // dial rolling over, or a reset.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = value * ROW;
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target;
  }, [value]);

  const commit = (next: number) => {
    const d = Math.max(0, Math.min(9, next));
    if (d !== value) onChange(d);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.band} aria-hidden="true" />
      <div
        ref={ref}
        className={styles.dial}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={9}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            commit(value + 1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            commit(value - 1);
          }
        }}
        onScroll={() => {
          // Snap fires many times per flick; only read the resting place.
          window.clearTimeout(settle.current);
          settle.current = window.setTimeout(() => {
            const el = ref.current;
            if (el) commit(Math.round(el.scrollTop / ROW));
          }, 90);
        }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className={`${styles.digit} ${d === value ? styles.digitOn : ''}`}>
            {d}
          </span>
        ))}
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
