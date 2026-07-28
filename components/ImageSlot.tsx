'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clearSlot, fileToDataUrl, readSlot, subscribeSlot, writeSlot } from '@/lib/slots';
import styles from './ImageSlot.module.css';

interface Props {
  /** Persistence key. Every slot on a page needs a distinct one. */
  id: string;
  /** Empty-state caption — say what photo belongs here, not "drop an image". */
  hint?: string;
  /**
   * `fill` — the whole slot browses on tap.
   * `inline` — the slot is passive and a corner control browses, for photos
   * that are also links. Tapping the photo then opens the car, as it should.
   */
  mode?: 'fill' | 'inline';
  className?: string;
}

/**
 * A user-fillable image area. Drag a photo onto it, or tap to browse.
 * The photo persists across reloads; there is no upload, nothing leaves
 * the phone.
 */
export function ImageSlot({ id, hint = 'Pune o poză', mode = 'fill', className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  /** Nested dragenter/dragleave pairs fire constantly; count them instead. */
  const depth = useRef(0);

  useEffect(() => {
    setSrc(readSlot(id));
    return subscribeSlot(id, setSrc);
  }, [id]);

  const accept = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      setBusy(true);
      try {
        writeSlot(id, await fileToDataUrl(file));
      } catch {
        // Not an image, or the browser could not decode it. Leave the
        // slot as it was rather than showing a broken tile.
      } finally {
        setBusy(false);
      }
    },
    [id],
  );

  const browse = () => input.current?.click();
  const fill = mode === 'fill';

  return (
    <div
      className={[
        styles.slot,
        over ? styles.over : '',
        fill ? styles.tappable : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(fill
        ? {
            role: 'button' as const,
            tabIndex: 0,
            'aria-label': src ? `Înlocuiește poza: ${hint}` : `Adaugă o poză: ${hint}`,
            onClick: browse,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                browse();
              }
            },
          }
        : {})}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current -= 1;
        if (depth.current <= 0) {
          depth.current = 0;
          setOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        depth.current = 0;
        setOver(false);
        void accept(e.dataTransfer.files?.[0]);
      }}
    >
      {src ? (
        <img className={styles.img} src={src} alt={hint} draggable={false} />
      ) : (
        <div className={styles.empty}>
          <svg
            className={styles.icon}
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            aria-hidden="true"
          >
            <rect x="0.75" y="0.75" width="20.5" height="16.5" stroke="currentColor" />
            <path d="M1 13l5.5-5.5L11 12l3.5-3.5L21 15" stroke="currentColor" />
            <circle cx="15.5" cy="5" r="1.75" stroke="currentColor" />
          </svg>
          <div className={styles.cap}>{hint}</div>
          {fill && <div className={styles.sub}>TRAGE O POZĂ SAU ATINGE</div>}
        </div>
      )}

      <div className={styles.ring} />

      {busy && <div className={styles.busy}>SE PROCESEAZĂ</div>}

      {/* One control, top-right: browse while empty, clear once filled. */}
      {!busy && (src || !fill) && (
        <button
          type="button"
          className={`${styles.corner} ${src ? '' : styles.cornerAlways}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (src) clearSlot(id);
            else browse();
          }}
        >
          {src ? 'ȘTERGE' : '+ POZĂ'}
        </button>
      )}

      <input
        ref={input}
        className={styles.file}
        type="file"
        accept="image/*"
        onChange={(e) => {
          void accept(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
