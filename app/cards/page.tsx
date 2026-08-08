import type { Metadata } from 'next';
import Link from 'next/link';
import { headline, type Car } from '@/lib/cars';
import { listCars } from '@/lib/db/queries';
import { EVENT } from '@/lib/event';
import { gateConfig, gateUnlocked } from '@/lib/gate';
import { leaveGate } from '@/lib/gate-actions';
import { CheckIn } from './CheckIn';
import { GateForm } from './GateForm';
import styles from './cards.module.css';

export const metadata: Metadata = {
  title: 'Cartonașe de parbriz — X Car Show',
};

/** Missing sorts last, whatever the field. */
const orLast = (v: string | undefined) => v || '￿';

/**
 * The lowest number nobody is wearing.
 *
 * Two digits because that is how they are written on the cards and read
 * back across a paddock — 07, not 7.
 */
function nextFreeNo(cars: Car[]): string {
  const taken = new Set(cars.map((c) => Number(c.no)).filter((n) => Number.isInteger(n) && n > 0));
  let n = 1;
  while (taken.has(n)) n++;
  return String(n).padStart(2, '0');
}

/**
 * What a marshal opens on the morning of the show: every entry on the
 * page, one tap to the three printable cards for that car, and the gate
 * itself — the number, the printed card and the award all follow from
 * one press per entry.
 *
 * Because that press writes, the page is behind the shared gate code
 * rather than open as it was when it only printed.
 */
export default async function CardsIndex() {
  const config = gateConfig();
  if (!config.ok) return <GateMisconfigured reason={config.reason} />;
  if (!(await gateUnlocked())) {
    return (
      <div className={styles.page}>
        <GateForm />
      </div>
    );
  }

  /**
   * Entry order, because that is the order a marshal works down the list
   * — but entry numbers are handed out at the gate, so on the morning of
   * the show most of this page has none. Plate is the tie-breaker: it is
   * what is written on the car standing in front of you, and it puts the
   * unnumbered majority in an order you can actually search by eye.
   */
  const cars = (await listCars()).sort(
    (a, b) =>
      orLast(a.no).localeCompare(orLast(b.no), undefined, { numeric: true }) ||
      orLast(a.plate).localeCompare(orLast(b.plate), 'ro', { sensitivity: 'base' }) ||
      headline(a).localeCompare(headline(b), 'ro'),
  );

  const suggestion = nextFreeNo(cars);
  const arrived = cars.filter((c) => c.checkedIn).length;

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <b>CARTONAȘE DE PARBRIZ</b>
          <span>
            {EVENT.edition} · {EVENT.dateNumeric} · {arrived} DIN {cars.length} AU TRECUT DE POARTĂ
          </span>
        </div>
        <form action={leaveGate}>
          <button className={styles.toolbarLink} type="submit">
            ÎNCHIDE POARTA
          </button>
        </form>
        <Link href="/" className={styles.toolbarLink}>
          ← APLICAȚIA
        </Link>
      </div>

      <div className={styles.index}>
        {cars.map((c) => (
          <div key={c.id} className={styles.entry} data-car={c.id} data-done={c.checkedIn}>
            <Link href={`/cards/${c.id}`} className={styles.entryOpen}>
              <span className={styles.entryNumber}>{c.no || '—'}</span>
              <span className={styles.entryName}>
                <b>{headline(c)}</b>
                <span>
                  {c.owner} · {c.cls}
                </span>
              </span>
              {/* The one thing on this row that is also written on the car
                  itself, so it is what a marshal matches against. */}
              <span className={styles.entryPlate}>{c.plate || '—'}</span>
              <span className={styles.entryStand}>{c.stand || '—'}</span>
              <span className={styles.entryArrow}>→</span>
            </Link>
            <CheckIn
              carId={c.id}
              no={c.no}
              checkedIn={Boolean(c.checkedIn)}
              suggestion={suggestion}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Said to whoever is deploying this, not to a marshal — they cannot fix
 * it from a field, so the screen names the variable rather than
 * apologising. The page stays shut: it hands out numbers and decides the
 * award, and an unset code would leave both to anyone with the link.
 */
function GateMisconfigured({ reason }: { reason: 'missing' | 'short' | 'no-secret' }) {
  const said = {
    missing: 'GATE_PIN nu e setat.',
    short: 'GATE_PIN e prea scurt — minimum 4 caractere.',
    'no-secret': 'BETTER_AUTH_SECRET nu e setat.',
  }[reason];

  return (
    <div className={styles.page}>
      <div className={styles.gate}>
        <b className={styles.gateTitle}>POARTA E ÎNCHISĂ</b>
        <p className={styles.gateBody}>
          {said} Pagina asta dă numere de concurs și pune mașinile în concurs, așa că nu se
          deschide fără cod.
        </p>
      </div>
    </div>
  );
}
