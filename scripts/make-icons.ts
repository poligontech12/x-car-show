/**
 * The home-screen icon, drawn rather than exported.
 *
 * The marque in components/Mark.tsx is a lockup: a red X with CAR SHOW
 * stacked beside it. At 60px on a home screen the wordmark is a grey
 * smudge, so the icon is the X alone — which is what Mark.module.css
 * already says carries the marque ("the letterform carries the red on
 * its own").
 *
 * The X is drawn as two paths instead of set in Albert Sans, because a
 * build that renders type depends on a font being installed on whatever
 * machine runs it. This depends on nothing, and an icon is one glyph —
 * the geometry is the whole design.
 *
 * Run it when the marque changes, which should be approximately never:
 *
 *   npx tsx scripts/make-icons.ts
 *
 * Output is committed. It is three small PNGs, and a checkout that has
 * to run a build step before it has an icon is a checkout that ships
 * without one.
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/** From app/tokens.css. The ground is neutral to the last digit. */
const INK = '#08080a';
const RED = '#e10600';

const CANVAS = 512;

/**
 * The shape of the letter, measured off the real one rather than
 * guessed at.
 *
 * Albert Sans 800's cap X was rendered to a canvas at 1000px and its
 * ink scanned: 686 wide by 700 tall, with a flat terminal 178 across
 * at each of the four corners, strokes running corner to corner and
 * crossing dead centre. Hence a letter very nearly square — an X drawn
 * by eye comes out far narrower than that, which is a shape the marque
 * in components/Mark.tsx never makes.
 *
 * CUT is the width of a terminal along the top edge. It is not the
 * stem weight: on a diagonal, a horizontal cut is wider than the
 * stroke it cuts across.
 */
const RATIO = 686 / 700;
const CUT_RATIO = 178 / 686;

/**
 * How tall the letter stands on a 512 tile, which is not one number
 * because the two jobs crop differently.
 *
 * HOME is for the icon a phone keeps. Android masks that to whatever
 * shape the launcher likes — circle, squircle, teardrop — and only
 * guarantees a circle across the middle 80%, which is 410px of the 512.
 * An X's four corners are its extreme points, so what has to fit that
 * circle is the glyph's diagonal, not its height: at 280 tall the
 * corners sit 196 from centre against a budget of 205. iOS does not
 * mask at all, it just rounds the corners, so the same drawing is
 * simply a well-padded icon there.
 *
 * TAB is for the favicon, which nothing masks and which is read at
 * 16px on a strip of browser chrome. Giving it the launcher's padding
 * would spend a third of those 16 pixels on empty ground, so it is
 * drawn tight instead — the same letter, cropped closer.
 */
const GLYPH_H = { home: 280, tab: 400 };

/**
 * Two crossed parallelograms, each with a flat horizontal terminal top
 * and bottom — the cut Albert Sans gives its X. They are separate paths
 * rather than one two-subpath path on purpose: drawn as one, the two
 * subpaths wind in opposite directions and the nonzero fill rule turns
 * the overlap at the crossing into a hole.
 */
function svg(size: number, glyphH: number) {
  const w = Math.round(glyphH * RATIO);
  const cut = Math.round(w * CUT_RATIO);
  const x0 = (CANVAS - w) / 2;
  const y0 = (CANVAS - glyphH) / 2;
  const x1 = x0 + w;
  const y1 = y0 + glyphH;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <rect width="${CANVAS}" height="${CANVAS}" fill="${INK}"/>
  <path d="M${x0} ${y0} H${x0 + cut} L${x1} ${y1} H${x1 - cut} Z" fill="${RED}"/>
  <path d="M${x1} ${y0} H${x1 - cut} L${x0} ${y1} H${x0 + cut} Z" fill="${RED}"/>
</svg>`;
}

/**
 * Each size is rendered from the vector at that size rather than
 * downscaled from the 512, so the diagonals stay hard-edged instead of
 * picking up the grey fringe a resample leaves on a hard shape.
 *
 * Next injects the right <link> for the two it owns by filename:
 * apple-icon.png becomes rel="apple-touch-icon", icon.png becomes
 * rel="icon". The two under public/ are named by app/manifest.ts.
 */
const TARGETS = [
  { size: 512, glyph: GLYPH_H.home, path: ['public', 'icon-512.png'] },
  { size: 192, glyph: GLYPH_H.home, path: ['public', 'icon-192.png'] },
  { size: 180, glyph: GLYPH_H.home, path: ['app', 'apple-icon.png'] },
  /* 32 rather than 16: it is the size a browser asks for on a normal
     display and halves cleanly for a tab bar, where 16 upscaled to a
     retina tab would not. */
  { size: 32, glyph: GLYPH_H.tab, path: ['app', 'icon.png'] },
];

async function main() {
  for (const { size, glyph, path } of TARGETS) {
    const png = await sharp(Buffer.from(svg(size, glyph)))
      .png({ compressionLevel: 9 })
      .toBuffer();
    const out = join(process.cwd(), ...path);
    await writeFile(out, png);
    console.log(`${path.join('/')}  ${size}×${size}  ${(png.length / 1024).toFixed(1)} kB`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
