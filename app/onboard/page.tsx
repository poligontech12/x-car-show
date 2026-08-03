'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageSlot } from '@/components/ImageSlot';
import { QrCodeClient } from '@/components/QrCodeClient';
import { EVENT } from '@/lib/event';
import { useStore, type Drive } from '@/lib/store';
import styles from './onboard.module.css';

const STEPS = [
  ['Ce e?', 'Alege sigla și anul. Restul completăm noi.'],
  ['Cifrele.', 'Aproximativ e în regulă. Nu verifică nimeni fișa de dyno.'],
  ['Trei poze.', 'Una principală, două detalii. Poți adăuga mai multe mai târziu.'],
  ['Spune-o cum ai spune-o la întâlnire.', 'Asta e partea pe care o citește lumea.'],
  ['Ești înscris.', 'Cartonaș tipărit. Stand alocat. Ne vedem pe 22.'],
] as const;

const NEXT_LABELS = ['Continuă', 'Continuă', 'Arată bine', 'Gata', 'Vezi grila'];

const MAKES = [
  'NISSAN',
  'TOYOTA',
  'BMW',
  'VOLKSWAGEN',
  'DACIA',
  'HONDA',
  'FORD',
  'AUDI',
  'MITSUBISHI',
  'ARO',
  'ALTA',
];
const YEARS = ['1978', '1989', '1994', '1998', '2003', '2005', '2016'];
const DRIVES: Drive[] = ['FWD', 'RWD', 'AWD'];

/** Marshals hand out stands on arrival; this is the one they have kept for you. */
const STAND = 'B-07';
const STORY_LIMIT = 400;

export default function OnboardScreen() {
  const router = useRouter();
  const { onboarding, patchOnboarding, resetOnboarding, completeOnboarding } = useStore();

  const [step, setStep] = useState(0);
  const [story, setStory] = useState('');

  const [title, sub] = STEPS[Math.min(step, 4)];
  const done = step >= 4;

  const next = () => {
    if (done) {
      resetOnboarding();
      router.push('/roster');
      return;
    }
    // Finishing step 4 issues the stand — the account becomes an entrant.
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
            <div className={styles.opts} role="group" aria-label="Marcă">
              {MAKES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={styles.make}
                  aria-pressed={onboarding.make === m}
                  onClick={() => patchOnboarding({ make: m })}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className={`${styles.fieldLabel} ${styles.spaced}`}>An</div>
            <div className={`${styles.opts} ${styles.optsTight}`} role="group" aria-label="An">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={styles.year}
                  aria-pressed={onboarding.year === y}
                  onClick={() => patchOnboarding({ year: y })}
                >
                  {y}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className={`${styles.fieldLabel} ${styles.spaced}`}>Putere la roți</div>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.pm}
                aria-label="Mai puțină putere"
                onClick={() => patchOnboarding({ power: Math.max(40, onboarding.power - 10) })}
              >
                −
              </button>
              <div className={styles.power}>
                <div className="n-lg n-gold">{onboarding.power}</div>
                <div className={styles.powerUnit}>cai putere</div>
              </div>
              <button
                type="button"
                className={styles.pm}
                aria-label="Mai multă putere"
                onClick={() => patchOnboarding({ power: onboarding.power + 10 })}
              >
                +
              </button>
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
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <b>{EVENT.edition}</b>
                <span>{EVENT.place}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardQr}>
                  <QrCodeClient value={`https://show.x/stand/${STAND}`} size={78} />
                </div>
                <div>
                  <div className={styles.cardStandLabel}>Stand</div>
                  <div className="n-md">{STAND}</div>
                  <div className={styles.cardLine}>
                    {`${onboarding.make ?? 'NISSAN'} · ${onboarding.year} · ${onboarding.power} CP · ${onboarding.drive}`}
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
        <button type="button" className="btn btn--primary" onClick={next}>
          {NEXT_LABELS[Math.min(step, 4)]}
        </button>
      </div>
    </div>
  );
}
