# BhoomiX Landing Page — Framer AI Prompt

Direct product page. No narrative sections.

Paste **BLOCK 0** first, once. Then one section block per message — Framer's agent
degrades on very long prompts.

---

## BLOCK 0 — DESIGN SYSTEM (paste first)

```
Build a landing page for BhoomiX, an Indian agriculture platform. Desktop 1200,
responsive down to tablet and phone.

Direct and factual. State what the product does. No storytelling, no build-up, no
emotional framing. Every section leads with the thing itself.

COLOUR STYLES — create these as Framer Color Styles with these exact names:
  bg/paper       #EAF0EC   page background, cool off-white with a green cast
  bg/ink         #0C1512   dark sections
  surface/card   #FFFFFF
  text/ink       #10201A
  text/muted     #4F615A
  text/onDark    #F2F7F4
  brand/field    #158A66   deep field green, primary actions
  brand/ochre    #C08A1F   turmeric accent, fills and badges only
  brand/ochreInk #8A6317   ochre for TEXT, the fill version fails contrast
  line/hair      #D5DEDA

Two hues only: field green and turmeric ochre. Never a third accent. One accent
per section.

TEXT STYLES — create these as Framer Text Styles:
  Display    Bricolage Grotesque, 700, 96px, line-height 0.95, letter-spacing -3%
  H1         Bricolage Grotesque, 700, 64px, line-height 1.0,  letter-spacing -3%
  H2         Bricolage Grotesque, 700, 44px, line-height 1.05, letter-spacing -2%
  H3         Bricolage Grotesque, 600, 28px, line-height 1.2
  Body       Inter, 400, 18px, line-height 1.6, colour text/muted
  Eyebrow    Inter, 600, 11px, uppercase, letter-spacing 0.28em, colour brand/ochreInk
  Figure     Inter, 700, 56px, tabular numerals ON
  Caption    Inter, 400, 13px, colour text/muted

Every number uses TABULAR NUMERALS. This product is about rates and figures.

SHAPE
  Radius: 0 / 8 / 14 / 20 / 999. Nothing else. Cards default to 20.
  Shadows soft and low: 0 2px 6px rgba(16,32,26,0.06),
  0 24px 60px -18px rgba(16,32,26,0.26). Never a hard drop shadow.

MOTION — use Framer's own effects:
  Appear: fade up 24px, 0.8s ease-out, 80ms stagger between siblings.
  Scroll Transform for parallax. Sticky sections for pinned scroll.
  Enable Framer's reduced-motion accessibility setting.
  Slow and expensive. Nothing bouncy.
```

---

## SECTION 1 — HERO

```
Full viewport height.

BACKGROUND: a Spline 3D scene, full-bleed, behind the text — a slowly rotating 3D
terrain tile of ploughed farmland at golden hour, with subtle mouse parallax. If
Spline is unavailable, use a full-bleed photograph of an Indian crop field at golden
hour with a dark gradient scrim from the bottom.

FOREGROUND, left aligned, max width 60%:
  Eyebrow:  AGRICULTURE PLATFORM
  Display:  Grow Smarter
  Body at 22px: Crop disease detection, government schemes, second-hand machinery
  and farm inputs. One app, 23 Indian languages.
  Two buttons in a row:
    primary, brand/field fill, 999 radius, white text: "Open the app"
    secondary, transparent, 1px white border: "See how it works"

RIGHT SIDE, floating frosted-glass card, 20px radius, 320px wide:
  Three rows separated by hairlines. Each: a large tabular figure in a fixed 64px
  column, then a two-line label.
    23     Indian languages, in their own script
    72h    The PMFBY claim window, counted for you
    0      Warehouses. We source from shops already in the village.
  This is the signature element. Do not add a fourth row.

BOTTOM EDGE: an irregular terrain ridge — NOT a straight line, NOT a smooth wave.
A rocky, uneven hill silhouette with small bumps, filled in bg/paper, with a faint
1px light rim along the crest. Two overlapping ridges at slightly different heights
and opacities so it reads as distance.

SCROLL: the 3D scene moves up at 0.3x, the headline at 1.0x, the stat card at 1.4x.
Apply Framer Scroll Transform to each layer separately. The different speeds are
what create the depth.
```

---

## SECTION 2 — WHAT IT DOES

```
Horizontal scroll on bg/paper. Four cards move left as the user scrolls down.
Use a Sticky section with Scroll Transform on the x axis.

Each card: 480px wide, 20px radius, surface/card, photograph filling the top half,
content beneath.

CARD 1
  Eyebrow: CROP DISEASE
  H3: Photograph the leaf
  Body: The app names the disease, gives a confidence score, and prescribes the
  treatment. The treatment is purchasable in the same app.

CARD 2
  Eyebrow: GOVERNMENT SCHEMES
  H3: Eligibility, checked
  Body: Which central and state schemes the farmer qualifies for, what each pays,
  the deadline, and a direct link to the official application.

CARD 3
  Eyebrow: MACHINERY
  H3: Second-hand tractors and equipment
  Body: Resale of used farm machinery. Good equipment at a price a two-acre farmer
  can reach.

CARD 4
  Eyebrow: SEED AND INPUTS
  H3: Through local dealers
  Body: Certified seed and crop protection sourced from dealers already in the
  district, so the price stays low and the quality stays verifiable.
```

---

## SECTION 3 — THE MODEL

```
Two-column section on bg/ink.

LEFT, sticky while the right column scrolls:
  Eyebrow: THE MODEL
  H1 in text/onDark: We own nothing.
  Body in text/onDark at 70%: No warehouses, no inventory, no last-mile fleet.
  Every transaction routes through businesses already operating in the village.

RIGHT, three stacked cards, appearing on scroll with 80ms stagger:
  "No warehouse" — Groceries come from the customer's own nearby shop. The farmer
  sets their location, the app finds the shop, the order goes straight there.
  "No inventory" — Seed and crop protection move through local dealers who already
  hold stock.
  "No new hardware" — Machinery is resold, not manufactured.

Below both columns, full width, centred, H2 in brand/ochre:
  Asset-light by design, not by stage.
```

---

## SECTION 4 — LANGUAGES

```
Full viewport on bg/paper. This is the strongest section on the page.

Centre: a marquee of language names scrolling horizontally, two rows moving in
opposite directions, each name in ITS OWN SCRIPT at 72px:
  हिन्दी  বাংলা  தமிழ்  ಕನ್ನಡ  ગુજરાતી  ਪੰਜਾਬੀ  ଓଡ଼ିଆ  മലയാളം  తెలుగు  मराठी  অসমীয়া
  اردو  कोंकणी  संस्कृतम्  मैथिली  नेपाली  डोगरी  बड़ो  ᱥᱟᱱᱛᱟᱲᱤ  ꯃꯤꯇꯩꯂꯣꯟ  کٲشُر  سنڌي
Runs continuously, slows on hover.

Overlaid centre, on a frosted panel:
  Figure: 23
  H2: languages. Eleven scripts. Three right-to-left.
  Body: Every screen, product name and diagnosis rendered in the farmer's own
  script, in a typeface chosen for it.

REQUIRED: load Noto Sans Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam,
Gujarati, Gurmukhi, Oriya and Noto Nastaliq Urdu as web fonts in Framer. Without
them this section renders as empty boxes.
```

---

## SECTION 5 — PRODUCT PREVIEW

```
Section on bg/paper.

Centre: a 3D perspective phone mockup, tilted slightly, rotating a few degrees with
the mouse. Inside the screen, a scrolling capture of the actual app.

Four callout labels around it, connected by thin hairlines to points on the phone,
each appearing on scroll with a stagger:
  "Disease named, with a confidence score"
  "Treatment purchasable in-app"
  "Scheme eligibility checked"
  "72-hour claim countdown"

Beneath, a row of three trust marks in text/muted:
  Government of India open data · 23 Eighth Schedule languages · Live at
  bhoomix.vercel.app
```

---

## SECTION 6 — SPECIFICATIONS

```
Section on bg/paper. A plain specification table, two columns, hairline dividers.
No decoration. This section exists to be scanned.

  Languages            23, across 11 scripts, 3 right-to-left
  Crop disease         Photo diagnosis with confidence score and treatment
  Mandi data           Government of India open data, refreshed daily
  Claim support        72-hour PMFBY countdown with GPS, timestamp and rainfall
  Schemes              Central and state, with eligibility and direct apply links
  Machinery            Second-hand resale
  Inputs               Seed and crop protection through local dealers
  Groceries            Sourced from the customer's nearby shop
  Platform             Web, live. iOS and Android in development.
  Warehouses           None
```

---

## SECTION 7 — TEAM

```
Two-column section on bg/paper.
Left: a photograph of the two founders, 20px radius, filling the column.
Right:
  Eyebrow: TEAM
  H2: Built by two founders.
  Two name blocks: "Parthiv Patel, Co-founder" and "Prayansh, Co-founder", each with
  a one-line role beneath.
  Body: Parthiv's family farms. The product is built from inside the problem.
Keep this section short. One paragraph maximum.
```

---

## SECTION 8 — CLOSE

```
Full viewport on bg/ink.
Centred, Display size, text/onDark: Open the app.
Body beneath in text/onDark at 70%: Live today in 23 Indian languages.
One primary button, brand/field, 999 radius: "bhoomix.vercel.app"
Background: the terrain ridge from the hero, mirrored, sitting at the top edge so
the page closes the way it opened.

FOOTER: bg/ink, a large BhoomiX wordmark at 120px with the X in brand/ochre, then
four link columns — Product, Company, Legal, Contact — and a bottom row with
copyright and social icons.
```

---

## FRAMER NOTES

**Fonts.** Bricolage Grotesque and Inter are on Google Fonts and available in Framer
directly. The Noto scripts must be added manually under Assets → Fonts, or Section 4
renders as empty rectangles.

**3D.** Framer is not a 3D engine. For real 3D, build the scene at spline.design,
publish it, and paste the URL into a Framer Embed component. Keep it under about
3 MB and lazy-load it, or the hero blocks first paint.

A cheaper alternative that usually looks better: skip Spline and use Framer's own
Scroll Transform on layered PNGs. Most "3D" landing pages are exactly this.

**Performance.** Publish, then run PageSpeed Insights. A slow page in front of an
investor who checks is worse than no 3D at all.

**Free plan.** Publishes to a `.framer.website` subdomain with no custom domain.
Remove the "Made in Framer" badge before presenting this as a company.
