import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EntryCard } from '@/components/EntryCard';
import { QrCode } from '@/components/QrCode';
import { carUrl, headline } from '@/lib/cars';
import { getCar } from '@/lib/db/queries';
import { EVENT } from '@/lib/event';
import { PrintButton } from '../PrintButton';
import styles from '../cards.module.css';

/**
 * Cards get printed while entries are still half-filled. An em dash reads
 * as "not given"; a 0 reads as a measurement, and a wrong one.
 */
const orDash = (v: string | number | null | undefined) => (v ? String(v) : '—');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const car = await getCar((await params).id);
  return { title: car ? `${headline(car)} — cartonaș de parbriz` : 'Cartonaș de parbriz' };
}

/**
 * One car, one card, one thing to do with it.
 *
 * This page used to carry three designs at once — a black spec plate and
 * a photo plate beside the paper one — because it was where the card was
 * being chosen. It is chosen: the paper card is what goes on the car and
 * what the entrant is handed at registration, so the alternates are gone
 * rather than left here to be printed by mistake.
 */
export default async function CardsScreen({ params }: { params: Promise<{ id: string }> }) {
  const car = await getCar((await params).id);
  if (!car) notFound();
  const url = carUrl(car);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <b>{headline(car)}</b>
          <span>
            STAND {orDash(car.stand)} · {EVENT.edition} · A5 LANDSCAPE, 210 × 148 MM
          </span>
        </div>
        <PrintButton />
        <Link href={`/car/${car.id}`} className={styles.toolbarLink}>
          PROIECTUL →
        </Link>
        <Link href="/cards" className={styles.toolbarLink}>
          TOATE ÎNSCRIERILE
        </Link>
      </div>

      <div className={styles.deck}>
        <EntryCard
          car={car}
          qr={<QrCode value={url} size="100%" dark="#0B0B0C" light="#F4F3EF" />}
        />
      </div>
    </div>
  );
}
