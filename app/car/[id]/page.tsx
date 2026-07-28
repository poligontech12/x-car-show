import type { Metadata } from 'next';
import { CARS, byId, headline } from '@/lib/cars';
import { CarProfile } from '../CarProfile';

export function generateStaticParams() {
  return CARS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const car = byId((await params).id);
  return {
    title: `${headline(car)} — X Car Show`,
    description: `${car.power} HP · ${car.engine} · ${car.drive}. ${car.owner}, ${car.town}. Stand ${car.stand}.`,
  };
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  return <CarProfile car={byId((await params).id)} />;
}
