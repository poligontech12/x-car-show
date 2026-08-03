'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ImageSlot } from '@/components/ImageSlot';
import { displayModel, garageOf, modCount, type Car } from '@/lib/cars';
import { useCountUp } from '@/lib/useCountUp';
import { useStore } from '@/lib/store';
import styles from './car.module.css';

const HERO_HINTS = ['Pune poza principală', 'Pune compartimentul motor', 'Pune un detaliu'];

/** Power leads in gold; the other two fall away behind it. */
function Stat({
  label,
  value,
  unit,
  delay,
  gold,
}: {
  label: string;
  value: string;
  unit: string;
  delay: number;
  gold?: boolean;
}) {
  const n = useCountUp(Number(value), { delay });
  return (
    <div className={`${styles.stat} a-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>
        <span className={`n-xl ${gold ? 'n-gold' : 'n-fade'}`}>{n.toLocaleString('ro-RO')}</span>
        <span className={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

/**
 * The car is the profile. Everything on this page belongs to the car;
 * the owner is a card at the foot of it, never the other way round.
 */
export function CarProfile({ car }: { car: Car }) {
  const { isFollowing, toggleFollow } = useStore();
  const [hero, setHero] = useState(0);
  // The first group is open on arrival — for most cars that is the engine,
  // but the bagged Passat leads with suspension, so take it from the data.
  const [openMod, setOpenMod] = useState<string | null>(car.mods[0]?.name ?? null);

  const following = isFollowing(car.id);
  const garage = garageOf(car);
  const followers = following ? Number(car.followers) + 1 : Number(car.followers);

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <div
          className={styles.rail}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== hero) setHero(i);
          }}
        >
          {HERO_HINTS.map((hint, i) => (
            <div key={i} className={styles.frame}>
              <ImageSlot id={`hero-${car.id}-${i}`} hint={hint} />
            </div>
          ))}
        </div>

        <div className={styles.heroTop} />
        {/* The blur that lets the name sit on the photograph. */}
        <div className="photo-veil" style={{ zIndex: 3 }} />
        <div className={styles.heroBottom} />

        <div className={styles.dots} aria-hidden="true">
          {HERO_HINTS.map((_, i) => (
            <i key={i} data-on={i === hero} />
          ))}
        </div>
      </div>

      <div className={styles.masthead}>
        <div className={`${styles.tags} a-up delay-300`}>
          <span className="tag">{car.cls}</span>
          <span className={styles.stand}>Stand {car.stand}</span>
        </div>
        <h1 className={`${styles.name} a-speed delay-400`}>{displayModel(car)}</h1>
        <div className={`${styles.year} a-up delay-500`}>
          {car.year} · {car.make}
        </div>
      </div>

      {car.win && (
        <div className={`${styles.win} a-up delay-500`}>
          <svg
            className={styles.trophy}
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4.5 2.5h9v4a4.5 4.5 0 0 1-9 0v-4Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M9 11v3M6 15.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className={styles.winLabel}>Mașina show-ului</span>
          <span className={styles.winYear}>{car.win}</span>
        </div>
      )}

      <div className={`${styles.followRow} a-up delay-600`}>
        <button
          type="button"
          className={`btn ${following ? 'btn--glass' : 'btn--primary'}`}
          aria-pressed={following}
          onClick={() => toggleFollow(car.id)}
        >
          {following ? 'Urmărești' : 'Urmărește'}
        </button>
        <div className={styles.followers}>{followers.toLocaleString('ro-RO')} urmăritori</div>
      </div>

      <div className={styles.stats}>
        <Stat label="Putere" value={car.power} unit="CP" delay={700} gold />
        <Stat label="Cuplu" value={car.tq} unit="NM" delay={900} />
        <Stat label="Greutate" value={car.weight} unit="KG" delay={1100} />
      </div>

      <div className={styles.specs}>
        {[
          ['Motor', car.engine],
          ['Tracțiune', `${car.drive} · ${car.gbox}`],
          ['Jante', car.wheels],
          ['Vopsea', car.paint],
        ].map(([k, v]) => (
          <div key={k} className={styles.spec}>
            <div className={styles.specKey}>{k}</div>
            <div className={styles.specValue}>{v}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionHead}>
        <h2>Modificări</h2>
        <div className="spacer" />
        <span className={styles.sectionCount}>{modCount(car)} piese</span>
      </div>

      <div className={styles.mods}>
        {car.mods.map((g) => {
          const open = openMod === g.name;
          return (
            <div
              key={g.name}
              className={`${styles.modGroup} ${open ? styles.modGroupOpen : ''}`}
            >
              <button
                type="button"
                className={styles.modHead}
                aria-expanded={open}
                onClick={() => setOpenMod(open ? null : g.name)}
              >
                <span className={styles.modName}>{g.name}</span>
                <span className={styles.modSign}>{open ? '−' : '+'}</span>
              </button>
              {open && (
                <ul className={styles.modItems}>
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.sectionHead}>
        <h2>Povestea</h2>
      </div>
      <p className={styles.story}>{car.story}</p>

      <div className={styles.owner}>
        <div className={styles.ownerAvatar} />
        <div className={styles.ownerBody}>
          <b>{car.owner}</b>
          <span>
            @{car.handle} · {car.town}
          </span>
        </div>
        <button type="button" className="chip">
          Urmărește
        </button>
      </div>

      {garage.length > 0 && (
        <div className={styles.garage}>
          {garage.map((g) => (
            <Link key={g.id} href={`/car/${g.id}`} className={styles.garageRow}>
              <span className={styles.garageThumb} />
              <b>
                {g.year} {displayModel(g)}
              </b>
              <em>→</em>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
