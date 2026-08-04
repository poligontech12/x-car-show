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
  toggleFollow as toggleFollowAction,
  toggleVote as toggleVoteAction,
} from './actions';
import { authClient } from './auth-client';
import type { Car } from './cars';
import { VOTE_LIMIT } from './event';

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
  /** Cars this account has backed. At most VOTE_LIMIT of them. */
  votes: string[];
  following: Record<string, true>;
  cars: Car[];
  /** Votes per car id. The board is derived from this, never invented. */
  tally: Record<string, number>;
}

interface UiState {
  onboarding: OnboardingDraft;
}

const EMPTY_DRAFT: OnboardingDraft = { name: '', year: '', power: 0, drive: 'RWD' };
const INITIAL_UI: UiState = { onboarding: EMPTY_DRAFT };

interface Store extends UiState, ServerState {
  /** Cars this account registered. Derived — ownership lives in the database. */
  myCars: Car[];
  /** Kept for the screens that hold their frame until the account is known. */
  hydrated: boolean;
  signedIn: boolean;

  /** Resolve to an error message in Romanian, or null when it worked. */
  signIn: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  signOut: () => Promise<void>;

  /** Back a car, or withdraw. Silently ignored once all three are spent. */
  toggleVote: (carId: string) => void;
  hasVoted: (carId: string) => boolean;
  /** How many of the three are still going spare. */
  votesLeft: number;
  toggleFollow: (carId: string) => void;
  isFollowing: (carId: string) => boolean;
  /**
   * How far ahead of the server a follow we painted optimistically is:
   * +1, -1, or 0 once the server's own count has caught up. Screens add
   * this to the count they were given rather than guessing at it.
   */
  followerDelta: (carId: string) => number;

  addCar: (car: Partial<Car>) => Promise<string>;
  updateCar: (id: string, patch: Partial<Car>) => Promise<void>;
  removeCar: (id: string) => Promise<void>;
  updateAccount: (patch: Partial<Account>) => void;

  patchOnboarding: (patch: Partial<OnboardingDraft>) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
}

const StoreContext = createContext<Store | null>(null);

function readUi(): UiState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return INITIAL_UI;
    const parsed = JSON.parse(raw) as Partial<UiState>;
    return {
      onboarding: { ...EMPTY_DRAFT, ...(parsed.onboarding ?? {}) },
    };
  } catch {
    return INITIAL_UI;
  }
}

/**
 * Rate limiting answers with a 429, which is not a wrong password. Saying
 * it is sends people straight back to retry, and retrying is exactly what
 * keeps the limit tripped.
 */
const TOO_MANY = 'Prea multe încercări. Așteaptă un minut și încearcă din nou.';

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
  const [pendingVotes, setPendingVotes] = useState<string[] | null>(null);
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
    setPendingVotes(null);
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
    const votes = pendingVotes ?? initial.votes;

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
      votes,
      following,
      myCars,
      hydrated: true,
      signedIn: !!account,

      signIn: async (email, password) => {
        const { error } = await authClient.signIn.email({ email: email.trim(), password });
        if (error) {
          // Only 401 means the credentials were wrong. Reporting anything
          // else as "wrong password" sends people off retyping a password
          // that was right all along.
          if (error.status === 401 || error.status === 403) {
            return 'E-mailul sau parola nu se potrivesc.';
          }
          if (error.status === 429) return TOO_MANY;
          if (process.env.NODE_ENV !== 'production') console.error('sign-in failed', error);
          return `Nu am putut face conectarea: ${error.message || error.status || 'motiv necunoscut'}`;
        }
        router.refresh();
        return null;
      },

      register: async (email, password, name) => {
        const address = email.trim();
        const { error } = await authClient.signUp.email({
          email: address,
          password,
          name: name.trim() || address.split('@')[0],
        });

        if (error) {
          /**
           * This screen opens on "create account", so somebody coming back
           * to sign in types their own email into it and gets told the
           * account exists — which is true, unhelpful, and reads as a
           * rejection. They gave us an email and a password: try them.
           */
          if (/exist/i.test(error.message ?? '') || error.code === 'USER_ALREADY_EXISTS') {
            const retry = await authClient.signIn.email({ email: address, password });
            if (!retry.error) {
              router.refresh();
              return null;
            }
            return 'Ai deja cont cu e-mailul ăsta, dar parola nu se potrivește.';
          }
          /**
           * A single catch-all message here cost days of guessing: the
           * server said exactly what was wrong every time and this threw
           * it away. Known causes get plain Romanian; anything else shows
           * the server's own words rather than a shrug.
           */
          if (process.env.NODE_ENV !== 'production') console.error('sign-up failed', error);
          if (error.status === 429) return TOO_MANY;
          const code = error.code ?? '';
          if (code === 'PASSWORD_TOO_SHORT') return 'Parola are minim 8 caractere.';
          if (code === 'PASSWORD_TOO_LONG') return 'Parola e prea lungă.';
          if (/email/i.test(error.message ?? '') && /invalid|valid/i.test(error.message ?? '')) {
            return 'E-mailul nu pare valid. Verifică-l încă o dată.';
          }
          return `Nu am putut crea contul: ${error.message || code || 'motiv necunoscut'}`;
        }

        // Nobody declares what they are here. Registering a car is what
        // makes you an entrant; everyone else just votes.
        router.refresh();
        return null;
      },

      signOut: async () => {
        await authClient.signOut();
        /**
         * A full page load, not router.push. Next keeps a client-side cache
         * of rendered pages, and pushing after signing out happily serves
         * the copy it rendered while you were still signed in — the session
         * is gone on the server but your initial is still in the nav, which
         * reads as "it did not log me out". Reloading throws that cache and
         * every scrap of client state away, which is what signing out means.
         */
        window.location.href = '/';
      },

      toggleVote: (carId) => {
        const on = votes.includes(carId);
        if (!on && votes.length >= VOTE_LIMIT) return;
        // Paint it immediately; a phone on two bars should not wait to
        // find out whether the tap registered.
        setPendingVotes(on ? votes.filter((id) => id !== carId) : [...votes, carId]);
        void toggleVoteAction(carId)
          .then(() => router.refresh())
          .catch(() => setPendingVotes(null));
      },

      hasVoted: (carId) => votes.includes(carId),
      votesLeft: Math.max(VOTE_LIMIT - votes.length, 0),

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

      /**
       * Only while our opinion and the server's differ. Adding one for
       * every follow you hold double-counts it the moment the refresh
       * lands, because the count we were handed already includes you —
       * which is how following a car with nobody on it read as two.
       */
      followerDelta: (carId) => {
        const pending = pendingFollows[carId];
        if (pending === undefined || pending === !!initial.following[carId]) return 0;
        return pending ? 1 : -1;
      },


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
  }, [initial, ui, pendingVotes, pendingFollows, draftAccount, router, patchUi]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}

export { message as errorMessage };
