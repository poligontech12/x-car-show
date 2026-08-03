'use client';

import { useEffect, useRef, useState } from 'react';

/** Fast out of the gate, long settle — the number arrives before it lands. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts from zero to `target` once the element has entered.
 *
 * The screens that use this are the ones the numbers are the point of —
 * the standings and the car's three figures. Anything smaller reads as
 * fidgeting, so keep it for display sizes.
 */
export function useCountUp(target: number, { delay = 0, duration = 2200 } = {}) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Respect the same preference the CSS does: land on the number.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let start: number | undefined;

    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOut(t)));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    const timer = window.setTimeout(() => {
      frame.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, delay, duration]);

  return value;
}
