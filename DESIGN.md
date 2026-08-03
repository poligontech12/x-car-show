---
name: X Car Show
description: A car show after dark — black field, lit glass, one red marker.
colors:
  ink: "#08080a"
  ink-deep: "#050506"
  slot: "#101012"
  marque-red: "#e10600"
  marque-red-lift: "#ff2019"
  marque-red-deep: "#8b0000"
  red-wash: "rgba(225, 6, 0, 0.12)"
  red-edge: "rgba(225, 6, 0, 0.5)"
  red-glow: "rgba(225, 6, 0, 0.35)"
  glass: "rgba(255, 255, 255, 0.055)"
  glass-strong: "rgba(255, 255, 255, 0.085)"
  glass-faint: "rgba(255, 255, 255, 0.03)"
  glass-dark: "rgba(18, 18, 21, 0.72)"
  rim: "rgba(255, 255, 255, 0.09)"
  rim-bright: "rgba(255, 255, 255, 0.16)"
  paper: "#ffffff"
  paper-70: "rgba(255, 255, 255, 0.7)"
  paper-45: "rgba(255, 255, 255, 0.45)"
  paper-28: "rgba(255, 255, 255, 0.28)"
  paper-16: "rgba(255, 255, 255, 0.16)"
typography:
  number-xl:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "96px"
    fontWeight: 600
    lineHeight: 0.76
    letterSpacing: "-0.055em"
    fontFeature: "tabular-nums"
  number-lg:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 600
    lineHeight: 0.8
    letterSpacing: "-0.05em"
    fontFeature: "tabular-nums"
  number-md:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 0.85
    letterSpacing: "-0.045em"
    fontFeature: "tabular-nums"
  display:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  subhead:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  micro:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
rounded:
  card: "14px"
  panel: "22px"
  chip: "999px"
  screen: "clamp(26px, 3.4vw, 44px)"
spacing:
  gutter: "20px"
  safe-top: "78px"
  safe-bottom: "24px"
components:
  button-primary:
    backgroundColor: "{colors.marque-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.chip}"
    padding: "17px"
    typography: "{typography.subhead}"
  button-primary-hover:
    backgroundColor: "{colors.marque-red-lift}"
  button-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.paper}"
    rounded: "{rounded.chip}"
    padding: "17px"
  chip:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.paper-45}"
    rounded: "{rounded.chip}"
    padding: "9px 16px"
  chip-selected:
    backgroundColor: "{colors.marque-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.chip}"
    padding: "9px 16px"
  card-glass:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "16px"
  input:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "15px 16px"
  icon-button:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    height: "44px"
    width: "44px"
  tag:
    backgroundColor: "{colors.marque-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.chip}"
    padding: "6px 13px"
---

# Design System: X Car Show

## Overview

**Creative North Star: "The Night Paddock"**

A car show after dark. The ground is a black field; the panels are lit windows
onto a machine; one red marker tells you where to look. Everything in the system
follows from standing outside at night in front of a car with a phone in one
hand — the screen is the only light source, so it behaves like one: it pools,
it catches an edge, it never floods.

The system is **material before it is graphic**. Depth comes from glass and
light, never from a second background colour or a drawn border doing the work of
a shadow. A panel is almost entirely transparent; what makes it a surface is the
blur behind it, the saturation lift that lets colour bloom through, and the
specular light caught on its top bevel. Take the bevel away and it stops being
glass and becomes a grey box — that failure mode is the single most common way
this system breaks.

The register is **motorsport, not consumer software**. Numbers are the
composition rather than values inside one; type is tight on both axes; nothing
is set in caps and nothing is exclaimed. It is emphatically not a dark-mode
dashboard, not a gamer aesthetic, and not a social feed — those three are the
adjacent traps and each one has pulled at this build already.

**Key Characteristics:**
- Neutral black ground with no hue in it (`#08080a`), never a blue-black
- Exactly one accent, the marque red, rationed to three jobs per screen
- Liquid glass: near-transparent, blurred, saturation-lifted, top-bevelled
- Display figures at 96px with tabular numerals, counting in on arrival
- One typeface doing every job through weight and tracking
- Photography leads; chrome gets out of its way via masked blur, not scrims

## Colors

Two hues and nothing else: a neutral black and the marque red. Everything
between them is white at some opacity, which is what keeps the system reading as
light on a black field rather than as a palette.

### Primary
- **Marque Red** (`#e10600`): the single accent. It marks the figure a screen is
  about, the state the visitor caused, and the one action the screen wants —
  and nothing else. Selected chips, the cast vote, the leading position, the
  primary button, the mark in the nav.
- **Marque Red Lift** (`#ff2019`): hover only, on the primary action.
- **Red Wash** (`rgba(225, 6, 0, 0.12)`) and **Red Edge**
  (`rgba(225, 6, 0, 0.5)`): the tint and hairline for a surface in an
  accented state — your vote's row, the award band on a winning car.
- **Red Glow** (`rgba(225, 6, 0, 0.35)`): the bloom under the primary action and
  the warm half of the aurora. Never a border, never text.

### Neutral
- **Ink** (`#08080a`): the ground, everywhere. Neutral to the last digit.
- **Ink Deep** (`#050506`): behind the device frame, and the print index page.
- **Slot** (`#101012`): an empty photo well waiting for its image.
- **Paper** (`#ffffff`) and its ladder — **70%** for prose, **45%** for every
  label, **28%** for tertiary meta, **16%** for placeholder text.

### Named Rules

**The Three Jobs Rule.** Red appears at most three times on a screen: the
figure the screen is about, the state you caused, the one action. A fourth
occurrence means one of them is not actually the point — take it away rather
than adding a fourth.

**The No Second Hue Rule.** There is no third colour. Success is not green,
warning is not amber, a chart series is not blue. If a state needs to be
distinguished, it is distinguished by opacity, weight, or position.

**The Neutral Black Rule.** The ground carries no hue. A blue-black reads as a
product with a brand colour; this has to read as a black floor with a light on
it. Any surface value drifting toward navy is a regression.

## Typography

**Single Family:** Albert Sans (with `system-ui`, `sans-serif`), weights 300–800,
Latin + Latin Extended for Romanian diacritics.

**Character:** One geometric sans doing every job through weight and tracking
rather than through a second family. Warm enough not to read as a data terminal,
neutral enough that the numbers stay the loudest thing on any screen. Tracking
tightens as size grows — by 96px it is at `-0.055em`, which is what stops the
figures reading as text.

### Hierarchy
- **Number XL** (600, 96px, 0.76, `-0.055em`, tabular): the figure a screen is
  about. Power on a car, votes on the leader. Counts in on arrival.
- **Number LG** (600, 60px, 0.8, tabular): a figure inside a flow — the power
  stepper during registration.
- **Number MD** (600, 36px, 0.85, tabular): the stand number on an issued card.
- **Display** (500, 46px, 0.94, `-0.045em`): the two-line name every destination
  opens with. "Cajvana / Bucovina", "Grila / de start".
- **Title** (600, 32px, 0.95, `-0.04em`): a car's name on its own page.
- **Subhead** (600, 20px, 1.15, `-0.03em`): panel headings, button labels.
- **Body** (400, 15px, 1.55): prose — build stories, explanatory copy.
- **Label** (400, 13.5px, 1.3, at `paper-45`): every label in the system.
- **Micro** (500, 11px): tab labels and badges only.

### Named Rules

**The Sentence Case Rule.** Nothing is set in caps. Not labels, not tabs, not
buttons. Emphasis comes from weight and size. The one exception is content that
is a code rather than a word — `SR20DET`, `RWD`, `JDM`, `A-14` — which is
written the way the trade writes it.

**The Tabular Rule.** Any figure that animates or ranks uses tabular numerals.
A count-up that reflows its own width is a broken count-up.

## Layout

A single mobile frame at **390 × 844**, centred on desktop inside device chrome
(`clamp(26px, 3.4vw, 44px)` screen radius, a black bezel, a bright inner ring,
and a dynamic island). Below 640px wide or 880px tall the frame becomes the
viewport.

**Gutter is 20px** on every screen edge, without exception. Panels stack in a
single column with **8–10px** between siblings and **~34px** between sections.
Scrolling screens pad **78px** at the top (clearing the floating nav) and
**120px** at the bottom (clearing the floating tab bar).

Three screens — scan, auth, register-a-car — take the full height and manage
their own scrolling, with a pinned action bar at the foot. The rest scroll under
fixed chrome.

**The one exception to the frame:** the print surface at `/cards`, drawn at
520 × 366 units where `--u` is a CSS pixel on screen and `210mm/520` on paper.
That is the only place in the system with a second coordinate space.

## Elevation & Depth

Depth is **material, not shadow**. Surfaces are glass over a black floor: what
separates them is blur, a saturation lift, and light on the top bevel. Drop
shadows exist only to float glass off the ground, never to separate flat cards.

Behind everything, two slow blooms — one red, one cold white — drift on a 26–32s
cycle at very low opacity, so the black floor has something for the glass to
refract. It is deliberately barely there.

### Shadow Vocabulary
- **Sheen** (`inset 0 1px 0 0 rgba(255,255,255,0.2)`): the top bevel. This is
  not optional decoration; it is what makes a panel read as glass.
- **Sheen Soft** (`inset 0 1px 0 0 rgba(255,255,255,0.12)`): the same on small
  controls where the full bevel would look plastic.
- **Lift** (`0 10px 34px rgba(0,0,0,0.55)`): floats the tab bar and full panels.
- **Lift Small** (`0 4px 16px rgba(0,0,0,0.4)`): floats an in-flow panel.
- **Accent Bloom** (`0 6px 26px rgba(225,6,0,0.35)`): under the primary action
  only.

### Named Rules

**The Bevel Rule.** Every glass surface carries `--sheen`. A panel with a
background and a border but no top bevel is the system's most common failure —
it reads as a grey box and the whole material argument collapses.

**The Literal Blur Rule.** Write `backdrop-filter` with a literal value, never
`var(--x)`. The CSS minifier silently drops the declaration when it cannot
resolve a custom property against its browser targets: the rule ships with no
blur and nothing warns you. `blur(28px) saturate(180%)` for panels,
`blur(16px) saturate(160%)` for small controls.

**The Dark Tint Over Motion Rule.** Glass floating over *scrolling* content —
the tab bar, the nav controls, a chip on a photograph — uses `glass-dark`
(a dark tint), not the white one. A white tint over a moving photograph goes
muddy and the text on it stops being readable.

## Shapes

Glass is moulded, not cut. **Nothing in the system has a square corner.**

- **Panels: 22px.** Cards, rows, sheets, form fields, photo wells.
- **Controls: 14px.** Icon buttons, thumbnails, small tiles.
- **Fully round: 999px.** Chips, tags, buttons, the tab bar, avatars, badges,
  progress segments and rule ends.
- **Screen: `clamp(26px, 3.4vw, 44px)`.** The device frame only.

Borders are always a single hairline of white at 9% (`rim`) or 16%
(`rim-bright`) — never a colour, never thicker than 1px, never a divider doing a
panel's job. An accented surface swaps the hairline for `red-edge`.

## Components

### Buttons
- **Shape:** fully round (999px), 17px padding, 600 weight, `-0.015em`.
- **Primary:** marque red on white, with an accent bloom beneath. A light runs
  its rim once every four seconds — a masked conic sweep, confined to a 1.5px
  ring. Enough to say "this one", not enough to fidget.
- **Glass:** the transparent panel recipe. Used for the secondary of a pair, and
  for a toggled-on state (Follow → Following).
- **Quiet:** transparent with a hairline, `paper-45` text. Destructive and
  low-stakes actions — sign out.
- **White:** solid white on near-black. The one action inside the red menu
  overlay, where red would disappear.
- **Never two primaries on a screen.**

### Chips
- Fully round, glass when off (`paper-45` text), **marque red when on** with an
  accent bloom. One filter row per screen, horizontally scrolling, sticky at
  76px so it lands just under the floating nav rather than behind it.

### Cards / Containers
- **Corner:** 22px. **Background:** `glass`. **Border:** 1px `rim`.
- **Shadow:** `--sheen` plus `--lift-sm`, always both.
- **Padding:** 16px. **Gap between siblings:** 8–10px.
- A pointer-tracked light sweeps across any panel marked `data-spot`, delegated
  from the shell rather than listened for per panel.

### Inputs / Fields
- Glass panel at 22px, 15px/16px padding, 16px text — never an underline.
- **Focus:** the hairline becomes `red-edge`. No glow, no ring, no shift.
- Caret is marque red. Placeholder is `paper-16`.

### Navigation
- **Top:** floats over content with no background of its own — a 44px mark (red,
  14px radius) or a back control, and two 44px controls at the right: a solid
  white account button and a glass menu button. It never scrolls.
- **Menu overlay:** full-screen `linear-gradient(160deg, #120000, #8b0000 40%,
  #e10600)`. Links at 34px/700 stagger in 80ms apart; the current destination
  takes the marque red. A white button sits at the foot.
- **Tab bar:** four tabs in one floating glass pill, inset 20px from the edges
  and 24px off the bottom, on `glass-dark`. The active tab takes red text on a
  red wash. The scan glyph keeps its red line whether active or not — it is the
  one live thing in the bar.

### Photo Well (signature)
Every image area is a drop target. Empty, it shows a dashed hairline ring at 16%
and a caption naming the photo that belongs there — never "drop an image". Full,
it is edge-to-edge with a corner control to clear it. Photo wells inside links
are passive, with a corner control to browse, so tapping the photo opens the car
rather than a file picker.

### The Veil (signature)
`.photo-veil` blurs the bottom 55% of an image behind a mask gradient, so a
headline sits on a photograph with no box, no scrim edge and no drop shadow.
It is how every headline-over-image in the system works, and it is the reason
the app can be photography-led without ever putting type in a plate.

## Do's and Don'ts

### Do:
- **Do** write `backdrop-filter` literally: `blur(28px) saturate(180%)` for
  panels, `blur(16px) saturate(160%)` for small controls.
- **Do** give every glass surface `--sheen`. Background + border alone is a grey
  box, not glass.
- **Do** use `glass-dark` for anything floating over scrolling content.
- **Do** keep red to three appearances per screen, maximum.
- **Do** use tabular numerals on any figure that animates or ranks.
- **Do** reach for opacity, weight and position to separate states.
- **Do** let the photograph run edge to edge and put type on it with the veil.

### Don't:
- **Don't** introduce a second hue. No green success, no amber warning, no blue.
- **Don't** let any surface value drift toward navy. The ground is neutral.
- **Don't** set anything in caps except trade codes (`SR20DET`, `RWD`, `A-14`).
- **Don't** add a square corner anywhere.
- **Don't** put a border where a bevel and a blur should be doing the work.
- **Don't** stack two primary actions on one screen.
- **Don't** add avatars, like counts or comment affordances — the product is
  deliberately thin and the design must not imply otherwise.
