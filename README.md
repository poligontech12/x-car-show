# X Car Show

Cajvana, Suceava. One meet a year, plus the year-round community around it.
142 entries, one award, one vote each.

This is the implementation of the design canvas in
[`design/X Car Show.dc.html`](design/X%20Car%20Show.dc.html) — its second pass,
which supersedes the first: **four tabs not five, one award, accounts added.**

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Photography is the product, so **every image
area is a live drop target** — drag a photo onto any placeholder and it sticks
across reloads.

**The interface is in Romanian.** Part names, engine codes and manufacturer
paint names stay as the trade writes them; everything a person reads as a
sentence is translated. There is no i18n layer — strings live next to the
layouts that constrain them, because the mono labels are sized to the pixel.

## What's here

| Route | |
|---|---|
| `/` | Feed — builds and sightings. Filterable, no likes, no comments. |
| `/roster` | 142 entries, photo-first, one filter row. |
| `/car/[id]` | The car profile. Swipeable hero, three numbers, four specs, mods, the build story, then the owner. |
| `/scan` | Viewfinder for windshield cards. Tap it to simulate a read. |
| `/award` | Car of the Show. Standings public, voting gated to an account. |
| `/auth` | Register, sign in, account. |
| `/onboard` | Register a car — four steps, then a stand and a printed card. |
| `/partners` | Shops as profiles. No paid placement. |
| `/cards` · `/cards/[id]` | **The printed windshield cards.** Three variants per entry, A5 landscape. Hit Print. |

## Layout

```
app/
  tokens.css        the colour and type scale — the source of truth
  globals.css       reset, motion, and the component sheet as CSS
  layout.tsx        fonts, the store, the app shell
  <route>/          one folder per screen, each with its own .module.css
components/         AppShell, TabBar, ImageSlot, QrCode, chips and rules
lib/
  cars.ts           the twelve modelled builds, plus standings
  store.tsx         account, vote, follows, filters — persisted to localStorage
  slots.ts          photo slots: downscale, encode, persist
design/             the original canvas and the app it embeds, for reference
```

## The rules the design runs on

Four things drive every screen, and they are worth keeping when you extend it:

**The car is the profile.** The owner is a card at the foot of the car's page,
never the other way round. One person, many cars, one garage.

**Numbers are the ornament.** IBM Plex Mono carries every spec, time, vote and
stand number. Nothing decorative sits on top of them.

**One red, three jobs.** `--arterial` marks live/now, the vote you cast, and the
one action the screen wants. If a fourth appears, something else has to give it
up. This is why `a` inherits its colour instead of turning red — most links here
are whole rows and photos, not words in a sentence.

**No cards, no corners.** Full-bleed photos and 1px rules instead of rounded
containers. `border-radius` is opt-in and used only on avatars.

## Prototype boundaries

There is no backend yet. Everything a member does lives in `lib/store.tsx` and
persists to `localStorage`; swapping in a real API means replacing the bodies of
the actions there, and no screen touches storage directly. Specifically:

- The password field is never read and never stored. It exists so the flow reads true.
- Scanning is simulated — tapping the viewfinder stands in for a successful card read.
- Photos never leave the phone. They are downscaled to 1600px and JPEG-encoded before
  being stored, because localStorage gives us about 5 MB in total.
- Vote tallies are seeded constants in `lib/cars.ts`; your own vote is added on read.

## Where this departs from the canvas

Small, deliberate changes, all of them the canvas's intent applied to working code:

- **QR codes are real.** The canvas draws a decorative random matrix; these encode
  the car's URL, because a card whose code does not scan has no reason to exist.
- **Print sizes are exact.** Cards are drawn once in the canvas's 520 × 366
  proportions; `--u` decides whether one of those units is a CSS pixel (screen) or
  `210mm/520` (paper), so the two can never drift. The stand number sits at 68 units
  rather than 74, and plate spec values at 17 rather than 19, so `A-14` and `SR20DET`
  fit their columns on every entry rather than only on some.
- **Follows are per car**, not one flag for whichever car you are looking at.
- **A new account starts with no vote cast.** The canvas prototype seeded one.
- **The build story is a real textarea** with a live counter, not a static placeholder.
- **Photos that are also links** get a small corner control to browse, so tapping the
  photo opens the car instead of opening a file picker.
- **Derived, not typed:** paddock comes from the stand letter, the mod count from the
  mod list, and the open modification group from the first group on the car (which
  is suspension on the bagged Passat, not engine).
- **Meets are not built.** The canvas designs a meet card in the feed with a date
  block and an RSVP; it is cut here until the feature is real.

## Still open

From the canvas, and still unanswered — these change real behaviour:

- Who assigns stand numbers, owners or marshals? It changes the last step of onboarding.
- Is voting gated to ticket holders (scan at the gate), or open to anyone with an account?
- Signal in a field outside Cajvana is a real risk. Should the roster and the standings
  work offline on event day?
- The feed is deliberately thin — and now thinner, with meets dropped. Is that too
  quiet between editions, or is a shop/parts board the thing that is missing?
