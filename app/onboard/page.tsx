'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DigitDial } from '@/components/DigitDial';
import { EntryCard } from '@/components/EntryCard';
import { ImageSlot } from '@/components/ImageSlot';
import { QrCodeClient } from '@/components/QrCodeClient';
import { saveCarPhoto } from '@/lib/actions';
import { BLANK_CAR, carUrl, headline, type Car } from '@/lib/cars';
import { prepareCarPhoto } from '@/lib/photo-file';
import { CAR_PHOTO_HINTS, CAR_PHOTO_LIMIT } from '@/lib/photos';
import { errorMessage, useStore, type Drive } from '@/lib/store';
import { useCar } from '@/lib/useCars';
import styles from './onboard.module.css';

const STEPS = [
  ['Ce mașină e?', 'Marca și modelul. Dacă nu e în listă, scrie-o oricum — lista doar ajută.'],
  ['Câți cai are?', 'Aproximativ e în regulă. Nu verifică nimeni fișa de dyno.'],
  [
    'Pozele.',
    'Una principală și încă cinci, dacă le ai. Lasă goale câte vrei — le poți adăuga oricând pe pagina mașinii.',
  ],
  ['Descriere', 'Ce ar trebui să știe lumea despre mașină.'],
  ['Ești înscris.', 'Ăsta e cartonașul tău. Arată-l lumii.'],
] as const;

const NEXT_LABELS = ['Continuă', 'Continuă', 'Arată bine', 'Gata', 'Vezi înscrișii'];

/** Suggestions, not options. Anything can be typed over them. */
const MAKES = [
  'Nissan',
  'Toyota',
  'BMW',
  'Volkswagen',
  'Dacia',
  'Honda',
  'Ford',
  'Audi',
  'Mitsubishi',
  'Mercedes',
  'Opel',
  'Renault',
  'Subaru',
  'Mazda',
  'ARO',
];

const DRIVES: Drive[] = ['FWD', 'RWD', 'AWD'];
const STORY_LIMIT = 400;

/** Four dials — no ceiling worth imposing on a horsepower figure. */
const DIALS = [1000, 100, 10, 1] as const;

/**
 * Getting the entry off this screen and onto somebody's feed.
 *
 * The phone's own share sheet is the whole point — it is what reaches
 * Instagram, WhatsApp and the group chat without us integrating with any
 * of them. A desktop browser without a sheet gets the link on the
 * clipboard instead, which is the same job done by hand.
 */
function ShareEntry({ url, title }: { url: string; title: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: `${title} · X Car Show`, url });
        return;
      } catch (e) {
        // Cancelling the sheet is a decision, not a failure — only a
        // sheet that could not open falls through to the clipboard.
        if (e instanceof Error && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 2400);
    } catch {
      // No sheet, and a browser that will not hand over the clipboard.
      // Put the link on screen rather than leave a button that does
      // nothing when you press it.
      setState('manual');
    }
  };

  return (
    <div className={styles.shareRow}>
      <button type="button" className="btn btn--glass" onClick={() => void share()}>
        {state === 'copied' ? 'Link copiat' : 'Trimite mai departe'}
      </button>

      {state === 'manual' && (
        <input
          className={styles.shareLink}
          readOnly
          value={url}
          aria-label="Linkul mașinii"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}

      <span className={styles.shareNote}>
        Fă-i o poză cartonașului și pune-l pe Instagram — codul duce la pagina mașinii.
      </span>
    </div>
  );
}

export default function OnboardScreen() {
  const router = useRouter();
  const { account, onboarding, patchOnboarding, resetOnboarding, completeOnboarding, addCar } =
    useStore();

  const [step, setStep] = useState(0);
  const [story, setStory] = useState('');

  /**
   * The entry, once it exists. Registration happens on the way *into* the
   * last step rather than on the way out of it, because that step now
   * shows the entrant their card — and a card needs a real entry behind
   * it: an id to build the code from, and a page for the code to open.
   *
   * Held here as well as read from the store so the card paints on the
   * frame the step appears, instead of waiting for the refresh.
   */
  const [entry, setEntry] = useState<Car | null>(null);
  const stored = useCar(entry?.id ?? '');
  const card = stored ?? entry;

  /**
   * The photographs wait here until the car has an id. They used to be
   * written under fixed keys — `ob-hero` and friends — that no car page
   * ever read, so three photos were picked at registration and three
   * photos were lost. Held in this component, they go to the server the
   * moment there is a car to attach them to.
   */
  const [photos, setPhotos] = useState<(string | null)[]>(() =>
    Array<string | null>(CAR_PHOTO_LIMIT).fill(null),
  );
  const [preparing, setPreparing] = useState<number | null>(null);
  /** Reported on the well it happened in, not somewhere else on the step. */
  const [photoError, setPhotoError] = useState<{ slot: number; message: string } | null>(null);

  const setPhoto = (slot: number, dataUrl: string | null) =>
    setPhotos((current) => current.map((v, i) => (i === slot ? dataUrl : v)));

  const holdPhoto = async (slot: number, file: File) => {
    setPhotoError(null);
    setPreparing(slot);
    try {
      setPhoto(slot, await prepareCarPhoto(file));
    } catch (cause) {
      setPhotoError({
        slot,
        message:
          cause instanceof Error && cause.message.includes('mare')
            ? cause.message
            : 'Nu am putut pregăti fotografia. Alege un JPEG, PNG sau WebP.',
      });
    } finally {
      setPreparing(null);
    }
  };

  const [title, sub] = STEPS[Math.min(step, 4)];
  const done = step >= 4;

  // Only offer what the typing so far could still become.
  const suggestions = useMemo(() => {
    const typed = onboarding.name.trim().toLowerCase();
    if (!typed) return MAKES;
    const first = typed.split(/\s+/)[0];
    return MAKES.filter((m) => m.toLowerCase().startsWith(first) && m.toLowerCase() !== typed);
  }, [onboarding.name]);

  const digitAt = (place: number) => Math.floor(onboarding.power / place) % 10;
  const setDigit = (place: number, digit: number) =>
    patchOnboarding({ power: onboarding.power - digitAt(place) * place + digit * place });

  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const next = async () => {
    if (done) {
      router.push(card ? `/car/${card.id}` : '/roster');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Registering, once. Anything that could run this a second time —
    // a double tap, a trip back through step 3 while the first write is
    // still in flight — has to land on the entry that already exists
    // rather than make another one.
    if (saving) return;
    if (entry) {
      setStep(4);
      return;
    }

    setSaving(true);
    setFailed(null);
    // The draft carries what the four steps could ask for without
    // becoming a chore; everything else is filled in on the car itself.
    const [make, ...rest] = onboarding.name.trim().split(/\s+/);
    const draft = {
      ...BLANK_CAR,
      make: make ?? '',
      model: rest.join(' ') || (make ?? 'Mașina mea'),
      year: Number(onboarding.year) || 0,
      power: onboarding.power ? String(onboarding.power) : '',
      drive: onboarding.drive,
      story,
    };

    let id: string;
    try {
      id = await addCar(draft);
    } catch (e) {
      setSaving(false);
      setFailed(errorMessage(e));
      return;
    }

    /**
     * Past this line the car exists, so nothing here may send anyone back
     * to the button that registered it — they would end up with two
     * entries. The draft is cleared now rather than on the way out, so
     * abandoning the last step cannot leave a filled form behind that
     * registers the same car again tomorrow.
     */
    setEntry({
      ...draft,
      id,
      owner: account?.name ?? '',
      town: account?.town ?? '',
      handle: account?.handle ?? '',
    });
    completeOnboarding();
    resetOnboarding();
    setStep(4);

    // A photo that will not upload is left to the car page, where the
    // empty well is both the report and the retry.
    await Promise.allSettled(
      photos.flatMap((dataUrl, slot) => (dataUrl ? [saveCarPhoto(id, slot, dataUrl)] : [])),
    );
    router.refresh();
    setSaving(false);
  };

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
          <div className={styles.label}>Înscrie o mașină</div>
          <div className={styles.stepLabel}>{done ? 'Gata' : `Pasul ${step + 1}/4`}</div>
        </div>
        <div className={styles.progress} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} data-done={i <= step} />
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={`${styles.title} a-up delay-100`}>{title}</h1>
        <p className={`${styles.sub} a-up delay-200`}>{sub}</p>

        {step === 0 && (
          <>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="car-name">
                Mașina
              </label>
              <input
                id="car-name"
                className={styles.input}
                type="text"
                placeholder="Nissan Silvia S14"
                autoComplete="off"
                value={onboarding.name}
                onChange={(e) => patchOnboarding({ name: e.target.value })}
              />
            </div>

            {suggestions.length > 0 && (
              <div className={styles.suggestions} role="group" aria-label="Sugestii de marcă">
                {suggestions.slice(0, 8).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="chip"
                    onClick={() => patchOnboarding({ name: `${m} ` })}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="car-year">
                An
              </label>
              <input
                id="car-year"
                className={styles.input}
                type="text"
                inputMode="numeric"
                placeholder="1998"
                maxLength={4}
                autoComplete="off"
                value={onboarding.year}
                onChange={(e) =>
                  patchOnboarding({ year: e.target.value.replace(/\D/g, '').slice(0, 4) })
                }
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className={`${styles.fieldLabel} ${styles.spaced}`}>Putere la roți</div>
            <div className={styles.dials}>
              {DIALS.map((place) => (
                <DigitDial
                  key={place}
                  label={place === 1 ? 'CP' : `×${place}`}
                  value={digitAt(place)}
                  onChange={(d) => setDigit(place, d)}
                />
              ))}
            </div>

            <div className={`${styles.fieldLabel} ${styles.spaced}`}>Tracțiune</div>
            <div className={styles.driveRow} role="group" aria-label="Tracțiune">
              {DRIVES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={styles.drive}
                  aria-pressed={onboarding.drive === d}
                  onClick={() => patchOnboarding({ drive: d })}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.heroSlot}>
              <ImageSlot
                src={photos[0]}
                hint={CAR_PHOTO_HINTS[0]}
                busy={preparing === 0}
                error={photoError?.slot === 0 ? photoError.message : null}
                onFile={(file) => void holdPhoto(0, file)}
                onClear={() => setPhoto(0, null)}
              />
            </div>
            <div className={styles.pair}>
              {Array.from({ length: CAR_PHOTO_LIMIT - 1 }, (_, i) => i + 1).map((slot) => (
                <div key={slot} className={styles.pairSlot}>
                  <ImageSlot
                    src={photos[slot]}
                    hint={CAR_PHOTO_HINTS[slot]}
                    busy={preparing === slot}
                    error={photoError?.slot === slot ? photoError.message : null}
                    onFile={(file) => void holdPhoto(slot, file)}
                    onClear={() => setPhoto(slot, null)}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <textarea
              className={styles.story}
              maxLength={STORY_LIMIT}
              placeholder="Unde ai găsit-o, ce s-a stricat, cine te-a ajutat, de ce ai păstrat-o."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
            <div
              className={`${styles.counter} ${
                story.length === STORY_LIMIT ? styles.counterFull : ''
              }`}
            >
              {story.length} / {STORY_LIMIT}
            </div>
          </>
        )}

        {done && card && (
          <>
            {/* The card itself, not a preview of one — the same component
                the print sheet renders. The number and the stand stay
                empty: a marshal assigns those at the gate, and inventing
                one here would be a promise the app cannot keep. */}
            <div className={styles.cardFrame}>
              <EntryCard
                car={card}
                qr={
                  <QrCodeClient
                    value={carUrl(card)}
                    size="100%"
                    dark="#0B0B0C"
                    light="#F4F3EF"
                  />
                }
              />
            </div>

            <ShareEntry url={carUrl(card)} title={headline(card)} />

            <p className={styles.doneNote}>
              Tipărim cartonașul ăsta și ți-l dăm la poartă, cu numărul și standul completate.
              Lumea îl scanează, ți se deschide pagina, și tu continui să vorbești în loc să
              repeți lista de specificații de patruzeci de ori.
            </p>
          </>
        )}

        <div className={styles.tail} />
      </div>

      <div className={styles.footer}>
        {step > 0 && step < 4 && (
          <button
            type="button"
            className={`btn btn--glass ${styles.back}`}
            onClick={() => setStep(step - 1)}
          >
            Înapoi
          </button>
        )}
        {failed && <p className={styles.failed}>{failed}</p>}
        <button
          type="button"
          className="btn btn--primary"
          disabled={saving}
          onClick={() => void next()}
        >
          {NEXT_LABELS[Math.min(step, 4)]}
        </button>
      </div>
    </div>
  );
}
