'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CLASSES, type CarClass } from './cars';
import { FEED_FILTERS, type FeedFilter } from './feed';

/**
 * There is no backend yet. Everything a member does — their account,
 * their one vote, who they follow — lives in this store and persists
 * to localStorage so the prototype survives a reload. Swapping this
 * for a real API means replacing the body of the actions below; no
 * screen touches storage directly.
 */

const KEY = 'x-car-show/state';

export type Role = 'car' | 'vote';
export type Drive = 'FWD' | 'RWD' | 'AWD';
export type ClassFilter = 'TOATE' | CarClass;

export interface Account {
  name: string;
  email: string;
  role: Role;
}

export interface OnboardingDraft {
  make: string | null;
  year: string;
  power: number;
  drive: Drive;
}

interface State {
  account: Account | null;
  /** Car of the show. One account, one vote — changeable until 18:00. */
  vote: string | null;
  following: Record<string, true>;
  feedFilter: FeedFilter;
  classFilter: ClassFilter;
  onboarding: OnboardingDraft;
}

const EMPTY_DRAFT: OnboardingDraft = {
  make: null,
  year: '1998',
  power: 412,
  drive: 'RWD',
};

const INITIAL: State = {
  account: null,
  vote: null,
  following: {},
  feedFilter: 'TOATE',
  classFilter: 'TOATE',
  onboarding: EMPTY_DRAFT,
};

interface Store extends State {
  /** False until localStorage has been read, so the first paint matches the server. */
  hydrated: boolean;
  signedIn: boolean;
  signIn: (email: string, name?: string) => void;
  register: (email: string, name: string, role: Role) => void;
  signOut: () => void;
  castVote: (carId: string) => void;
  toggleFollow: (carId: string) => void;
  isFollowing: (carId: string) => boolean;
  setFeedFilter: (f: FeedFilter) => void;
  setClassFilter: (c: ClassFilter) => void;
  patchOnboarding: (patch: Partial<OnboardingDraft>) => void;
  resetOnboarding: () => void;
  /** Called when a car registration completes — the account becomes an entrant. */
  completeOnboarding: () => void;
}

const StoreContext = createContext<Store | null>(null);

/**
 * A filter that is no longer one of the options matches nothing and the
 * screen comes up empty, so fall back rather than trust what was stored.
 * Filter labels are the values themselves, so renaming one — as the move
 * to Romanian did — strands every browser that saw the old build.
 */
const oneOf = <T,>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...INITIAL,
      ...parsed,
      feedFilter: oneOf(parsed.feedFilter, FEED_FILTERS, 'TOATE'),
      classFilter: oneOf(parsed.classFilter, CLASSES, 'TOATE'),
      following: parsed.following ?? {},
      onboarding: { ...EMPTY_DRAFT, ...(parsed.onboarding ?? {}) },
    };
  } catch {
    return INITIAL;
  }
}

/** Whatever they typed, shown the way the app shows every name. */
function nameFrom(typed: string, email: string): string {
  const base = typed.trim() || email.split('@')[0] || 'MEMBRU';
  return base.toUpperCase();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode). The session still works,
      // it just will not survive a reload.
    }
  }, [state, hydrated]);

  const patch = useCallback(
    (p: Partial<State> | ((s: State) => Partial<State>)) =>
      setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })),
    [],
  );

  const value = useMemo<Store>(() => {
    const signedIn = !!state.account;
    return {
      ...state,
      hydrated,
      signedIn,

      // Signing in is for people who already have a reason to be here.
      signIn: (email, name = '') =>
        patch({ account: { name: nameFrom(name, email), email, role: 'vote' } }),

      register: (email, name, role) =>
        patch({ account: { name: nameFrom(name, email), email, role } }),

      // Sign out drops the vote with the account — it belongs to the account,
      // not to the phone.
      signOut: () => patch({ account: null, vote: null }),

      castVote: (carId) => patch({ vote: carId }),

      toggleFollow: (carId) =>
        patch((s) => {
          const next = { ...s.following };
          if (next[carId]) delete next[carId];
          else next[carId] = true;
          return { following: next };
        }),

      isFollowing: (carId) => !!state.following[carId],

      setFeedFilter: (feedFilter) => patch({ feedFilter }),
      setClassFilter: (classFilter) => patch({ classFilter }),

      patchOnboarding: (p) => patch((s) => ({ onboarding: { ...s.onboarding, ...p } })),
      resetOnboarding: () => patch({ onboarding: EMPTY_DRAFT }),
      completeOnboarding: () =>
        patch((s) => ({
          account: s.account ? { ...s.account, role: 'car' } : s.account,
        })),
    };
  }, [state, hydrated, patch]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
