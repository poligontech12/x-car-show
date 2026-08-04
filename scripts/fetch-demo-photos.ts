/**
 * Real photographs for the demo roster, from Wikimedia Commons.
 *
 * The twelve builds in lib/cars.ts are placeholders standing in for real
 * entrants, and PRODUCT.md is blunt that they must never be presented as
 * real. Dressing them in real photography makes them look a great deal
 * more real, so two things are non-negotiable here:
 *
 *   - Only openly licensed files. Public domain, CC0, CC BY and CC BY-SA
 *     and nothing else; anything whose licence cannot be read is skipped.
 *   - Provenance travels with the picture. Every file downloaded is
 *     recorded with its source page, author and licence in credits.json
 *     and CREDITS.md next to it, so no image in this repo is ever an
 *     anonymous JPEG somebody found.
 *
 * These are other people's cars, photographed by other people. They are
 * development scenery, not the roster.
 *
 *   npm run demo:photos
 *
 * Output lands in demo-photos/, which is git-ignored — seed.ts picks it
 * up if it is there and falls back to generated colour fields if not.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { CARS } from '../lib/cars';
import { CAR_PHOTO_LIMIT } from '../lib/photos';

const API = 'https://commons.wikimedia.org/w/api.php';
const OUT = join(process.cwd(), 'demo-photos');

/** Wikimedia asks for a real one that identifies the tool and its purpose. */
const UA = 'XCarShow-demo-seed/1.0 (https://github.com/poligontech12/x-car-show; dev seed data)';

/**
 * What to ask Commons for. The roster names a car the way its owner would
 * ("Silvia S14"); Commons files it the way a catalogue would.
 */
const QUERY: Record<string, string> = {
  s14: 'Nissan Silvia S14',
  sup: 'Toyota Supra A80',
  e30: 'BMW E30 coupe',
  g2: 'Volkswagen Golf Mk2 GTI',
  d13: 'Dacia 1300',
  aro: 'ARO 24 series',
  mus: 'Ford Mustang 1968 fastback',
  pas: 'Volkswagen Passat B5',
  evo: 'Mitsubishi Lancer Evolution VIII',
  s2: 'Audi S2',
  cam: 'Chevrolet Camaro second generation',
  ek4: 'Honda Civic EK hatchback',
};

/**
 * Everything here may be reused; anything else is not downloaded at all.
 * Compared against a normalised form, because Commons says the same
 * licence as "cc-by-sa-4.0" in one field and "CC BY-SA 4.0" in another.
 */
const ALLOWED = [
  /^cc0/,
  /^cc-by(-sa)?-\d/,
  /^pd(-|$)/,
  /^public-domain/,
  // Commons' own name for a plain attribution licence. It is free to
  // reuse and, as the name says, wants the author credited.
  /^attribution$/,
];

const normaliseLicence = (v: string) =>
  v
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();

/** True only when at least one of the fields Commons fills says so. */
function isReusable(licenceKey: string, shortName: string): boolean {
  return [licenceKey, shortName]
    .map(normaliseLicence)
    .filter(Boolean)
    .some((value) => ALLOWED.some((re) => re.test(value)));
}

interface Credit {
  carId: string;
  file: string;
  title: string;
  sourcePage: string;
  author: string;
  licence: string;
  licenceUrl: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Commons is a donated service and answers 429 when leaned on. Requests
 * go out one at a time with a gap between them, and a refusal is waited
 * out rather than retried immediately — their Retry-After if they sent
 * one, a widening backoff if they did not.
 */
async function polite(url: string, attempt = 0): Promise<Response> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (res.status !== 429 || attempt >= 4) return res;

  const after = Number(res.headers.get('retry-after'));
  const wait = Number.isFinite(after) && after > 0 ? after * 1000 : 2000 * 2 ** attempt;
  if (process.env.DEBUG_PHOTOS) console.log(`      429 — waiting ${wait}ms`);
  await sleep(wait);
  return polite(url, attempt + 1);
}

const stripHtml = (v: string) =>
  v
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

async function api(params: Record<string, string>): Promise<Record<string, unknown>> {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await polite(url);
  if (!res.ok) throw new Error(`Commons answered ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

interface Candidate {
  title: string;
  thumb: string;
  descriptionUrl: string;
  author: string;
  licence: string;
  licenceUrl: string;
  width: number;
  height: number;
}

async function search(term: string): Promise<Candidate[]> {
  const data = (await api({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: term,
    gsrlimit: '24',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size|mime',
    iiurlwidth: '1600',
  })) as { query?: { pages?: Record<string, Record<string, unknown>> } };

  const pages = Object.values(data.query?.pages ?? {});
  const out: Candidate[] = [];
  const trace = (why: string, title: unknown) => {
    if (process.env.DEBUG_PHOTOS) console.log(`      skip ${why}: ${String(title).slice(0, 60)}`);
  };

  for (const page of pages) {
    const info = (page.imageinfo as Record<string, unknown>[] | undefined)?.[0];
    if (!info) {
      trace('no imageinfo', page.title);
      continue;
    }
    if (info.mime !== 'image/jpeg') {
      trace(`mime ${info.mime}`, page.title);
      continue;
    }

    const meta = (info.extmetadata ?? {}) as Record<string, { value?: string }>;
    const licence = stripHtml(meta.LicenseShortName?.value ?? '');
    const key = stripHtml(meta.License?.value ?? '');
    if (!licence || !isReusable(key, licence)) {
      trace(`licence "${key || licence}"`, page.title);
      continue;
    }

    const width = Number(info.width ?? 0);
    const height = Number(info.height ?? 0);
    // Landscape and big enough to fill a phone screen; the roster is a
    // full-bleed deck and a portrait crop of a car reads as a mistake.
    // Landscape, and sharp enough that a full-bleed deck does not show it
    // being stretched. The upper bound is Commons failing to render a
    // thumbnail for its very largest originals.
    if (width < 1000 || height < 600 || width / height < 1.2 || width / height > 3) {
      trace(`size ${width}x${height}`, page.title);
      continue;
    }

    out.push({
      title: String(page.title ?? ''),
      thumb: String(info.thumburl ?? info.url ?? ''),
      descriptionUrl: String(info.descriptionurl ?? ''),
      author: stripHtml(meta.Artist?.value ?? '') || 'Necunoscut',
      licence,
      licenceUrl: stripHtml(meta.LicenseUrl?.value ?? ''),
      width,
      height,
    });
  }
  return out;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const credits: Credit[] = [];

  for (const car of CARS) {
    const term = QUERY[car.id];
    if (!term) continue;

    let found: Candidate[] = [];
    try {
      found = await search(term);
    } catch (error) {
      console.warn(`${car.id}: search failed (${(error as Error).message}) — skipping.`);
      continue;
    }

    let slot = 0;
    for (const candidate of found) {
      if (slot >= CAR_PHOTO_LIMIT) break;
      const note = (why: string) => {
        if (process.env.DEBUG_PHOTOS) console.log(`      drop ${why}: ${candidate.title.slice(0, 56)}`);
      };
      try {
        await sleep(350);
        const res = await polite(candidate.thumb);
        if (!res.ok) {
          note(`http ${res.status}`);
          continue;
        }
        const input = Buffer.from(await res.arrayBuffer());

        /**
         * Re-encoded rather than saved as it arrived: this bounds the
         * file, strips whatever metadata the camera left in it, and means
         * nothing downloaded is ever written to disk in its original form.
         */
        /**
         * 1200px wide, because these are committed and git keeps every
         * byte forever. The app draws inside a 390pt phone frame, so
         * 1200 is already three times what any screen can show it at —
         * anything larger is repository weight nobody ever sees.
         */
        const bytes = await sharp(input, { failOn: 'error', limitInputPixels: 40_000_000 })
          .rotate()
          .resize({ width: 1200, height: 800, fit: 'cover', position: 'centre' })
          .jpeg({ quality: 74, mozjpeg: true })
          .toBuffer();
        if (bytes.length > 900_000) {
          note(`${Math.round(bytes.length / 1024)}kB`);
          continue;
        }

        const file = `${car.id}-${slot}.jpg`;
        await writeFile(join(OUT, file), bytes);
        credits.push({
          carId: car.id,
          file,
          title: candidate.title,
          sourcePage: candidate.descriptionUrl,
          author: candidate.author,
          licence: candidate.licence,
          licenceUrl: candidate.licenceUrl,
        });
        slot++;
      } catch (error) {
        // A file that will not decode is not worth chasing; there are more.
        note((error as Error).message.slice(0, 40));
      }
    }
    console.log(`${car.id.padEnd(4)} ${String(slot).padStart(2)} photo(s)  ← ${term}`);
  }

  await writeFile(join(OUT, 'credits.json'), `${JSON.stringify(credits, null, 2)}\n`);

  const lines = [
    '# Demo photograph credits',
    '',
    'Development scenery only. These are other people’s cars, photographed',
    'by other people, standing in for the placeholder roster in `lib/cars.ts`.',
    'They are not entries in X Car Show and must never be shown as such.',
    '',
    'Every file below is reused under the licence named against it. CC BY and',
    'CC BY-SA require the author to be credited wherever the image is shown —',
    'including in a screenshot or a slide.',
    '',
    '| File | Car | Author | Licence | Source |',
    '| --- | --- | --- | --- | --- |',
    ...credits.map(
      (c) =>
        `| \`${c.file}\` | ${c.carId} | ${c.author} | [${c.licence}](${c.licenceUrl}) | [Commons](${c.sourcePage}) |`,
    ),
    '',
  ];
  await writeFile(join(OUT, 'CREDITS.md'), lines.join('\n'));

  console.log(`\n${credits.length} photographs in demo-photos/, credited in CREDITS.md.`);
  console.log('Openly licensed, but CC BY / CC BY-SA still want the author named on show.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
