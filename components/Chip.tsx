'use client';

/**
 * Filter chip. Filled red = a state you caused; outline = neutral fact.
 * The whole filter row is one radio group, so arrow keys work.
 */
export function Chip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick}>
      {label}
    </button>
  );
}
