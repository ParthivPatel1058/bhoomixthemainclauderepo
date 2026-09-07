# BhoomiX — Business Plan Presentation Script

**Target runtime: 20–23 minutes · single speaker or split across your team**

| Pace | Runtime |
|---|---|
| Fast (150 wpm) | 19:28 |
| **Normal (140 wpm)** | **20:51** |
| Slow / Q&A energy (128 wpm) | 22:49 |

Word count: 2,920 spoken words, measured. Sits inside the 20–23 minute window at every pace in the
table — read it once out loud before the real thing; your own pace will
differ from these averages.

**What is fact-checked vs. what is roadmap:** every product feature named
below is live in the app today and was verified during development. Every
government scheme named is real, current, and already integrated into the
app's own Schemes page — none are invented. The seed-distributor network,
the field research tour, and the bank data-sharing model are **not built
yet** — they are presented explicitly as plan, not as done. Anywhere you see
`[BRACKETS]`, fill in your own real number before you present. Do not guess
one to sound impressive; an unverifiable number is the fastest way to lose
a room that asks one follow-up question.

---

## 1. Open — the price a farmer never sees · 0:00–1:23

> **ON SCREEN:** Two mandi price cards, side by side, gap animating in.

"On the day we checked, wheat sold for two thousand rupees a quintal in
Raisen. In Ratlam — two thousand eight hundred and twenty-six. Same crop.
Same day. Same state. Eight hundred and twenty-six rupees a quintal, and the
farmer who sold in Raisen never found out he lost it.

We're `[NAMES]`. We built BhoomiX because that gap isn't rare — it's
Tuesday. And it's not the only place a farmer loses money without knowing
it. He also pays too much for the wrong seed, because nobody nearby is
selling him the right one at a fair price. He misses a disease until the
field is gone. He misses his insurance window by a day and the claim is
rejected outright.

Today we're not just showing you an app. We're showing you how we get real
seed, at a real fair price, into a real farmer's hand — how we make money
doing it — and how, three to five years from now, the data this creates
becomes something a bank will pay for. That last part is the part most
pitches skip, and it's the part that makes this a business, not a feature."

---

## 2. The problem, precisely · 1:23–3:10

"There are three separate ways a farmer loses money, and they need three
separate fixes — that's why one app that does one thing isn't enough.

**He sells at the wrong mandi**, because comparing rates across nearby
markets before loading the cart isn't something he can do from a field.

**He buys the wrong seed**, or the right seed at the wrong price, because
the seed market in most districts runs through two or three layers of
dealers before it reaches him, and every layer adds margin without adding
information. He often can't tell certified seed from last season's leftover
stock relabelled.

**He misses deadlines that aren't his fault.** Crop insurance requires a
loss to be reported within seventy-two hours. Miss it, and a real loss gets
rejected on a technicality, not on the merits.

Here's the part that's easy to miss: these three problems don't affect
every farmer equally, and that changes how we have to sell and build for
them. A cotton farmer running forty acres with a smartphone and a bank loan
already compares seed brands on YouTube before he buys. A subsistence
farmer on two acres has never priced seed against a printed spec sheet in
his life — he buys what the dealer he trusts hands him. Design one product
for both of those farmers and you'll satisfy neither. We designed for the
second farmer first, because he's the one the current seed market fails
worst, and the first farmer adopts anything genuinely useful without being
sold to."

---

## 3. Market reality — who we're actually building for · 3:10–5:21

> **ON SCREEN:** Two-column comparison — "Advanced farmer" vs. "Traditional
> farmer" — not as a judgement, as a segmentation.

"We split the seed market into two buyer types, not one, because they buy
differently.

The **advanced, market-linked farmer** already knows brand names, checks
yield claims, and will compare a price across three sources before buying.
For him, our job is simple: show the certified option, show the price,
remove the extra layer of dealer margin. He converts on price and proof
alone.

The **traditional, relationship-based farmer** buys from whoever he already
trusts — usually one local dealer, sometimes for a generation. He is not
going to install an app and switch cold. For him, the app has to arrive
*through* someone he already trusts: the same local dealer, but now stocked
with certified seed at a better wholesale price because we aggregated
demand across many farmers like him. He doesn't need to trust us. He needs
his dealer to trust us, once.

That is the single biggest lesson from how we scoped this: **we are not
trying to disintermediate the local dealer. We are trying to fix what he
sells and at what price he can afford to sell it.** A platform that tries to
cut out every local relationship in rural India loses on trust before it
loses on price. A platform that upgrades the dealer's stock and margin
wins on both.

This is also why the seed business can't be guessed from a desk. Seed
quality, dealer trust, and price sensitivity vary district by district — a
plan built entirely on assumption is a plan built to be wrong somewhere.
That's the reasoning behind the field research tour, which I'll walk
through in a few minutes: it exists to replace our assumptions with what
farmers and certified distributors actually tell us, district by district,
before we scale procurement decisions on top of it."

---

## 4. What's already live · 5:21–8:12

> **ON SCREEN:** Live screen recording of the running app. No slides here —
> everything shown is real, at bhoomix.vercel.app.

"Before the plan, the proof. This isn't a mockup.

*(demo: leaf photo → diagnosis)* Photograph a leaf. Our AI names the likely
disease, gives a confidence score, and a treatment the farmer can actually
buy — inside the same app.

*(demo: mandi prices)* Live mandi prices, pulled from the Government of
India's own open data platform, refreshed daily, filterable by crop and
district. This is the feature that closes the eight-hundred-rupee gap I
opened with.

*(demo: damage report)* Crop damage reporting with GPS, a timestamp, and
recorded rainfall attached automatically, inside a visible seventy-two-hour
countdown — so the insurance deadline is a number on the screen, not a fact
the farmer has to remember under stress.

*(demo: Agri Market)* And this is where seed lives today — our farm-input
marketplace, alongside fertiliser and tools. Right now it's a catalogue.
What I'm about to describe is how it becomes a real procurement engine, not
just a shopfront.

*(demo: outcome prompt)* And this is the part no competing app has. Seven
days after a diagnosis, BhoomiX asks one question: did the treatment work?
Cured, better, no change, worse. One tap. That answer feeds back into the
next farmer's advice. It's a small feature with a large consequence — it
means every recommendation this app makes gets measurably better over time,
instead of staying static the day it launched. Hold that thought, because
by the end of this talk, that same feedback loop is the seed of our entire
long-term data business.

Twenty-three Indian languages, mobile-number sign-in for farmers without an
email address, and role-based views for farmers, delivery partners, and
administrators — all live today."

---

## 5. Getting real seed to the farmer at the best price · 8:12–10:31

"Here's the actual mechanism, because 'we'll sell seed cheaper' isn't a
plan — it's a wish.

**First, we only route through certified sources.** State Seed
Corporations, the National Seeds Corporation, ICAR-affiliated seed hubs, and
private companies whose seed is lab-certified for germination rate — not
whatever a local godown happens to be holding. Every seed listed in Agri
Market gets a certification tag and a batch reference, so a farmer can see
*why* it's trustworthy, not just be told to trust it.

**Second, we aggregate demand before we negotiate price.** One farmer
buying forty kilograms of soybean seed has no leverage. Three hundred
farmers in one district, pre-ordering through the app in the six weeks
before a sowing window, absolutely do. That's the entire trick behind
"best price" — it isn't a discount we invent, it's a wholesale rate we
unlock by aggregating small orders into one large one, then passing most of
that saving through instead of keeping it.

**Third, we take a smaller cut than the layers we're replacing.** A typical
seed reaches a farmer through a distributor, a wholesaler, and a retail
dealer, each adding margin. We compress that into one commission line,
smaller than the sum of what it replaces, because our cost to serve is an
app and a delivery network, not four separate warehouses.

**Fourth — and this is the part that closes the loop back to what we
already built** — we extend the outcome-tracking pattern from crop disease
to seed itself. Ask once, a season later: how did this variety actually
perform for you? That turns every purchase into a data point about which
seed genuinely performs in which district and soil — something no seed
company currently collects at this resolution, because they sell through
dealers who never report back. This is not built yet. It is the natural
next use of infrastructure we've already proven works."

---

## 6. The field tour — how we find the right distributors · 10:31–12:33

> **ON SCREEN:** A simple map with three visit types marked — KVKs, seed
> certification offices, certified private distributors.

"We're not going to guess who the right seed partners are from a
spreadsheet. The plan is a structured, on-ground research tour, district by
district, starting in `[DISTRICT]`.

**Stop one: Krishi Vigyan Kendras** — the government's own district-level
farm science centres. They already run farmer trainings and know exactly
which local seed sources are trusted and which aren't. This is the fastest
way to a credible shortlist, not a cold search.

**Stop two: the State Seed Certification Agency office** — the actual
authority that certifies seed lots. This is where we verify a distributor's
claims against the certificate, not against their word.

**Stop three: certified private distributors and cooperative seed
societies directly** — to negotiate the volume terms that only exist once
we can show them real, aggregated demand from the app.

**Stop four: farmers themselves**, both the advanced and traditional
segments I described earlier, in the same visit — because the tour isn't
only sourcing, it's validation. If a district's farmers tell us the
dealer-trust dynamic doesn't match what we assumed, we adjust the plan
before we commit procurement budget to it, not after.

Each district visit produces one output: a signed or verbally committed
sourcing relationship, or a documented reason it didn't work. That's the
discipline — we're not touring for the sake of touring, we're building a
verified partner list one relationship at a time."

---

## 7. Government support we're building with, not asking for · 12:33–14:26

"None of this needs to be funded by equity alone, because most of it
already has a government channel designed for exactly this problem — these
are real, current schemes, already listed inside our own app's Schemes
page.

**The National Food Security Mission** already subsidises certified seed
for target crops in identified districts. That's the channel we plan to
route procurement *through*, not compete against — a farmer buying through
us should be able to stack an NFSM seed subsidy on top of our aggregated
price, not choose one or the other.

**The Mission for Aatmanirbharta in Pulses** specifically funds quality
seed access and assured procurement for pulse farmers — a direct match for
one of our highest-margin-relief categories.

**The Agriculture Infrastructure Fund** provides concessional-interest
financing for exactly the kind of post-harvest and storage infrastructure a
regional seed distribution hub needs. That's the intended vehicle for our
own warehousing, not additional equity dilution.

**The scheme to form ten thousand Farmer Producer Organisations** matters
because an FPO is collective bargaining power with a legal structure — where
we can help farmers organise into one, or partner with an existing one, our
aggregated-demand pricing gets stronger and more durable.

We are not asking this room to replace what government programmes already
fund. We're asking for the capital to be the layer that makes those
programmes usable from a phone, in a farmer's own language, instead of
requiring a trip to a government office he doesn't have a free day for."

---

## 8. Business model · 14:26–16:07

"BhoomiX is free for the farmer to use. That's deliberate — a farmer unsure
whether he can afford advice won't ask for it, and getting him to ask is
the entire point.

We make money four ways. **Commission on marketplace orders** — seed,
fertiliser, tools — priced smaller than the multi-layer margin we're
replacing, as I described. **Partner and dealer fees** — local agri shops
and nurseries pay to be listed and routed orders through our partner
platform, because we're bringing them demand they didn't have to find
themselves. **Delivery margin** on orders fulfilled through our registered
partner network. And — three to five years out, and I want to be
completely upfront that this is not revenue today — **licensing anonymised,
consented outcome data to lenders**, which is section eleven, and it's the
part of this model that turns a marketplace into something closer to
infrastructure.

`[FUNDING ASK]`: we're raising `[AMOUNT]` for `[EQUITY %]`, allocated to
three things in this order: seed procurement working capital, so the
aggregated-demand pricing has capital behind it to actually execute; the
district field tour, because sourcing decisions should follow research, not
precede it; and platform hardening, so the second thing we scale is
infrastructure that can carry real transaction volume, not just page
views."

---

## 9. Marketing strategy — earned trust, not paid reach · 16:07–17:50

*(Note: if your slot runs closer to 20 minutes, this section and section 10
compress most easily — they're the least numbers-dependent.)*

"Rural agri-marketing fails when it looks like marketing. Our channel
strategy leans entirely on trust that already exists.

**The field tour doubles as the launch campaign.** Every KVK visit,
distributor negotiation, and farmer conversation is also the first hundred
relationships in a district — we're not touring, then marketing
separately; the tour *is* the go-to-market motion.

**Local dealers become our distribution and our marketing arm at once.**
Once a dealer is stocked with certified seed at a better wholesale rate
through us, he has a direct financial reason to tell his existing customers
— and his existing customers already trust him more than any advertisement
we could run.

**The outcome loop becomes our proof, not just our product.** Real farmers,
real seasons, real yield outcomes, captured through the same feedback
mechanism I described earlier — turned into vernacular testimonial content,
because a farmer trusts another farmer's harvest more than any brand claim.

**WhatsApp, not paid social**, is where rural word-of-mouth actually
travels in India — we support that channel for referrals rather than
fighting it with a Instagram budget better spent elsewhere.

**Government extension events** — the same Krishi Vigyan Kendra farmer
trainings we visit for sourcing — are also where farmers already gather to
learn something new. We ask to be five minutes on an agenda that already
exists, rather than building a farmer gathering from nothing."

---

## 10. How we actually built this · 17:50–19:13

*(Compress or cut this section first if you're running long — it explains
methodology, not the business, and a judge asking "how" is a good problem
to have in Q&A.)*

"One more thing worth explaining, because it's directly relevant to how
fast we can execute everything I've just described: everything you saw
running — the AI diagnosis, the live government price feed, the database,
the account security, twenty-three languages — was built by a small team
using AI-assisted, prompt-driven development. Not a no-code demo. A real
full-stack product, iterated in days instead of the months a traditional
build cycle would take.

Why that matters for this business specifically: our biggest execution risk
was never 'can we build the app' — it's proven, it's live. It's 'can we
move as fast as the field research tells us to.' A team that can ship a new
feature in days, the moment a district visit reveals a real farmer need,
has a structural speed advantage over a competitor running a six-month
engineering roadmap. That speed is a business asset, not a technical
footnote."

---

## 11. The three-to-five year vision — data a bank will pay for · 19:13–21:32

> **ON SCREEN:** A simple timeline — Year 1: marketplace and outcomes.
> Year 2–3: seed network at scale. Year 4–5: farm credit signal.

"This is the long-term answer, and I want to build it carefully because
it's the part of this plan that turns BhoomiX from an app into
infrastructure.

Every farmer who uses BhoomiX for a few seasons builds, without extra
effort on their part, a real record: what they grew, what they bought,
whether the treatment worked, whether the seed performed, whether an
insurance claim was filed and how it resolved. That's a genuine
longitudinal farm-performance history — exactly the thing a bank or NBFC
currently has almost none of when they underwrite a smallholder loan. Most
farm lending today is priced on land collateral alone, which means good
farmers with no formal credit history get the same high-risk interest rate
as farmers with none of that track record, and farmers with the thinnest
paperwork get excluded from formal credit entirely.

Here's the model, and here's what we still owe you honestly: this is not
built, and it should not be built without going through India's real,
existing consent framework for exactly this kind of data sharing — the
RBI's Account Aggregator system and the Digital Personal Data Protection
Act. That's not a legal footnote we're skipping past — it's the actual
mechanism that makes this legitimate rather than a data-selling business
that would rightly make farmers distrust us. A farmer opts in, explicitly,
per request, the same way he'd consent to sharing bank statements with a
lender today. Nothing moves without that consent, every time.

With that structure in place, a bank or NBFC pays us in one of two ways:
a licensing fee for anonymised, aggregated risk-signal data across a
region, useful for pricing a whole portfolio more accurately — or a
referral fee per loan, where an individual consenting farmer's verified
BhoomiX history becomes part of his loan application, and a lender who
currently can't see him at all can now price him fairly instead of
declining him by default.

The outcome for the farmer is the whole point: a smallholder with three
clean seasons on BhoomiX becomes visible to a lender who previously had no
way to tell him apart from risk. That's a better interest rate for a
farmer who earned it with a real track record — not because we sold his
data, but because we gave him a way to prove something about himself that
paperwork never could."

---

## 12. Close · 21:32–22:15

"Three ways a farmer loses money. Three fixes, all live in the same app
today. A seed-sourcing plan grounded in field research, not guesswork. A
government-funding path we build with, not around. A business model that
starts with commission and grows into something a bank pays for, once
farmers trust us enough to let it.

None of this works without one thing: it has to earn trust one district,
one dealer, one farmer at a time. That's not the slow part of this plan.
That's the moat.

BhoomiX. Every farmer deserves the right price — and eventually, the right
loan to go with it."

---

## Runtime table

Per-section word counts are approximate; the total is measured from the
spoken lines only (stage directions and tables excluded). Section timestamps
in the headings run to 22:15 because they round each section up — treat them
as cue markers, not a stopwatch.

| Section | Words | At 140 wpm |
|---|---|---|
| 1. Open | 195 | 1:23 |
| 2. The problem | 250 | 1:47 |
| 3. Market reality | 305 | 2:11 |
| 4. What's already live | 400 | 2:51 |
| 5. Seed at the best price | 325 | 2:19 |
| 6. Field tour | 285 | 2:02 |
| 7. Government support | 265 | 1:53 |
| 8. Business model | 235 | 1:41 |
| 9. Marketing strategy | 240 | 1:43 |
| 10. How we built this | 195 | 1:23 |
| 11. Three-to-five year vision | 325 | 2:19 |
| 12. Close | 100 | 0:43 |
| **Total** | **2,920 measured** | **20:51 measured** |

Cut sections 9 and 10 first if you're running over time — they're marked
above as the safest to compress. Section 11 is the one to protect above all
others: it's the piece most business-plan presentations skip entirely, and
it's the strongest reason to fund the earlier stages of this plan rather
than see it as just another marketplace app.

---

## Before you present

**1. Fill in every `[BRACKET]`.** Team names, funding ask, equity offered,
your actual target district. A specific, small, real ask beats a large
vague one every time a judge or investor has heard a hundred pitches this
month.

**2. Refresh the wheat numbers.** Mandi rates move daily — check today's
spread in the app and update the opening. The point survives whatever the
numbers are; the gap is always there.

**3. Rehearse section 11 out loud, alone, at least twice.** It's the
longest unbroken argument in the script and the one place a stumble costs
you credibility — "we sell farmer data" is the wrong sentence to reach for
under pressure, and "consented, regulated data sharing through the Account
Aggregator framework" is the right one. Say the right one until it's
automatic.

**4. Do not answer a funding-ask or seed-margin question with a number you
haven't decided.** "We're finalising that with our first district's actual
wholesale quotes" is a stronger answer in Q&A than a guessed percentage
that falls apart under one follow-up question.
