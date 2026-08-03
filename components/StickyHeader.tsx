import styles from './StickyHeader.module.css';

/**
 * Label, mark, then the name on two lines at 48px. Every
 * destination in the app opens with this block.
 */
export function ScreenTitle({
  label,
  icon,
  lines,
  aside,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  lines: [string, string?];
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.title} ${className ?? ''}`}>
      <div className={styles.label}>
        {icon}
        <span>{label}</span>
      </div>
      <h1 className={styles.lines}>
        <b>{lines[0]}</b>
        {lines[1] && <b>{lines[1]}</b>}
      </h1>
      {aside && <div className={styles.aside}>{aside}</div>}
    </div>
  );
}

export function TitleAside({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return <span className={gold ? styles.asideAccent : undefined}>{children}</span>;
}

/** One filter row. No trays, no second level. */
export function FilterRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className={styles.filters} role="group" aria-label={label}>
      {children}
    </div>
  );
}
