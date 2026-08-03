'use client';

import type { Car } from './cars';
import { useStore } from './store';

/**
 * The roster, fetched on the server and handed to the store. Owner name,
 * town and socials are joined in there rather than copied onto each car,
 * so editing a profile updates every entry that person brought.
 */
export function useCars(): Car[] {
  return useStore().cars;
}

/** One entry by id. Null when nothing matches. */
export function useCar(id: string): Car | null {
  return useCars().find((c) => c.id === id) ?? null;
}

/** Whether this member registered the entry, and may therefore edit it. */
export function useOwnsCar(id: string): boolean {
  return useStore().myCars.some((c) => c.id === id);
}
