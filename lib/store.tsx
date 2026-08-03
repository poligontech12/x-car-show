'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  deleteCar as deleteCarAction,
  registerCar,
  saveCar,
  saveProfile,
  castVote as castVoteAction,
  toggleFollow as toggleFollowAction,
} from './actions';
import { authClient } from './auth-client';
import type { Car } from './cars';
import { FEED_FILTERS, type FeedFilter } from './feed';

/**
 * The seam between the screens and the server. Everything durable — the
 * account, the roster, the one vote, who you follow — is fetched on the
 * server and handed in as `initial`; the actions below post to server
 * actions and then ask Next to re-fetch.
 *
 * What stays in the browser is what only matters to this browser: which
 * feed filter is showing, and the half-finished registration draft.
 */

const KEY = 'x-car-show/ui';

export type Role = 'car' | 'vote';
export type Drive = 'FWD' | 'RWD' | 'AWD';

export interface Account {
  name: string;
  email: string;
  role: Role;
  /** Assigned at sign-up, printed on cards — shown, never edited. */
  handle: string;
  town?: string;
  instagram?: string;
  facebook?: string;
}

export interface OnboardingDraft {
  name: string;
  year: string;
  power: number;
  drive: Drive;
}

/** What the server hands the provider on every render. */
export interface ServerState {
  account: Account | null;
  vote: string | null;
  following: Record<string, true>;
  cars: Car[];
  /** Votes per car id. The board is derived from this, never invented. */
  tally: Record<string, number>;
}

interface UiState {
  feedFilter: FeedFilter;
  onboarding: OnboardingDraft;
}

const EMPTY_DRAFT: OnboardingDraft = { name: '', year: '', power: 0, drive: 'RWD' };
const INITIAL_UI: UiState = { feedFilter: 'Toate', onboarding: EMPTY_DRAFT };

interface Store extends UiState, ServerState {
  /** Cars this account registered. Derived — ownership lives in the database. */
  myCars: Car[];
  /** Kept for the screens that hold their frame until the account is known. */
  hydrated: boolean;
  signedIn: boolean;

  /** Resolve to an error message in Romanian, or null when it worked. */
  signIn: (email: string, password: string) => Promise<string | null>;
  register: (
    email: string,
    password: string,
    name: string,
    role: Role,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;

  castVote: (carId: string) => void;
  toggleFollow: (carId: string) => void;
  isFollowing: (carId: string) => boolean;
  setFeedFilter: (f: FeedFilter) => void;

  addCar: (car: Partial<Car>) => Promise<string>;
  updateCar: (id: string, patch: Partial<Car>) => Promise<void>;
  removeCar: (id: string) => Promise<void>;
  updateAccount: (patch: Partial<Account>) => void;

  patchOnboarding: (patch: Partial<OnboardingDraft>) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
}

const StoreContext = createContext<Store | null>(null);

/**
 * A filter that is no longer one of the options matches nothing and the
 * screen comes up empty, so fall back rather than trust what was stored.
 */
const oneOf = <T,>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

function readUi(): UiState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL_UI;
    const parsed = JSON.parse(raw) as Partial<UiState>;
    return {
      feedFilter: oneOf(parsed.feedFilter, FEED_FILTERS, 'Toate'),
      onboarding: { ...EMPTY_DRAFT, ...(parsed.onboarding ?? {}) },
    };
  } catch {
    return INITIAL_UI;
  }
}

/** Turn whatever a server action threw into something worth reading. */
function message(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  return raw && !/digest|fetch failed/i.test(raw) ? raw : 'Ceva n-a mers. Mai încearcă.';
}

export function StoreProvider({
  initial,
  children,
}: {
  initial: ServerState;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ui, setUi] = useState<UiState>(INITIAL_UI);
  const [uiReady, setUiReady] = useState(false);

  /**
   * Voting and following should feel instant on a phone with two bars, so
   * they paint immediately and reconcile when the server answers. Null
   * means "no local opinion — show what the server sent".
   */
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [pendingFollows, setPendingFollows] = useState<Record<string, boolean>>({});
  const [draftAccount, setDraftAccount] = useState<Partial<Account> | null>(null);

  useEffect(() => {
    setUi(readUi());
    setUiReady(true);
  }, []);

  useEffect(() => {
    if (!uiReady) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ui));
    } catch {
      // Storage blocked (private mode). The draft just will not survive a reload.
    }
  }, [ui, uiReady]);

  // Fresh server data supersedes whatever we painted optimistically.
  useEffect(() => {
    setPendingVote(null);
    setPendingFollows({});
    setDraftAccount(null);
  }, [initial]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (saveTimer.current && clearTimeout(saveTimer.current)), []);

  const patchUi = useCallback(
    (p: Partial<UiState> | ((s: UiState) => Partial<UiState>)) =>
      setUi((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })),
    [],
  );

  const value = useMemo<Store>(() => {
    const account = initial.account
      ? { ...initial.account, ...(draftAccount ?? {}) }
      : null;
    const vote = pendingVote ?? initial.vote;

    const following = { ...initial.following };
    for (const [id, on] of Object.entries(pendingFollows)) {
      if (on) following[id] = true;
      else delete following[id];
    }

    const myCars = account ? initial.cars.filter((c) => c.handle === account.handle) : [];

    return {
      ...ui,
      ...initial,
      account,
      vote,
      following,
      myCars,
      hydrated: true,
      signedIn: !!account,

      signIn: async (email, password) => {
        const { error } = await authClient.signIn.email({ email: email.trim(), password });
        if (error) return 'E-mailul sau parola nu se potrivesc.';
        router.refresh();
        return null;
      },

      register: async (email, password, name, role) => {
        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim().split('@')[0],
        });
        if (error) {
          return /exist|taken|unique/i.test(error.message ?? '')
            ? 'Există deja un cont cu e-mailul ăsta.'
            : 'Nu am putut crea contul. Verifică e-mailul și parola (minim 8 caractere).';
        }
        // The role follows what they actually do — registering a car is
        // what makes you an entrant, so there is nothing to set here.
        void role;
        router.refresh();
        return null;
      },

      signOut: async () => {
        await authClient.signOut();
        router.refresh();
        router.push('/');
      },

      castVote: (carId) => {
        setPendingVote(carId);
        void castVoteAction(carId)
          .then(() => router.refresh())
          .catch(() => setPendingVote(null));
      },

      toggleFollow: (carId) => {
        const on = !following[carId];
        setPendingFollows((p) => ({ ...p, [carId]: on }));
        void toggleFollowAction(carId)
          .then(() => router.refresh())
          .catch(() =>
            setPendingFollows((p) => {
              const next = { ...p };
              delete next[carId];
              return next;
            }),
          );
      },

      isFollowing: (carId) => !!following[carId],

      setFeedFilter: (feedFilter) => patchUi({ feedFilter }),

      addCar: async (car) => {
        const id = await registerCar({
          make: car.make,
          model: car.model,
          year: car.year,
          nickname: car.nickname,
          cls: car.cls,
          power: car.power,
          tq: car.tq,
          weight: car.weight,
          engine: car.engine,
          drive: car.drive,
          gbox: car.gbox,
          wheels: car.wheels,
          paint: car.paint,
          story: car.story,
          mods: car.mods,
        });
        router.refresh();
        return id;
      },

      updateCar: async (id, patch) => {
        await saveCar(id, {
          make: patch.make,
          model: patch.model,
          year: patch.year,
          nickname: patch.nickname,
          cls: patch.cls,
          power: patch.power,
          tq: patch.tq,
          weight: patch.weight,
          engine: patch.engine,
          drive: patch.drive,
          gbox: patch.gbox,
          wheels: patch.wheels,
          paint: patch.paint,
          story: patch.story,
          mods: patch.mods,
        });
        router.refresh();
      },

      removeCar: async (id) => {
        await deleteCarAction(id);
        router.refresh();
      },

      // Typed into on every keystroke, so it paints locally and the write
      // trails behind it rather than one round trip per character.
      updateAccount: (patch) => {
        setDraftAccount((d) => ({ ...(d ?? {}), ...patch }));
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          const next = { ...(account ?? {}), ...(draftAccount ?? {}), ...patch };
          void saveProfile({
            name: next.name,
            town: next.town,
            instagram: next.instagram,
            facebook: next.facebook,
          }).then(() => router.refresh());
        }, 700);
      },

      patchOnboarding: (patch) =>
        patchUi((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
      resetOnboarding: () => patchUi({ onboarding: EMPTY_DRAFT }),
      completeOnboarding: () => {},
    };
  }, [initial, ui, pendingVote, pendingFollows, draftAccount, router, patchUi]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}

export { message as errorMessage };
