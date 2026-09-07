# BhoomiX — UI Upgrade Prompt for Manus

Modify the **existing** app in place. Do not rebuild it.

Adds: a neumorphic + liquid-glass material system, scroll-driven 3D depth, and a
proper type scale.

**How to use:** paste **BLOCK 0** alone first — it stops Manus making the two
mistakes that would break the build. Then one block per message.

---

## BLOCK 0 — THE PROJECT (paste this alone, first)

```
You are modifying an EXISTING, WORKING React application. Do not scaffold a new
project. Do not rewrite pages. Do not change routing, data fetching, Supabase
calls, or any business logic. You are changing the visual layer only.

THE STACK — verify before you write a single line

  Vite 5.4          NOT Next.js. There is no app/ directory, no server
                    components, and `"use client"` does nothing. Never add it.
  React 18.3        react-router-dom 6.30 for routing
  Tailwind CSS 3.4  NOT v4. This matters:
                      - use `bg-gradient-to-b`, NOT `bg-linear-to-b`
                      - `shadow-[...]` arbitrary values work in v3
                      - `size-*` works (3.4+), `@theme` does NOT
  TypeScript 5.8    strict; no `any`
  shadcn/ui         components live in src/components/ui/
  Path alias        `@/` maps to `src/`

ALREADY INSTALLED — use these, do NOT add new animation libraries

  gsap 3.15 + @gsap/react   scroll timelines, already wrapped in src/lib/gsap.ts
  lenis 1.3                 smooth scroll, already mounted in SmoothScroll.tsx
  framer-motion 11.18       component animation, used across the app
  @paper-design/shaders     WebGL shaders (already used by LiquidMetalButton)
  ogl                       lightweight WebGL

  If you reach for three.js, @react-three/fiber, locomotive-scroll,
  react-spring, or another motion library — STOP. The answer is already
  installed. Adding one is an automatic failure of this task.

THE HARD CONSTRAINT — read this twice

  The production bundle is currently 1,124 KB raw / 353 KB gzipped. The primary
  users are farmers in rural India on cheap Android phones over patchy 3G. At
  that connection 353 KB is roughly seven seconds before anything paints.

  Your total net addition must be UNDER 25 KB gzipped.

  Every effect in this brief must be achieved with CSS — box-shadow, backdrop-
  filter, transform, gradients — plus the GSAP and Lenis already present. If an
  effect needs a new dependency, do it in CSS or do not do it.

  You may DELETE things to make room. Unused code removed is a win, not a risk.

WHAT YOU MUST NOT BREAK
  - The 23-language / 11-script i18n system, including 3 right-to-left languages
  - Supabase auth, the cart, and all form submissions
  - The existing `.glass` utility (used in 108 places) — extend it, do not
    delete it or rename it
  - prefers-reduced-motion handling that already exists
```

---

## BLOCK 1 — THE MATERIAL SYSTEM (the most important block)

```
You have been asked for BOTH neumorphism AND liquid glass. Used carelessly they
contradict each other and the result looks confused:

  Neumorphism  = opaque, extruded from the background, same hue as the surface
                 behind it. The metaphor is "carved from the page."
  Liquid glass = translucent, refracting what is behind it, clearly floating
                 above. The metaphor is "a pane held over the page."

An element cannot be both carved from the page and floating above it.

THE RULE — assign each material a job, and never mix them on one element:

  NEUMORPHIC — things you TOUCH. They sit IN the page.
    buttons, toggles, switches, sliders, radio and checkbox controls,
    input fields, segmented controls, stat tiles, pressable cards

  LIQUID GLASS — things that FLOAT OVER content. They sit ABOVE the page.
    the top navigation bar, the sidebar, modals and dialogs, the cart drawer,
    the spotlight search palette, toasts, dropdown menus, bottom sheets

  FLAT — everything else. Body text, images, lists, tables, page backgrounds.
    Most of the page must remain flat. If every surface has a material, none
    of them read as special.

Apply that rule literally. A glass button is wrong. A neumorphic modal is wrong.

Add new CSS variables to src/index.css alongside the existing tokens. Do NOT
replace the existing --background / --card / --primary tokens; other components
depend on them.
```

---

## BLOCK 2 — NEUMORPHISM (with the accessibility fix)

```
Neumorphism has one famous failure: it conveys state through low-contrast soft
shadows, which fail WCAG AA and vanish on a cheap screen in daylight. Your users
are outdoors, in sun, on budget phones. So build it with this correction:

  THE SHADOWS CARRY THE SHAPE. COLOUR AND TEXT CARRY THE MEANING.

  Never let a soft shadow be the only signal for pressed, selected, disabled,
  focused or invalid. Always pair it with a colour change, a border, an icon,
  or a text label.

TOKENS — add to :root in src/index.css

  --neu-surface   the surface colour. Must be a MID tone, not white.
                  light: hsl(40 22% 93%)   a warm off-white
                  dark:  hsl(150 8% 14%)
  --neu-light     highlight, top-left.  light: hsl(0 0% 100% / .9)
                                        dark:  hsl(150 10% 22% / .55)
  --neu-shadow    shade, bottom-right.  light: hsl(40 18% 72% / .75)
                                        dark:  hsl(150 20% 4% / .6)

  Neumorphism only works when the element and its parent are the SAME colour.
  On a photograph or a gradient it collapses. Use it on --neu-surface panels only.

UTILITIES — add to @layer components in src/index.css

  .neu-raised   box-shadow: 6px 6px 14px var(--neu-shadow),
                            -6px -6px 14px var(--neu-light);
  .neu-pressed  box-shadow: inset 5px 5px 10px var(--neu-shadow),
                            inset -5px -5px 10px var(--neu-light);
  .neu-flat     box-shadow: 3px 3px 8px var(--neu-shadow),
                            -3px -3px 8px var(--neu-light);

  Radius: 14px to 20px. Neumorphism needs generous corners; sharp corners
  break the illusion of extrusion.

INTERACTION
  rest      .neu-raised
  hover     soften to .neu-flat, 180ms ease-out
  active    .neu-pressed, 90ms — it should feel like it depresses
  focus     .neu-pressed PLUS a visible 2px --primary ring at 2px offset.
            The ring is mandatory. A neumorphic focus state alone is invisible.
  disabled  .neu-flat at 55% opacity plus a cursor change

APPLY TO
  src/components/ui/button.tsx   a new `neu` variant. Do NOT change the existing
                                 variants — other pages depend on them
  src/components/ui/input.tsx    .neu-pressed as the resting state; an inset
                                 field reads as somewhere to put something
  switch.tsx, checkbox.tsx, radio-group.tsx, slider.tsx
  the stat tiles on the home page
```

---

## BLOCK 3 — LIQUID GLASS

```
Extend the existing `.glass` utility rather than replacing it. Add richer
variants beside it so the 108 existing usages keep working untouched.

WHAT MAKES IT READ AS GLASS — all four, not just blur:

  1. backdrop-filter: blur(20px) saturate(180%)
     The saturate is what stops it looking like grey fog. Do not omit it.
  2. A translucent fill: hsl(var(--card) / 0.62)
  3. A 1px hairline border, brighter at the top:
     border: 1px solid hsl(0 0% 100% / .18)
  4. An inner top highlight — the actual "liquid" cue:
     box-shadow: inset 0 1px 0 0 hsl(0 0% 100% / .35),
                 0 8px 32px -12px hsl(150 30% 8% / .38);

UTILITIES — add to @layer components

  .glass-pane   the four properties above. Chrome and panels.
  .glass-float  the same, plus a stronger drop shadow. Modals and drawers.
  .glass-edge   adds a 1px gradient border, bright top-left fading to
                bottom-right, so the pane catches light from one direction.

THE REFRACTIVE EDGE — what makes it feel liquid rather than merely frosted

  Give .glass-edge a ::before that is a 1px inset gradient ring:
    background: linear-gradient(140deg,
      hsl(0 0% 100% / .5), transparent 40%, transparent 60%,
      hsl(0 0% 100% / .18));
    then mask-composite so only the border shows.
  Pure CSS. No SVG filter, no shader, no library.

FALLBACK — required, not optional
  @supports not (backdrop-filter: blur(1px)) — fall back to an opaque
  hsl(var(--card)) fill. On a low-end Android that cannot composite backdrop
  filters, translucent panels become unreadable text over photographs.

PERFORMANCE — backdrop-filter is the most expensive thing in this brief
  - Maximum FOUR elements with backdrop-filter on screen at once
  - Never put backdrop-filter on anything inside a scrolling list
  - Never animate the blur radius. Animate opacity or transform instead
  - Add `will-change: transform` ONLY to panels that actually move

APPLY TO
  Navigation.tsx, Sidebar.tsx, CartDrawer / CartSheet, spotlight-search.tsx,
  dialog.tsx, sheet.tsx, dropdown-menu.tsx, sonner toasts
```

---

## BLOCK 4 — 3D SCROLL DEPTH

```
Use the GSAP and Lenis already installed and already wired together.
src/lib/gsap.ts registers the plugins; SmoothScroll.tsx mounts Lenis. Do not
add a scroll library.

THE PRINCIPLE
  Depth comes from layers moving at DIFFERENT SPEEDS, not from rotating things.
  Parallax reads as space. Spinning reads as a gimmick.

  Animate only `transform` and `opacity` — both composite on the GPU. Animating
  top, left, width, height or margin on scroll will jank the page.

1. LAYERED PARALLAX — home hero
   Three layers, back to front, one ScrollTrigger with scrub: 1
     background photograph   y: 0 -> 12%   (slowest)
     mid content             y: 0 -> 4%
     foreground card         y: 0 -> -6%   (moves against the scroll)
   Things nearer the viewer must move MORE than things behind them. Getting
   this backwards reads as a glitch, not as depth.

2. CARD DEPTH ON ENTRY
   As each section scrolls in: translateY 40px -> 0, translateZ -60px -> 0,
   opacity 0 -> 1, over ~500ms with a 60ms stagger.
   The parent needs `perspective: 1200px` or translateZ does nothing.

3. STICKY SCENE — use exactly ONCE on the whole site
   One section pins for about 200vh while its content advances through three
   states. More than one and the site feels like it is fighting the user.

4. SCROLL-LINKED HEADER
   The nav goes from transparent to .glass-pane between 0 and 80px of scroll.
   Interpolate opacity and blur with GSAP, not a class toggle, so it is smooth.

REDUCED MOTION — mandatory
  Wrap every scroll animation in:
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  Do not merely shorten durations. Skip creating the timelines at all.

MOBILE — mandatory
  Disable parallax and the sticky scene below 768px. Scroll-linked transforms
  on a mid-range Android drop frames badly, and the whole point of this app is
  that it works on those phones. Test with 4x CPU throttling, not on a laptop.
```

---

## BLOCK 5 — TYPOGRAPHY

```
THE CONSTRAINT THAT OVERRIDES EVERYTHING ELSE

  This app renders in 23 languages across 11 scripts, including Devanagari,
  Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, Odia and
  Urdu (right-to-left).

  Therefore:
    - NEVER use letter-spacing on headings. Devanagari and Bengali join their
      glyphs along a headline stroke; tracking visibly breaks the word.
    - NEVER use text-transform: uppercase. Indic scripts have no capitals, so
      the property does nothing and the design silently loses its hierarchy.
    - NEVER use a condensed or ultra-thin display face. No Indic companion
      exists and the fallback will not match.
    - Line-height at least 1.7 for body text. Indic scripts have tall ascenders
      and deep descenders and collide at Latin leading.

  The font stack is driven by CSS variables that LanguageContext rewrites per
  language — --font-display and --font-body. Keep that mechanism. Change the
  values, not the system.

TYPE SCALE — replace the ad-hoc sizes with one ramp

  eyebrow   12px / 1.4   weight 600  muted   (NO uppercase, NO tracking)
  body-sm   14px / 1.7
  body      16px / 1.7   the default
  body-lg   18px / 1.7   long-form reading
  h3        20px / 1.35  weight 600
  h2        28px / 1.25  weight 600
  h1        36px / 1.15  weight 700
  display   clamp(2.25rem, 5vw, 3.75rem) / 1.05  weight 700

  Every number in the interface uses `font-variant-numeric: tabular-nums`.
  This product shows prices, rates and deadlines; proportional digits make
  columns of figures impossible to scan.

FONT LOADING — a performance issue, not a nicety
  Load ONLY the script the active language needs. Loading all 11 Noto families
  on every page is several megabytes and would undo everything in BLOCK 0.
  Use font-display: swap. Preload only the active body font.
```

---

## BLOCK 6 — ACCESSIBILITY GATES

```
Every one of these is pass/fail, not a suggestion.

  1. All body text meets WCAG AA (4.5:1). Neumorphic surfaces reduce apparent
     contrast — re-check every text colour against --neu-surface after you
     change it. This is the most likely place this brief breaks.
  2. Text over .glass-pane meets AA against the LIGHTEST content that can pass
     behind it, not against the average.
  3. Every interactive element has a visible focus ring: 2px --primary, 2px
     offset. A neumorphic or glass focus state alone is not visible enough.
  4. prefers-reduced-motion disables all scroll animation, all parallax and the
     entry transitions. Verify by actually enabling it in the OS.
  5. Tap targets at least 44x44px.
  6. Right-to-left layouts (Urdu, Kashmiri, Sindhi) still mirror correctly.
     Check that neumorphic shadow direction flips sensibly and that the glass
     edge highlight does not end up on the wrong side.
  7. Keyboard-only navigation reaches everything in a sensible order.
```

---

## BLOCK 7 — WHAT NOT TO TOUCH

```
Do not modify:
  - Any file under src/integrations/supabase/
  - src/contexts/  (Auth, Cart, Language, Theme)
  - src/hooks/
  - supabase/functions/
  - Any data fetching, form submission or auth logic
  - src/i18n/strings.ts, other than adding keys if you genuinely add new copy

Do not:
  - Add a new animation, scroll or 3D library
  - Rename or delete the `.glass` utility
  - Replace existing shadcn component variants — ADD new ones beside them
  - Add `"use client"` anywhere
  - Use Tailwind v4 syntax
  - Apply neumorphism to anything sitting on a photograph or a gradient
  - Put backdrop-filter on list items or table rows
```

---

## BLOCK 8 — FINAL CHECK

```
Verify each of these yourself before saying you are done. Report the numbers.

  1. `npm run build` succeeds.
  2. `npx tsc --noEmit -p tsconfig.app.json` adds no new errors.
  3. The gzipped main chunk grew by LESS THAN 25 KB. State the before and after
     figures. Baseline: 353 KB gzipped.
  4. The site is usable at 360px width.
  5. Switching to Hindi does not break any heading or card layout.
  6. Switching to Urdu mirrors correctly, including shadow direction.
  7. prefers-reduced-motion stops every scroll animation.
  8. Mobile Lighthouse: Performance >= 85, Accessibility >= 90.
  9. No more than four backdrop-filter elements visible at once on any screen.
 10. Scrolling the home page holds 60fps with 4x CPU throttling in DevTools.
```

---

## NOTES FOR PARTHIV

**Why I split neumorphism and glass by job.** Asking for both is common and it
usually produces mush, because they are opposite metaphors — one is carved into
the page, the other floats above it. Giving each a job (neumorphic = things you
press, glass = things that float over content) is what makes a combined system
look deliberate rather than indecisive. It is also, incidentally, how Apple's
Liquid Glass actually works: the chrome floats, the content stays solid.

**The neumorphism warning is real.** Its whole aesthetic depends on low-contrast
soft shadows, and it routinely fails WCAG. Your users are outdoors, in sunlight,
on cheap screens. BLOCK 2 keeps the look but forces state to be carried by
colour and text as well as shadow. Do not let Manus drop that rule.

**The 25 KB budget is the most important line in the document.** You asked me to
reduce lag an hour ago; this brief adds visual weight. Without a hard cap Manus
will happily install three.js and add 600 KB. If it reports a bigger increase,
make it cut something rather than accepting it.

**Watch for the two build-breakers.** Manus is trained mostly on Next.js and
Tailwind v4, so it will instinctively write `"use client"` and `bg-linear-to-b`.
Both are wrong here. BLOCK 0 says so explicitly — if you skip that block, expect
a broken build.

**One honest note on timing.** Your Shark Tank audition is on 9 September. A
half-finished visual overhaul looks worse than the current site, which is
already good. If you start this, either finish it or `git stash` it before the
audition — do not demo mid-refactor.
