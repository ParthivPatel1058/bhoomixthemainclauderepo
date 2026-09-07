# BhoomiX Mobile — Google Stitch Prompt

Paste the block below into Google Stitch. Generate **one screen at a time** using the
per-screen sections; the "GLOBAL" block goes at the top of every prompt so the design
system stays consistent across screens.

---

## HOW TO USE THIS FILE

Stitch generates **UI screens**, not working applications. It will give you layouts,
components and a design system you can export to Figma or code. It will not wire up
Supabase, run the AI, or fetch mandi prices. Plan for:

1. **Stitch** → screen designs, component library, visual system
2. **AI Studio / Gemini** → React Native code scaffolding from those designs
3. **You** → wiring the real backend, which already exists and is listed below

Do not paste all 20 screens at once. Stitch degrades badly on very long prompts.
Run GLOBAL + one screen section per generation.

---

## GLOBAL — paste at the top of EVERY screen prompt

```
Design a mobile app screen for BhoomiX, an Indian agriculture platform for farmers.
Platform: React Native, iOS and Android. Design at 393x852 (Pixel 8 / iPhone 15).

BRAND AND TONE
Serious agricultural tooling, not a consumer lifestyle app. The user is an Indian
farmer, often over 40, on a mid-range Android phone, outdoors in bright sunlight,
on a slow connection. Legibility beats decoration every single time. Confident and
plain, never cute.

COLOUR SYSTEM (use these exact values)
Light theme:
  background   #EAF0EC   cool off-white with a green cast, NOT warm cream
  surface      #FFFFFF   cards
  ink          #10201A   primary text, near-black with a green cast
  muted        #4F615A   secondary text
  border       #D5DEDA
  primary      #158A66   deep field green - primary actions, active states
  accent       #C08A1F   turmeric ochre - fills, badges, highlights
  accentInk    #8A6317   ochre for TEXT only - the fill ochre fails contrast at small sizes
  danger       #C0392B
Dark theme:
  background   #0C1512
  surface      #131F1B
  ink          #F2F7F4
  muted        #A8B8B1
  border       rgba(242,247,244,0.14)
  primary      #3FBF95
  accent       #E0A94A
  accentInk    #F0C170

Two hues only: field green and turmeric ochre. Never introduce a third accent.
Use ONE accent colour per screen. If two things are highlighted, one is wrong.

TYPOGRAPHY
  Display / headings: Bricolage Grotesque, weight 700, tracking -3%
  Body and UI:        Inter, weight 400/500/600
  Indic scripts:      Noto Sans Devanagari / Tamil / Bengali / Telugu / Kannada /
                      Malayalam / Gujarati / Gurmukhi / Oriya, Noto Nastaliq Urdu
Scale:
  eyebrow   10px, weight 600, uppercase, letter-spacing 0.28em, colour accentInk
  caption   12px
  body      15px, line-height 1.55   (never below 15 - outdoor readability)
  h3        20px weight 600
  h2        26px weight 700
  screen title  32px weight 700, tracking -3%
ALL NUMBERS use tabular figures (font-variant-numeric: tabular-nums). Prices,
quantities, countdowns, confidence scores. This is a rate-board product; figures
must align in a column.

SHAPE AND ELEVATION
  radius: 0 / 8px / 14px / 20px / pill(999px). Four steps only.
  Cards default to 14px.
  Shadows: soft neumorphic depth, light source top-left.
    raised:   0 1px 2px rgba(16,32,26,0.05), 0 4px 16px -6px rgba(16,32,26,0.10)
    floating: 0 2px 6px rgba(16,32,26,0.06), 0 24px 60px -18px rgba(16,32,26,0.26)
  Subtle neumorphism on the tab bar and primary cards only: a light inner highlight
  on the top edge, a soft shadow below. Do NOT make every element neumorphic - it
  destroys contrast and makes the whole screen mush.

ACCESSIBILITY (non-negotiable)
  Minimum touch target 48x48dp. Farmers use these with calloused hands, sometimes wet.
  Text contrast minimum 4.5:1, large text 3:1. Verify ochre-on-white uses accentInk.
  Every icon paired with a text label. Icon-only navigation fails users with low
  digital literacy.
  Support system font scaling up to 200%.

LANGUAGE
Every string appears in English and Hindi in this design. The real app ships 23
languages across 11 scripts including 3 right-to-left (Urdu, Kashmiri, Sindhi).
Design every layout to survive text 2x longer than English and to mirror for RTL.
Never put text in a fixed-width box.
```

---

## NAVIGATION ARCHITECTURE

```
Bottom tab bar, 5 tabs, always visible except on auth screens and full-screen camera.
Tabs (icon + label, label always visible):
  1. Home       house icon
  2. Crop AI    scan icon
  3. Market     shopping bag icon
  4. Rates      rupee icon
  5. Menu       grid icon

The web app uses a 17-item sidebar. That does not fit a phone. Everything not in the
5 tabs lives behind the Menu tab, grouped:
  MY FARM      Crop Advisory, Damage Claim, Farming Guides (Organic / Vegetable / Robotic)
  SHOPPING     AgriNova Mart, Orders, Addresses, Nearby Shops
  EARN         Become a Delivery Partner, Partner Orders
  GOVERNMENT   Schemes
  ACCOUNT      Settings, Language, Theme, Support, Sign out
```

---

## SCREEN 1 — HOME

```
Design the Home screen.

TOP BAR (sticky, ink-green glass, not white):
  Left: BhoomiX wordmark, the X in ochre.
  Centre: location chip - a pin icon, "Indore", a weather glyph, "29 degrees Overcast".
  Right: notification bell with an ochre dot when unread, and a circular avatar
  with the user's two-letter initials on a green fill.

HERO (top 45% of the screen):
  Full-bleed photograph of an Indian crop field at golden hour, dark gradient scrim
  from the bottom so white text stays readable.
  Over it, bottom-aligned:
    eyebrow  "TOOLS AND ADVISORY FOR EVERY FARMING DECISION"
    headline "Grow Smarter" - 40px, weight 700, tracking -3%, white
    subhead  "with BhoomiX" - italic serif, ochre
  The hero ends in an IRREGULAR TERRAIN RIDGE, not a straight line and not a smooth
  wave. A rocky, uneven hill silhouette with small bumps, in the page background
  colour, with a faint light rim along the crest. Two overlapping ridges at slightly
  different heights and opacities for depth.

RATE STRIP (immediately below the ridge, the signature element):
  A card with three rows separated by hairlines. Each row: a large tabular figure
  on the left in a fixed 56px column, a two-line label on the right.
    23     "Indian languages, in their own script"
    Daily  "Mandi rates from government open data"
    72h    "The PMFBY claim window, counted for you"
  These are facts, not marketing. Do not add a fourth.

QUICK ACTIONS (horizontal scroll of 5 pills):
  Crop AI / Market / Mart / Advisory / Schemes. Icon above label. The active route
  gets an ochre glow underline.

TODAY'S FARM ADVICE card:
  Green-tinted surface, leaf icon, heading "Today's farm advice", subtext "Based on
  the live forecast for your location". Inside, an advisory row with a status dot:
  "Good time to spray - No rain and low wind expected for the next 6 hours."

WEATHER: 7-day forecast strip, horizontal scroll. Each day: weekday, glyph, high and
low in tabular figures, rainfall in mm.

FEATURE GRID: 2-column bento of 9 cards, each a photograph with a dark gradient and
a white title. Crop Intelligence, Agri Market, AgriNova Mart, Crop Advisory,
Government Schemes, Robotic Farming, Organic Farming, Vegetable Farming,
Delivery Partner.

Bottom tab bar. Home tab active.
```

---

## SCREEN 2 — CROP INTELLIGENCE (the flagship feature)

```
Design the Crop Intelligence screen. Three segmented tabs at the top:
"Scan a Photo" | "Plant Buyer" | "Disease Library".

TAB 1 - SCAN A PHOTO (default):
  Two pill toggles: "Identify the crop" / "Find a disease".
  A large dashed-border upload area, 14px radius, centred:
    circular ochre-tinted icon, "Upload a photo of the crop",
    "The AI identifies the crop and its growth stage from a clear field photo",
    a primary green button "Scan Crop" with a camera icon.
  Below: "Recent scans" - horizontal cards showing a thumbnail, the disease name,
  and a confidence percentage in tabular figures with a coloured severity dot
  (low green / medium ochre / high orange / critical red).

  RESULT STATE - design this as a second screen:
    the photographed leaf at the top, then a result card:
      disease name in English and Hindi
      confidence as a large tabular percentage with a horizontal bar
      severity chip
      "What to do" - a numbered treatment list
      "Buy the treatment" - product cards linking into Agri Market
    Then the OUTCOME PROMPT, which is unique to this product: seven days after a
    diagnosis, a card asks "Did the treatment work?" with four tap targets -
    Cured / Better / No change / Worse. One tap. This feeds the next farmer's advice.

TAB 2 - PLANT BUYER: a 2-column grid of plant cards, each a photo, common name,
botanical name, price per unit, and an add-to-cart stepper.

TAB 3 - DISEASE LIBRARY: a search field, then a filterable list of disease cards
with a thumbnail, name in both languages, affected crops as chips, and severity.
```

---

## SCREEN 3 — MANDI PRICES (rate board)

```
Design the Mandi Prices screen. This is the product's heart and must read like a
physical rate board at a market gate.

Screen title "Mandi Prices", eyebrow "TODAY", lede "Today's rates from
government-regulated markets. Know the price before you sell."

Controls: a search field "Search crop or market", a state dropdown defaulting to
"Madhya Pradesh", and a horizontal chip row: All crops / Wheat / Paddy / Soyabean /
Maize / Cotton / Onion / Potato / Tomato / Gram / Mustard.

Result count in muted text: "100 rates".

RATE CARDS, one per row, white surface, 14px radius:
  Top line: crop name bold, trend arrow on the right (up green, down red).
  Second line: market and district, muted, truncating.
  PRICE ROW: a rupee glyph then the figure at 26px weight 700 in TABULAR FIGURES,
  then "/ quintal" in muted 12px. The tabular figures matter - a farmer compares
  a column of prices by eye, and proportional digits make the column ripple.
  Bottom line: "Range: 2451 to 2587" and the arrival date, both tabular.
  A variety chip if present.

Empty state: a package icon, "No rates for that crop today", and a suggestion to
try another market. Never a blank screen.
```

---

## SCREEN 4 — AGRI MARKET

```
Design the Agri Market screen. Farm inputs, not groceries.

Screen title "Agri Market", eyebrow "FARM INPUTS".
Search field, then category chips: All / Seeds / Fertilizers / Tools / Pesticides.

2-column product grid. Each card:
  product photograph, 14px radius top corners
  name over two lines maximum, then the Hindi name in muted 12px
  price in tabular figures with the unit, e.g. "1200 / 40kg bag"
  a star rating with the review count
  a quantity stepper: minus, a tabular number, plus. The stepper caps at 100 per
  item and the plus button visibly disables at the cap.
  an "Add" button that becomes the stepper once quantity is above zero

A floating cart bar pinned above the tab bar when the cart is non-empty: item count,
total in tabular figures, and a "View cart" button.
```

---

## SCREEN 5 — DAMAGE CLAIM (the highest-stakes screen)

```
Design the Crop Damage Report screen. A farmer uses this after a loss, under stress,
possibly standing in a ruined field. Calm, linear, no clever interactions.

Screen title "Crop Damage Report".
Lede: "Photograph the damage now. Under PMFBY a localised loss must be reported
within 72 hours - missing that window is the most common reason claims are rejected."

A COUNTDOWN BANNER at the top, ochre-tinted, with a clock icon:
  "48 hours 12 minutes left to report" - the numbers in large tabular figures.
  Turns red under 12 hours remaining.

A vertical stepper form, one step visible at a time, with a progress indicator:
  1. Photograph the damage - camera tile plus a thumbnail strip, minimum 3 photos
  2. Location - an auto-filled GPS card showing coordinates, village and district,
     with a small map, and a "Use a different location" link
  3. Crop and area - crop picker, area in acres, sowing date
  4. Cause - chips: Flood / Drought / Hailstorm / Pest / Fire / Unseasonal rain
  5. Recorded rainfall - auto-attached from the weather service, read-only, shown as
     evidence, in tabular mm
  6. Review and submit - a summary card, then a large primary button "Submit claim"

After submission: a receipt card with a reference number in tabular figures, the
timestamp, and a status timeline - Submitted / Under review / Surveyor assigned /
Settled.
```

---

## SCREEN 6 — GOVERNMENT SCHEMES

```
Design the Government Schemes screen.
Title "Government Schemes", lede "Central and state schemes for farmers -
eligibility, benefits, and direct links to apply."
Filter chips: All / Central / State / Insurance / Credit / Subsidy.
Scheme cards: a category chip and a status chip ("Open" green / "Closing soon"
ochre / "Closed" muted), the scheme name, a one-line benefit summary, the benefit
amount in tabular figures, an eligibility checklist with tick or cross icons, and
a primary "Apply" button with an external-link icon.
Detail screen: full eligibility, documents needed as a checklist, the deadline as a
countdown, and the official application link.
```

---

## SCREEN 7 — AUTH FLOW (4 screens)

```
Design the authentication flow. The card is a deliberate always-light island even in
dark mode - do not invert it.

WELCOME:
  Split card, 20px radius, floating shadow.
  Left panel: near-black, the BhoomiX logo centred, a subtle animated water-ripple
  distortion over it.
  Right panel: warm off-white.
    Headline "Sign in to continue" - fluid size, wraps to 3 lines in long scripts,
    never clips
    Subhead "Your farming companion"
    Three benefit rows, each a green circular tick: "Free crop disease scanning",
    "Available in 23 Indian languages", "No credit card required"
    Primary green button "Get Started" with an arrow
    "Already have an account? Sign in"
  Top-right: a globe icon and the current language, opening a language sheet.

SIGN UP: email, username, password with a strength meter and a show/hide eye,
phone with a +91 prefix. An inline error under the username reading "That username
is already taken" - this is a real failure mode, design for it.

SIGN IN: email and password, "Forgot password", a divider reading "or", then
"Continue with Google" and "Sign in with phone OTP".

TWO-FACTOR: six separate OTP boxes, large tabular figures, auto-advancing, a resend
countdown in tabular seconds, and "We sent a code to par***@gmail.com".

LANGUAGE SHEET: a bottom sheet, a search field, then a list of all 23 languages.
Each row shows the endonym in its OWN script at 18px (हिन्दी, বাংলা, தமிழ், ಕನ್ನಡ,
ગુજરાતી, ਪੰਜਾਬੀ, ଓଡ଼ିଆ, മലയാളം, తెలుగు, اردو, ...) with the English name beneath in
muted text, and a tick on the current selection. This screen is the single best
demonstration of the product's differentiator - make it beautiful.
```

---

## SCREEN 8 — MENU / MORE

```
Design the Menu tab. A profile header card: avatar with initials, email, and an
account-type chip ("Farmer Account"). Then grouped list sections with 10px uppercase
tracked section labels:
  MY FARM     Crop Advisory / Damage Claim / Farming Guides
  SHOPPING    AgriNova Mart / Orders (with an unread count badge) / Addresses /
              Nearby Shops
  EARN        Become a Delivery Partner / Partner Orders
  GOVERNMENT  Schemes
  ACCOUNT     Settings / Language (showing the current language) /
              Theme (a sun-moon toggle) / Support / Sign out in danger red
Each row: a leading icon, a label, an optional trailing value, a chevron.
Rows are 56px tall minimum.
```

---

## REMAINING SCREENS (generate with GLOBAL + a short brief each)

```
ORDERS          Status-filter tabs (All/Active/Delivered/Cancelled). Order cards with
                an order ID in tabular figures, date, item thumbnails, total, a status
                chip, and a horizontal delivery timeline. A "Reorder" button.
ADDRESSES       Saved address cards with a type chip (Home/Farm/Other), the full
                address, a default badge, edit and delete icons, and a large
                "Add new address" tile.
CROP ADVISORY   A chat interface. Farmer messages right-aligned green, AI responses
                left-aligned on a white surface. A photo-attach button, a microphone
                for voice input, and suggested-question chips when empty.
AGRINOVA MART   Groceries and household. Same grid pattern as Agri Market, different
                categories, warmer photography.
NEARBY SHOPS    A map at the top, a list beneath. Shop cards with name, type, distance
                in tabular km, open/closed status, and call and directions buttons.
PARTNER REG     A multi-step form: personal details, vehicle type, licence upload,
                bank details, and an hours-per-day slider.
PARTNER ORDERS  A delivery run list with pickup and drop addresses, distance, payout
                in tabular figures, and accept/reject actions.
SETTINGS        Grouped toggles: notifications, language, theme, units, data saver,
                account, privacy, delete account.
FARMING GUIDES  Article list with hero images, read time, and category chips.
                (Organic / Vegetable / Robotic)
SEARCH          A full-screen overlay. A search field at the top, then live results
                grouped by "Pages", "Agri Market" and "AgriNova Mart". Each result:
                icon, title, source label, chevron. An empty state reading
                "Nothing matches that yet. Try a crop or a scheme name."
```

---

## BACKEND THAT ALREADY EXISTS (for the AI Studio step, not for Stitch)

Do not ask Stitch for these. Give this list to AI Studio when generating React Native
code, so it wires to what is already built rather than inventing a new backend.

**Supabase, project ref `tzmuivqtlnosgkubhyft`.** Row Level Security is enabled on
every table.

Tables: `profiles`, `addresses`, `cart_items`, `orders`, `crop_diagnoses`,
`damage_reports`, `farm_profiles`, `kisan_help_sessions`, `notifications`,
`partners`, `shops`, `nearby_shops`, `product_reviews`, `product_avg_ratings`,
`user_roles`, `managers`, `staff_roster`, `staff_audit`.

RPC / helper functions: `get_partner_orders`, `has_role`, `is_admin`, `is_manager`,
`is_partner`, `my_role`, `my_unread_notification_count`.

Edge functions: `crop-vision` (image diagnosis), `kisan-ai-chat` (advisory),
`mandi-prices` (Government of India open data), `geocode`, `translate`,
`login-2fa` (email OTP via Resend), `resend-webhook`, `create-staff-account`.

Auth methods in use: `signInWithPassword`, `signInWithOtp` (phone),
`signInWithOAuth` (Google), `signUp`, `resetPasswordForEmail`.
Note: the admin address `parthiv1058@gmail.com` bypasses 2FA; every other account
requires it.

React Native equivalents for the web stack:
  react-router-dom      -> @react-navigation/native + bottom-tabs + native-stack
  Tailwind CSS          -> NativeWind (keeps the same token names)
  framer-motion         -> react-native-reanimated 3
  GSAP ScrollTrigger    -> Reanimated useAnimatedScrollHandler
  lenis smooth scroll   -> not needed, native scrolling already has momentum
  ogl / WebGL           -> react-native-skia
  localStorage          -> @react-native-async-storage/async-storage
  Google Fonts link     -> expo-font, and bundle the Noto scripts you actually ship
```

---

## THINGS TO GET RIGHT THAT ARE EASY TO MISS

1. **Bundle the Indic fonts, do not fetch them.** On the web these load on demand.
   On mobile a farmer may be offline. Bundle Devanagari, and lazy-load the rest from
   your own CDN with an offline fallback.
2. **Tabular figures everywhere numbers appear.** Prices, quantities, countdowns,
   confidence. `fontVariant: ['tabular-nums']` in React Native.
3. **The 72-hour countdown must never animate or count up on first paint.** Showing
   "69h" for a legal deadline, even for a second, is wrong.
4. **Design every screen for a 2x longer string.** Malayalam and Tamil run far longer
   than English and will break any fixed-width layout.
5. **48dp minimum touch targets.** Not 44. These are outdoor hands.
6. **Offline-first.** Cache mandi rates, the disease library and the scheme list.
   A farmer in a field frequently has no signal.
```
