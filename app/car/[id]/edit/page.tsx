'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CarPhotoSlot } from '@/components/CarPhotoSlot';
import {
  PLATE_EXAMPLE,
  PLATE_MAX,
  PLATE_NOTE,
  type Car,
  type CarClass,
  type ModCategory,
} from '@/lib/cars';
import { useFlowExit } from '@/lib/flow-exit';
import { CAR_PHOTO_HINTS, CAR_PHOTO_LIMIT, photoAt } from '@/lib/photos';
import { useCar, useOwnsCar } from '@/lib/useCars';
import { useStore } from '@/lib/store';
import styles from './edit.module.css';

const CLASS_OPTIONS: CarClass[] = ['JDM', 'Germane', 'Muscle', 'Clasice', 'Stance', 'Off-road'];
const DRIVES: Car['drive'][] = ['FWD', 'RWD', 'AWD', '4WD'];
const MOD_CATEGORIES: ModCategory[] = ['Motor', 'Suspensie', 'Jante', 'Exterior', 'Interior'];
const PHOTO_SLOTS = Array.from({ length: CAR_PHOTO_LIMIT }, (_, position) => position);

/** Mod groups are edited as one line per item — faster than a list builder. */
const groupText = (car: Car, name: ModCategory) =>
  car.mods.find((g) => g.name === name)?.items.join('\n') ?? '';

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const car = useCar(id);
  const owns = useOwnsCar(id);
  const { updateCar, removeCar, hydrated } = useStore();
  // Editing is reached from the car, so that is where closing it belongs —
  // including when the edit screen was opened cold from a link.
  const close = useFlowExit(`/car/${id}`);

  const [draft, setDraft] = useState<Car | null>(null);
  const [mods, setMods] = useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!car || draft) return;
    setDraft(car);
    setMods(Object.fromEntries(MOD_CATEGORIES.map((n) => [n, groupText(car, n)])));
  }, [car, draft]);

  if (!hydrated) return <div className={styles.screen} />;

  // The seed roster is demo data standing in for real entrants; only what
  // you registered yourself is yours to change.
  if (!car || !owns) {
    return (
      <div className={styles.screen}>
        <div className={styles.top}>
          <div className={styles.topRow}>
            <button type="button" className="icon-btn" aria-label="Înapoi" onClick={close}>
              ←
            </button>
            <div className={styles.label}>Editare</div>
          </div>
        </div>
        <div className={styles.body}>
          <h1 className={styles.title}>Nu poți edita mașina asta.</h1>
          <p className={styles.sub}>
            Poți schimba doar mașinile pe care le-ai înscris tu. Restul aparțin altor
            participanți.
          </p>
        </div>
      </div>
    );
  }

  if (!draft) return <div className={styles.screen} />;

  const set = (patch: Partial<Car>) => setDraft({ ...draft, ...patch });

  const save = async () => {
    if (saving) return;
    setSaving(true);
    await updateCar(id, {
      ...draft,
      mods: MOD_CATEGORIES.map((name) => ({
        name,
        items: (mods[name] ?? '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      })).filter((g) => g.items.length > 0),
    });
    router.push(`/car/${id}`);
  };

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <button type="button" className="icon-btn" aria-label="Înapoi" onClick={() => router.back()}>
            ←
          </button>
          <div className={styles.label}>Editează mașina</div>
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={styles.title}>{draft.model || 'Mașina ta'}</h1>
        <p className={styles.sub}>
          Tot ce completezi aici apare pe pagina mașinii și pe cartonașul tipărit.
          Poți lăsa gol ce nu știi încă.
        </p>

        <Section title="Fotografii" note="Poți adăuga, înlocui sau șterge oricând.">
          <div className={styles.photoGrid}>
            {PHOTO_SLOTS.map((position) => (
              <div key={position} className={styles.photoWell}>
                <CarPhotoSlot
                  carId={car.id}
                  position={position}
                  src={photoAt(car.photos, position)}
                  hint={CAR_PHOTO_HINTS[position]}
                  canEdit
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Identitate">
          <Field label="Model" value={draft.model} onChange={(v) => set({ model: v })} placeholder="Silvia S14" />
          <Field label="Marcă" value={draft.make} onChange={(v) => set({ make: v })} placeholder="Nissan" />
          <Field
            label="An"
            value={String(draft.year || '')}
            onChange={(v) => set({ year: Number(v.replace(/\D/g, '').slice(0, 4)) || 0 })}
            inputMode="numeric"
            placeholder="1998"
          />
          <Field
            label="Poreclă"
            value={draft.nickname ?? ''}
            onChange={(v) => set({ nickname: v })}
            placeholder="Kouki"
          />
          {/* Scrisă cum vrea proprietarul: fără format, fără majuscule
              impuse, fiindcă vin mașini și din Ucraina și din Moldova. */}
          <Field
            label="Nr. înmatriculare"
            value={draft.plate ?? ''}
            onChange={(v) => set({ plate: v.slice(0, PLATE_MAX) })}
            placeholder={PLATE_EXAMPLE}
            note={PLATE_NOTE}
          />
          <Choice
            label="Clasă"
            options={CLASS_OPTIONS}
            value={draft.cls}
            onChange={(v) => set({ cls: v as CarClass })}
          />
        </Section>

        <Section title="Cifre">
          <Field label="Putere (CP)" value={draft.power} onChange={(v) => set({ power: v.replace(/\D/g, '') })} inputMode="numeric" placeholder="412" />
          <Field label="Cuplu (NM)" value={draft.tq} onChange={(v) => set({ tq: v.replace(/\D/g, '') })} inputMode="numeric" placeholder="480" />
          <Field label="Greutate (KG)" value={draft.weight} onChange={(v) => set({ weight: v.replace(/\D/g, '') })} inputMode="numeric" placeholder="1240" />
        </Section>

        <Section title="Tehnic">
          <Field label="Motor" value={draft.engine} onChange={(v) => set({ engine: v })} placeholder="SR20DET 2.0 turbo" />
          <Choice
            label="Tracțiune"
            options={DRIVES}
            value={draft.drive}
            onChange={(v) => set({ drive: v as Car['drive'] })}
          />
          <Field label="Cutie" value={draft.gbox} onChange={(v) => set({ gbox: v })} placeholder="5MT · diferențial 1.5W" />
          <Field label="Jante" value={draft.wheels} onChange={(v) => set({ wheels: v })} placeholder='Work Meister S1 3P' />
          <Field label="Vopsea" value={draft.paint} onChange={(v) => set({ paint: v })} placeholder="Bayside Blue" />
        </Section>

        <Section title="Modificări" note="Câte una pe rând.">
          {MOD_CATEGORIES.map((name) => (
            <Area
              key={name}
              label={name}
              value={mods[name] ?? ''}
              onChange={(v) => setMods({ ...mods, [name]: v })}
              placeholder={name === 'Motor' ? 'Turbină GT2871R\nECU standalone' : ''}
              rows={3}
            />
          ))}
        </Section>

        <Section title="Povestea">
          <Area
            label="Cum ai ajuns la ea"
            value={draft.story}
            onChange={(v) => set({ story: v })}
            placeholder="Unde ai găsit-o, ce s-a stricat, cine te-a ajutat, de ce ai păstrat-o."
            rows={7}
          />
        </Section>

        <button
          type="button"
          className={`btn btn--quiet ${styles.delete}`}
          onClick={() =>
            confirmingDelete
              ? void removeCar(id).then(() => router.push('/garage'))
              : setConfirmingDelete(true)
          }
        >
          {confirmingDelete ? 'Sigur? Atinge din nou ca să ștergi' : 'Șterge mașina'}
        </button>

        <div className={styles.tail} />
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className="btn btn--primary"
          disabled={saving}
          onClick={() => void save()}
        >
          Salvează
        </button>
      </div>
    </div>
  );
}

/* ── Form primitives ───────────────────────────────────────── */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        {note && <span>{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  note,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'numeric' | 'text';
  /** Said under the input, where a decision about the field gets made. */
  note?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        className={styles.input}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {note && <span className={styles.fieldNote}>{note}</span>}
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <textarea
        className={styles.area}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.choices} role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className="chip"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
