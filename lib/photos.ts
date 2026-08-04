/**
 * Photo slots, in one place.
 *
 * A car's pictures are numbered, and the number is the slot: 0 is the
 * picture that leads the profile, the roster deck, the garage row and
 * the printed card. Every screen imports the numbering from here rather
 * than composing an id of its own — the roster and the profile once
 * disagreed about what a car's photo was called, so a picture added on
 * one was invisible on the other.
 *
 * Six is the ceiling, and the range check on `car_photos.position` is
 * what actually enforces it.
 */

export const CAR_PHOTO_LIMIT = 6;

/**
 * Say what photo belongs in the slot, never "drop an image". The first
 * three are what registration asks for; the rest are what an owner fills
 * in later, so they get looser as they go.
 */
export const CAR_PHOTO_HINTS: readonly string[] = [
  'Poza principală — 3/4 față',
  'Compartiment motor',
  'Interior / detaliu',
  'Spate 3/4',
  'Jante și gardă',
  'Alegerea ta',
];

/** What registration asks for up front. The rest are added on the car. */
export const ONBOARD_PHOTO_COUNT = 3;

export interface CarPhoto {
  position: number;
  url: string;
}

export const isCarPhotoPosition = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < CAR_PHOTO_LIMIT;

/**
 * `v` is the photo's own updated stamp, so replacing a picture changes
 * the URL. Without it the route would have to answer `no-store` forever;
 * with it the bytes are immutable and a phone on two bars fetches each
 * photograph exactly once.
 */
export const carPhotoUrl = (carId: string, position: number, version: number): string =>
  `/api/cars/${carId}/photo/${position}?v=${version}`;

/** The URL for one slot, or null when nobody has filled it. */
export const photoAt = (photos: CarPhoto[] | undefined, position: number): string | null =>
  photos?.find((p) => p.position === position)?.url ?? null;

/** The picture a car leads with wherever it appears as a single tile. */
export const leadPhoto = (photos: CarPhoto[] | undefined): string | null => photoAt(photos, 0);
