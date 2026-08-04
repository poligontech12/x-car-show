'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createSpottedPost } from '@/lib/actions';
import type { SpottedPost } from '@/lib/db/queries';
import { MAX_UPLOAD_DATA_URL, fileToDataUrl } from '@/lib/photo-file';
import { useStore } from '@/lib/store';
import styles from './feed.module.css';

function postedAt(value: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Bucharest',
  })
    .format(new Date(value))
    .replace(',', ' ·')
    .toUpperCase();
}

export function SpottedFeed({ posts }: { posts: SpottedPost[] }) {
  const router = useRouter();
  const { signedIn } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [composing, setComposing] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setImageDataUrl('');
    setLocation('');
    setCaption('');
    setError('');
    setBusy(false);
    setComposing(false);
  };

  const choosePhoto = async (file: File | null | undefined) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file, {
        maxEdge: 1200,
        quality: 0.72,
        allowOriginalFallback: false,
      });
      if (dataUrl.length > MAX_UPLOAD_DATA_URL) throw new Error('Fotografia este prea mare.');
      setImageDataUrl(dataUrl);
    } catch (cause) {
      setError(cause instanceof Error && cause.message.includes('mare')
        ? cause.message
        : 'Nu am putut pregăti fotografia. Alege un JPEG, PNG sau WebP.');
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!imageDataUrl || busy) {
      setError('Adaugă fotografia pe care ai surprins-o.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const result = await createSpottedPost({ imageDataUrl, location, caption });
      if (!result.ok) {
        setError(result.error ?? 'Nu am putut publica. Mai încearcă.');
        setBusy(false);
        return;
      }
      reset();
      router.refresh();
    } catch {
      setError('Nu am putut publica. Mai încearcă.');
      setBusy(false);
    }
  };

  return (
    <div className={styles.screen}>
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>DIN STRADĂ, ÎN COMUNITATE</span>
          <h1>Spotted</h1>
        </div>
        {signedIn ? (
          <button
            type="button"
            className={styles.add}
            aria-expanded={composing}
            disabled={busy}
            onClick={() => setComposing((open) => !open)}
          >
            <span aria-hidden="true">＋</span> SPOTTED
          </button>
        ) : (
          <Link href="/auth?next=/" className={styles.add}>
            <span aria-hidden="true">＋</span> SPOTTED
          </Link>
        )}
      </header>

      {composing && (
        <form
          className={styles.composer}
          aria-label="Adaugă o mașină văzută"
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault();
            void publish();
          }}
        >
          <button
            type="button"
            className={`${styles.photoPicker} ${imageDataUrl ? styles.photoPickerReady : ''}`}
            disabled={busy}
            aria-describedby={error ? 'spotted-error' : undefined}
            onClick={() => input.current?.click()}
          >
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Previzualizarea fotografiei" />
            ) : (
              <span>
                <b>Adaugă fotografia</b>
                <small>CAMERĂ SAU GALERIE</small>
              </span>
            )}
          </button>
          <input
            ref={input}
            className={styles.file}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              void choosePhoto(event.target.files?.[0]);
              event.target.value = '';
            }}
          />

          <label className={styles.field}>
            <span>Unde ai văzut-o?</span>
            <input
              value={location}
              maxLength={80}
              disabled={busy}
              placeholder="ex. DN2, Pătrăuți"
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Ce ți-a atras atenția?</span>
            <textarea
              value={caption}
              maxLength={280}
              rows={3}
              disabled={busy}
              placeholder="Câteva cuvinte despre mașină…"
              onChange={(event) => setCaption(event.target.value)}
            />
          </label>

          <div className={styles.composeActions}>
            <button type="button" className={styles.cancel} disabled={busy} onClick={reset}>
              Renunță
            </button>
            <button type="submit" className={styles.publish} disabled={busy}>
              {busy ? 'Se publică…' : 'Publică'}
            </button>
          </div>
          {error && <p id="spotted-error" className={styles.error} role="alert">{error}</p>}
        </form>
      )}

      <main className={styles.posts} aria-live="polite">
        {posts.length ? (
          posts.map((post) => (
            <article key={post.id} className={styles.post} data-spot>
              <div className={styles.postPhoto}>
                <img src={post.imageUrl} alt={post.caption || `Mașină văzută de ${post.author}`} />
                <span className="photo-veil" />
                <div className={styles.postMeta}>
                  <div className={styles.avatar}>{post.author.trim().charAt(0).toUpperCase()}</div>
                  <div className={styles.postByline}>
                    <b>{post.author}</b>
                    <span>{post.location ? `SPOTTED · ${post.location}` : 'SPOTTED'}</span>
                  </div>
                  <time dateTime={post.createdAt}>{postedAt(post.createdAt)}</time>
                </div>
              </div>
              {post.caption && <p className={styles.caption}>{post.caption}</p>}
            </article>
          ))
        ) : (
          <section className={styles.empty}>
            <span aria-hidden="true">◎</span>
            <h2>Prima apariție e încă pe drum.</h2>
            <p>Vezi o mașină care merită cunoscută? Fotografiază și pune-o aici.</p>
          </section>
        )}
      </main>
    </div>
  );
}
