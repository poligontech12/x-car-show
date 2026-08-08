import type { Car } from '@/lib/cars';
import { headline } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { Mark } from './Mark';
import styles from './EntryCard.module.css';

/**
 * Cards get printed, and shown to the person who just registered, while
 * entries are still half-filled. An em dash reads as "not given"; a 0
 * reads as a measurement, and a wrong one.
 */
const orDash = (v: string | number | null | undefined) => (v ? String(v) : '—');

interface Props {
  car: Car;
  /**
   * The code itself, drawn at `size="100%"` — the card decides how big it
   * is, the caller decides who draws it. The print sheet needs a server
   * component so the code is in the HTML before anyone hits print; the
   * app can afford to wait for the browser.
   */
  qr: React.ReactNode;
}

/**
 * The card that goes on the car: paper stock, ink-light, readable from
 * ten paces, and a code that opens the full build on a phone.
 *
 * One component for the print sheet and for the end of registration. The
 * entrant photographs the card they are shown and posts it, so the two
 * must be the same object — a card that shares differently from how it
 * prints is a card nobody trusts.
 *
 * Sizes itself against its container, so put it in one (`container-type:
 * inline-size`); it caps at the A5 design size and scales down from there.
 */
export function EntryCard({ car, qr }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <div className={styles.scanCol}>
          <div className={styles.scanLabel}>SCANEAZĂ</div>
          <div className={styles.scanCode}>{qr}</div>
        </div>

        <div className={styles.col}>
          <div className={styles.mark}>
            <Mark tone="light" className={styles.markLockup} />
            <span className={styles.markMeta}>
              EDIȚIA {EVENT.editionNo} · {EVENT.place}
            </span>
          </div>
          <div className={styles.headline}>{headline(car)}</div>
          <div className={styles.owner}>
            {[car.owner, car.town].filter(Boolean).join(' · ') || 'FĂRĂ NUME'}
          </div>

          <div className={styles.rows}>
            {(
              [
                ['MOTOR', car.engine],
                ['PUTERE', car.power ? `${car.power} CP` : '—'],
                ['TRACȚIUNE', car.drive],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className={styles.row}>
                <b>{k}</b>
                <div className="spacer" />
                <span>{orDash(v)}</span>
              </div>
            ))}
          </div>

          <div className="spacer" />
          <div className={styles.entry}>
            <div className={styles.entryLabel}>ÎNSCRIERE №</div>
            {/* An em dash at this size is a black bar, not a blank — and
                the entrant sees this card the moment they register, when
                the number is always missing. Say who fills it in. */}
            {car.no ? (
              <div className={styles.entryNo}>{car.no}</div>
            ) : (
              <div className={styles.entryPending}>SE ALOCĂ LA POARTĂ</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
