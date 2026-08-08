/**
 * The poster that goes up around the field.
 *
 * Its whole job is to get a phone pointed at the app: a marque somebody
 * recognises from the gate, one sentence saying what is behind the code,
 * and a code big enough to read from a couple of paces.
 *
 * White stock, so a copy shop or an office printer can run a stack of it
 * without a full-bleed black field drinking a toner cartridge. Two cuts
 * come out of the same markup — one led by a photograph, one purely
 * typographic — because which of those reads better on a fence post is a
 * judgement to make with both of them on the table.
 *
 *   npm run poster
 *
 * Writes A4 PNG (300dpi) and PDF per cut into design/poster/.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QR from 'qrcode';
import sharp from 'sharp';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'design', 'poster');
const FONT_CACHE = join(ROOT, 'node_modules', '.cache', 'poster-fonts');

/**
 * Where the code lands, and what is printed under it — deliberately not
 * the same thing.
 *
 * The roster is the front door now, so the scan needs no path at all —
 * which is the shortest the code will ever be, and short codes have fat
 * modules. It is also what the poster promises: every car in the field,
 * which is what "vezi orice mașină" means.
 *
 * `?ref=poster` is the only way anybody will ever know whether this sheet
 * of paper did anything. Google Analytics records the landing address, so
 * the parameter arrives with the page view; the app itself ignores it.
 * Dropping `/roster` paid for it — at 43 characters the whole thing still
 * fits the same QR version the bare domain did, so the tracking is free.
 *
 * The printed line stays the bare domain, without the parameter: it is
 * the one somebody types by hand, and a query string is a thing to get
 * wrong on a phone keyboard.
 */
const URL_QR = 'https://xcarshow.poligontech.ro/?ref=poster';
const URL_TEXT = 'xcarshow.poligontech.ro';

const EVENT = { place: 'CAJVANA', county: 'SUCEAVA', dates: '8–9 AUGUST 2026' };

/**
 * The photograph. CC0 off Wikimedia Commons, which is the only reason it
 * can go on a printed poster at all: no attribution line to carry and no
 * share-alike clause reaching back onto the artwork. Provenance is in
 * demo-photos/credits.json — File:S14_03.jpg by Jacksonpuaminghow.
 *
 * It is a stranger's wheel, not an entrant's car. Cropped to a detail and
 * pushed to near-monochrome it reads as texture rather than as a claim
 * about which cars are in the field.
 */
const PHOTO = join(OUT, 'src', 'wheel-s14-cc0.jpg');
const BAND_MM = 72;

const WEIGHTS = [400, 500, 600, 700, 800];

/* ── the code ───────────────────────────────────────────────────────── */

/**
 * Error correction Q, not the M the windshield cards use. A card lives
 * one day on a windscreen; a poster gets rained on, taped over at a
 * corner and read at an angle, and the redundancy pays for itself.
 *
 * The four-module quiet zone is drawn into the SVG rather than left to
 * the layout. Padding is a design decision and gets tightened by whoever
 * is fighting the page for eight millimetres; the margin here is the one
 * the scanner needs, so it lives with the code.
 */
const QUIET_MODULES = 4;

async function code() {
  const modules = QR.create(URL_QR, { errorCorrectionLevel: 'Q' }).modules.size;
  const svg = await QR.toString(URL_QR, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: QUIET_MODULES,
    /* Transparent, not white. The quiet zone is real estate the code has
       to own but must not paint — the layout pulls the type in over it,
       and a white rect would rub out the line above. On white stock the
       paper is the quiet zone. */
    color: { dark: '#0b0b0c', light: '#0000' },
  });
  return {
    modules,
    /** What fraction of the drawn box is the code itself, so the caller
        can size the box and still know how big the code came out. */
    codeRatio: modules / (modules + QUIET_MODULES * 2),
    svg: svg
      .replace(/<svg([^>]*)>/, '<svg$1 shape-rendering="crispEdges">')
      .replace(/width="[^"]*"/, 'width="100%"')
      .replace(/height="[^"]*"/, 'height="100%"'),
  };
}

/* ── the photograph ─────────────────────────────────────────────────── */

/**
 * Cropped from the top, where the wheel arch and the caliper are, and
 * pushed to a hard monochrome. The source is a catalogue snapshot taken
 * in a car park; left in colour it looks like one. Stripped of colour and
 * given some contrast it stops being a picture of a particular Tuesday
 * and starts being the texture the type sits on.
 */
async function band() {
  return (
    'data:image/jpeg;base64,' +
    (
      await sharp(PHOTO)
        .resize({ width: 2480, height: Math.round((BAND_MM / 25.4) * 300), fit: 'cover', position: 'top' })
        .greyscale()
        .linear(1.4, -34)
        .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
        .toBuffer()
    ).toString('base64')
  );
}

/* ── the sheet ──────────────────────────────────────────────────────── */

/**
 * How much white to leave between the code and the type either side of
 * it. On the black poster the quiet zone was visible — it was the white
 * card the code sat on. On white stock it is invisible, so a margin set
 * on top of it reads as a hole, and the code looks small in the middle of
 * nothing. These are the gaps somebody actually sees; the quiet zone is
 * subtracted back out below.
 */
const GAP_ABOVE_MM = 10;
const GAP_BELOW_MM = 7;

/**
 * Trim size, and how far the artwork runs past it.
 *
 * The photograph bleeds off three edges, and a guillotine does not cut
 * to the micron — trimmed with no bleed, a millimetre of drift leaves a
 * white hairline down the side of the band. A shop wants 3mm of overhang
 * to cut into. A desk printer wants the opposite: an exact A4 with the
 * artwork inside it, because it cannot reach the paper edge anyway.
 */
const TRIM_W = 210;
const TRIM_H = 297;

const sheet = ({ cut, qr, boxMm, quietMm, faces, photo, bleedMm }) => `
<style>
${faces}

:root{
  --red:#e10600;
  --ink:#0b0b0c;
  --ink-70:rgba(11,11,12,.72);
  --ink-45:rgba(11,11,12,.5);
  --rim:rgba(11,11,12,.16);
}

*{margin:0;padding:0;box-sizing:border-box}

.sheet{
  width:${TRIM_W + bleedMm * 2}mm; height:${TRIM_H + bleedMm * 2}mm;
  position:relative; overflow:hidden;
  background:#fff; color:var(--ink);
  font-family:'Albert Sans',system-ui,sans-serif; font-weight:400;
  -webkit-font-smoothing:antialiased;
  hyphens:none;
  display:flex; flex-direction:column;
}
/* Whatever height is left over after the code has taken its size gets
   split evenly above and below it, so the sheet stays balanced without
   the code being resized to fill it. */
.grow{flex:1}

/* "Mașina show-ului" is the award's name; a line break through the hyphen
   turns it into two words nobody has heard of. */
.keep{white-space:nowrap}

/* ── the photograph ── */
/* Taller by the bleed, because it runs off the top as well as the sides. */
.band{position:relative; height:${BAND_MM + bleedMm}mm; overflow:hidden; background:#0b0b0c}
.band img{width:100%; height:100%; object-fit:cover; display:block}
/* Type needs somewhere to stand. The gradient darkens the bottom-left
   corner the marque sits in and leaves the wheel alone. */
.band .shade{
  position:absolute; inset:0;
  background:
    linear-gradient(100deg, rgba(11,11,12,.88) 0%, rgba(11,11,12,.55) 34%, rgba(11,11,12,0) 62%),
    linear-gradient(0deg, rgba(11,11,12,.6) 0%, rgba(11,11,12,0) 42%);
}
.band .mark{position:absolute; left:${16 + bleedMm}mm; bottom:10mm}

/* ── marque ── */
.mark{display:inline-flex; align-items:center; gap:.28em; font-size:15mm; line-height:1}
.mark .x{font-weight:800; font-size:1em; letter-spacing:-.06em; color:var(--red)}
.mark .word{display:flex; flex-direction:column}
.mark .word b{font-weight:700; font-size:.39em; line-height:1.02; letter-spacing:.02em; color:#fff}
/* No photograph to knock out of — the wordmark goes back to ink. */
.plain .mark .word b{color:var(--ink)}

/* Margins measure from the trim, not the sheet, so the bleed does not
   quietly shove the type inward. */
.body{
  flex:1; display:flex; flex-direction:column;
  padding:${cut === 'photo' ? 11 : 16 + bleedMm}mm ${16 + bleedMm}mm ${14 + bleedMm}mm;
}

.rule{height:.35mm; background:var(--rim); margin-top:6mm}
.where{
  margin-top:${cut === 'photo' ? '0' : '3.5mm'};
  font-weight:500; font-size:3.4mm; letter-spacing:.24em; color:var(--ink-45);
}

/* ── the sentence ── */
.say{margin-top:5mm}
.say h1{font-weight:600; font-size:16mm; line-height:.9; letter-spacing:-.05em}
.say p{margin-top:4.5mm; font-weight:400; font-size:4.6mm; line-height:1.4; color:var(--ink-70)}

/* ── the code ── */
/* No card behind it. On white stock a white panel is a panel nobody can
   see, and the code carries its own quiet zone — which is why both these
   margins are pulled back by it. */
.codeWrap{margin-top:${(GAP_ABOVE_MM - quietMm).toFixed(2)}mm; display:flex; justify-content:center}
.codeWrap .q{width:${boxMm.toFixed(1)}mm; height:${boxMm.toFixed(1)}mm; line-height:0}

.cta{
  margin-top:${(GAP_BELOW_MM - quietMm).toFixed(2)}mm;
  display:flex; align-items:center; justify-content:center; gap:3mm;
  font-weight:700; font-size:3.8mm; letter-spacing:.2em; color:var(--red);
}
.cta i{display:block; width:8mm; height:.7mm; background:var(--red)}
.url{margin-top:3mm; text-align:center; font-weight:600; font-size:5.4mm; letter-spacing:-.02em}
</style>

<div class="sheet ${cut === 'photo' ? '' : 'plain'}">
  ${
    cut === 'photo'
      ? `<div class="band">
    <img src="${photo}" alt="">
    <div class="shade"></div>
    <span class="mark"><span class="x">X</span><span class="word"><b>CAR</b><b>SHOW</b></span></span>
  </div>`
      : ''
  }

  <div class="body">
    ${
      cut === 'photo'
        ? ''
        : `<span class="mark"><span class="x">X</span><span class="word"><b>CAR</b><b>SHOW</b></span></span>
    <div class="rule"></div>`
    }
    <div class="where">${EVENT.place} · ${EVENT.county} · ${EVENT.dates}</div>

    <div class="say">
      <h1>Vezi orice mașină<br>de la eveniment.</h1>
      <p>Fișe, clasament și votul tău pentru <span class="keep">Mașina show-ului</span>.</p>
    </div>

    <div class="grow"></div>
    <div class="codeWrap"><div class="q">${qr}</div></div>
    <div class="cta"><i></i>SCANEAZĂ<i></i></div>
    <div class="url">${URL_TEXT}</div>
    <div class="grow"></div>
  </div>
</div>
`;

/* ── fonts ──────────────────────────────────────────────────────────── */

/**
 * The interface is set in Albert Sans and so is the poster, but a Mac has
 * no such font installed and a headless Chromium would quietly fall back
 * to Helvetica. Fetch the files once, embed them, and the render stops
 * depending on what happens to be on the machine.
 */
async function faces() {
  mkdirSync(FONT_CACHE, { recursive: true });
  const files = [];

  for (const w of WEIGHTS) {
    const path = join(FONT_CACHE, `albert-${w}.ttf`);
    if (!existsSync(path)) {
      const css = await fetch(
        `https://fonts.googleapis.com/css2?family=Albert+Sans:wght@${w}&display=swap`,
        { headers: { 'user-agent': 'Mozilla/5.0' } },
      ).then((r) => r.text());
      const url = css.match(/https:\/\/fonts\.gstatic\.com[^)]+/)?.[0];
      if (!url) throw new Error(`no font file offered for weight ${w}`);
      writeFileSync(path, Buffer.from(await fetch(url).then((r) => r.arrayBuffer())));
    }
    files.push([w, readFileSync(path).toString('base64')]);
  }

  return files
    .map(
      ([w, b64]) =>
        `@font-face{font-family:'Albert Sans';font-style:normal;font-weight:${w};` +
        `font-display:block;src:url(data:font/ttf;base64,${b64}) format('truetype')}`,
    )
    .join('\n');
}

/* ── render ─────────────────────────────────────────────────────────── */

const css = await faces();
const photo = await band();
const qr = await code();
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const MM = 96 / 25.4; // CSS px per mm

/* Sized by the code, not by the box — the box is whatever the code plus
   its quiet zone comes to. The photograph costs the code a few
   millimetres of height, which is the whole trade between the two cuts.
   Only the photo cut needs a bleed edition; the plain one is white to
   all four edges, so there is nothing for a guillotine to miss. */
for (const [cut, codeMm, bleedMm] of [
  ['photo', 116, 0],
  ['photo', 116, 3],
  ['plain', 125, 0],
]) {
  const boxMm = codeMm / qr.codeRatio;
  const quietMm = (boxMm - codeMm) / 2;
  const wMm = TRIM_W + bleedMm * 2;
  const hMm = TRIM_H + bleedMm * 2;
  const suffix = bleedMm ? `-a4-bleed${bleedMm}` : '-a4';

  const ctx = await browser.newContext({
    viewport: { width: Math.round(wMm * MM), height: Math.round(hMm * MM) },
    deviceScaleFactor: 300 / 96, // …taken to 300dpi
  });
  const page = await ctx.newPage();
  await page.setContent(
    sheet({ cut, qr: qr.svg, boxMm, quietMm, faces: css, photo, bleedMm }),
    { waitUntil: 'load' },
  );
  await page.evaluate(() => document.fonts.ready);

  /* The sheet clips anything past 297mm, so an overrun is silent — it
     shows up as a URL that simply is not on the poster. */
  const overshoot = await page.evaluate(() => {
    const s = document.querySelector('.sheet');
    const body = document.querySelector('.body');
    const room = s.getBoundingClientRect().bottom - parseFloat(getComputedStyle(body).paddingBottom);
    return document.querySelector('.url').getBoundingClientRect().bottom - room;
  });
  if (overshoot > 0.5) {
    throw new Error(`${cut}: content overruns the sheet by ${(overshoot / 3.7795).toFixed(1)}mm`);
  }

  const base = join(OUT, `x-car-show-poster-${cut}${suffix}`);
  /* A bleed edition is for a shop, which wants the PDF. A PNG of it would
     only get printed by hand and trimmed by nobody. */
  if (!bleedMm) {
    await page.screenshot({
      path: `${base}.png`,
      clip: { x: 0, y: 0, width: Math.round(wMm * MM), height: Math.round(hMm * MM) },
    });
  }
  await page.pdf({
    path: `${base}.pdf`,
    width: `${wMm}mm`,
    height: `${hMm}mm`,
    printBackground: true,
  });
  await ctx.close();

  console.log(
    `${cut}${suffix}: ${wMm}×${hMm}mm, code ${codeMm.toFixed(0)}mm (${qr.modules} modules), ` +
      `quiet zone ${(quietMm / (codeMm / qr.modules)).toFixed(1)} modules → ${base}.pdf`,
  );
}

await browser.close();
console.log(`\nEncoded: ${URL_QR}`);
