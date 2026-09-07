# BhoomiX — Full Website Build Prompt

A fresh design direction. This does **not** reuse the current site's look.

**How to use:** paste **BLOCK 0** and **BLOCK 1** first, together. Then one block
per message. AI builders degrade badly on very long prompts.

Works with Lovable, v0, Bolt, Manus, or any AI site builder. Stack assumed:
React + TypeScript + Tailwind. Adjust the stack line in BLOCK 0 if yours differs.

---

## BLOCK 0 — WHAT BHOOMIX IS (paste first)

```
Build a website for BhoomiX, an Indian agriculture platform.

Stack: React + TypeScript + Tailwind CSS. Deploy target Vercel.

WHAT THE COMPANY ACTUALLY DOES

BhoomiX connects small farmers and rural households to things they currently
cannot reach, without owning any infrastructure. No warehouses. No inventory.
No delivery fleet. Every transaction routes through a business that already
exists in the village.

Seven things it offers:

1. FRESH PRODUCE — direct from a small farmer's field or farm stall to the
   customer's door. Never frozen. This is the core promise.
2. LOCAL KIRANA ORDERING — a partner app that shows which nearby kirana shops
   actually stock what you need, and orders directly from them. The shop gets
   business; BhoomiX sells the connection, not the goods.
3. CROP DISEASE DETECTION — photograph a leaf, get the disease named with a
   confidence score and a treatment plan.
4. GOVERNMENT SCHEMES — which central and state schemes a farmer qualifies for,
   what each pays, the deadline, and a direct link to the official application.
5. SEEDS AND PESTICIDES — contacts for local dealers whose shops the BhoomiX
   team has visited and inspected in person before recommending them.
6. SECOND-HAND FARM MACHINERY — connecting people selling used tractors and
   equipment with small farmers who can only afford used.
7. MANDI PRICES — current market rates from Government of India open data.

WHO IT IS FOR — two audiences, one site

  A. Farmers and rural households. Often on a cheap Android phone, on patchy
     3G, reading in Hindi or a regional language, possibly not confident
     readers. They are the users.
  B. Investors, judges, press and partners. They are the evaluators.

The site must serve both without patronising either. Do not build a "simple
version for farmers" — build one site clear enough for everyone.

FACTS YOU MAY STATE (all true, do not embellish)
  - 23 Indian languages across 11 scripts, 3 of them right-to-left
  - Trademark registered
  - Founded and self-funded by two brothers, roughly ₹40,000 of their own money
  - Web platform live; mobile apps in development

FACTS YOU MUST NOT INVENT
  Do not invent user counts, revenue, funding raised, farmer numbers, GMV,
  partner counts, or testimonials. If a number is not in the list above, leave
  it out. An honest site with three real facts beats a fake one with thirty.
  Never write placeholder metrics like "10,000+ farmers" — they read as claims.
```

---

## BLOCK 1 — DESIGN DIRECTION (paste with BLOCK 0)

```
DIRECTION: "FIELD NOTES"

An agricultural almanac, not a SaaS dashboard. Warm paper, real photographs of
Indian farmland, confident typography, generous space. It should feel like a
well-made printed guide that happens to be a website — trustworthy, unhurried,
made by people who have stood in a field.

Explicitly avoid: dark glassmorphism, neon gradients, floating 3D blobs,
purple-to-blue tech gradients, and the generic startup landing page. This is
not a crypto product.

COLOUR — define as CSS variables on :root

  --paper      #F7F4EE   warm off-white page ground, never cool grey
  --paper-2    #EFEAE0   raised cards and alternating bands
  --ink        #1A1712   warm near-black, all body text
  --ink-soft   #5C5449   secondary text
  --line       #DDD5C7   hairlines and dividers
  --leaf       #2F6B3F   primary action, deep and slightly desaturated
  --soil       #6B4E2E   earth brown, secondary emphasis
  --sun        #C77D22   ochre accent — badges and highlights ONLY, never
                         body text; it fails contrast at small sizes
  --sun-ink    #8A5514   the ochre that IS safe for text

Rules: one accent per section. Leaf green is the action colour and nothing else
is. Ochre appears at most twice per screen. Never place leaf on soil.

Dark mode: optional. If built, warm it — near-black #14120F ground, not
blue-black. Never invert to a cold grey.

TYPOGRAPHY — this is the constraint most designs get wrong

  The site renders in 11 scripts including Devanagari, Tamil, Bengali and Urdu.
  That rules out most display faces, tight tracking, and all-caps styling —
  Devanagari has no capitals, and its headline strokes break under tight
  letter-spacing.

  Display / headings   Fraunces or Instrument Serif for Latin, paired with
                       Noto Serif Devanagari and the matching Noto Serif for
                       each other script. Never letter-space Indic headings.
  Body                 Inter for Latin, Noto Sans <Script> for everything else.
                       17px base, line-height 1.7 — Indic scripts need more
                       leading than Latin or they collide.
  Numbers              tabular-nums everywhere. This product is about rates,
                       prices and deadlines.

  Load only the scripts the current language needs. Loading all 11 Noto
  families on every page is several megabytes and will destroy the experience
  on a 3G phone — which is most of the audience.

LAYOUT

  A 12-column grid with wide gutters and a genuinely generous max-width
  (1240px). Long-form text caps at 68 characters.
  Sections separated by whitespace and hairlines, not boxes inside boxes.
  Asymmetry is welcome — a full-bleed photograph beside a narrow text column
  reads far better than another row of three equal cards.

SHAPE AND DEPTH

  Radius: 0 / 4 / 12 / 999. Cards default to 12.
  Prefer a 1px --line border over a shadow. Where a shadow is needed it is soft
  and low: 0 1px 2px rgba(26,23,18,.04), 0 12px 32px -16px rgba(26,23,18,.18).
  No glass, no blur panels, no glow.

PHOTOGRAPHY

  Real Indian farmland, real hands, real produce, real shops. Warm daylight.
  No stock photos of white people in laboratories, no drone shots of American
  monoculture, no AI-generated "farmer" faces.
  Every image needs a real alt description.

MOTION

  Restrained. Content fades up 16px over 500ms on entry, 60ms stagger.
  Hover: a 150ms colour or border change. That is all.
  No parallax, no scroll-jacking, no counters ticking up, no cursor followers.
  Honour prefers-reduced-motion by disabling all of it — not merely softening.
```

---

## BLOCK 2 — SITE MAP

```
Build these pages:

  /                    Home
  /what-we-do          The seven services, in depth
  /how-it-works        The asset-light model explained
  /for-farmers         Written for the user, in plain language
  /for-partners        For kirana shops and dealers who want to join
  /about               The founders and the origin story
  /contact             Simple, real

Global chrome:
  - Header: wordmark, five links, a language switcher, one primary CTA
    ("Open the app" → bhoomix.vercel.app)
  - The language switcher is a first-class control, not buried in a footer.
    It shows each language in its own script — हिन्दी, not "Hindi".
  - Footer: sitemap, the trademark line, contact, and an honest one-liner about
    what the company is.

Mobile: single column, header collapses to a sheet, the primary CTA stays
visible. Test at 360px — a common cheap Android width, not 390px.
```

---

## BLOCK 3 — HOME PAGE

```
1. HERO
   Full-bleed photograph of an Indian field at golden hour, warm and real, with
   a soft bottom scrim so the text holds contrast.
   Left-aligned, not centred:
     Eyebrow (small, ochre-ink): AGRICULTURE PLATFORM
     Headline (serif display, large): Fresh from the field. Direct to the door.
     Sub (18px, 2 lines max): Crop diagnosis, government schemes, local
       machinery and genuinely fresh produce. One app, 23 Indian languages.
     Two buttons: "Open the app" (leaf, filled) and "How it works" (a text link
       with an arrow, not a second filled button)
   No stat counters. No floating cards. Let the photograph carry it.

2. THE PROBLEM — the strongest section on the page
   Two panels side by side on desktop, stacked on mobile. Set as a short story,
   because it is a true one:

     Panel A — "In a small town, there is nothing."
       In Pawai, in Panna district, there is no Blinkit and no Zepto. For a
       small everyday thing, you travel to another town.

     Panel B — "In the city, there is everything except freshness."
       In Indore you can get anything in ten minutes. But the rosemary was
       frozen, the corn was frozen, and the leaves for poha were not there
       at all.

   Then, full width, centred, serif display:
     "The farms were twenty minutes away the whole time."
   Sub: The produce already existed nearby. Nothing connected it to the person
   who wanted it.

3. WHAT WE DO
   The seven services. Not seven identical cards — vary the rhythm: two large
   feature blocks with photographs (fresh produce, crop diagnosis), then five
   compact rows with an icon, a title and one line each.
   Each links to its section on /what-we-do.

4. THE MODEL
   Band in --paper-2. Headline: "We own nothing."
   Then a four-row comparison table, hairline-separated, no borders:
     Instead of a warehouse    →  the customer's own kirana shop
     Instead of cold storage   →  the farmer's field, the same day
     Instead of inventory      →  dealers who already hold stock
     Instead of manufacturing  →  resale of second-hand machinery
   Close with one line: "Asset-light by design, not by stage."

5. LANGUAGES
   Full-bleed band. Every language name set in its own script at a large size,
   flowing as a paragraph rather than a marquee — 23 names, 11 scripts, reading
   as one block of text. Beneath it, one sentence: every screen, product name
   and diagnosis rendered in the farmer's own script.
   Requires the Noto fonts. Without them this renders as empty boxes.

6. CLOSE
   Quiet. One line, one button to the app. No newsletter popup.
```

---

## BLOCK 4 — /what-we-do

```
One long page, seven anchored sections, a sticky in-page nav on the left at
desktop width.

For each service: a photograph, a two-sentence description of what it does, a
short "how it works" list of 3 steps, and one honest line about what it does
NOT do yet. That last line is unusual and it is the point — it builds trust.

  1. Fresh Produce          field → your door, never frozen
  2. Local Kirana Ordering  the shop is already there; we route the order
  3. Crop Disease Detection photo → named disease + confidence → treatment
  4. Government Schemes     eligibility, payout, deadline, apply link
  5. Seeds and Pesticides   dealers we visited in person before listing
  6. Second-Hand Machinery  good equipment a two-acre farmer can afford
  7. Mandi Prices           Government of India open data

For Seeds and Pesticides specifically, say plainly that the team visits the
dealer's shop and checks the stock before recommending anyone. A counterfeit
pesticide costs a smallholder an entire season — that is why this step is not
automated, and saying so is the strongest trust signal on the site.
```

---

## BLOCK 5 — /for-farmers

```
Written for the user, not about them. Plain language, short sentences, second
person. This page must read well when translated into 23 languages, so avoid
idiom, wordplay and long subordinate clauses.

Structure it as questions a farmer would actually ask:

  What does this cost me?
  What if I do not read English?
  What if my phone is old, or the network is slow?
  How do I know the dealer you recommend is honest?
  What happens to my photograph when I upload it?
  Who do I talk to if something goes wrong?

Answer each in three sentences or fewer. If an answer is "not yet", say "not
yet" rather than dressing it up.

Larger base type here — 18px — and a maximum of 60 characters per line.
```

---

## BLOCK 6 — /how-it-works and /for-partners

```
/how-it-works
  The asset-light model, explained with one diagram and prose. The diagram is a
  simple flow: Farmer / Kirana shop / Dealer → BhoomiX (the thin connecting
  layer) → Customer. Draw it as clean inline SVG, not an image, so it scales
  and can be translated. Label it in the active language.
  Then answer the obvious question directly: "What stops Blinkit doing this?"
  Honest answer — their model needs dark-store density that a town like Pawai
  cannot support, which is exactly why nobody serves it.

/for-partners
  For kirana shop owners and input dealers. What they get, what is asked of
  them, what it costs, and how to join. A short form: name, shop name, phone,
  district, what they sell. Nothing more — every extra field loses people.
  Make the phone field the most prominent one; it is how these conversations
  actually happen.
```

---

## BLOCK 7 — /about

```
The origin story, told properly, because it is the most persuasive thing here.

  Parthiv is from Pawai, in Panna district, Madhya Pradesh. Pawai has no quick
  commerce of any kind. He moved to Indore and found the opposite problem —
  everything available in ten minutes, and none of it fresh. Then he visited
  the farms at Deoguradia, twenty minutes outside the city, and realised the
  produce had been there all along.

  BhoomiX is built by two brothers. They registered the trademark and have put
  roughly ₹40,000 of their own money in. No outside funding.

Set it as an essay — one column, 68 characters wide, serif, generous leading,
with two photographs breaking the text. Not a "meet the team" card grid.

Founders section: two names, two roles, two real photographs. No stock
headshots, no LinkedIn-style tiles.
```

---

## BLOCK 8 — TECHNICAL REQUIREMENTS

```
PERFORMANCE — a design requirement, not an afterthought

  The primary audience is on cheap Android phones on patchy 3G. Budget:
    - Under 150KB of JavaScript on first load
    - Largest Contentful Paint under 2.5s on a simulated Slow 4G / 4x CPU
      throttle, not on your laptop
    - Every image in AVIF or WebP with width/height set, lazy below the fold
    - Fonts subset; preload only the active script; font-display: swap
    - Lighthouse Performance and Accessibility both ≥ 90 on MOBILE

  If a visual effect costs more than 20KB of JS, cut it.

ACCESSIBILITY — not optional

  - WCAG AA on every text/background pair. Check --ink-soft on --paper-2 and
    ochre on paper specifically; both are easy to get wrong.
  - Visible focus rings on every interactive element, 2px, offset.
  - Full keyboard operation. Skip-to-content link.
  - Real alt text on every photograph — describing content, not "image".
  - Language switching sets the <html lang> attribute, and dir="rtl" for Urdu,
    Kashmiri and Sindhi. Test that the layout does not break mirrored.
  - Tap targets minimum 44×44px. Assume an older phone and an imprecise tap.

SEO AND METADATA
  Real <title> and meta description per page. Open Graph image. Organization
  and WebSite structured data. A sitemap. hreflang for each language.

WHAT NOT TO BUILD
  No cookie banner beyond what the law requires. No newsletter modal. No live
  chat widget. No "trusted by" logo wall with invented logos. No testimonials
  you have to make up. No auto-playing video with sound.
```

---

## BLOCK 9 — FINAL CHECK

```
Before calling it done, verify each of these yourself:

  1. Every claim on the site is in the approved facts list. No invented numbers.
  2. The site works at 360px width.
  3. Switching to Hindi renders correctly — no empty boxes, no clipped
     descenders, no broken layout.
  4. Switching to Urdu mirrors the layout correctly (dir="rtl").
  5. Keyboard-only navigation reaches every link and control, in a sane order.
  6. prefers-reduced-motion disables all entrance animation.
  7. Mobile Lighthouse: Performance ≥ 90, Accessibility ≥ 90.
  8. Every image has meaningful alt text.
  9. No console errors.
 10. The word "revolutionary" does not appear anywhere on the site.
```

---

## NOTES FOR PARTHIV

**Why this direction.** Your current site is dark glass with green accents —
competent, but it looks like every other startup site, which is exactly the
problem you had when someone copied it. "Field Notes" is harder to copy because
it depends on real photography, real typographic judgement and real writing,
not on effects anyone can lift from a component library.

**The typography constraint is the real one.** Most beautiful landing pages
fall apart the moment you set them in Devanagari. Tight tracking, all-caps
eyebrows and thin display weights all break. The prompt is written so the
builder cannot paint itself into that corner — but if it offers you a gorgeous
condensed display font, check it in Hindi before you accept it.

**The performance budget is not padding.** Your users are the reason for it. A
4MB landing page is invisible to a farmer in Panna on 3G, however good it looks
on your laptop.

**BLOCK 5 (/for-farmers) is the page worth the most time.** It is the only page
that speaks to the actual user rather than about them, and it is the one an
investor will quote back at you as proof you understand the market.

**Do not skip the "what it does NOT do yet" lines in BLOCK 4.** They feel
counter-intuitive on a marketing site. They are the fastest way to be believed.
