import styles from './Avatar.module.css';

interface Props {
  /** The photograph, or nothing if this person has not added one. */
  src?: string | null;
  /** Whose face it is — read out, and the source of the fallback initial. */
  name: string;
  className?: string;
}

/**
 * A person, drawn wherever their name appears. Fills whatever circle the
 * caller has already sized and rounded, so every screen keeps its own
 * dimensions and only the contents come from here.
 */
export function Avatar({ src, name, className }: Props) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className={className}>
      {src ? (
        <img className={styles.img} src={src} alt={name} draggable={false} />
      ) : (
        <div className={styles.letter} aria-hidden="true">
          {initial}
        </div>
      )}
    </div>
  );
}
