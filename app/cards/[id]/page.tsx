import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { QrCode } from '@/components/QrCode';
import { SITE_HOST, carUrl, headline, modCount, paddockOf } from '@/lib/cars';
import { getCar } from '@/lib/db/queries';
import { EVENT } from '@/lib/event';
import { PrintButton } from '../PrintButton';
import styles from '../cards.module.css';

/** 87 design units square — the size the codes are drawn at on all three cards. */
const QR_SIZE = 'calc(87 * var(--u))';

/**
 * Cards get printed while entries are still half-filled. An em dash reads
 * as "not given"; a 0 reads as a measurement, and a wrong one.
 */
const orDash = (v: string | number | null | undefined) => (v ? String(v) : '—');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const car = await getCar((await params).id);
  return { title: car ? `${headline(car)} — cartonașe de parbriz` : 'Cartonașe de parbriz' };
}

export default async function CardsScreen({ params }: { params: Promise<{ id: string }> }) {
  const car = await getCar((await params).id);
  if (!car) notFound();
  const url = carUrl(car);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <b>{headline(car)}</b>
          <span>
            STAND {orDash(car.stand)} · {EVENT.edition} · A5 LANDSCAPE, 210 × 148 MM
          </span>
        </div>
        <PrintButton />
        <Link href={`/car/${car.id}`} className={styles.toolbarLink}>
          PROIECTUL →
        </Link>
        <Link href="/cards" className={styles.toolbarLink}>
          TOATE ÎNSCRIERILE
        </Link>
      </div>

      <div className={styles.deck}>
        {/* ── 1g · Spec plate — black stock, stand number leads ── */}
        <div className={styles.caption}>
          <span className={styles.captionTag}>1g</span>
          <span>Plăcuță de specificații — carton negru, numărul de stand conduce.</span>
        </div>
        <div className={`${styles.card} ${styles.dark}`}>
          <div className={styles.band}>
            <div className={styles.bandTitle}>{EVENT.edition}</div>
            <div className="spacer" />
            <div className={styles.bandDate}>{EVENT.dateNumeric}</div>
          </div>

          <div className={styles.plateBody}>
            <div className={styles.standCol}>
              <div className={styles.standLabel}>STAND</div>
              <div className={styles.standNo}>{orDash(car.stand)}</div>
              <div className={styles.classTag}>{car.cls}</div>
            </div>

            <div className={styles.idCol}>
              <div className={styles.plateHeadline}>
                {[car.year || null, car.make].filter(Boolean).join(' ')}
                <br />
                {car.model}
              </div>
              <div className={styles.plateNick}>
                {car.nickname ? `“${car.nickname}”` : car.paint}
              </div>
              <div className="spacer" />
              <div className={styles.plateSpecs}>
                <div className={styles.plateSpec}>
                  <div className={styles.plateSpecKey}>PUTERE</div>
                  <div className={styles.plateSpecValue}>
                    {orDash(car.power)}
                    {car.power && <i> CP</i>}
                  </div>
                </div>
                <div className={styles.plateSpec}>
                  <div className={styles.plateSpecKey}>MOTOR</div>
                  <div className={styles.plateSpecValue}>{orDash(car.engine.split(' ')[0])}</div>
                </div>
                <div className={styles.plateSpec}>
                  <div className={styles.plateSpecKey}>TRACȚIUNE</div>
                  <div className={styles.plateSpecValue}>{car.drive}</div>
                </div>
              </div>
            </div>

            <div className={styles.qrCol}>
              <QrCode value={url} size={QR_SIZE} dark="#F2F2F0" light="#0B0B0C" />
              <div className={styles.qrCaption}>
                SCANEAZĂ
                <br />
                PROIECTUL
              </div>
            </div>
          </div>

          <div className={styles.plateFoot}>
            <b>
              {car.owner} · @{car.handle} · {car.town}
            </b>
            <span>LASĂ PE PARBRIZ</span>
          </div>
        </div>

        {/* ── 1h · Scrutineering slip — paper stock, ink-light ── */}
        <div className={styles.caption}>
          <span className={styles.captionTag}>1h</span>
          <span>Fișă de verificare — hârtie, puțină cerneală, se citește de la zece pași.</span>
        </div>
        <div className={`${styles.card} ${styles.light}`}>
          <div className={styles.slipBody}>
            <div className={styles.entryCol}>
              <div className={styles.entryLabel}>ÎNSCRIERE №</div>
              <div className={styles.entryNo}>{orDash(car.no)}</div>
              <div className="spacer" />
              <div className={styles.entryFoot}>
                CLASĂ · {car.cls}
                <br />
                PADOC {paddockOf(car)}
              </div>
            </div>

            <div className={styles.slipCol}>
              <div className={styles.slipMark}>
                <i>X</i>
                <span>
                  {EVENT.edition} · {EVENT.place}
                </span>
              </div>
              <div className={styles.slipHeadline}>{headline(car)}</div>
              <div className={styles.slipOwner}>
                {car.owner} · {car.town}
              </div>

              <div className={styles.slipRows}>
                {[
                  ['MOTOR', car.engine],
                  ['PUTERE', car.power ? `${car.power} CP` : '—'],
                  ['TRACȚIUNE', car.drive],
                  ['VOPSEA', car.paint],
                ].map(([k, v]) => (
                  <div key={k} className={styles.slipRow}>
                    <b>{k}</b>
                    <div className="spacer" />
                    <span>{v}</span>
                  </div>
                ))}
              </div>

              <div className="spacer" />
              <div className={styles.slipScan}>
                <QrCode value={url} size={QR_SIZE} dark="#0B0B0C" light="#F4F3EF" />
                <p>
                  SCANEAZĂ PENTRU LISTA
                  <br />
                  DE MODIFICĂRI, POVESTE
                  <br />
                  ȘI REȚELELE PROPRIETARULUI.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.slipFoot}>
            <b>{SITE_HOST.toUpperCase()} / {car.no || '—'}</b>
            <span>VOTUL SE ÎNCHIDE LA {EVENT.votingCloses}</span>
          </div>
        </div>

        {/* ── 1i · Photo plate — the car on the card ── */}
        <div className={styles.caption}>
          <span className={styles.captionTag}>1i</span>
          <span>Plăcuță foto — mai scumpă de tipărit, potrivită pentru câștigători.</span>
        </div>
        <div className={`${styles.card} ${styles.dark}`}>
          <div className={styles.photoBand}>
            <ImageSlot id={`hero-${car.id}-0`} hint="Pune poza principală a mașinii" />
            <div className={styles.photoScrim} />
            <div className={styles.photoBadge}>{EVENT.edition}</div>
            <div className={styles.photoCaption}>
              <div style={{ flex: 1 }}>
                <b>{headline(car)}</b>
                <span>
                  {car.owner} · {car.town}
                </span>
              </div>
              <div className={styles.photoNo}>{orDash(car.no)}</div>
            </div>
          </div>

          <div className={styles.photoBody}>
            <QrCode value={url} size={QR_SIZE} dark="#F2F2F0" light="#0B0B0C" />
            <div className={styles.photoSpecs}>
              {[
                ['MOTOR', car.engine],
                ['PUTERE', car.power ? `${car.power} CP` : '—'],
                ['CUPLU', `${car.tq} NM`],
                ['TRACȚIUNE', car.drive],
                ['GREUTATE', `${car.weight} KG`],
                ['CLASĂ', car.cls],
              ].map(([k, v]) => (
                <div key={k} className={styles.photoSpec}>
                  <b>{k}</b>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.photoFoot}>
            SCANEAZĂ PENTRU TOT PROIECTUL · {modCount(car)} MODIFICĂRI · {car.town}
          </div>
        </div>
      </div>
    </div>
  );
}
