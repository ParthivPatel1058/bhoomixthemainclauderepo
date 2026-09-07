# BhoomiX Landing Page — Prompt for Manus

Manus writes and runs real code, unlike Stitch and Framer which only emit mockups.
So this is an implementation brief — stack, libraries, file structure, working
motion — not a visual description.

Paste the whole block below in one message. Do not chunk it the way you had to for
Stitch and Framer; Manus is built for long, specific briefs.

---

```
Build a standalone marketing landing page for BhoomiX, an Indian agriculture
platform. This is a NEW static site, separate from the main app — it links out to
bhoomix.vercel.app, it does not replace it.

Audience: investors, press and competition judges, on desktop. Not farmers, not
mobile-first. Design for that.

═══════════════════════════════════════════════════════════════
STACK
═══════════════════════════════════════════════════════════════

Vite + React 18 + TypeScript + Tailwind CSS
Framer Motion          scroll-linked and hover animation
@react-three/fiber     the 3D terrain scene
@react-three/drei      helpers
lenis                  smooth scroll
lucide-react           icons

No CMS, no backend. Static content, single build.

Do NOT add GSAP. Framer Motion's useScroll/useTransform covers everything on this
page, and two animation libraries fighting over the same scroll position is a
source of bugs, not capability.

═══════════════════════════════════════════════════════════════
DESIGN TOKENS — put these in index.css and tailwind.config.ts exactly as given
═══════════════════════════════════════════════════════════════

Colours (CSS custom properties, HSL triplets, mapped into Tailwind):
  --bg-paper          150 14% 93%    cool off-white with a green cast, NOT cream
  --bg-ink            160 24% 6%
  --surface-card      0 0% 100%
  --text-ink          160 22% 8%
  --text-muted        160 9% 35%
  --text-on-dark      150 20% 97%
  --brand-field       168 72% 30%    deep field green, primary actions
  --brand-ochre       38 68% 46%     turmeric, fills and badges ONLY
  --brand-ochre-ink   38 68% 32%     ochre for TEXT — the fill value fails AA
  --line-hair         150 12% 84%

Exactly two hues: field green and turmeric ochre. Never a third accent. One accent
colour per section, maximum.

Note the two ochres. The fill value measures about 3:1 on paper, which fails AA for
small text. Any ochre that appears as type — eyebrows, emphasised figures — uses
--brand-ochre-ink. Do not collapse these into one token.

Fonts — Google Fonts for the Latin faces, and every Noto family listed:
  Display   "Bricolage Grotesque" 700, tracking -0.03em
  Body      "Inter" 400/500/600
  Indic     Noto Sans Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam,
            Gujarati, Gurmukhi, Oriya, plus Noto Nastaliq Urdu

Type scale:
  display   clamp(4rem, 8vw, 7rem)      700, line-height 0.95, tracking -3%
  h1        clamp(2.5rem, 5vw, 4rem)    700, tracking -3%
  h2        clamp(1.75rem, 3vw, 2.75rem) 700, tracking -2%
  h3        1.75rem                      600
  body      1.125rem                     line-height 1.6, --text-muted
  eyebrow   0.6875rem  600, uppercase, tracking 0.28em, --brand-ochre-ink
  figure    3.5rem     700, font-variant-numeric: tabular-nums

Every numeral on this page uses tabular figures. Put this on a .figure utility
class rather than repeating it per instance.

Radius: 0 / 8 / 14 / 20 / 999px. Only these. Cards default to 20px.

Shadows — soft and low, never hard:
  --shadow-raised    0 2px 6px rgba(16,32,26,0.06)
  --shadow-floating  0 24px 60px -18px rgba(16,32,26,0.26)

═══════════════════════════════════════════════════════════════
MOTION PRIMITIVES — build these three first, then use them everywhere
═══════════════════════════════════════════════════════════════

1. <SmoothScroll> — mounts Lenis once at the app root. duration 1.15, exponential
   easing. If prefers-reduced-motion is set it must mount NO Lenis instance and
   render children directly. Momentum scroll changes how the primary navigation of
   the page behaves; this is not a decorative effect and the check is not optional.

2. <Reveal> — Framer Motion whileInView, fade + rise 24px, 0.8s,
   ease [0.16, 1, 0.3, 1], viewport={{ once: true, margin: "-10%" }}.
   Accepts a stagger prop for children.

3. <ParallaxLayer speed={n}> — useScroll + useTransform translating Y by `speed`
   PIXELS across the element's scroll range. Positive lags the scroll, negative
   leads it.

   Pixels, not percentages. Percentage transforms are measured against each
   element's own height, so a tall copy block and a short card given different
   percentages end up travelling nearly the same distance and produce no visible
   depth at all. Use px and the numbers below.

Global: one reduced-motion check that disables Lenis, freezes ParallaxLayer, stops
the 3D auto-rotation, and drops Reveal to opacity-only.

═══════════════════════════════════════════════════════════════
SECTION 1 — HERO, WITH REAL 3D
═══════════════════════════════════════════════════════════════

min-height 100vh.

3D SCENE (react-three-fiber), full-bleed behind the text:

  Geometry: a PlaneGeometry with displaced vertices forming ploughed farmland.
  Use seeded simplex noise — low-frequency 1D noise along one axis to make furrows
  that run toward the horizon, plus a higher-frequency ripple perpendicular to it
  for soil texture. A flat plane with random bumps will not read as a field; the
  directional furrow structure is the whole point.

  Material: MeshStandardMaterial tinted from --brand-field.

  Lighting: ONE warm DirectionalLight, positioned low and to one side, raking
  across the furrows. This is what makes ridges read as ridges. If the terrain
  ends up looking like a flat green plane with bumps, the fix is the light angle
  and colour temperature, not more geometry.

  Camera: low angle looking slightly down the field. Very slow autonomous
  rotation (under 2 degrees over 20 seconds) plus pointer parallax that is DAMPED
  via lerp inside useFrame — a direct 1:1 pointer mapping feels jittery and cheap,
  damping feels expensive.

  Fog: exponential fog matching --bg-paper so the terrain dissolves into the page
  instead of ending at a hard horizon.

  Performance, all of these:
    - cap the mesh around 8000 triangles
    - dpr={[1, 1.5]} on the Canvas
    - frameloop="demand", invalidating on pointer move and scroll
    - stop invalidating entirely once the hero leaves the viewport. A WebGL
      context left rendering behind the rest of the page is real battery and
      fan noise on a laptop, and reviewers notice it.

  Resilience, both required:
    - wrap the Canvas in Suspense with a static gradient fallback in the
      terrain's colour, so there is never a white flash while Three.js boots
    - feature-detect WebGL before mounting; if unavailable, render a static
      photograph of an Indian crop field at golden hour with the same scrim.
      Never show a broken or blank canvas.

FOREGROUND, left-aligned, max-width 60%, above the canvas:
  eyebrow  AGRICULTURE PLATFORM
  display  Grow Smarter
  body 1.375rem  Crop disease detection, government schemes, second-hand machinery
                 and farm inputs. One app, 23 Indian languages.
  buttons:
    primary   --brand-field fill, white text, 999px → https://bhoomix.vercel.app
              label "Open the app"
    secondary transparent, 1px white border, "See how it works", scrolls to §2

RIGHT — floating frosted card, absolute bottom-right within the hero.
backdrop-blur-xl, bg-white/10, border-white/20, radius 20, width 320:
  Three rows, hairline dividers. Each: a tabular figure in a fixed 64px column,
  then a two-line label.
    23    Indian languages, in their own script
    72h   The PMFBY claim window, counted for you
    0     Warehouses. We source from shops already in the village.
  This is the page's signature element. Exactly three rows. Do not add a fourth.

SCROLL DEPTH — ParallaxLayer speeds, all different:
    3D canvas   speed={40}    lags
    headline    speed={-30}   leads
    stat card   speed={-80}   leads most, reads as nearest

BOTTOM EDGE — a terrain-ridge SVG divider.

  Irregular, NOT a smooth wave. Generate the path with a seeded midpoint-
  displacement function written as a utility (not hand-drawn bezier control
  points) so it carries detail at several scales: broad rises, bumps on the
  rises, small rocks on the bumps. A sine curve is the one shape ground never
  makes and it reads instantly as decoration.

  Two overlapping ridges: the far one higher and at 55% opacity, the near one
  opaque, and content begins against the near one.

  Each ridge is filled with a VERTICAL GRADIENT from an earth tone at the crest
  down to exactly --bg-paper at the foot — not a flat fill. A flat fill in the
  page colour reads as fog lying over the photo, not as ground catching light.

  Add a 1px rim along the near crest at low opacity. In light themes the tonal
  step alone defines the shape; the rim is what keeps it visible if the section
  colours are ever darkened.

═══════════════════════════════════════════════════════════════
SECTION 2 — WHAT IT DOES (horizontal scroll)
═══════════════════════════════════════════════════════════════

A wrapper 300vh tall containing a sticky viewport-height panel. Four cards
translate horizontally as the user scrolls down through it: useScroll on the tall
wrapper with offset ["start start", "end end"], one useTransform driving translateX
on the card row.

Cards: 480px wide, radius 20, white surface, photo filling the top half.

  1  eyebrow CROP DISEASE · h3 "Photograph the leaf"
     The app names the disease, gives a confidence score, and prescribes the
     treatment. Purchasable in the same app.

  2  eyebrow GOVERNMENT SCHEMES · h3 "Eligibility, checked"
     Which central and state schemes the farmer qualifies for, what each pays,
     the deadline, and a direct link to apply.

  3  eyebrow MACHINERY · h3 "Second-hand tractors and equipment"
     Resale of used farm machinery. Good equipment at a price a two-acre farmer
     can actually reach.

  4  eyebrow SEED AND INPUTS · h3 "Through local dealers"
     Certified seed and crop protection sourced from dealers already in the
     district, so the price stays low and the quality stays verifiable.

Use real Unsplash photography for the four images — greenhouse leaf, a farmer
with a document, a tractor, a seed sack. No grey placeholder boxes.

BELOW 900px viewport width: do not run the horizontal mechanic. Collapse to a
plain vertical stack of the same four cards. Horizontal-scroll-on-vertical-scroll
is disorienting on a phone and traps the scroll.

═══════════════════════════════════════════════════════════════
SECTION 3 — THE MODEL
═══════════════════════════════════════════════════════════════

Two columns on --bg-ink.

LEFT, position sticky top 20vh while the right column scrolls past:
  eyebrow THE MODEL
  h1 in --text-on-dark:  We own nothing.
  body at 70% opacity: No warehouses, no inventory, no last-mile fleet. Every
  transaction routes through businesses already operating in the village.

RIGHT — three cards, each in <Reveal>, 80ms stagger:
  No warehouse   Groceries come from the customer's own nearby shop. The farmer
                 sets their location, the order goes straight there.
  No inventory   Seed and crop protection move through local dealers who already
                 hold stock and already have the farmer's trust.
  No new hardware  Machinery is resold, not manufactured.

Full width beneath both columns, centred, h2 in --brand-ochre:
  Asset-light by design, not by stage.

═══════════════════════════════════════════════════════════════
SECTION 4 — LANGUAGES  (the strongest section on the page)
═══════════════════════════════════════════════════════════════

Full viewport, --bg-paper.

Two marquee rows moving in opposite directions. Each item is a language's own
endonym at 4.5rem, in its correct script and font.

  Row 1, rightward:
  हिन्दी · বাংলা · தமிழ் · ಕನ್ನಡ · ગુજરાતી · ਪੰਜਾਬੀ · ଓଡ଼ିଆ · മലയാളം · తెలుగు · मराठी

  Row 2, leftward:
  অসমীয়া · اردو · कोंकणी · संस्कृतम् · मैथिली · नेपाली · डोगरी · बड़ो · ᱥᱟᱱᱛᱟᱲᱤ ·
  ꯃꯤꯇꯩꯂꯣꯟ · کٲشُر · سنڌي

Implement as a CSS keyframe translateX(-50%) over a row containing the list
duplicated twice. 45–60s per loop so it reads calm, not busy.
animation-play-state: paused on hover. Pause entirely under reduced motion.

Overlaid centre on a frosted panel:
  figure  23
  h2      languages. Eleven scripts. Three right-to-left.
  body    Every screen, product name and diagnosis rendered in the farmer's own
          script, in a typeface chosen for it.

CRITICAL: this section is worthless if the fonts fail to load. Explicitly link
every Noto family named in the tokens block, then open the BUILT page and visually
confirm each row renders real glyphs and not tofu boxes. Treat that check as part
of finishing the section, not as QA to do later. This is the single most important
visual proof point on the page.

═══════════════════════════════════════════════════════════════
SECTION 5 — PRODUCT PREVIEW
═══════════════════════════════════════════════════════════════

--bg-paper. Centre: a phone frame using CSS 3D (perspective + rotateY, tilted
about 8 degrees, rotating toward centre on scroll via ParallaxLayer) with an app
screenshot inside. Use CSS here, not a second WebGL canvas — a styled transformed
div is enough and a second Three.js context on one page is not worth the cost.

Four callouts positioned around the phone, each joined to a point on it by a 1px
line, appearing via <Reveal> with stagger:
  Disease named, with a confidence score
  Treatment purchasable in-app
  Scheme eligibility checked
  72-hour claim countdown

Beneath, three trust marks in --text-muted:
  Government of India open data · 23 Eighth Schedule languages · Live at
  bhoomix.vercel.app

═══════════════════════════════════════════════════════════════
SECTION 6 — SPECIFICATIONS
═══════════════════════════════════════════════════════════════

A plain two-column table on --bg-paper, hairline row dividers, zero decoration.
Built to be scanned, not admired. Reviewers look for this.

  Languages       23, across 11 scripts, 3 right-to-left
  Crop disease    Photo diagnosis with confidence score and treatment
  Mandi data      Government of India open data, refreshed daily
  Claim support   72-hour PMFBY countdown with GPS, timestamp and rainfall
  Schemes         Central and state, with eligibility and direct apply links
  Machinery       Second-hand resale
  Inputs          Seed and crop protection through local dealers
  Groceries       Sourced from the customer's nearby shop
  Platform        Web, live. iOS and Android in development.
  Warehouses      None

═══════════════════════════════════════════════════════════════
SECTION 7 — TEAM
═══════════════════════════════════════════════════════════════

Two columns, --bg-paper.
Left: a generic placeholder portrait, radius 20, filling the column. Do not
generate or invent a photograph of a real person.
Right:
  eyebrow TEAM
  h2      Built by two founders.
  Two name blocks: "Parthiv Patel — Co-founder", "Prayansh — Co-founder"
  One paragraph: Parthiv's family farms. The product is built from inside the
  problem.
Keep it to that one paragraph.

═══════════════════════════════════════════════════════════════
SECTION 8 — CLOSE
═══════════════════════════════════════════════════════════════

Full viewport, --bg-ink.
  display  Open the app.
  body at 70%  Live today in 23 Indian languages.
  one button, --brand-field, 999px, "bhoomix.vercel.app", links out

Background: the same generated terrain ridge, mirrored, along the TOP edge of this
section, so the page closes the way it opened. Reuse the HillDivider component with
a flip prop — do not write a second ridge generator.

FOOTER on --bg-ink: BhoomiX wordmark around 7rem with the X in --brand-ochre, four
link columns (Product / Company / Legal / Contact) with placeholder hrefs, and a
bottom row with copyright and lucide-react social icons.

═══════════════════════════════════════════════════════════════
FILE STRUCTURE — build it this way, not as one large page file
═══════════════════════════════════════════════════════════════

src/
  components/
    motion/SmoothScroll.tsx
    motion/Reveal.tsx
    motion/ParallaxLayer.tsx
    three/TerrainScene.tsx        Canvas, mesh, lighting, frameloop control
    three/terrainGeometry.ts      seeded noise displacement, pure function
    ui/HillDivider.tsx            seeded ridge generator, reused top and bottom
    ui/LanguageMarquee.tsx
    ui/PhoneMockup.tsx
    ui/SpecTable.tsx
  sections/
    Hero.tsx  WhatItDoes.tsx  TheModel.tsx  Languages.tsx
    ProductPreview.tsx  Specifications.tsx  Team.tsx  Close.tsx
  App.tsx        composes the sections in order inside <SmoothScroll>
  index.css      tokens, font imports, base styles

═══════════════════════════════════════════════════════════════
ACCEPTANCE CRITERIA — check every one before calling this done
═══════════════════════════════════════════════════════════════

[ ] Builds with zero TypeScript errors
[ ] Lighthouse performance above 80 on the BUILT bundle, not the dev server.
    The R3F canvas is the main risk — profile it before assuming it passes.
[ ] prefers-reduced-motion: reduce disables Lenis, parallax, 3D rotation and the
    marquee, and the page remains fully readable and usable with all of it static
[ ] Every Noto script in §4 renders real glyphs, verified by eye on the built page
[ ] WebGL failure falls back to the static photograph, verified by forcing it
[ ] No layout shift when the 3D scene or the fonts finish loading — reserve space
[ ] Tabular figures actually align: check 23 / 72h / 0 in the hero card share a
    baseline and a common digit width
[ ] Visible keyboard focus on both hero buttons and the close CTA
[ ] Responsive to 768px, with §2 collapsed to a vertical stack below 900px
```

---

## NOTES FOR YOU — not part of the prompt

**Why real WebGL here when I talked you out of it in the app.** The BhoomiX app
serves farmers on rural, often metered connections, so a multi-megabyte 3D runtime
was the wrong trade. This page serves investors and judges on desktop broadband.
Same product, different audience, different budget — that is why this brief asks
for Three.js and the app brief did not.

**Feed it in one message.** Manus installs packages, writes files, runs the build
and iterates on its own errors. Chunking it, as you had to for Stitch and Framer,
would actually make the output worse here.

**The terrain is the highest-risk piece.** If it comes back looking like a green
plane with lumps, tell Manus to lower the directional light angle and warm its
colour before touching the geometry. Raking light is what makes furrows read.

**If Lighthouse lands under 80,** check first whether the Canvas is still
rendering after the hero scrolls away. `frameloop="demand"` plus stopping
invalidation on scroll-out usually recovers most of the score on its own.

**One thing to watch in review:** the two ochre tokens. If Manus collapses
`--brand-ochre` and `--brand-ochre-ink` into a single value, every eyebrow on the
page drops to roughly 3:1 contrast and fails AA. It is an easy simplification for
a model to make and a real accessibility regression.
