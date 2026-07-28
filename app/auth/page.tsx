'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { byId } from '@/lib/cars';
import { useStore, type Role } from '@/lib/store';
import styles from './auth.module.css';

type Mode = 'register' | 'signin' | 'account';

const COPY: Record<Mode, { label: string; title: string; sub: string; cta: string }> = {
  signin: {
    label: 'CONECTARE',
    title: 'Bine ai revenit.',
    sub: 'Votul tău, mașinile tale și toți cei pe care îi urmărești.',
    cta: 'CONECTARE',
  },
  register: {
    label: 'CONT NOU',
    title: 'Intră în show.',
    sub: 'Două minute. Fără cotizație, fără politică de club.',
    cta: 'CREEAZĂ CONTUL',
  },
  account: {
    label: 'CONT',
    title: 'Ești înăuntru.',
    sub: 'Conectat pe telefonul ăsta.',
    cta: '',
  },
};

const ROLES: { key: Role; title: string; sub: string }[] = [
  {
    key: 'car',
    title: 'EXPUN O MAȘINĂ',
    sub: 'Îți înscrii proiectul, primești un stand și un cartonaș de parbriz tipărit. Votul e inclus.',
  },
  {
    key: 'vote',
    title: 'VOTEZ & URMĂRESC',
    sub: 'Un vot pentru mașina show-ului, plus fiecare proiect din listă.',
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
          <button type="button" className={styles.close} aria-label="Închide" onClick={() => router.back()}>
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
                ['NUME', account.name],
                ['EMAIL', account.email],
                ['ROL', account.role === 'car' ? 'PARTICIPANT · 1 MAȘINĂ' : 'VOTANT'],
                ['VOT', vote ? byId(vote).model : 'NEVOTAT'],
              ].map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <div className={styles.rowKey}>{k}</div>
                  <div className={styles.rowValue}>{v}</div>
                </div>
              ))}
            </div>

            {account.role !== 'car' && (
              <button type="button" className={styles.addCar} onClick={() => router.push('/onboard')}>
                <b>Înscrie și o mașină</b>
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
              DECONECTARE
            </button>
          </>
        )}

        {mode === 'register' && (
          <>
            <div className={`${styles.fieldLabel} ${styles.roleHead}`}>SUNT AICI CA SĂ</div>
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
                  NUME
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
                PAROLĂ
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
                ? 'AI DEJA CONT? CONECTEAZĂ-TE →'
                : 'EȘTI NOU? CREEAZĂ-ȚI CONT →'}
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
