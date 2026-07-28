import styles from './StickyHeader.module.css';

export function StickyHeader({ children }: { children: React.ReactNode }) {
  return <header className={styles.header}>{children}</header>;
}

export function HeaderRow({
  children,
  align = 'end',
}: {
  children: React.ReactNode;
  align?: 'end' | 'center';
}) {
  return (
    <div className={`${styles.row} ${align === 'center' ? styles.rowCenter : ''}`}>{children}</div>
  );
}

export function HeaderRule() {
  return <div className={styles.rule} />;
}

/** One filter row. No trays, no second level. */
export function FilterRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className={styles.filters} role="group" aria-label={label}>
      {children}
    </div>
  );
}
