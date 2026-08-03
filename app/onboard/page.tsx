'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DigitDial } from '@/components/DigitDial';
import { ImageSlot } from '@/components/ImageSlot';
import { QrCodeClient } from '@/components/QrCodeClient';
import { EVENT } from '@/lib/event';
import { BLANK_CAR, SITE_ORIGIN } from '@/lib/cars';
import { errorMessage, useStore, type Drive } from '@/lib/store';
import styles from './onboard.module.css';

const STEPS = [
  ['Ce mașină e?', 'Marca și modelul. Dacă nu e în listă, scrie-o oricum — lista doar ajută.'],
  ['Câți cai are?', 'Aproximativ e în regulă. Nu verifică nimeni fișa de dyno.'],
  ['Trei poze.', 'Una principală, două detalii. Poți adăuga mai multe mai târziu.'],
  ['Descriere', 'Ce ar trebui să știe lumea despre mașină.'],
  ['Ești înscris.', 'Cartonaș pregătit. Ne vedem pe 8 august.'],
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

export default function OnboardScreen() {
  const router = useRouter();
  const { onboarding, patchOnboarding, resetOnboarding, completeOnboarding, addCar } = useStore();

  const [step, setStep] = useState(0);
  const [story, setStory] = useState('');

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
      if (saving) return;
      setSaving(true);
      // The draft carries what the four steps could ask for without
      // becoming a chore; everything else is filled in on the car itself.
      const [make, ...rest] = onboarding.name.trim().split(/\s+/);
      try {
      const id = await addCar({
        ...BLANK_CAR,
        make: make ?? '',
        model: rest.join(' ') || (make ?? 'Mașina mea'),
        year: Number(onboarding.year) || 0,
        power: onboarding.power ? String(onboarding.power) : '',
        drive: onboarding.drive,
      });
      resetOnboarding();
      router.push(`/car/${id}`);
      } catch (e) {
        setSaving(false);
        setFailed(errorMessage(e));
      }
      return;
    }
    if (step === 3) completeOnboarding();
    setStep(step + 1);
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
              <ImageSlot id="ob-hero" hint="Poza principală — 3/4 față" />
            </div>
            <div className={styles.pair}>
              <div className={styles.pairSlot}>
                <ImageSlot id="ob-2" hint="Compartiment motor" />
              </div>
              <div className={styles.pairSlot}>
                <ImageSlot id="ob-3" hint="Interior / detaliu" />
              </div>
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

        {done && (
          <>
            {/* The stand is assigned at the gate, not here — the card
                carries the car and the code that opens it, nothing we
                would have to invent. */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <b>{EVENT.edition}</b>
                <span>{EVENT.place}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardQr}>
                  <QrCodeClient value={SITE_ORIGIN} size={92} />
                </div>
                <div className={styles.cardDetails}>
                  <div className={styles.cardName}>{onboarding.name.trim() || 'Mașina ta'}</div>
                  <div className={styles.cardLine}>
                    {[
                      onboarding.year,
                      onboarding.power ? `${onboarding.power} CP` : null,
                      onboarding.drive,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              </div>
            </div>
            <p className={styles.doneNote}>
              Tipărim cartonașul ăsta și ți-l dăm la poartă. Lumea îl scanează, ți se deschide
              pagina, și tu continui să vorbești în loc să repeți lista de specificații de
              patruzeci de ori.
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
