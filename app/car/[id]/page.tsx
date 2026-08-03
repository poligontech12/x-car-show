import type { Metadata } from 'next';
import { headline } from '@/lib/cars';
import { getCar } from '@/lib/db/queries';
import { CarProfile } from '../CarProfile';

/**
 * A car URL is what the printed QR code points at, so this is the preview
 * somebody gets when they paste it into a message. It is worth a query.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const car = await getCar((await params).id);
  if (!car) return { title: 'Mașină — X Car Show' };

  const spec = [car.power && `${car.power} CP`, car.engine, car.drive].filter(Boolean).join(' · ');
  const who = [car.owner, car.town].filter(Boolean).join(', ');
  return {
    title: `${headline(car)} — X Car Show`,
    description: [spec, who].filter(Boolean).join('. ') || 'X Car Show, Cajvana.',
  };
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  // The id only — the roster is already in the store, fetched once in the
  // layout, so the profile resolves from there without a second query.
  return <CarProfile id={(await params).id} />;
}
