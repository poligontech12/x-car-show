import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageSlot } from '@/components/ImageSlot';
import { QrCode } from '@/components/QrCode';
import {
  CARS,
  byId,
  carUrl,
  headline,
  modCount,
  paddockOf,
} from '@/lib/cars';
import { EVENT } from '@/lib/event';
import { PrintButton } from '../PrintButton';
import styles from '../cards.module.css';

/** 87 design units square — the size the codes are drawn at on all three cards. */
const QR_SIZE = 'calc(87 * var(--u))';

export function generateStaticParams() {
  return CARS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const car = byId((await params).id);
  return { title: `${headline(car)} — windshield cards` };
}

export default async function CardsScreen({ params }: { params: Promise<{ id: string }> }) {
  const car = byId((await params).id);
  const url = carUrl(car);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <b>{headline(car)}</b>
          <span>
            STAND {car.stand} · {EVENT.edition} · A5 LANDSCAPE, 210 × 148 MM
          </span>
        </div>
        <PrintButton />
        <Link href={`/car/${car.id}`} className={styles.toolbarLink}>
          THE BUILD →
        </Link>
        <Link href="/cards" className={styles.toolbarLink}>
          ALL ENTRIES
        </Link>
      </div>

      <div className={styles.deck}>
        {/* ── 1g · Spec plate — black stock, stand number leads ── */}
        <div className={styles.caption}>
          <span className={styles.captionTag}>1g</span>
          <span>Spec plate — black stock, stand number leads.</span>
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
              <div className={styles.standNo}>{car.stand}</div>
              <div className={styles.classTag}>{car.cls}</div>
            </div>

            <div className={styles.idCol}>
              <div className={styles.plateHeadline}>
                {car.year} {car.make}
                <br />
                {car.model}
              </div>
              <div className={styles.plateNick}>
                {car.nickname ? `“${car.nickname}”` : car.paint}
              </div>
              <div className="spacer" />
              <div className={styles.plateSpecs}>
                <div className={styles.plateSpec}>
                  <div className={styles.plateSpecKey}>POWER</div>
                  <div className={styles.plateSpecValue}>
                    {car.power}
                    <i> HP</i>
                  </div>
                </div>
                <div className={styles.plateSpec}>
                  <div className={styles.plateSpecKey}>ENGINE</div>
                  <div className={styles.plateSpecValue}>{car.engine.split(' ')[0]}</div>
                </div>
                <div className={styles.plateSpec}>
                  <div className={styles.plateSpecKey}>DRIVE</div>
                  <div className={styles.plateSpecValue}>{car.drive}</div>
                </div>
              </div>
            </div>

            <div className={styles.qrCol}>
              <QrCode value={url} size={QR_SIZE} dark="#F2F2F0" light="#0B0B0C" />
              <div className={styles.qrCaption}>
                SCAN FOR
                <br />
                THE BUILD
              </div>
            </div>
          </div>

          <div className={styles.plateFoot}>
            <b>
              {car.owner} · @{car.handle.toUpperCase()} · {car.town}
            </b>
            <span>LEAVE ON THE WINDSCREEN</span>
          </div>
        </div>

        {/* ── 1h · Scrutineering slip — paper stock, ink-light ── */}
        <div className={styles.caption}>
          <span className={styles.captionTag}>1h</span>
          <span>Scrutineering slip — paper stock, ink-light, reads at ten paces.</span>
        </div>
        <div className={`${styles.card} ${styles.light}`}>
          <div className={styles.slipBody}>
            <div className={styles.entryCol}>
              <div className={styles.entryLabel}>ENTRY №</div>
              <div className={styles.entryNo}>{car.no}</div>
              <div className="spacer" />
              <div className={styles.entryFoot}>
                CLASS · {car.cls}
                <br />
                PADDOCK {paddockOf(car)}
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
                  ['ENGINE', car.engine],
                  ['POWER', `${car.power} HP`],
                  ['DRIVETRAIN', car.drive],
                  ['PAINT', car.paint],
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
                  SCAN FOR MOD LIST,
                  <br />
                  BUILD STORY AND
                  <br />
                  THE OWNER&apos;S SOCIALS.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.slipFoot}>
            <b>SHOW.X / {car.no}</b>
            <span>VOTING CLOSES {EVENT.votingCloses}</span>
          </div>
        </div>

        {/* ── 1i · Photo plate — the car on the card ── */}
        <div className={styles.caption}>
          <span className={styles.captionTag}>1i</span>
          <span>Photo plate — costlier to print, best for award winners.</span>
        </div>
        <div className={`${styles.card} ${styles.dark}`}>
          <div className={styles.photoBand}>
            <ImageSlot id={`hero-${car.id}-0`} hint="Drop the car's hero photo" />
            <div className={styles.photoScrim} />
            <div className={styles.photoBadge}>{EVENT.edition}</div>
            <div className={styles.photoCaption}>
              <div style={{ flex: 1 }}>
                <b>{headline(car)}</b>
                <span>
                  {car.owner} · {car.town}
                </span>
              </div>
              <div className={styles.photoNo}>{car.no}</div>
            </div>
          </div>

          <div className={styles.photoBody}>
            <QrCode value={url} size={QR_SIZE} dark="#F2F2F0" light="#0B0B0C" />
            <div className={styles.photoSpecs}>
              {[
                ['ENGINE', car.engine],
                ['POWER', `${car.power} HP`],
                ['TORQUE', `${car.tq} NM`],
                ['DRIVE', car.drive],
                ['WEIGHT', `${car.weight} KG`],
                ['CLASS', car.cls],
              ].map(([k, v]) => (
                <div key={k} className={styles.photoSpec}>
                  <b>{k}</b>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.photoFoot}>
            SCAN FOR THE FULL BUILD · {modCount(car)} MODS · {car.town}
          </div>
        </div>
      </div>
    </div>
  );
}
