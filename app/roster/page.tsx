'use client';

import Link from 'next/link';
import { Chip } from '@/components/Chip';
import { ImageSlot } from '@/components/ImageSlot';
import { FilterRow, ScreenTitle, TitleAside } from '@/components/StickyHeader';
import { CARS, CLASSES, ROSTER_TOTAL, displayModel, headline } from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { useStore } from '@/lib/store';
import styles from './roster.module.css';

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function RosterScreen() {
  const { classFilter, setClassFilter } = useStore();

  const list = CARS.filter((c) => classFilter === 'Toate' || c.cls === classFilter);
  const [feature, ...rest] = list;
  const unfiltered = list.length === CARS.length;

  return (
    <div className={styles.screen}>
      <ScreenTitle
        className="a-up delay-300"
        label={EVENT.edition}
        icon={<GridIcon />}
        lines={['Grila', 'de start']}
        aside={
          <>
            <TitleAside>{ROSTER_TOTAL} de înscrieri</TitleAside>
            {!unfiltered && <TitleAside gold>{list.length} în filtru</TitleAside>}
          </>
        }
      />

      <FilterRow label="Filtrează după clasă">
        {CLASSES.map((c) => (
          <Chip key={c} label={c} on={classFilter === c} onClick={() => setClassFilter(c)} />
        ))}
      </FilterRow>

      {feature && (
        <Link href={`/car/${feature.id}`} className={`${styles.feature} a-scale delay-400`}>
          <ImageSlot
            id={`car-${feature.id}`}
            hint={`${feature.year} ${feature.model}`}
            mode="inline"
          />
          <span className="photo-scrim" />
          <span className="photo-veil" />
          <span className={`tag ${styles.badge}`}>{feature.cls}</span>
          <span className={styles.featureCaption}>
            <span className={styles.featureName}>
              <b>{headline(feature)}</b>
              <span>
                {feature.power} CP · {feature.owner}
              </span>
            </span>
            <span className={styles.featureNo}>{feature.no}</span>
          </span>
        </Link>
      )}

      <div className={styles.grid}>
        {rest.map((c, i) => (
          <Link
            key={c.id}
            href={`/car/${c.id}`}
            className={`${styles.tile} a-up`}
            style={{ animationDelay: `${0.5 + i * 0.06}s` }}
          >
            <span className={styles.no}>{c.no}</span>
            <ImageSlot id={`car-${c.id}`} hint={`${c.year} ${c.model}`} mode="inline" />
            <span className="photo-scrim" />
            <span className={styles.tileCaption}>
              <b>{displayModel(c)}</b>
              <span>
                {c.year} · {c.power} CP
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className={styles.foot}>
        {unfiltered
          ? `Sfârșitul paginii 1 · încă ${ROSTER_TOTAL - CARS.length}`
          : 'Vizualizare filtrată'}
      </div>
    </div>
  );
}
