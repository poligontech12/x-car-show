'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImageSlot } from '@/components/ImageSlot';
import { QrCodeClient } from '@/components/QrCodeClient';
import { EVENT } from '@/lib/event';
import { useStore, type Drive } from '@/lib/store';
import styles from './onboard.module.css';

const STEPS = [
  ['What is it?', 'Pick the badge and the year. We fill in the boring parts.'],
  ['Numbers.', 'Rough is fine. Nobody is checking your dyno sheet.'],
  ['Three photos.', 'One hero, two details. You can add more later.'],
  ['Tell it like you would at the meet.', 'This is the bit people actually read.'],
  ['You’re in.', 'Card printed. Stand assigned. See you on the 22nd.'],
] as const;

const NEXT_LABELS = ['CONTINUE', 'CONTINUE', 'LOOKS GOOD', 'FINISH', 'SEE THE ROSTER'];

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
  'OTHER',
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
            className={styles.close}
            aria-label="Close"
            onClick={() => router.back()}
          >
            ×
          </button>
          <div className={styles.label}>REGISTER A CAR</div>
          <div className={styles.stepLabel}>{done ? 'DONE' : `STEP ${step + 1}/4`}</div>
        </div>
        <div className={styles.progress} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} data-done={i <= step} />
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sub}>{sub}</p>

        {step === 0 && (
          <>
            <div className={styles.opts} role="group" aria-label="Make">
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

            <div className={`${styles.fieldLabel} ${styles.spaced}`}>YEAR</div>
            <div className={`${styles.opts} ${styles.optsTight}`} role="group" aria-label="Year">
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
            <div className={`${styles.fieldLabel} ${styles.spaced}`}>POWER AT THE WHEELS</div>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.pm}
                aria-label="Less power"
                onClick={() => patchOnboarding({ power: Math.max(40, onboarding.power - 10) })}
              >
                −
              </button>
              <div className={styles.power}>
                <div className={styles.powerValue}>{onboarding.power}</div>
                <div className={styles.powerUnit}>HP</div>
              </div>
              <button
                type="button"
                className={styles.pm}
                aria-label="More power"
                onClick={() => patchOnboarding({ power: onboarding.power + 10 })}
              >
                +
              </button>
            </div>

            <div className={`${styles.fieldLabel} ${styles.spaced}`}>DRIVETRAIN</div>
            <div className={styles.driveRow} role="group" aria-label="Drivetrain">
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
              <ImageSlot id="ob-hero" hint="Hero shot — 3/4 front" />
            </div>
            <div className={styles.pair}>
              <div className={styles.pairSlot}>
                <ImageSlot id="ob-2" hint="Engine bay" />
              </div>
              <div className={styles.pairSlot}>
                <ImageSlot id="ob-3" hint="Interior / detail" />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <textarea
              className={styles.story}
              maxLength={STORY_LIMIT}
              placeholder="Where you found it, what broke, who helped, why you kept it."
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
                  <div className={styles.cardStandLabel}>STAND</div>
                  <div className={styles.cardStand}>{STAND}</div>
                  <div className={styles.cardLine}>
                    {`${onboarding.make ?? 'NISSAN'} · ${onboarding.year} · ${onboarding.power} HP · ${onboarding.drive}`}
                  </div>
                </div>
              </div>
            </div>
            <p className={styles.doneNote}>
              We print this card and hand it to you at the gate. People scan it, your page opens,
              and you keep talking instead of repeating your spec list forty times.
            </p>
          </>
        )}

        <div className={styles.tail} />
      </div>

      <div className={styles.footer}>
        {step > 0 && step < 4 && (
          <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>
            BACK
          </button>
        )}
        <button type="button" className="btn btn--primary" onClick={next}>
          {NEXT_LABELS[Math.min(step, 4)]}
        </button>
      </div>
    </div>
  );
}
