'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { displayModel } from '@/lib/cars';
import { useStore } from '@/lib/store';
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

function AuthScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { account, hydrated, votes, cars, signIn, register, signOut, updateAccount } = useStore();

  const [authMode, setAuthMode] = useState<'register' | 'signin'>(
    params.get('mode') === 'signin' ? 'signin' : 'register',
  );
  const headedForOnboarding = params.get('role') === 'car';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  /**
   * The message appears in the footer, which on a phone sits behind the
   * keyboard — so a rejected form reads as nothing happening at all.
   * Dropping focus closes the keyboard; scrolling finishes the job.
   */
  const fail = (message: string) => {
    setError(message);
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [error]);

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
    if (!address) return fail('Scrie-ți e-mailul.');
    if (password.length < 8) return fail('Parola are minim 8 caractere.');

    setBusy(true);
    setError(null);
    const failed =
      authMode === 'signin'
        ? await signIn(address, password)
        : await register(address, password, name);
    setBusy(false);

    if (failed) return fail(failed);
    if (authMode === 'signin') return router.push('/');
    // Somebody who tapped "register a car" carries on to doing that;
    // everybody else lands on the thing they came to look at.
    router.push(headedForOnboarding ? '/onboard' : '/roster');
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
                [
                  'Voturi',
                  votes.length
                    ? votes
                        .map((id) => cars.find((c) => c.id === id))
                        .filter(Boolean)
                        .map((c) => displayModel(c!))
                        .join(', ')
                    : 'Niciunul încă',
                ],
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
              {authMode === 'register' && (
                <p className={styles.fieldNote}>Minim 8 caractere.</p>
              )}
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
          {error && (
            <p className={styles.error} ref={errorRef} role="alert">
              {error}
            </p>
          )}
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
