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
 * Say what photo belongs in the slot, never "drop an image". They get
 * looser as they go: the first is the one every screen leads with, the
 * last is whatever the owner thinks is worth showing.
 *
 * Registration offers all six and the car page offers the same six — one
 * number, so nobody has to be told where the other three went.
 */
export const CAR_PHOTO_HINTS: readonly string[] = [
  'Poza principală — 3/4 față',
  'Compartiment motor',
  'Interior / detaliu',
  'Spate 3/4',
  'Jante și gardă',
  'Alegerea ta',
];

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

/**
 * A member's own photograph. Keyed by handle rather than account id
 * because the handle is already the public name for a person — it is what
 * /owner/<handle> is built from and what gets printed on a card.
 */
export const AVATAR_EDGE = 512;

export const avatarUrl = (handle: string, version: number): string =>
  `/api/owners/${encodeURIComponent(handle)}/avatar?v=${version}`;

/** The picture a car leads with wherever it appears as a single tile. */
export const leadPhoto = (photos: CarPhoto[] | undefined): string | null => photoAt(photos, 0);
