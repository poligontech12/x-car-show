# X Car Show

Cajvana, Suceava. One meet a year, plus the year-round community around it.
142 entries, one award, one vote each.

Built from the design canvas in
[`design/X Car Show.dc.html`](design/X%20Car%20Show.dc.html) — its second pass,
which supersedes the first: **four tabs not five, one award, accounts added.**

The canvas defined the product; the **visual language was later replaced**
twice, and now reads as F1 does: black, marque red, liquid glass. The canvas
argued a different case — "no cards, no corners", condensed caps, mono
numerals — so read it for what the app is, not for how it looks.

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
  tokens.css        colour, glass, type and radius — the source of truth
  globals.css       reset, the eight keyframes + delay utilities, surfaces, controls
  layout.tsx        Albert Sans, the store, the app shell
  <route>/          one folder per screen, each with its own .module.css
components/
  AppShell          the 390x844 frame, device chrome, scroll vs fill
  PhoneNav          the fixed nav and the full-screen menu overlay
  TabBar            the floating glass tab pill
  ImageSlot         drop-target photo wells
lib/
  cars.ts           the twelve modelled builds, plus standings
  store.tsx         account, vote, follows, filters — persisted to localStorage
  slots.ts          photo slots: downscale, encode, persist
  useCountUp.ts     display numbers count in on a cubic ease-out
design/             the original canvas and the app it embeds, for reference
```

## The rules the design runs on

Black, one red, and glass. Four rules carry it:

**Neutral ground, never a tinted one.** `--ink` is `#08080a` — black with no
hue in it. A blue-black reads as a product with a brand colour; this has to
read as a black floor with a light on it.

**Red is the only accent, and it belongs to numbers.** `--red` marks the
figure the screen is about, the state you caused, and the one action. Nothing
else is coloured — everything between black and red is white at some opacity.
A screen showing red four times is a screen with no point.

**Glass is blur, saturation and a bevel — all three.** A panel is almost
entirely transparent (`--glass` is 5.5% white). What makes it a surface is the
backdrop blur, the saturation lift that lets colour bloom through it, and
`--sheen`, the light caught on its top edge. Take away the bevel and it stops
being glass and becomes a grey box. Surfaces that float over *moving* content —
the tab bar, the nav controls — use `--glass-dark` instead, because a white
tint over a scrolling photograph just goes muddy.

**Photography wins, and the veil is how.** `.photo-veil` blurs the bottom of
an image behind a mask gradient, so a headline sits on a photograph without a
box, a scrim edge or a drop shadow.

Three borrowed flourishes, kept to a hint: a slow two-blob **aurora** behind
everything so the black floor has depth, a **pointer spotlight** on panels
(delegated from the shell — `data-spot` opts an element in), and a light that
runs the **rim of the one primary action** every four seconds.

> **Editing the glass?** Write `backdrop-filter` with a literal value, never
> `var(--x)`. Next's CSS minifier silently drops the declaration when it cannot
> resolve the custom property against its browser targets — the rule ships with
> no blur at all and nothing warns you. The values are `blur(28px)
> saturate(180%)` for panels and `blur(16px) saturate(160%)` for small controls.

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
  `210mm/520` (paper), so the two can never drift. Albert Sans is far wider than the
  condensed face the plate was first fitted to, so the stand number sits at 48 units
  and the label tracking came off — `A-14` and `SR20DET` now clear their columns on
  every entry with room to spare.
- **The cards keep print logic, not screen logic.** Glass and backdrop blur mean
  nothing on paper, so the three cards take the type and the accent but none of the
  surfaces.
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
