'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { byId } from '@/lib/cars';
import { useStore, type Role } from '@/lib/store';
import styles from './auth.module.css';

type Mode = 'register' | 'signin' | 'account';

const COPY: Record<Mode, { label: string; title: string; sub: string; cta: string }> = {
  signin: {
    label: 'SIGN IN',
    title: 'Welcome back.',
    sub: 'Your vote, your cars and everyone you follow.',
    cta: 'SIGN IN',
  },
  register: {
    label: 'CREATE ACCOUNT',
    title: 'Join the show.',
    sub: 'Two minutes. No membership fee, no club politics.',
    cta: 'CREATE ACCOUNT',
  },
  account: {
    label: 'ACCOUNT',
    title: 'You’re in.',
    sub: 'Signed in on this phone.',
    cta: '',
  },
};

const ROLES: { key: Role; title: string; sub: string }[] = [
  {
    key: 'car',
    title: 'SHOW A CAR',
    sub: 'Register your build, get a stand and a printed windshield card. Voting included.',
  },
  {
    key: 'vote',
    title: 'VOTE & FOLLOW',
    sub: 'One vote for car of the show, plus every build in the roster.',
  },
];

function AuthScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { account, hydrated, vote, signIn, register, signOut } = useStore();

  const [authMode, setAuthMode] = useState<'register' | 'signin'>(
    params.get('mode') === 'signin' ? 'signin' : 'register',
  );
  const [role, setRole] = useState<Role>(params.get('role') === 'vote' ? 'vote' : 'car');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Signing out from the account screen should land you back in the feed,
  // not on a form you did not ask for.
  const [justSignedOut, setJustSignedOut] = useState(false);
  useEffect(() => {
    if (justSignedOut) router.push('/');
  }, [justSignedOut, router]);

  const mode: Mode = account ? 'account' : authMode;
  const copy = COPY[mode];
  const isForm = mode !== 'account';

  const submit = () => {
    const address = email.trim() || 'you@show.x';
    if (authMode === 'signin') {
      signIn(address, name);
      router.push('/');
    } else {
      register(address, name, role);
      // Entrants go straight into registering the car they came here for;
      // voters go to the thing they came here to do.
      router.push(role === 'car' ? '/onboard' : '/award');
    }
  };

  // Hold the frame until we know whether there is an account, so the
  // form does not flash in front of someone who is already signed in.
  if (!hydrated) return <div className={styles.screen} />;

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <button type="button" className={styles.close} aria-label="Close" onClick={() => router.back()}>
            ×
          </button>
          <div className={styles.label}>{copy.label}</div>
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.sub}>{copy.sub}</p>

        {mode === 'account' && account && (
          <>
            <div className={styles.rows}>
              {[
                ['NAME', account.name],
                ['EMAIL', account.email],
                ['ROLE', account.role === 'car' ? 'ENTRANT · 1 CAR' : 'VOTER'],
                ['VOTE', vote ? byId(vote).model : 'NOT CAST'],
              ].map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <div className={styles.rowKey}>{k}</div>
                  <div className={styles.rowValue}>{v}</div>
                </div>
              ))}
            </div>

            {account.role !== 'car' && (
              <button type="button" className={styles.addCar} onClick={() => router.push('/onboard')}>
                <b>Register a car too</b>
                <em>→</em>
              </button>
            )}

            <button
              type="button"
              className={`btn btn--quiet ${styles.signOut}`}
              onClick={() => {
                signOut();
                setAuthMode('signin');
                setJustSignedOut(true);
              }}
            >
              SIGN OUT
            </button>
          </>
        )}

        {mode === 'register' && (
          <>
            <div className={`${styles.fieldLabel} ${styles.roleHead}`}>I’M HERE TO</div>
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`${styles.role} ${role === r.key ? styles.roleOn : ''}`}
                aria-pressed={role === r.key}
                onClick={() => setRole(r.key)}
              >
                <span className={styles.roleDot} />
                <span className={styles.roleBody}>
                  <b>{r.title}</b>
                  <span>{r.sub}</span>
                </span>
              </button>
            ))}
          </>
        )}

        {isForm && (
          <>
            {mode === 'register' && (
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="name">
                  NAME
                </label>
                <input
                  id="name"
                  className={styles.input}
                  type="text"
                  placeholder="Andrei M."
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="email">
                EMAIL
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* There is no backend yet, so this field is never read and
                never stored — it is here so the flow reads true. */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="button"
              className={styles.switch}
              onClick={() => setAuthMode(authMode === 'register' ? 'signin' : 'register')}
            >
              {authMode === 'register'
                ? 'ALREADY HAVE AN ACCOUNT? SIGN IN →'
                : 'NEW HERE? CREATE AN ACCOUNT →'}
            </button>
          </>
        )}

        <div className={styles.tail} />
      </div>

      {isForm && (
        <div className={styles.footer}>
          <button type="button" className="btn btn--primary" onClick={submit}>
            {copy.cta}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className={styles.screen} />}>
      <AuthScreen />
    </Suspense>
  );
}
