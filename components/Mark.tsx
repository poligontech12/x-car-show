import styles from './Mark.module.css';

interface Props {
  /**
   * The ground it sits on. The X stays the marque red either way — only
   * the wordmark changes, because white type on paper stock is not type.
   */
  tone?: 'dark' | 'light';
  /** Where the caller sets the size: one font-size scales the lockup. */
  className?: string;
}

/**
 * The X Car Show marque, in one place.
 *
 * It used to be drawn inline in the nav and improvised again on every
 * printed card — a red square with an X in it on one, the edition set as
 * a headline on another — so the thing on the car and the thing in the
 * app were not the same logo. This is the app's, and the cards render it.
 */
export function Mark({ tone = 'dark', className }: Props) {
  return (
    <span
      className={[styles.mark, tone === 'light' ? styles.light : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className={styles.x}>X</span>
      <span className={styles.word}>
        <b>CAR</b>
        <b>SHOW</b>
      </span>
    </span>
  );
}
