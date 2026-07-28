'use client';

import Link from 'next/link';
import { Chip } from '@/components/Chip';
import { ImageSlot } from '@/components/ImageSlot';
import {
  FilterRow,
  HeaderRow,
  HeaderRule,
  StickyHeader,
} from '@/components/StickyHeader';
import { CARS, CLASSES, ROSTER_TOTAL, displayModel, headline } from '@/lib/cars';
import { useStore } from '@/lib/store';
import styles from './roster.module.css';

export default function RosterScreen() {
  const { classFilter, setClassFilter } = useStore();

  const list = CARS.filter((c) => classFilter === 'TOATE' || c.cls === classFilter);
  const [feature, ...rest] = list;
  const unfiltered = list.length === CARS.length;

  return (
    <>
      <StickyHeader>
        <HeaderRow>
          <h1 className="t-title">ÎNSCRIȘI</h1>
          <HeaderRule />
          <div className={styles.count}>
            {unfiltered ? `${ROSTER_TOTAL} ÎNSCRIERI` : `${list.length} DIN ${ROSTER_TOTAL}`}
          </div>
        </HeaderRow>

        <FilterRow label="Filtrează după clasă">
          {CLASSES.map((c) => (
            <Chip key={c} label={c} on={classFilter === c} onClick={() => setClassFilter(c)} />
          ))}
        </FilterRow>
      </StickyHeader>

      {feature && (
        <Link href={`/car/${feature.id}`} className={styles.feature}>
          <ImageSlot
            id={`car-${feature.id}`}
            hint={`${feature.year} ${feature.model}`}
            mode="inline"
          />
          <div className={styles.scrim} />
          <div className={styles.featureCaption}>
            <b>{headline(feature)}</b>
            <span>{`${feature.no} · ${feature.cls} · ${feature.power} CP`}</span>
          </div>
        </Link>
      )}

      <div className={styles.grid}>
        {rest.map((c) => (
          <Link key={c.id} href={`/car/${c.id}`} className={styles.tile}>
            <div className={styles.no}>{c.no}</div>
            <ImageSlot id={`car-${c.id}`} hint={`${c.year} ${c.model}`} mode="inline" />
            <div className={styles.tileScrim} />
            <div className={styles.tileCaption}>
              <b>{displayModel(c)}</b>
              <span>{`${c.year} · ${c.power} CP`}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.foot}>
        {unfiltered
          ? `SFÂRȘITUL PAGINII 1 · ÎNCĂ ${ROSTER_TOTAL - CARS.length}`
          : 'VIZUALIZARE FILTRATĂ'}
      </div>
    </>
  );
}
