# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Entrants** — people who bring a car. They register the build, are assigned a
stand, and are handed a printed windshield card at the gate. Their goal on show
day is to stop repeating their spec list to every passer-by.

**Visitors** — everyone else at the show, plus the scene between editions. They
walk the paddocks, scan the cards on windscreens to read a build, follow the
cars they like, and cast one vote for Car of the Show.

**Marshals** — an operational role, not an audience. They run the gate, assign
stands, and print the cards. They are the reason `/cards` exists.

The scene is the Bucovina car community: Suceava, Rădăuți, Fălticeni, Botoșani,
Gura Humorului, Vatra Dornei, Cajvana. The interface is Romanian only.

## Product Purpose

One meet a year in Cajvana, plus the year-round community around it. The app
carries a 142-car entry list, the build behind each car, and a single award
decided by the people who turn up.

Success is that a visitor standing in front of a car can read its whole story
without interrupting the owner, and that the award is settled by the room
rather than by a panel.

## Positioning

**The car is the profile.** Every other car community app is a social network
where people post; here the entry is the unit, and the owner is a card at the
foot of the car's page. One person, many cars, one garage.

**The printed card is the bridge.** An A5 windshield card carries a QR that
opens the build. That physical-to-digital hop is the mechanism — the app is not
trying to hold attention, it is trying to answer a question someone is asking
while standing in a field.

## Operating Context

- The show runs on **8–9 August 2026** in **Cajvana, Suceava** — edition 04.
- It happens in a field. Entries are grouped into **paddocks** (A–D) and each
  car gets a **stand** (`A-14`, `B-07`). The stand letter is the paddock.
- Marshals print an A5 landscape card per entry and hand it over at the gate.
  Owners leave it on the windscreen. Three variants exist: a spec plate, an
  ink-light scrutineering slip, and a photo plate for winners.
- **Voting closes at 18:00** on show day.
- Between editions the community runs on the feed: builds progressing, and
  cars spotted on the road.

## Capabilities and Constraints

Eight screens: feed, roster, car profile, scan, award, account/auth, a
four-step car registration, and partners — plus a print surface at `/cards`.

**Confirmed:**

- **One award, one vote per account.** Car of the Show. The vote is changeable
  until voting closes. Entrants cannot vote for their own car.
- **Voting is open to anyone with an account** — not gated to ticket holders,
  and not gated on a gate scan. Confirmed, not assumed.
- **The roster and the standings must work offline on show day.** There is no
  reliable signal in a field outside Cajvana. Cached reads and queued votes are
  a hard requirement on anything built from here, not a nice-to-have.
- Romanian only. No second locale is planned.
- The feed is deliberately thin: follows, no likes, no comments.
- Meets are **not** a feature. A meet card was designed and deliberately cut.

**Technical, current:** Next.js App Router, TypeScript, CSS Modules. Accounts,
entries, votes, follows, sightings and car photographs are in Postgres behind
server actions no screen reaches around; `lib/store.tsx` holds only what matters
to one browser, such as the half-finished registration draft. Uploaded images
are stored as bytes and served from their own cacheable routes — a car keeps its
photographs across a deploy, a new phone, and a visitor who has never opened the
app before.

**Undecided — do not invent an answer:**

- Who assigns stand numbers, marshals or owners. It changes the last step of
  registration.
- Whether the thin feed is too quiet between editions, or whether the missing
  thing is a shop/parts board rather than more posts.

## Brand Commitments

- The name is **X Car Show**. The current edition is **04**.
- The mark is a red `X`. The marque colour is a single red; it is rationed to
  the figure a screen is about, the state the visitor caused, and the one
  action a screen wants.
- Romanian, sentence case, plain-spoken. Part names, engine codes and
  manufacturer paint names stay as the trade writes them (`SR20DET`, `Bayside
  Blue`, `RWD`) — everything a person reads as a sentence is Romanian.

## Evidence on Hand

**Real:** the place, the date, the edition, the format, the 142-entry scale.

**Placeholder — must be replaced before this ships, and must never be presented
as real:** all twelve modelled builds in `lib/cars.ts`, including the owners'
names, handles, towns and build stories; the six partner workshops in
`lib/partners.ts`; and every vote tally in `AWARD_POOL`. These stand in for real
entrants at a real event. Do not add more invented entrants, sponsors,
testimonials or counts.

**Absent:** there is no photography of our own. A car carries up to six
photographs and the owner supplies all of them, so every image area starts as an
empty well. The design leans on photography heavily, so it is under-represented
in any screenshot taken today.

**Source of record:** the design canvas the product was specified from lives in
`design/X Car Show.dc.html`. Read it for what the app *is*; its visual language
has since been replaced.

## Product Principles

1. **The car is the unit.** Everything hangs off an entry. The owner is a
   credit at the foot of it.
2. **Answer the question in front of the car.** The visitor is standing in a
   field with a phone, mid-conversation. Depth is available, never demanded.
3. **The room decides the award.** One account, one vote, changeable until it
   closes, standings public to everyone including people with no account.
4. **Field-first.** No signal, one hand, bright sun, dirty screen. Anything
   that only works on a good connection in good light is not finished.
5. **Nothing invented.** The roster is real people's cars. Placeholder content
   is labelled as such and replaced, never dressed up as evidence.

## Accessibility & Inclusion

No formal standard has been set. Two product-specific needs follow from the
operating context and should be treated as requirements:

- **Outdoor daylight legibility.** The interface is very dark by design and
  will be read on a phone in an August field. Contrast has to survive that.
- **One-handed use.** The other hand is holding a coffee or a camera. Primary
  actions belong within thumb reach.

Romanian diacritics (ă, â, î, ș, ț) must render correctly everywhere; the type
stack is subset accordingly.
