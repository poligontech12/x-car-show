'use client';

import Link from 'next/link';
import { useState } from 'react';
import { socialUrl } from '@/lib/cars';
import { Avatar } from '@/components/Avatar';
import { CarPhotoSlot } from '@/components/CarPhotoSlot';
import { displayModel, modCount } from '@/lib/cars';
import { CAR_PHOTO_HINTS, CAR_PHOTO_LIMIT, photoAt } from '@/lib/photos';
import { useCar, useCars, useOwnsCar } from '@/lib/useCars';
import { useCountUp } from '@/lib/useCountUp';
import { useStore } from '@/lib/store';
import styles from './car.module.css';

/**
 * Six wells. A visitor scrolls past the ones nobody filled; the owner
 * sees them as an invitation, and this is the only screen that offers
 * one — every other place a car appears is showing, not editing.
 */
const SLOTS = Array.from({ length: CAR_PHOTO_LIMIT }, (_, i) => i);

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
        <span className={`n-xl ${gold ? 'n-accent' : 'n-fade'}`}>{n.toLocaleString('ro-RO')}</span>
        <span className={styles.unit}>{unit}</span>
      </div>
    </div>
  );
}

/**
 * The car is the profile. Everything on this page belongs to the car;
 * the owner is a card at the foot of it, never the other way round.
 */
export function CarProfile({ id }: { id: string }) {
  const { isFollowing, toggleFollow, followerDelta, hydrated } = useStore();
  const car = useCar(id);
  const owns = useOwnsCar(id);
  const all = useCars();
  const [hero, setHero] = useState(0);
  const [openMod, setOpenMod] = useState<string | null>(null);

  if (!hydrated) return <div className={styles.screen} />;
  if (!car) {
    return (
      <div className={styles.screen}>
        <div className={styles.missing}>
          <h1>Mașina nu există.</h1>
          <p>Poate a fost ștearsă, sau linkul e greșit.</p>
          <Link href="/roster" className="btn btn--glass">
            Vezi înscrișii
          </Link>
        </div>
      </div>
    );
  }

  // The first group is open on arrival — for most cars that is the engine,
  // but the bagged Passat leads with suspension, so take it from the data.
  const openGroup = openMod ?? car.mods[0]?.name ?? null;
  const following = isFollowing(car.id);
  // Everything else this person brought. One person, many cars.
  const garage = car.handle
    ? all.filter((o) => o.handle === car.handle && o.id !== car.id)
    : [];
  // The count came from the database and already counts everyone who
  // follows, this reader included; only a tap the server has not answered
  // yet needs adding on top.
  const followers = Number(car.followers) + followerDelta(car.id);

  /**
   * The owner gets every well, so there is always somewhere to put the
   * next photograph. A visitor gets the pictures that exist — and a
   * single empty well when there are none, because a car nobody has
   * photographed should look unphotographed, not broken.
   */
  const filled = SLOTS.filter((i) => photoAt(car.photos, i));
  const frames = owns ? SLOTS : filled.length ? filled : [0];

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
          {frames.map((slot) => (
            <div key={slot} className={styles.frame}>
              <CarPhotoSlot
                carId={car.id}
                position={slot}
                src={photoAt(car.photos, slot)}
                hint={CAR_PHOTO_HINTS[slot]}
                canEdit={owns}
              />
            </div>
          ))}
        </div>

        {/* Gradients only. A blur over the foot of the photograph bought
            the headline contrast it already has from `heroBottom`, and
            paid for it by softening the part of the car people actually
            came to look at. */}
        <div className={styles.heroTop} />
        <div className={styles.heroBottom} />

        {frames.length > 1 && (
          <div className={styles.dots} aria-hidden="true">
            {frames.map((slot, i) => (
              <i key={slot} data-on={i === hero} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.masthead}>
        <div className={`${styles.tags} a-up delay-300`}>
          <span className="tag">{car.cls}</span>
          <span className={styles.stand}>
            {car.stand ? `Stand ${car.stand}` : 'Stand nealocat încă'}
          </span>
        </div>
        <h1 className={`${styles.name} a-speed delay-400`}>{displayModel(car)}</h1>
        <div className={`${styles.year} a-up delay-500`}>
          {[car.year || null, car.make || null, car.nickname && `„${car.nickname}”`]
            .filter(Boolean)
            .join(' · ')}
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
        {(
          [
            ['Motor', car.engine],
            ['Tracțiune', [car.drive, car.gbox].filter(Boolean).join(' · ')],
            ['Jante', car.wheels],
            ['Vopsea', car.paint],
            // Last, and blank for anyone who would rather not publish it.
            ['Înmatriculare', car.plate ?? ''],
          ] as [string, string][]
        )
          .filter(([, v]) => v.trim())
          .map(([k, v]) => (
          <div key={k} className={styles.spec}>
            <div className={styles.specKey}>{k}</div>
            <div
              className={`${styles.specValue} ${k === 'Înmatriculare' ? styles.plate : ''}`}
            >
              {v}
            </div>
          </div>
          ))}
      </div>

      {car.mods.length > 0 && (
        <div className={styles.sectionHead}>
          <h2>Modificări</h2>
          <div className="spacer" />
          <span className={styles.sectionCount}>{modCount(car)} piese</span>
        </div>
      )}

      <div className={styles.mods}>
        {car.mods.map((g) => {
          const open = openGroup === g.name;
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

      {car.story.trim() && (
        <>
          <div className={styles.sectionHead}>
            <h2>Povestea</h2>
          </div>
          <p className={styles.story}>{car.story}</p>
        </>
      )}

      <div className={styles.owner}>
        <Avatar src={car.ownerImage} name={car.owner || "?"} className={styles.ownerAvatar} />
        <div className={styles.ownerBody}>
          <b>{car.owner || 'Fără nume'}</b>
          <span>{[car.handle && `@${car.handle}`, car.town].filter(Boolean).join(' · ')}</span>
        </div>
        {car.handle && (
          <Link href={`/owner/${car.handle}`} className="chip">
            Profil
          </Link>
        )}
      </div>

      {(car.instagram || car.facebook) && (
        <div className={styles.socials}>
          {car.instagram && (
            <a
              className={styles.social}
              href={socialUrl('instagram', car.instagram)}
              target="_blank"
              rel="noreferrer noopener"
            >
              Instagram
              <em>@{car.instagram.replace(/^@+/, '')}</em>
            </a>
          )}
          {car.facebook && (
            <a
              className={styles.social}
              href={socialUrl('facebook', car.facebook)}
              target="_blank"
              rel="noreferrer noopener"
            >
              Facebook
              <em>{car.facebook.replace(/^@+/, '')}</em>
            </a>
          )}
        </div>
      )}

      {owns && (
        <Link href={`/car/${car.id}/edit`} className={`btn btn--glass ${styles.editCta}`}>
          Editează detaliile
        </Link>
      )}

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
