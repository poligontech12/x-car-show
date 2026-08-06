/**
 * The roster. Twelve builds modelled end to end against the 142-car
 * entry list — JDM, German, muscle, stance, off-road, and the Dacia/ARO
 * classics that actually turn up in Bucovina.
 *
 * Part names, engine codes and manufacturer paint names stay as the
 * trade writes them; everything a person reads as a sentence is Romanian.
 */

import type { CarPhoto } from './photos';

export type CarClass = 'JDM' | 'Germane' | 'Muscle' | 'Clasice' | 'Stance' | 'Off-road';

export type ModCategory = 'Motor' | 'Suspensie' | 'Jante' | 'Exterior' | 'Interior';

export interface ModGroup {
  name: ModCategory;
  items: string[];
}

export interface Car {
  id: string;
  /** Entry number. Also the number printed on the windshield card. */
  no: string;
  year: number;
  make: string;
  model: string;
  cls: CarClass;
  engine: string;
  power: string;
  tq: string;
  weight: string;
  drive: 'FWD' | 'RWD' | 'AWD' | '4WD';
  gbox: string;
  wheels: string;
  paint: string;
  stand: string;
  owner: string;
  town: string;
  handle: string;
  followers: string;
  /** What the owner calls it. Printed on the card under the headline. */
  nickname?: string;
  /** The owner's own photograph, if they have added one. */
  ownerImage?: string;
  /** Where the owner sends people. Handles, not URLs — we build the link. */
  instagram?: string;
  facebook?: string;
  /** True for an entry a member registered themselves, rather than seed data. */
  mine?: boolean;
  /**
   * Uploaded photographs, by slot. Absent on the modelled builds below,
   * which have never had any — the screens show an empty well for those.
   */
  photos?: CarPhoto[];
  /** Year this car took car of the show, if it ever has. */
  win: string | null;
  mods: ModGroup[];
  story: string;
}

const mods = (groups: [ModCategory, string[]][]): ModGroup[] =>
  groups.map(([name, items]) => ({ name, items }));

export const CARS: Car[] = [
  {
    id: 's14',
    no: '14',
    year: 1998,
    make: 'Nissan',
    model: 'Silvia S14',
    cls: 'JDM',
    engine: 'SR20DET 2.0 turbo',
    power: '412',
    tq: '480',
    weight: '1240',
    drive: 'RWD',
    gbox: '5MT · diferențial 1.5W',
    wheels: 'Work Meister S1 3P',
    paint: 'Bayside Blue',
    stand: 'A-14',
    owner: 'Andrei Moroșanu',
    town: 'Suceava',
    handle: 'andrei.s14',
    followers: '218',
    nickname: 'Kouki',
    win: null,
    mods: mods([
      [
        'Motor',
        [
          'Turbină GT2871R, 1.06 A/R',
          'Tomei Poncam 260°',
          'ECU standalone Link G4X',
          'Intercooler frontal 600×300',
        ],
      ],
      ['Suspensie', ['Coilovere BC Racing ER', 'Kit unghi Wisefab', 'Cușcă demontabilă în 6 puncte']],
      ['Jante', ['Work Meister S1 3P 18×9.5 / 18×10.5', 'Nankang NS-2R 235/265']],
      ['Exterior', ['Bară față BN Sports', 'Eleron Origin ducktail', 'Revopsită în Bayside Blue']],
    ]),
    story:
      'Am luat-o de la un tip din Iași în 2019. SR-ul ars, jumătate de cușcă și un portbagaj plin cu chitanțele altcuiva.\n\nDouă ierni într-un garaj neîncălzit ca să meargă cum trebuie. Motorul l-am asamblat de trei ori. Tata încă crede că am cumpărat o epavă, și optsprezece luni a avut dreptate.\n\nNu e mașină de remorcă. O conduc prin Bucovina și înapoi, iar vopseaua e Bayside Blue pentru că nu mi-am permis R34-ul căruia îi aparține culoarea.',
  },
  {
    id: 'sup',
    no: '22',
    year: 1994,
    make: 'Toyota',
    model: 'Supra MK4',
    cls: 'JDM',
    engine: '2JZ-GTE 3.0 twin turbo',
    power: '620',
    tq: '760',
    weight: '1560',
    drive: 'RWD',
    gbox: '6MT GETRAG',
    wheels: 'Volk TE37 18"',
    paint: 'Renaissance Red',
    stand: 'A-22',
    owner: 'Răzvan P.',
    town: 'Botoșani',
    handle: 'razvan2jz',
    followers: '640',
    win: '2022',
    mods: mods([
      ['Motor', ['Precision 6466', 'Bloc motor forjat', 'Conversie E85']],
      ['Suspensie', ['KW V3', 'Bară de rigidizare față']],
      ['Jante', ['Volk TE37 18×10', 'Michelin PS4S']],
      ['Exterior', ['Buză față Ridox', 'Eleron TRD ducktail']],
    ]),
    story:
      'Adusă din Japonia în 2016 cu 190.000 km și evacuare de serie. N-a mai fost de serie din drumul de întoarcere de la Constanța.',
  },
  {
    id: 'e30',
    no: '07',
    year: 1989,
    make: 'BMW',
    model: 'E30 325i',
    cls: 'Germane',
    engine: 'M50B25 swap 2.5',
    power: '240',
    tq: '285',
    weight: '1180',
    drive: 'RWD',
    gbox: '5MT · diferențial 3.46',
    wheels: 'BBS RS 16"',
    paint: 'Alpinweiss II',
    stand: 'B-07',
    owner: 'Tudor V.',
    town: 'Rădăuți',
    handle: 'tudor.e30',
    followers: '312',
    win: '2023',
    mods: mods([
      ['Motor', ['Swap M50B25, OBD1', 'Clapete individuale', 'Galerie pe comandă']],
      ['Suspensie', ['Bilstein B14', 'Plăci camber față']],
      ['Jante', ['BBS RS 16×8 / 16×9', 'Centre refăcute în auriu']],
      ['Exterior', ['Kit Mtech I', 'Bare euro, ornamente scoase']],
    ]),
    story:
      'Șaisprezece ani în aceeași familie. Unchiul meu mergea cu ea în Germania la muncă în fiecare vară; eu i-am pus clapete individuale și i-am stricat consumul pe vecie.',
  },
  {
    id: 'g2',
    no: '31',
    year: 1991,
    make: 'Volkswagen',
    model: 'Golf Mk2 GTI',
    cls: 'Germane',
    engine: '1.8 16V turbo',
    power: '285',
    tq: '340',
    weight: '980',
    drive: 'FWD',
    gbox: '5MT · QUAIFE',
    wheels: 'BBS RM 15"',
    paint: 'Tornado Red',
    stand: 'B-31',
    owner: 'Ciprian L.',
    town: 'Fălticeni',
    handle: 'ciprian.16v',
    followers: '188',
    win: null,
    mods: mods([
      ['Motor', ['GT3071R', 'Biele forjate, 8.5:1', 'Injecție apă/metanol']],
      ['Suspensie', ['Coilovere, coborâtă 60mm', 'Bucșe punte spate']],
      ['Jante', ['BBS RM 15×7', 'Federal 595 semi-slick']],
      ['Interior', ['Recaro Pole Position', 'Ceas de presiune în grilă']],
    ]),
    story:
      'Sub o tonă, fără tracțiune, iar volanul încearcă să-ți fugă din mâini în treapta a doua. Cei mai bine cheltuiți bani din viața mea.',
  },
  {
    id: 'd13',
    no: '01',
    year: 1978,
    make: 'Dacia',
    model: '1300',
    cls: 'Clasice',
    engine: '1.4 8V carburator',
    power: '96',
    tq: '128',
    weight: '900',
    drive: 'RWD',
    gbox: '4MT',
    wheels: 'Jante tablă 13"',
    paint: 'Alb polar',
    stand: 'C-01',
    owner: 'Mihai B.',
    town: 'Cajvana',
    handle: 'mihai1300',
    followers: '890',
    win: '2024',
    mods: mods([
      ['Motor', ['Două carburatoare Weber 40 DCOE', 'Chiulasă prelucrată', 'Galerie inox']],
      ['Suspensie', ['Coborâtă 40mm', 'Amortizoare întărite']],
      ['Exterior', ['Vopsea originală, păstrată', 'Grilă 1310 de epocă']],
      ['Interior', ['Retapițată în material original', 'Radio de epocă, funcțional']],
    ]),
    story:
      'Bunicul meu a stat unsprezece luni la coadă pentru mașina asta în 1978 și n-a lăsat pe nimeni altcineva s-o conducă. Acum o conduc eu. Carburatoarele Weber sunt singura minciună de pe ea.',
  },
  {
    id: 'aro',
    no: '44',
    year: 1985,
    make: 'ARO',
    model: '244',
    cls: 'Off-road',
    engine: '2.5 turbodiesel',
    power: '138',
    tq: '320',
    weight: '1820',
    drive: '4WD',
    gbox: '4MT + reductor',
    wheels: 'Tablă 16" beadlock',
    paint: 'Verde militar',
    stand: 'D-44',
    owner: 'George T.',
    town: 'Gura Humorului',
    handle: 'aro.carpatin',
    followers: '274',
    win: null,
    mods: mods([
      ['Motor', ['Swap Toyota 2L-TE', 'Intercooler', 'Snorkel']],
      ['Suspensie', ['Arcuri +3 inch', 'Amortizoare cu cursă lungă']],
      ['Jante', ['Anvelope M/T 33"', 'Beadlock față și spate']],
      ['Exterior', ['Bară cu troliu', 'Portbagaj de plafon, roata de rezervă în spate']],
    ]),
    story:
      'Merge oriunde și ajunge târziu. Arcurile noi l-au făcut cu 3 cm mai înalt și acum nu mai intră în garaj, ceea ce soția mea consideră un defect de proiectare.',
  },
  {
    id: 'mus',
    no: '66',
    year: 1968,
    make: 'Ford',
    model: 'Mustang Fastback',
    cls: 'Muscle',
    engine: '302 V8',
    power: '340',
    tq: '440',
    weight: '1420',
    drive: 'RWD',
    gbox: '4MT TOPLOADER',
    wheels: 'Torq Thrust 15"',
    paint: 'Highland Green',
    stand: 'C-66',
    owner: 'Florin A.',
    town: 'Suceava',
    handle: 'florin.fastback',
    followers: '520',
    win: null,
    mods: mods([
      ['Motor', ['Motor 302 refăcut, 10:1', 'Edelbrock Performer', 'Galerii lungi']],
      ['Suspensie', ['Shelby drop', 'Conversie frâne disc față']],
      ['Jante', ['American Racing Torq Thrust 15×7']],
      ['Exterior', ['Revopsită la metal', 'Dungi GT trasate manual']],
    ]),
    story:
      'Adusă din Ohio într-un container în 2011. Tot ce e dedesubt e nou; tot ce se vede e exact cum a ieșit din fabrică.',
  },
  {
    id: 'pas',
    no: '19',
    year: 2003,
    make: 'Volkswagen',
    model: 'Passat B5.5',
    cls: 'Stance',
    engine: '1.8T AUM',
    power: '210',
    tq: '290',
    weight: '1420',
    drive: 'FWD',
    gbox: '5MT',
    wheels: 'Rotiform 19"',
    paint: 'Deep Black',
    stand: 'B-19',
    owner: 'Alex C.',
    town: 'Vatra Dornei',
    handle: 'alex.bagged',
    followers: '160',
    win: null,
    mods: mods([
      [
        'Suspensie',
        ['Air Lift Performance 3P', 'Punte spate decupată', 'Amortizoare spate pe comandă'],
      ],
      ['Jante', ['Rotiform 19×9.5 ET35', 'Anvelope întinse 215/35']],
      ['Exterior', ['Compartiment motor netezit', 'Sigle scoase']],
      ['Interior', ['Rezervor și management în portbagaj, îmbrăcate în fibră']],
    ]),
    story:
      'Lumea zice că mașinile pe perne nu merg. A mea face 900 km până în Polonia și înapoi pe înălțimea 3, și stă lipită de asfalt când ajunge acolo.',
  },
  {
    id: 'evo',
    no: '09',
    year: 2005,
    make: 'Mitsubishi',
    model: 'Lancer Evo VIII',
    cls: 'JDM',
    engine: '4G63T 2.0 turbo',
    power: '465',
    tq: '560',
    weight: '1410',
    drive: 'AWD',
    gbox: '5MT · ACD',
    wheels: 'Enkei RPF1 17"',
    paint: 'Rosso Corsa wrap',
    stand: 'A-09',
    owner: 'Daniel S.',
    town: 'Suceava',
    handle: 'dani.evo8',
    followers: '405',
    win: null,
    mods: mods([
      ['Motor', ['Turbină FP Black', 'Motor 2.0 forjat', 'E85, flex fuel']],
      ['Suspensie', ['Ohlins Road & Track', 'Bare antiruliu Whiteline']],
      ['Jante', ['Enkei RPF1 17×9', 'Semi-slick pentru probele pe asfalt']],
      ['Interior', ['Frână de mână hidraulică', 'Stație radio, nefolosită']],
    ]),
    story:
      'Jumătate mașină de raliu, jumătate mașină de zi cu zi. A urcat pe Transfăgărășan de mai multe ori decât majoritatea turiștilor și încă are scaunele originale.',
  },
  {
    id: 's2',
    no: '12',
    year: 1994,
    make: 'Audi',
    model: 'S2 Coupé',
    cls: 'Germane',
    engine: '3B 2.2 20V turbo',
    power: '380',
    tq: '480',
    weight: '1470',
    drive: 'AWD',
    gbox: '6MT 01E',
    wheels: 'Speedline 17"',
    paint: 'RS Green',
    stand: 'B-12',
    owner: 'Bogdan N.',
    town: 'Rădăuți',
    handle: 'bogdan.s2',
    followers: '233',
    win: null,
    mods: mods([
      ['Motor', ['Turbină hibrid K26/28', 'Intercooler frontal mare', 'ECU standalone']],
      ['Suspensie', ['Coilovere H&R', 'Bucșe schimbate']],
      ['Jante', ['Speedline Mistral 17×8']],
      ['Exterior', ['Oglinzi RS2', 'Revopsită integral în RS green']],
    ]),
    story: 'Cinci cilindri, o turbină cât pumnul și cel mai frumos sunet din tot show-ul.',
  },
  {
    id: 'cam',
    no: '55',
    year: 1979,
    make: 'Chevrolet',
    model: 'Camaro Z28',
    cls: 'Muscle',
    engine: '5.7 V8 small block',
    power: '355',
    tq: '500',
    weight: '1600',
    drive: 'RWD',
    gbox: '3AT',
    wheels: 'Cragar 15"',
    paint: 'Hugger Orange',
    stand: 'C-55',
    owner: 'Sorin M.',
    town: 'Suceava',
    handle: 'sorin.z28',
    followers: '198',
    win: null,
    mods: mods([
      ['Motor', ['Motor 350 refăcut', 'Carburator Holley 750', 'Tobe Flowmaster 40']],
      ['Suspensie', ['Distanțiere spate', 'Bucșe poliuretan']],
      ['Jante', ['Cragar S/S 15×8']],
      ['Exterior', ['Revopsită în Hugger Orange original']],
    ]),
    story: 'Face unsprezece litri la sută dacă sunt blând și nu sunt niciodată blând.',
  },
  {
    id: 'ek4',
    no: '38',
    year: 1996,
    make: 'Honda',
    model: 'Civic EK4',
    cls: 'JDM',
    engine: 'B18C swap 1.8',
    power: '210',
    tq: '190',
    weight: '1010',
    drive: 'FWD',
    gbox: '5MT · diferențial blocabil',
    wheels: 'Mugen MF10 15"',
    paint: 'Milano Red',
    stand: 'A-38',
    owner: 'Andrei Moroșanu',
    town: 'Suceava',
    handle: 'andrei.s14',
    followers: '96',
    win: null,
    mods: mods([
      ['Motor', ['Swap B18C, clapete individuale', 'Hondata K-Pro', 'Galerie 4-1']],
      ['Suspensie', ['Amortizoare spec Spoon', 'Bară de rigidizare spate']],
      ['Jante', ['Mugen MF10 15×7', 'Yokohama A052']],
      ['Interior', ['Scaune Bride Zieg', 'Semi-cușcă']],
    ]),
    story:
      'Mașina de circuit. Fără radio, fără mochetă, fără vreun motiv s-o am în afară de faptul că e cel mai rapid lucru al meu prin Adâncata.',
  },
];


/** Full entry list size. Only the first page is modelled. */
export const ROSTER_TOTAL = 142;

export const byId = (id: string | undefined): Car => CARS.find((c) => c.id === id) ?? CARS[0];

/**
 * Some models already start with the year-ish numeral (DACIA 1300),
 * which reads as a stray number on a card. Prefix the make in that case.
 */
export const displayModel = (c: Car): string =>
  /^[0-9]/.test(c.model) ? `${c.make} ${c.model}` : c.model;

/**
 * Joined rather than interpolated, because any of the three can be
 * missing: a car registered under one word has no make, and one nobody
 * has dated has no year — and `${0} ${''} Nissan` reads as "0  Nissan".
 */
export const headline = (c: Car): string =>
  [c.year || null, c.make, c.model].filter(Boolean).join(' ');

export const modCount = (c: Car): number => c.mods.reduce((a, g) => a + g.items.length, 0);

/** Stand A-14 is in paddock A. The letter is the paddock. */
export const paddockOf = (c: Car): string => c.stand.split('-')[0];

/**
 * The public origin, inlined at build time. Every printed QR code encodes
 * a URL built from this, so changing it after cards are printed kills
 * every card already out there — see DEPLOY.md.
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

/** How the origin reads on a printed card: no scheme, no trailing slash. */
export const SITE_HOST = SITE_ORIGIN.replace(/^https?:\/\//, '');

/** Where a scanned card lands. Printed as a QR on every windshield card. */
export const carUrl = (c: Car, origin = SITE_ORIGIN): string => `${origin}/car/${c.id}`;

export interface Standing {
  id: string;
  car: Car;
  pos: number;
  votes: number;
  pct: number;
  /** One of the viewer's own picks. */
  mine: boolean;
}

/**
 * Car of the show, as it stands. Every entry is on the board, because the
 * board is also the ballot — a car with no votes yet still has to be
 * tappable, or nobody could ever cast the first one.
 */
export function standings(
  cars: Car[],
  tally: Record<string, number>,
  myVotes: string[],
): Standing[] {
  const total = Object.values(tally).reduce((a, n) => a + n, 0);

  return cars
    .map((car) => ({ id: car.id, car, votes: tally[car.id] ?? 0 }))
    .sort(
      (a, b) =>
        b.votes - a.votes ||
        displayModel(a.car).localeCompare(displayModel(b.car), 'ro'),
    )
    .map((r, i) => ({
      ...r,
      pos: i + 1,
      pct: total ? Math.round((r.votes / total) * 100) : 0,
      mine: myVotes.includes(r.id),
    }));
}

/** How many votes are in, said plainly. */
export const votesCastLabel = (tally: Record<string, number>): string => {
  const n = Object.values(tally).reduce((a, v) => a + v, 0);
  if (!n) return 'Niciun vot încă. Fii primul.';
  return n === 1 ? 'Un vot până acum.' : `${n} de voturi până acum.`;
};

/**
 * An entry a member registered. The number and the stand are assigned by
 * marshals on the day, so a fresh registration carries neither — the UI
 * says "pending" rather than inventing one.
 */
export const BLANK_CAR: Omit<Car, 'id' | 'model' | 'make' | 'year'> = {
  no: '',
  cls: 'JDM',
  engine: '',
  power: '',
  tq: '',
  weight: '',
  drive: 'RWD',
  gbox: '',
  wheels: '',
  paint: '',
  stand: '',
  owner: '',
  town: '',
  handle: '',
  followers: '0',
  win: null,
  mods: [],
  story: '',
  mine: true,
};

/** Everyone who shows a car, derived from the entries themselves. */
export interface OwnerProfile {
  handle: string;
  name: string;
  town: string;
  image?: string;
  instagram?: string;
  facebook?: string;
  cars: Car[];
}

export function ownerOf(handle: string, all: Car[]): OwnerProfile | null {
  const cars = all.filter((c) => c.handle && c.handle === handle);
  if (!cars.length) return null;
  const [first] = cars;
  return {
    handle,
    name: first.owner,
    town: first.town,
    image: first.ownerImage,
    instagram: first.instagram,
    facebook: first.facebook,
    cars,
  };
}

/** A handle typed with or without the @, turned into a real link. */
export const socialUrl = (network: 'instagram' | 'facebook', handle: string) =>
  `https://${network}.com/${handle.replace(/^@+/, '').trim()}`;
