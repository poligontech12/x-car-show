/**
 * The roster. Twelve builds modelled end to end against the 142-car
 * entry list — JDM, German, muscle, stance, off-road, and the Dacia/ARO
 * classics that actually turn up in Bucovina.
 *
 * Part names, engine codes and manufacturer paint names stay as the
 * trade writes them; everything a person reads as a sentence is Romanian.
 */

export type CarClass = 'JDM' | 'GERMANE' | 'MUSCLE' | 'CLASICE' | 'STANCE' | 'OFF-ROAD';

export type ModCategory = 'MOTOR' | 'SUSPENSIE' | 'JANTE' | 'EXTERIOR' | 'INTERIOR';

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
    make: 'NISSAN',
    model: 'SILVIA S14',
    cls: 'JDM',
    engine: 'SR20DET 2.0 TURBO',
    power: '412',
    tq: '480',
    weight: '1240',
    drive: 'RWD',
    gbox: '5MT · DIFERENȚIAL 1.5W',
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
        'MOTOR',
        [
          'Turbină GT2871R, 1.06 A/R',
          'Tomei Poncam 260°',
          'ECU standalone Link G4X',
          'Intercooler frontal 600×300',
        ],
      ],
      ['SUSPENSIE', ['Coilovere BC Racing ER', 'Kit unghi Wisefab', 'Cușcă demontabilă în 6 puncte']],
      ['JANTE', ['Work Meister S1 3P 18×9.5 / 18×10.5', 'Nankang NS-2R 235/265']],
      ['EXTERIOR', ['Bară față BN Sports', 'Eleron Origin ducktail', 'Revopsită în Bayside Blue']],
    ]),
    story:
      'Am luat-o de la un tip din Iași în 2019. SR-ul ars, jumătate de cușcă și un portbagaj plin cu chitanțele altcuiva.\n\nDouă ierni într-un garaj neîncălzit ca să meargă cum trebuie. Motorul l-am asamblat de trei ori. Tata încă crede că am cumpărat o epavă, și optsprezece luni a avut dreptate.\n\nNu e mașină de remorcă. O conduc prin Bucovina și înapoi, iar vopseaua e Bayside Blue pentru că nu mi-am permis R34-ul căruia îi aparține culoarea.',
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
      ['MOTOR', ['Precision 6466', 'Bloc motor forjat', 'Conversie E85']],
      ['SUSPENSIE', ['KW V3', 'Bară de rigidizare față']],
      ['JANTE', ['Volk TE37 18×10', 'Michelin PS4S']],
      ['EXTERIOR', ['Buză față Ridox', 'Eleron TRD ducktail']],
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
    cls: 'GERMANE',
    engine: 'M50B25 SWAP 2.5',
    power: '240',
    tq: '285',
    weight: '1180',
    drive: 'RWD',
    gbox: '5MT · DIFERENȚIAL 3.46',
    wheels: 'BBS RS 16"',
    paint: 'ALPINWEISS II',
    stand: 'B-07',
    owner: 'TUDOR V.',
    town: 'RĂDĂUȚI',
    handle: 'tudor.e30',
    followers: '312',
    win: '2023',
    mods: mods([
      ['MOTOR', ['Swap M50B25, OBD1', 'Clapete individuale', 'Galerie pe comandă']],
      ['SUSPENSIE', ['Bilstein B14', 'Plăci camber față']],
      ['JANTE', ['BBS RS 16×8 / 16×9', 'Centre refăcute în auriu']],
      ['EXTERIOR', ['Kit Mtech I', 'Bare euro, ornamente scoase']],
    ]),
    story:
      'Șaisprezece ani în aceeași familie. Unchiul meu mergea cu ea în Germania la muncă în fiecare vară; eu i-am pus clapete individuale și i-am stricat consumul pe vecie.',
  },
  {
    id: 'g2',
    no: '31',
    year: 1991,
    make: 'VOLKSWAGEN',
    model: 'GOLF MK2 GTI',
    cls: 'GERMANE',
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
      ['MOTOR', ['GT3071R', 'Biele forjate, 8.5:1', 'Injecție apă/metanol']],
      ['SUSPENSIE', ['Coilovere, coborâtă 60mm', 'Bucșe punte spate']],
      ['JANTE', ['BBS RM 15×7', 'Federal 595 semi-slick']],
      ['INTERIOR', ['Recaro Pole Position', 'Ceas de presiune în grilă']],
    ]),
    story:
      'Sub o tonă, fără tracțiune, iar volanul încearcă să-ți fugă din mâini în treapta a doua. Cei mai bine cheltuiți bani din viața mea.',
  },
  {
    id: 'd13',
    no: '01',
    year: 1978,
    make: 'DACIA',
    model: '1300',
    cls: 'CLASICE',
    engine: '1.4 8V CARBURATOR',
    power: '96',
    tq: '128',
    weight: '900',
    drive: 'RWD',
    gbox: '4MT',
    wheels: 'JANTE TABLĂ 13"',
    paint: 'ALB POLAR',
    stand: 'C-01',
    owner: 'MIHAI B.',
    town: 'CAJVANA',
    handle: 'mihai1300',
    followers: '890',
    win: '2024',
    mods: mods([
      ['MOTOR', ['Două carburatoare Weber 40 DCOE', 'Chiulasă prelucrată', 'Galerie inox']],
      ['SUSPENSIE', ['Coborâtă 40mm', 'Amortizoare întărite']],
      ['EXTERIOR', ['Vopsea originală, păstrată', 'Grilă 1310 de epocă']],
      ['INTERIOR', ['Retapițată în material original', 'Radio de epocă, funcțional']],
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
    cls: 'OFF-ROAD',
    engine: '2.5 TURBODIESEL',
    power: '138',
    tq: '320',
    weight: '1820',
    drive: '4WD',
    gbox: '4MT + REDUCTOR',
    wheels: 'TABLĂ 16" BEADLOCK',
    paint: 'VERDE MILITAR',
    stand: 'D-44',
    owner: 'GEORGE T.',
    town: 'GURA HUMORULUI',
    handle: 'aro.carpatin',
    followers: '274',
    win: null,
    mods: mods([
      ['MOTOR', ['Swap Toyota 2L-TE', 'Intercooler', 'Snorkel']],
      ['SUSPENSIE', ['Arcuri +3 inch', 'Amortizoare cu cursă lungă']],
      ['JANTE', ['Anvelope M/T 33"', 'Beadlock față și spate']],
      ['EXTERIOR', ['Bară cu troliu', 'Portbagaj de plafon, roata de rezervă în spate']],
    ]),
    story:
      'Merge oriunde și ajunge târziu. Arcurile noi l-au făcut cu 3 cm mai înalt și acum nu mai intră în garaj, ceea ce soția mea consideră un defect de proiectare.',
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
      ['MOTOR', ['Motor 302 refăcut, 10:1', 'Edelbrock Performer', 'Galerii lungi']],
      ['SUSPENSIE', ['Shelby drop', 'Conversie frâne disc față']],
      ['JANTE', ['American Racing Torq Thrust 15×7']],
      ['EXTERIOR', ['Revopsită la metal', 'Dungi GT trasate manual']],
    ]),
    story:
      'Adusă din Ohio într-un container în 2011. Tot ce e dedesubt e nou; tot ce se vede e exact cum a ieșit din fabrică.',
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
      [
        'SUSPENSIE',
        ['Air Lift Performance 3P', 'Punte spate decupată', 'Amortizoare spate pe comandă'],
      ],
      ['JANTE', ['Rotiform 19×9.5 ET35', 'Anvelope întinse 215/35']],
      ['EXTERIOR', ['Compartiment motor netezit', 'Sigle scoase']],
      ['INTERIOR', ['Rezervor și management în portbagaj, îmbrăcate în fibră']],
    ]),
    story:
      'Lumea zice că mașinile pe perne nu merg. A mea face 900 km până în Polonia și înapoi pe înălțimea 3, și stă lipită de asfalt când ajunge acolo.',
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
      ['MOTOR', ['Turbină FP Black', 'Motor 2.0 forjat', 'E85, flex fuel']],
      ['SUSPENSIE', ['Ohlins Road & Track', 'Bare antiruliu Whiteline']],
      ['JANTE', ['Enkei RPF1 17×9', 'Semi-slick pentru probele pe asfalt']],
      ['INTERIOR', ['Frână de mână hidraulică', 'Stație radio, nefolosită']],
    ]),
    story:
      'Jumătate mașină de raliu, jumătate mașină de zi cu zi. A urcat pe Transfăgărășan de mai multe ori decât majoritatea turiștilor și încă are scaunele originale.',
  },
  {
    id: 's2',
    no: '12',
    year: 1994,
    make: 'AUDI',
    model: 'S2 COUPÉ',
    cls: 'GERMANE',
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
      ['MOTOR', ['Turbină hibrid K26/28', 'Intercooler frontal mare', 'ECU standalone']],
      ['SUSPENSIE', ['Coilovere H&R', 'Bucșe schimbate']],
      ['JANTE', ['Speedline Mistral 17×8']],
      ['EXTERIOR', ['Oglinzi RS2', 'Revopsită integral în RS green']],
    ]),
    story: 'Cinci cilindri, o turbină cât pumnul și cel mai frumos sunet din tot show-ul.',
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
      ['MOTOR', ['Motor 350 refăcut', 'Carburator Holley 750', 'Tobe Flowmaster 40']],
      ['SUSPENSIE', ['Distanțiere spate', 'Bucșe poliuretan']],
      ['JANTE', ['Cragar S/S 15×8']],
      ['EXTERIOR', ['Revopsită în Hugger Orange original']],
    ]),
    story: 'Face unsprezece litri la sută dacă sunt blând și nu sunt niciodată blând.',
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
    gbox: '5MT · DIFERENȚIAL BLOCABIL',
    wheels: 'MUGEN MF10 15"',
    paint: 'MILANO RED',
    stand: 'A-38',
    owner: 'ANDREI MOROȘANU',
    town: 'SUCEAVA',
    handle: 'andrei.s14',
    followers: '96',
    win: null,
    mods: mods([
      ['MOTOR', ['Swap B18C, clapete individuale', 'Hondata K-Pro', 'Galerie 4-1']],
      ['SUSPENSIE', ['Amortizoare spec Spoon', 'Bară de rigidizare spate']],
      ['JANTE', ['Mugen MF10 15×7', 'Yokohama A052']],
      ['INTERIOR', ['Scaune Bride Zieg', 'Semi-cușcă']],
    ]),
    story:
      'Mașina de circuit. Fără radio, fără mochetă, fără vreun motiv s-o am în afară de faptul că e cel mai rapid lucru al meu prin Adâncata.',
  },
];

export const CLASSES: readonly ('TOATE' | CarClass)[] = [
  'TOATE',
  'JDM',
  'GERMANE',
  'MUSCLE',
  'CLASICE',
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
 * Car of the show, as it stands. Votes seeded from the running tally;
 * the viewer's own vote is added on top at read time.
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

export const VOTES_CAST_LABEL = '2 530 DE VOTURI PÂNĂ ACUM · CLASAMENTUL SE ACTUALIZEAZĂ LIVE';

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
