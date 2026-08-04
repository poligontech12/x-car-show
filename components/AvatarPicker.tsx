'use client';

import { useRef, useState } from 'react';
import { deleteAvatar, saveAvatar } from '@/lib/actions';
import { prepareCarPhoto } from '@/lib/photo-file';
import { useRouter } from 'next/navigation';
import { Avatar } from './Avatar';
import styles from './AvatarPicker.module.css';

/**
 * Your own photograph, on the one screen that is about you. It is cropped
 * square on the server, so there is nothing to frame here — pick a photo
 * and it is your face everywhere your name is printed.
 */
export function AvatarPicker({ src, name }: { src?: string | null; name: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (work: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    setBusy(true);
    try {
      const result = await work();
      if (!result.ok) {
        setError(result.error ?? 'Nu am putut salva fotografia.');
        return;
      }
      router.refresh();
    } catch {
      setError('Nu am putut salva fotografia. Încearcă din nou.');
    } finally {
      setBusy(false);
    }
  };

  const choose = async (file: File | null | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    let dataUrl: string;
    try {
      dataUrl = await prepareCarPhoto(file);
    } catch {
      setBusy(false);
      setError('Nu am putut pregăti fotografia. Alege un JPEG, PNG sau WebP.');
      return;
    }
    setBusy(false);
    await run(() => saveAvatar(dataUrl));
  };

  return (
    <div className={styles.row}>
      <div className={styles.well}>
        <Avatar src={src} name={name} />
        {busy && <div className={styles.busy}>…</div>}
      </div>

      <div className={styles.actions}>
        <p className={styles.note}>
          {src ? 'Poza ta, așa cum te vede lumea.' : 'Adaugă o poză — apare lângă numele tău.'}
        </p>
        <div className={styles.buttons}>
          <button
            type="button"
            className="chip"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {src ? 'Schimbă poza' : 'Adaugă o poză'}
          </button>
          {src && (
            <button
              type="button"
              className={styles.remove}
              disabled={busy}
              onClick={() => void run(() => deleteAvatar())}
            >
              Șterge
            </button>
          )}
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>

      <input
        ref={input}
        className={styles.file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => {
          void choose(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
