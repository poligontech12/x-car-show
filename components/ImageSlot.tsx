'use client';

import { useCallback, useRef, useState } from 'react';
import styles from './ImageSlot.module.css';

interface Props {
  /** The photograph, or null for an empty well. */
  src: string | null;
  /** Empty-state caption — say what photo belongs here, not "drop an image". */
  hint?: string;
  /**
   * `fill` — the whole slot browses on tap.
   * `inline` — the slot is passive and a corner control browses, for photos
   * that are also links. Tapping the photo then opens the car, as it should.
   */
  mode?: 'fill' | 'inline';
  /**
   * A photograph belongs to whoever registered the car. Everyone else
   * sees it, and sees an empty well where there is none, but is offered
   * nothing to tap — the server would refuse them anyway, and a control
   * that always fails is worse than no control.
   */
  readOnly?: boolean;
  busy?: boolean;
  error?: string | null;
  onFile?: (file: File) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * A photo well. Drag a picture onto it, or tap to browse — the shell is
 * the same whether the picture is being uploaded, already stored, or
 * simply being looked at by a visitor. Where the bytes go is the
 * caller's business; this only shows the well and reports the file.
 */
export function ImageSlot({
  src,
  hint = 'Pune o poză',
  mode = 'fill',
  readOnly = false,
  busy = false,
  error = null,
  onFile,
  onClear,
  className,
}: Props) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  /** Nested dragenter/dragleave pairs fire constantly; count them instead. */
  const depth = useRef(0);

  const accept = useCallback(
    (file: File | undefined | null) => {
      if (!file || readOnly) return;
      onFile?.(file);
    },
    [onFile, readOnly],
  );

  const browse = () => input.current?.click();
  const editable = !readOnly && !busy;
  const fill = mode === 'fill';
  const tappable = fill && editable;

  return (
    <div
      className={[styles.slot, over ? styles.over : '', tappable ? styles.tappable : '', className]
        .filter(Boolean)
        .join(' ')}
      {...(tappable
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
      {...(editable
        ? {
            onDragEnter: (e: React.DragEvent) => {
              e.preventDefault();
              depth.current += 1;
              setOver(true);
            },
            onDragOver: (e: React.DragEvent) => e.preventDefault(),
            onDragLeave: () => {
              depth.current -= 1;
              if (depth.current <= 0) {
                depth.current = 0;
                setOver(false);
              }
            },
            onDrop: (e: React.DragEvent) => {
              e.preventDefault();
              e.stopPropagation();
              depth.current = 0;
              setOver(false);
              accept(e.dataTransfer.files?.[0]);
            },
          }
        : {})}
    >
      {src ? (
        /**
         * Fetched when it is nearly on screen, not when the page is.
         *
         * The roster is a hundred cars, each with a photograph averaging
         * around a hundred kilobytes, and every one of them used to be
         * asked for the moment the page opened — megabytes to show the
         * four you can actually see. The showground has one saturated
         * tower and a hundred and forty people on it. `lazy` defers only
         * what is off screen, so the pictures under your thumb still
         * arrive first.
         */
        <img
          className={styles.img}
          src={src}
          alt={hint}
          draggable={false}
          loading="lazy"
          decoding="async"
        />
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
          {tappable && <div className={styles.sub}>TRAGE O POZĂ SAU ATINGE</div>}
        </div>
      )}

      {/* The dashed ring says "this is yours to fill", which is nothing a
          photograph needs said over it. */}
      {!src && <div className={styles.ring} />}

      {busy && <div className={styles.busy}>SE ÎNCARCĂ</div>}

      {/* One control, top-right: browse while empty, clear once filled. */}
      {editable && (src || !fill) && (
        <button
          type="button"
          className={`${styles.corner} ${src ? '' : styles.cornerAlways}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (src) onClear?.();
            else browse();
          }}
        >
          {src ? 'ȘTERGE' : '+ POZĂ'}
        </button>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!readOnly && (
        <input
          ref={input}
          className={styles.file}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      )}
    </div>
  );
}
