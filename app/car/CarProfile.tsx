'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageSlot } from '@/components/ImageSlot';
import { SectionRule } from '@/components/SectionRule';
import { garageOf, headline, modCount, type Car } from '@/lib/cars';
import { useStore } from '@/lib/store';
import styles from './car.module.css';

const HERO_HINTS = ['Pune poza principală', 'Pune compartimentul motor', 'Pune un detaliu'];

/**
 * The car is the profile. Everything on this page belongs to the car;
 * the owner is a card at the foot of it, never the other way round.
 */
export function CarProfile({ car }: { car: Car }) {
  const router = useRouter();
  const { isFollowing, toggleFollow } = useStore();
  const [hero, setHero] = useState(0);
  // The first group is open on arrival — for most cars that is the engine,
  // but the bagged Passat leads with suspension, so take it from the data.
  const [openMod, setOpenMod] = useState<string | null>(car.mods[0]?.name ?? null);

  const following = isFollowing(car.id);
  const garage = garageOf(car);

  return (
    <>
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
        <div className={styles.heroBottom} />

        <button
          type="button"
          className={`icon-btn ${styles.back}`}
          aria-label="Înapoi"
          onClick={() => router.back()}
        >
          ←
        </button>

        <div className={styles.dots} aria-hidden="true">
          {HERO_HINTS.map((_, i) => (
            <i key={i} data-on={i === hero} />
          ))}
        </div>
      </div>

      <div className={styles.masthead}>
        <div className={styles.tags}>
          <span className="tag">{car.cls}</span>
          <span className={styles.stand}>STAND {car.stand}</span>
        </div>
        <h1 className={`t-display ${styles.headline}`}>{headline(car)}</h1>
      </div>

      {car.win && (
        <div className={styles.win}>
          <div className={styles.diamond} />
          <div className="t-label" style={{ flex: 1 }}>
            MAȘINA SHOW-ULUI
          </div>
          <div className={styles.winYear}>{car.win}</div>
        </div>
      )}

      <div className={styles.followRow}>
        <button
          type="button"
          className={`btn ${following ? 'btn--secondary' : 'btn--primary'}`}
          style={{ padding: 13, letterSpacing: '0.18em' }}
          aria-pressed={following}
          onClick={() => toggleFollow(car.id)}
        >
          {following ? 'URMĂREȘTI' : 'URMĂREȘTE'}
        </button>
        <div className={styles.followers}>
          {(following ? Number(car.followers) + 1 : Number(car.followers)).toLocaleString('ro-RO')}{' '}
          URMĂRITORI
        </div>
      </div>

      <div className={styles.stats}>
        {[
          { k: 'PUTERE', v: car.power, u: 'CP' },
          { k: 'CUPLU', v: car.tq, u: 'NM' },
          { k: 'GREUTATE', v: car.weight, u: 'KG' },
        ].map((s) => (
          <div key={s.k} className={styles.stat}>
            <div className={styles.k}>{s.k}</div>
            <div className={styles.statValue}>
              <span className="t-data-xl">{s.v}</span>
              <span className={styles.unit}>{s.u}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.specs}>
        {[
          ['MOTOR', car.engine],
          ['TRACȚIUNE', `${car.drive} · ${car.gbox}`],
          ['JANTE', car.wheels],
          ['VOPSEA', car.paint],
        ].map(([k, v]) => (
          <div key={k} className={styles.spec}>
            <div className={styles.k}>{k}</div>
            <div className={styles.specValue}>{v}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionHead}>
        <SectionRule label="MODIFICĂRI" trailing={`${modCount(car)} PIESE`} />
      </div>

      {car.mods.map((g) => {
        const open = openMod === g.name;
        return (
          <div key={g.name} className={styles.modGroup}>
            <button
              type="button"
              className={styles.modHead}
              aria-expanded={open}
              onClick={() => setOpenMod(open ? null : g.name)}
            >
              <span className={`${styles.modBar} ${open ? styles.modBarOpen : ''}`} />
              <span className={`t-label ${styles.modName}`}>{g.name}</span>
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

      <div className={styles.storyHead}>
        <SectionRule label="POVESTEA" />
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
        <button type="button" className={styles.ownerFollow}>
          URMĂREȘTE
        </button>
      </div>

      {garage.length > 0 && (
        <div className={styles.garage}>
          {garage.map((g) => (
            <Link key={g.id} href={`/car/${g.id}`} className={styles.garageRow}>
              <span className={styles.garageThumb} />
              <b>
                {g.year} {g.model}
              </b>
              <em>→</em>
            </Link>
          ))}
        </div>
      )}

      <div className={styles.tail} />
    </>
  );
}
