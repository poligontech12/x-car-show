'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteCarPhoto, saveCarPhoto } from '@/lib/actions';
import { prepareCarPhoto } from '@/lib/photo-file';
import { ImageSlot } from './ImageSlot';

interface Props {
  carId: string;
  /** Which of the car's six slots this is. 0 leads everywhere. */
  position: number;
  src: string | null;
  hint?: string;
  mode?: 'fill' | 'inline';
  /** Only the person who registered the car may change its photographs. */
  canEdit?: boolean;
  className?: string;
}

/**
 * A photo well bound to a car's slot. The picture is downscaled on the
 * phone, posted to the server, and then re-read from it — so what you
 * see after an upload is what every other visitor will see, rather than
 * a copy that only exists in this browser.
 */
export function CarPhotoSlot({
  carId,
  position,
  src,
  hint,
  mode,
  canEdit = false,
  className,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const result = await saveCarPhoto(carId, position, await prepareCarPhoto(file));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message.includes('mare')
          ? cause.message
          : 'Nu am putut pregăti fotografia. Alege un JPEG, PNG sau WebP.',
      );
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await deleteCarPhoto(carId, position);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError('Nu am putut șterge fotografia. Încearcă din nou.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ImageSlot
      src={src}
      hint={hint}
      mode={mode}
      readOnly={!canEdit}
      busy={busy}
      error={error}
      onFile={(file) => void upload(file)}
      onClear={() => void clear()}
      className={className}
    />
  );
}
