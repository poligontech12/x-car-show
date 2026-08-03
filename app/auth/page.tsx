'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { byId, displayModel } from '@/lib/cars';
import { useStore, type Role } from '@/lib/store';
import styles from './auth.module.css';

type Mode = 'register' | 'signin' | 'account';

const COPY: Record<Mode, { label: string; title: string; sub: string; cta: string }> = {
  signin: {
    label: 'Conectare',
    title: 'Bine ai revenit.',
    sub: 'Votul tău, mașinile tale și toți cei pe care îi urmărești.',
    cta: 'Conectare',
  },
  register: {
    label: 'Cont nou',
    title: 'Intră în show.',
    sub: 'Două minute. Fără cotizație, fără politică de club.',
    cta: 'Creează contul',
  },
  account: {
    label: 'Cont',
    title: 'Ești înăuntru.',
    sub: 'Conectat pe telefonul ăsta.',
    cta: '',
  },
};

const ROLES: { key: Role; title: string; sub: string }[] = [
  {
    key: 'car',
    title: 'Expun o mașină',
    sub: 'Îți înscrii proiectul, primești un stand și un cartonaș de parbriz tipărit. Votul e inclus.',
  },
  {
    key: 'vote',
    title: 'Votez și urmăresc',
    sub: 'Un vot pentru mașina show-ului, plus fiecare proiect din listă.',
  },
];

function AuthScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { account, hydrated, vote, signIn, register, signOut, updateAccount } = useStore();

  const [authMode, setAuthMode] = useState<'register' | 'signin'>(
    params.get('mode') === 'signin' ? 'signin' : 'register',
  );
  const [role, setRole] = useState<Role>(params.get('role') === 'vote' ? 'vote' : 'car');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Signing out from the account screen should land you back in the feed,
  // not on a form you did not ask for.
  const [justSignedOut, setJustSignedOut] = useState(false);
  useEffect(() => {
    if (justSignedOut) router.push('/');
  }, [justSignedOut, router]);

  const mode: Mode = account ? 'account' : authMode;
  const copy = COPY[mode];
  const isForm = mode !== 'account';

  const submit = async () => {
    if (busy) return;
    const address = email.trim();
    if (!address) return setError('Scrie-ți e-mailul.');
    if (password.length < 8) return setError('Parola are minim 8 caractere.');

    setBusy(true);
    setError(null);
    const failed =
      authMode === 'signin'
        ? await signIn(address, password)
        : await register(address, password, name, role);
    setBusy(false);

    if (failed) return setError(failed);
    if (authMode === 'signin') return router.push('/');
    // Entrants go straight into registering the car they came here for;
    // voters go to the thing they came here to do.
    router.push(role === 'car' ? '/onboard' : '/award');
  };

  // Hold the frame until we know whether there is an account, so the
  // form does not flash in front of someone who is already signed in.
  if (!hydrated) return <div className={styles.screen} />;

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Închide"
            onClick={() => router.back()}
          >
            ×
          </button>
          <div className={styles.label}>{copy.label}</div>
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={`${styles.title} a-up delay-200`}>{copy.title}</h1>
        <p className={`${styles.sub} a-up delay-300`}>{copy.sub}</p>

        {mode === 'account' && account && (
          <>
            <div className={styles.rows}>
              {[
                ['Email', account.email],
                ['Vot', vote ? displayModel(byId(vote)) : 'Nevotat'],
              ].map(([k, v]) => (
                <div key={k} className={styles.row}>
                  <div className={styles.rowKey}>{k}</div>
                  <div className={styles.rowValue}>{v}</div>
                </div>
              ))}
            </div>

            {/* Everything below is what other people see on your cars and
                on your profile, so it is edited here and nowhere else. */}
            <div className={`${styles.fieldLabel} ${styles.roleHead}`}>Profilul public</div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="acc-name">
                Nume
              </label>
              <input
                id="acc-name"
                className={styles.input}
                value={account.name}
                placeholder="Andrei M."
                onChange={(e) => updateAccount({ name: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="acc-handle">
                Nume de utilizator
              </label>
              <input
                id="acc-handle"
                className={styles.input}
                value={account.handle ?? ''}
                readOnly
                aria-describedby="acc-handle-note"
              />
              <p id="acc-handle-note" className={styles.fieldNote}>
                Ți l-am ales la înscriere. Ajunge pe cartonașul tipărit, așa că rămâne
                așa.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="acc-town">
                Localitate
              </label>
              <input
                id="acc-town"
                className={styles.input}
                value={account.town ?? ''}
                placeholder="Suceava"
                onChange={(e) => updateAccount({ town: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="acc-ig">
                Instagram
              </label>
              <input
                id="acc-ig"
                className={styles.input}
                value={account.instagram ?? ''}
                placeholder="@andrei.s14"
                onChange={(e) => updateAccount({ instagram: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="acc-fb">
                Facebook
              </label>
              <input
                id="acc-fb"
                className={styles.input}
                value={account.facebook ?? ''}
                placeholder="andrei.morosanu"
                onChange={(e) => updateAccount({ facebook: e.target.value })}
              />
            </div>

            {account.handle && (
              <Link href={`/owner/${account.handle}`} className={`btn btn--glass ${styles.viewPublic}`}>
                Vezi cum arată profilul tău
              </Link>
            )}

            <button type="button" className={styles.addCar} onClick={() => router.push('/garage')}>
              <b>Garajul meu</b>
              <em>→</em>
            </button>

            <button
              type="button"
              className={`btn btn--quiet ${styles.signOut}`}
              onClick={() => {
                void signOut();
                setAuthMode('signin');
                setJustSignedOut(true);
              }}
            >
              Deconectare
            </button>
          </>
        )}

        {mode === 'register' && (
          <>
            <div className={`${styles.fieldLabel} ${styles.roleHead}`}>Sunt aici ca să</div>
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`${styles.role} ${role === r.key ? styles.roleOn : ''}`}
            data-spot
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
                  Nume
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
                Email
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

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="password">
                Parolă
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void submit()}
              />
            </div>

            <button
              type="button"
              className={styles.switch}
              onClick={() => setAuthMode(authMode === 'register' ? 'signin' : 'register')}
            >
              {authMode === 'register'
                ? 'Ai deja cont? Conectează-te →'
                : 'Ești nou? Creează-ți cont →'}
            </button>
          </>
        )}

        <div className={styles.tail} />
      </div>

      {isForm && (
        <div className={styles.footer}>
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy}
            onClick={() => void submit()}
          >
            {busy ? 'O secundă…' : copy.cta}
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
