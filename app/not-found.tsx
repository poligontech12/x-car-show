import Link from 'next/link';
import styles from './error.module.css';

/**
 * An address that leads nowhere.
 *
 * Cards printed for a previous year, a link retyped by hand off a
 * windscreen, a route that has since moved. Without this the visitor got
 * Next's own page — untouched, in English, on a white background, with no
 * way back into the app. A card at the gate deserves better than that.
 *
 * A car that was deleted is not this: the car page says so itself, in its
 * own words, with the roster one tap away.
 */
export default function NotFound() {
  return (
    <div className={styles.screen}>
      <div className={styles.body}>
        <h1 className={styles.title}>Pagina asta nu există.</h1>
        <p className={styles.sub}>
          Poate linkul e scris greșit, sau ducea undeva ce nu mai e acolo.
        </p>

        <div className={styles.actions}>
          <Link
            href="/"
            className="btn btn--primary"
          >
            Vezi înscrișii
          </Link>
          <Link
            href="/spotted"
            className="btn btn--glass"
          >
            Înapoi la Spotted
          </Link>
        </div>
      </div>
    </div>
  );
}
