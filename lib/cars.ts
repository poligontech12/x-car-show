/**
 * The roster. Twelve builds modelled end to end against the
 * 142-car entry list — JDM, German, muscle, stance, off-road,
 * and the Dacia/ARO classics that actually turn up in Bucovina.
 */

export type CarClass =
  | 'JDM'
  | 'GERMAN'
  | 'MUSCLE'
  | 'CLASSIC'
  | 'STANCE'
  | 'OFF-ROAD';

export type ModCategory = 'ENGINE' | 'SUSPENSION' | 'WHEELS' | 'EXTERIOR' | 'INTERIOR';

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
  /** Year this car took Car of the Show, if it ever has. */
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
    make: 'NISSAN',
    model: 'SILVIA S14',
    cls: 'JDM',
    engine: 'SR20DET 2.0 TURBO',
    power: '412',
    tq: '480',
    weight: '1240',
    drive: 'RWD',
    gbox: '5MT · 1.5W LSD',
    wheels: 'WORK MEISTER S1 3P',
    paint: 'BAYSIDE BLUE',
    stand: 'A-14',
    owner: 'ANDREI MOROȘANU',
    town: 'SUCEAVA',
    handle: 'andrei.s14',
    followers: '218',
    nickname: 'KOUKI',
    win: null,
    mods: mods([
      [
        'ENGINE',
        ['GT2871R turbo, 1.06 A/R', 'Tomei Poncam 260°', 'Link G4X standalone', '600×300 front-mount'],
      ],
      ['SUSPENSION', ['BC Racing ER coilovers', 'Wisefab lock kit', '6-point bolt-in cage']],
      ['WHEELS', ['Work Meister S1 3P 18×9.5 / 18×10.5', 'Nankang NS-2R 235/265']],
      ['EXTERIOR', ['BN Sports front bar', 'Origin ducktail', 'Bayside Blue respray']],
    ]),
    story:
      'Bought it off a guy in Iași in 2019. Blown SR, half a cage, and a boot full of somebody else’s receipts.\n\nTwo winters in a garage with no heating to get it running right. The engine went together three times. My father still thinks I bought a wreck, and for eighteen months he was correct.\n\nIt is not a trailer queen. I drive it to Bucovina and back, and the paint is Bayside Blue because I could not afford the R34 the colour belongs on.',
  },
  {
    id: 'sup',
    no: '22',
    year: 1994,
    make: 'TOYOTA',
    model: 'SUPRA MK4',
    cls: 'JDM',
    engine: '2JZ-GTE 3.0 TWIN TURBO',
    power: '620',
    tq: '760',
    weight: '1560',
    drive: 'RWD',
    gbox: '6MT GETRAG',
    wheels: 'VOLK TE37 18"',
    paint: 'RENAISSANCE RED',
    stand: 'A-22',
    owner: 'RĂZVAN P.',
    town: 'BOTOȘANI',
    handle: 'razvan2jz',
    followers: '640',
    win: '2022',
    mods: mods([
      ['ENGINE', ['Precision 6466', 'Built bottom end', 'E85 conversion']],
      ['SUSPENSION', ['KW V3', 'Front strut brace']],
      ['WHEELS', ['Volk TE37 18×10', 'Michelin PS4S']],
      ['EXTERIOR', ['Ridox front lip', 'TRD ducktail']],
    ]),
    story:
      'Imported from Japan in 2016 with 190,000 km and a stock exhaust. It has not been stock since the drive home from Constanța.',
  },
  {
    id: 'e30',
    no: '07',
    year: 1989,
    make: 'BMW',
    model: 'E30 325i',
    cls: 'GERMAN',
    engine: 'M50B25 SWAP 2.5',
    power: '240',
    tq: '285',
    weight: '1180',
    drive: 'RWD',
    gbox: '5MT · 3.46 LSD',
    wheels: 'BBS RS 16"',
    paint: 'ALPINWEISS II',
    stand: 'B-07',
    owner: 'TUDOR V.',
    town: 'RĂDĂUȚI',
    handle: 'tudor.e30',
    followers: '312',
    win: '2023',
    mods: mods([
      ['ENGINE', ['M50B25 swap, OBD1', 'Individual throttle bodies', 'Custom manifold']],
      ['SUSPENSION', ['Bilstein B14', 'Front camber plates']],
      ['WHEELS', ['BBS RS 16×8 / 16×9', 'Refinished gold centres']],
      ['EXTERIOR', ['Mtech I kit', 'Euro bumpers, deleted trim']],
    ]),
    story:
      'Sixteen years in the same family. My uncle drove it to Germany for work every summer; I put ITBs on it and ruined his fuel economy forever.',
  },
  {
    id: 'g2',
    no: '31',
    year: 1991,
    make: 'VOLKSWAGEN',
    model: 'GOLF MK2 GTI',
    cls: 'GERMAN',
    engine: '1.8 16V TURBO',
    power: '285',
    tq: '340',
    weight: '980',
    drive: 'FWD',
    gbox: '5MT · QUAIFE',
    wheels: 'BBS RM 15"',
    paint: 'TORNADO RED',
    stand: 'B-31',
    owner: 'CIPRIAN L.',
    town: 'FĂLTICENI',
    handle: 'ciprian.16v',
    followers: '188',
    win: null,
    mods: mods([
      ['ENGINE', ['GT3071R', 'Forged rods, 8.5:1', 'Water/meth injection']],
      ['SUSPENSION', ['Coilovers, 60mm drop', 'Rear beam bushings']],
      ['WHEELS', ['BBS RM 15×7', 'Federal 595 semis']],
      ['INTERIOR', ['Recaro Pole Position', 'Boost gauge in vent']],
    ]),
    story:
      'Under a tonne, no traction, and the steering wheel tries to leave your hands in second gear. Best money I ever spent.',
  },
  {
    id: 'd13',
    no: '01',
    year: 1978,
    make: 'DACIA',
    model: '1300',
    cls: 'CLASSIC',
    engine: '1.4 8V CARBURETTOR',
    power: '96',
    tq: '128',
    weight: '900',
    drive: 'RWD',
    gbox: '4MT',
    wheels: 'STEELIES 13"',
    paint: 'ALB POLAR',
    stand: 'C-01',
    owner: 'MIHAI B.',
    town: 'CAJVANA',
    handle: 'mihai1300',
    followers: '890',
    win: '2024',
    mods: mods([
      ['ENGINE', ['Twin Weber 40 DCOE', 'Ported head', 'Stainless manifold']],
      ['SUSPENSION', ['Lowered 40mm', 'Uprated dampers']],
      ['EXTERIOR', ['Original paint, preserved', 'Period-correct 1310 grille']],
      ['INTERIOR', ['Retrimmed in original vinyl', 'Period radio, works']],
    ]),
    story:
      'My grandfather queued eleven months for this car in 1978 and never let anyone else drive it. Now I drive it. The Webers are the only lie on it.',
  },
  {
    id: 'aro',
    no: '44',
    year: 1985,
    make: 'ARO',
    model: '244',
    cls: 'OFF-ROAD',
    engine: '2.5 TURBODIESEL',
    power: '138',
    tq: '320',
    weight: '1820',
    drive: '4WD',
    gbox: '4MT + LOW RANGE',
    wheels: 'STEEL 16" BEADLOCK',
    paint: 'VERDE MILITAR',
    stand: 'D-44',
    owner: 'GEORGE T.',
    town: 'GURA HUMORULUI',
    handle: 'aro.carpatin',
    followers: '274',
    win: null,
    mods: mods([
      ['ENGINE', ['Toyota 2L-TE swap', 'Intercooled', 'Snorkel']],
      ['SUSPENSION', ['+3 inch leaf packs', 'Long-travel shocks']],
      ['WHEELS', ['33" mud terrains', 'Beadlocks front and rear']],
      ['EXTERIOR', ['Winch bumper', 'Roof rack, spare on the back']],
    ]),
    story:
      'It goes anywhere and arrives late. New leaf packs put it 3cm taller and now it does not fit in my garage, which my wife considers a design flaw.',
  },
  {
    id: 'mus',
    no: '66',
    year: 1968,
    make: 'FORD',
    model: 'MUSTANG FASTBACK',
    cls: 'MUSCLE',
    engine: '302 V8',
    power: '340',
    tq: '440',
    weight: '1420',
    drive: 'RWD',
    gbox: '4MT TOPLOADER',
    wheels: 'TORQ THRUST 15"',
    paint: 'HIGHLAND GREEN',
    stand: 'C-66',
    owner: 'FLORIN A.',
    town: 'SUCEAVA',
    handle: 'florin.fastback',
    followers: '520',
    win: null,
    mods: mods([
      ['ENGINE', ['302 rebuild, 10:1', 'Edelbrock Performer', 'Long-tube headers']],
      ['SUSPENSION', ['Shelby drop', 'Front disc conversion']],
      ['WHEELS', ['American Racing Torq Thrust 15×7']],
      ['EXTERIOR', ['Bare-metal respray', 'GT stripes, hand-laid']],
    ]),
    story:
      'Shipped from Ohio in a container in 2011. Everything under it is new; everything you can see is exactly as it left the factory.',
  },
  {
    id: 'pas',
    no: '19',
    year: 2003,
    make: 'VOLKSWAGEN',
    model: 'PASSAT B5.5',
    cls: 'STANCE',
    engine: '1.8T AUM',
    power: '210',
    tq: '290',
    weight: '1420',
    drive: 'FWD',
    gbox: '5MT',
    wheels: 'ROTIFORM 19"',
    paint: 'DEEP BLACK',
    stand: 'B-19',
    owner: 'ALEX C.',
    town: 'VATRA DORNEI',
    handle: 'alex.bagged',
    followers: '160',
    win: null,
    mods: mods([
      ['SUSPENSION', ['Air Lift Performance 3P', 'Notched subframe', 'Custom rear struts']],
      ['WHEELS', ['Rotiform 19×9.5 ET35', 'Stretched 215/35']],
      ['EXTERIOR', ['Smoothed bay', 'Deleted badges']],
      ['INTERIOR', ['Tank and management in boot, glassed in']],
    ]),
    story:
      'People say bagged cars do not drive. Mine does 900 km to Poland and back at ride height 3, and parks flat on the floor when it gets there.',
  },
  {
    id: 'evo',
    no: '09',
    year: 2005,
    make: 'MITSUBISHI',
    model: 'LANCER EVO VIII',
    cls: 'JDM',
    engine: '4G63T 2.0 TURBO',
    power: '465',
    tq: '560',
    weight: '1410',
    drive: 'AWD',
    gbox: '5MT · ACD',
    wheels: 'ENKEI RPF1 17"',
    paint: 'ROSSO CORSA WRAP',
    stand: 'A-09',
    owner: 'DANIEL S.',
    town: 'SUCEAVA',
    handle: 'dani.evo8',
    followers: '405',
    win: null,
    mods: mods([
      ['ENGINE', ['FP Black turbo', 'Built 2.0', 'E85, flex fuel']],
      ['SUSPENSION', ['Ohlins Road & Track', 'Whiteline sway bars']],
      ['WHEELS', ['Enkei RPF1 17×9', 'Semi-slicks for tarmac stages']],
      ['INTERIOR', ['Hydraulic handbrake', 'Intercom, unused']],
    ]),
    story:
      'Half rally car, half daily. It has been up Transfăgărășan more times than most tourists and it still has the original seats.',
  },
  {
    id: 's2',
    no: '12',
    year: 1994,
    make: 'AUDI',
    model: 'S2 COUPÉ',
    cls: 'GERMAN',
    engine: '3B 2.2 20V TURBO',
    power: '380',
    tq: '480',
    weight: '1470',
    drive: 'AWD',
    gbox: '6MT 01E',
    wheels: 'SPEEDLINE 17"',
    paint: 'RS GREEN',
    stand: 'B-12',
    owner: 'BOGDAN N.',
    town: 'RĂDĂUȚI',
    handle: 'bogdan.s2',
    followers: '233',
    win: null,
    mods: mods([
      ['ENGINE', ['Hybrid K26/28', 'Big front-mount', 'Standalone ECU']],
      ['SUSPENSION', ['H&R coilovers', 'Refreshed bushings']],
      ['WHEELS', ['Speedline Mistral 17×8']],
      ['EXTERIOR', ['RS2 mirrors', 'Full respray in RS green']],
    ]),
    story: 'Five cylinders, one turbo the size of a fist, and the best noise at the whole meet.',
  },
  {
    id: 'cam',
    no: '55',
    year: 1979,
    make: 'CHEVROLET',
    model: 'CAMARO Z28',
    cls: 'MUSCLE',
    engine: '5.7 V8 SMALL BLOCK',
    power: '355',
    tq: '500',
    weight: '1600',
    drive: 'RWD',
    gbox: '3AT',
    wheels: 'CRAGAR 15"',
    paint: 'HUGGER ORANGE',
    stand: 'C-55',
    owner: 'SORIN M.',
    town: 'SUCEAVA',
    handle: 'sorin.z28',
    followers: '198',
    win: null,
    mods: mods([
      ['ENGINE', ['350 rebuild', 'Holley 750', 'Flowmaster 40s']],
      ['SUSPENSION', ['Rear lowering blocks', 'Poly bushings']],
      ['WHEELS', ['Cragar S/S 15×8']],
      ['EXTERIOR', ['Repainted in original Hugger Orange']],
    ]),
    story: 'It does eleven litres per hundred if I am gentle and I am never gentle.',
  },
  {
    id: 'ek4',
    no: '38',
    year: 1996,
    make: 'HONDA',
    model: 'CIVIC EK4',
    cls: 'JDM',
    engine: 'B18C SWAP 1.8',
    power: '210',
    tq: '190',
    weight: '1010',
    drive: 'FWD',
    gbox: '5MT · LSD',
    wheels: 'MUGEN MF10 15"',
    paint: 'MILANO RED',
    stand: 'A-38',
    owner: 'ANDREI MOROȘANU',
    town: 'SUCEAVA',
    handle: 'andrei.s14',
    followers: '96',
    win: null,
    mods: mods([
      ['ENGINE', ['B18C swap, ITBs', 'Hondata K-Pro', '4-1 header']],
      ['SUSPENSION', ['Spoon-spec dampers', 'Rear tie bar']],
      ['WHEELS', ['Mugen MF10 15×7', 'Yokohama A052']],
      ['INTERIOR', ['Bride Zieg', 'Half cage']],
    ]),
    story:
      'The track car. No radio, no carpet, no reason to own it except that it is the fastest thing I own around Adâncata.',
  },
];

export const CLASSES: readonly ('ALL' | CarClass)[] = [
  'ALL',
  'JDM',
  'GERMAN',
  'MUSCLE',
  'CLASSIC',
  'STANCE',
  'OFF-ROAD',
] as const;

/** Full entry list size. Only the first page is modelled. */
export const ROSTER_TOTAL = 142;

export const byId = (id: string | undefined): Car => CARS.find((c) => c.id === id) ?? CARS[0];

/**
 * Some models already start with the year-ish numeral (DACIA 1300),
 * which reads as a stray number on a card. Prefix the make in that case.
 */
export const displayModel = (c: Car): string =>
  /^[0-9]/.test(c.model) ? `${c.make} ${c.model}` : c.model;

export const headline = (c: Car): string => `${c.year} ${c.make} ${c.model}`;

export const modCount = (c: Car): number => c.mods.reduce((a, g) => a + g.items.length, 0);

/** Stand A-14 is in paddock A. The letter is the paddock. */
export const paddockOf = (c: Car): string => c.stand.split('-')[0];

/** Where a scanned card lands. Printed as a QR on every windshield card. */
export const carUrl = (c: Car, origin = 'https://show.x'): string => `${origin}/car/${c.id}`;

/** Other cars in the same owner's garage. One person, many cars. */
export const garageOf = (c: Car): Car[] =>
  CARS.filter((o) => o.owner === c.owner && o.id !== c.id);

/**
 * Car of the Show, as it stands. Votes seeded from the running
 * tally; the viewer's own vote is added on top at read time.
 */
export const AWARD_POOL: readonly [string, number][] = [
  ['d13', 612],
  ['s14', 430],
  ['mus', 388],
  ['sup', 301],
  ['e30', 256],
  ['cam', 204],
  ['evo', 188],
  ['pas', 151],
] as const;

export const VOTES_CAST_LABEL = '2 530 VOTES CAST SO FAR · STANDINGS UPDATE LIVE';

export interface Standing {
  id: string;
  car: Car;
  pos: number;
  votes: number;
  pct: number;
  mine: boolean;
}

export function standings(myVote: string | null): Standing[] {
  const total = AWARD_POOL.reduce((a, p) => a + p[1], 0) + (myVote ? 1 : 0);
  return AWARD_POOL.map(([id, v]) => ({ id, votes: v + (myVote === id ? 1 : 0) }))
    .sort((a, b) => b.votes - a.votes)
    .map((r, i) => ({
      id: r.id,
      car: byId(r.id),
      pos: i + 1,
      votes: r.votes,
      pct: Math.round((r.votes / total) * 100),
      mine: myVote === r.id,
    }));
}
