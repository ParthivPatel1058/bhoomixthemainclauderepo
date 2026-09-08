import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  ScrollText,
  ShieldAlert,
  Sprout,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import PageHeader from '@/components/layout/PageHeader';
import SectionHeading from '@/components/layout/SectionHeading';
import Reveal from '@/components/Reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

import RobotCard from '@/components/robotics/RobotCard';
import RobotFilters from '@/components/robotics/RobotFilters';
import RobotFinder from '@/components/robotics/RobotFinder';
import RobotCompare, { CompareTray, MAX_COMPARE } from '@/components/robotics/RobotCompare';

import {
  CATALOGUE_VERIFIED_AT,
  EMPTY_FILTERS,
  MANUFACTURERS,
  ROBOTS,
  filterRobots,
  getRobot,
  type RobotFilters as Filters,
} from '@/data/robotics';
import {
  BUYING_CHECKS,
  DRONE_RULES,
  DRONE_RULES_NOTE,
  INTRO_BODY,
  INTRO_JOBS,
  INTRO_LEAD,
  OFFICIAL_LINKS,
  OWNERSHIP_ROUTES,
  PRESSURES,
  ROLE_CHAIN,
  SAFETY_RULES,
  STAGES,
  STATE_MACHINERY,
  STATE_MACHINERY_NOTE,
  SUBSIDY_LEAD,
  SUBSIDY_POINTS,
} from '@/data/roboticsGuide';

import heroImage from '@/assets/robotics/farmrobo-r1v2-weeding.webp';

/**
 * Farm robotics.
 *
 * The page this replaced was a list of machines. This one is meant to be a way
 * of deciding, which is a different shape: it explains what the technology is
 * in language that assumes no engineering, says plainly what it can and cannot
 * be expected to do, then puts a verified catalogue underneath with the tools
 * to search, narrow, compare and go to the manufacturer.
 *
 * The section carries its own visual identity — flat panels, a rule-and-eyebrow
 * rhythm, big photography, numbered stages — while staying inside the app's
 * tokens. Notably it is mostly *not* glass: cut-out product photography and
 * dense specification tables both read badly over a blurred backdrop, so glass
 * is spent on the two floating surfaces that earn it and the rest of the page
 * is solid card.
 *
 * Every factual claim below either comes from `robotics.ts`, where it carries a
 * source URL and a date, or is hedged. There is no number on this page that
 * bhoomix invented.
 */
const RoboticFarming = () => {
  const { tx } = useLanguage();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeState, setActiveState] = useState(0);

  const results = useMemo(() => filterRobots(filters), [filters]);
  const compareRobots = useMemo(
    () => compareIds.map(getRobot).filter((r): r is NonNullable<typeof r> => Boolean(r)),
    [compareIds],
  );

  const toggleCompare = (id: string) =>
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : ids.length < MAX_COMPARE ? [...ids, id] : ids,
    );

  const makerCount = new Set(ROBOTS.map((r) => r.manufacturerId)).size;
  const state = STATE_MACHINERY[activeState];

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow={tx('Technology', 'तकनीक')}
        title={tx('Farm robotics', 'कृषि रोबोटिक्स')}
        lede={tx(
          'Machines that take on the repetitive part of farming. What they are, what they honestly can and cannot do, and who actually sells them in India.',
          'खेती के दोहराव वाले काम संभालने वाली मशीनें। ये क्या हैं, सच में क्या कर सकती हैं और क्या नहीं, और भारत में इन्हें असल में बेचता कौन है।',
        )}
        stats={[
          { label: tx('Machines listed', 'सूचीबद्ध मशीनें'), value: ROBOTS.length },
          { label: tx('Manufacturers', 'निर्माता'), value: makerCount },
          {
            label: tx('Sourced from', 'स्रोत'),
            value: tx('Makers only', 'सिर्फ़ निर्माता'),
            emphasis: true,
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* What this is                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Reveal>
        <section
          aria-labelledby="what-heading"
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="order-2 flex flex-col justify-center p-7 sm:p-10 lg:order-1">
              <span className="mb-4 flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-accent-ink" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-ink">
                  {tx('The idea', 'बात क्या है')}
                </span>
              </span>

              <h2
                id="what-heading"
                className="text-[clamp(1.5rem,2.6vw,2.15rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground"
              >
                {tx(INTRO_LEAD.en, INTRO_LEAD.hi)}
              </h2>

              <div className="mt-5 space-y-3.5">
                {INTRO_BODY.map((p) => (
                  <p key={p.en} className="text-[15px] leading-relaxed text-muted-foreground">
                    {tx(p.en, p.hi)}
                  </p>
                ))}
              </div>

              <div className="mt-7 border-t border-border pt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tx('Used today for', 'आज इनका उपयोग')}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {INTRO_JOBS.map((j) => (
                    <li
                      key={j.en}
                      className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground"
                    >
                      {tx(j.en, j.hi)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <figure className="relative order-1 m-0 lg:order-2">
              <img
                src={heroImage}
                alt={tx(
                  'A FarmRobo R1v2 electric field robot pulling a tiller attachment through a vegetable crop',
                  'सब्ज़ी की फसल में टिलर अटैचमेंट खींचता फार्मरोबो R1v2 बैटरी रोबोट',
                )}
                className="h-full min-h-[16rem] w-full object-cover"
                loading="eager"
                decoding="sync"
              />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10 text-[11px] font-medium text-white/85">
                {tx(
                  'A FarmRobo R1v2 working a vegetable field. Photograph: FarmRobo.',
                  'सब्ज़ी के खेत में काम करता फार्मरोबो R1v2। तस्वीर: फार्मरोबो।',
                )}
              </figcaption>
            </figure>
          </div>

          {/* Who does what. The one thing worth remembering from this page. */}
          <div className="border-t border-border bg-muted/30 px-7 py-7 sm:px-10">
            <p className="mb-6 text-sm font-semibold text-foreground">
              {tx(
                'The robot does not replace the farmer. It extends what one farmer can reach.',
                'रोबोट किसान की जगह नहीं लेता। वह एक किसान की पहुँच बढ़ाता है।',
              )}
            </p>
            <ol className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
              {ROLE_CHAIN.map((step, i) => (
                <li key={step.actor.en} className="relative min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      data-numeric
                      aria-hidden
                      className="text-[11px] font-semibold text-accent-ink"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13px] font-semibold text-foreground">
                      {tx(step.actor.en, step.actor.hi)}
                    </span>
                  </div>
                  <p className="mt-1 pl-[1.65rem] text-[13px] leading-snug text-muted-foreground">
                    {tx(step.does.en, step.does.hi)}
                  </p>
                  {i < ROLE_CHAIN.length - 1 && (
                    <ArrowRight
                      aria-hidden
                      className="absolute -right-3 top-0 hidden h-3.5 w-3.5 text-border lg:block"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      {/* ---------------------------------------------------------------- */}
      {/* Why it matters                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="pressures-heading" className="mt-20">
        <SectionHeading
          title={tx('What it is actually for', 'यह असल में किस लिए है')}
          note={tx(
            'Six pressures a farm feels, and what this technology can — and cannot — do about each.',
            'खेती की छह मुश्किलें, और यह तकनीक हर एक के बारे में क्या कर सकती है और क्या नहीं।',
          )}
        />
        <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {PRESSURES.map((p, i) => (
            <li key={p.problem.en} className="bg-card p-6">
              <Reveal delay={i * 0.04} distance={12}>
                <p className="text-[15px] font-semibold leading-snug text-foreground">
                  {tx(p.problem.en, p.problem.hi)}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {tx(p.response.en, p.response.hi)}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="stages-heading" className="mt-20">
        <SectionHeading
          title={tx('How a farm robot works', 'खेत का रोबोट कैसे काम करता है')}
          note={tx(
            'Five steps, and the last one is you.',
            'पाँच चरण, और आख़िरी चरण आप हैं।',
          )}
        />
        <ol className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.index}>
              <Reveal delay={i * 0.06} distance={16}>
                <div
                  className={cn(
                    'flex h-full flex-col rounded-lg border p-5',
                    // The last stage is the farmer, so it is the one that gets
                    // the accent — the page should not make the machine the
                    // hero of its own process diagram.
                    i === STAGES.length - 1
                      ? 'border-secondary/40 bg-secondary/[0.07]'
                      : 'border-border bg-card',
                  )}
                >
                  <span
                    data-numeric
                    aria-hidden
                    className="text-2xl font-semibold leading-none tracking-tight text-accent-ink"
                  >
                    {s.index}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {tx(s.title.en, s.title.hi)}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {tx(s.body.en, s.body.hi)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Catalogue                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="catalogue-heading" className="mt-20 scroll-mt-24" id="catalogue">
        <SectionHeading
          title={tx('The catalogue', 'सूची')}
          note={tx(
            'Every machine here is transcribed from its manufacturer’s own site, with the link and the date it was read.',
            'यहाँ हर मशीन उसके निर्माता की अपनी साइट से ली गई है — लिंक और पढ़ने की तारीख के साथ।',
          )}
        />

        <RobotFilters filters={filters} onChange={setFilters} resultCount={results.length} />

        <div className="mt-8">
          {results.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="text-base font-semibold text-foreground">
                {tx('Nothing matches that.', 'इससे कुछ मेल नहीं खाता।')}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {tx(
                  'This catalogue is deliberately small — a machine only appears once we can read its details off the manufacturer’s own site. Harvesting robots, for instance, are not here yet because nothing sold in India publishes enough to list honestly.',
                  'यह सूची जानबूझकर छोटी है — कोई मशीन तभी आती है जब उसका विवरण निर्माता की अपनी साइट से पढ़ा जा सके। मसलन कटाई रोबोट अभी नहीं हैं, क्योंकि भारत में बिकने वाला कोई भी उत्पाद इतनी जानकारी प्रकाशित नहीं करता कि उसे ईमानदारी से सूचीबद्ध किया जा सके।',
                )}
              </p>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {tx('Clear filters', 'फ़िल्टर हटाएँ')}
              </button>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((robot, i) => (
                <li key={robot.id}>
                  <Reveal delay={Math.min(i, 5) * 0.05} distance={16} className="h-full">
                    <RobotCard
                      robot={robot}
                      priority={i < 3}
                      selected={compareIds.includes(robot.id)}
                      compareDisabled={compareIds.length >= MAX_COMPARE}
                      onToggleCompare={toggleCompare}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Guided finder                                                     */}
      {/* ---------------------------------------------------------------- */}
      <div className="mt-20">
        <RobotFinder />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Before you buy                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="buying-heading" className="mt-20">
        <SectionHeading
          title={tx('Before you buy one', 'खरीदने से पहले')}
          note={tx(
            'Nine questions worth answering before any money moves.',
            'पैसा चलने से पहले नौ सवालों के जवाब ज़रूरी हैं।',
          )}
        />
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {BUYING_CHECKS.map((c, i) => (
            <li key={c.title.en} className="bg-card p-6">
              <div className="flex items-baseline gap-2.5">
                <span
                  data-numeric
                  aria-hidden
                  className="text-[11px] font-semibold text-accent-ink"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[15px] font-semibold text-foreground">
                  {tx(c.title.en, c.title.hi)}
                </h3>
              </div>
              <p className="mt-2 pl-[1.65rem] text-sm leading-relaxed text-muted-foreground">
                {tx(c.body.en, c.body.hi)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Buy, hire, or pay for the job                                     */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="routes-heading" className="mt-20">
        <SectionHeading
          title={tx('Buy it, hire it, or buy the job', 'खरीदें, किराए पर लें, या काम खरीदें')}
          note={tx(
            'You do not have to own a machine to use one. Which route fits depends on your acreage and how often you would run it.',
            'मशीन इस्तेमाल करने के लिए उसका मालिक होना ज़रूरी नहीं। कौन-सा रास्ता ठीक है, यह आपके रकबे और उपयोग की बारंबारता पर है।',
          )}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {OWNERSHIP_ROUTES.map((r) => (
            <div key={r.title.en} className="flex flex-col rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                {tx(r.title.en, r.title.hi)}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{tx(r.lede.en, r.lede.hi)}</p>
              <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                {r.points.map((p) => (
                  <li key={p.en} className="flex gap-2.5 text-[13px] leading-snug text-foreground">
                    <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-secondary" />
                    {tx(p.en, p.hi)}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-5 text-[13px] leading-relaxed text-muted-foreground">
                {tx(r.suits.en, r.suits.hi)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Safety                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="safety-heading" className="mt-20">
        <SectionHeading title={tx('Before you operate one', 'चलाने से पहले')} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-7">
            <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <ShieldAlert aria-hidden className="h-4 w-4 text-accent-ink" />
              {tx('Any machine', 'हर मशीन')}
            </h3>
            <ul className="mt-4 space-y-3">
              {SAFETY_RULES.map((r) => (
                <li key={r.en} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                  {tx(r.en, r.hi)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-7">
            <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <ScrollText aria-hidden className="h-4 w-4 text-accent-ink" />
              {tx('Drones, additionally', 'ड्रोन के लिए अतिरिक्त')}
            </h3>
            <ul className="mt-4 space-y-3">
              {DRONE_RULES.map((r) => (
                <li key={r.en} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                  {tx(r.en, r.hi)}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
              {tx(DRONE_RULES_NOTE.en, DRONE_RULES_NOTE.hi)}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Government support                                                */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="subsidy-heading" className="mt-20">
        <SectionHeading title={tx('What the government pays for', 'सरकार किसमें मदद करती है')} />
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            <div className="p-7 sm:p-9">
              <p className="text-[15px] font-medium leading-relaxed text-foreground">
                {tx(SUBSIDY_LEAD.en, SUBSIDY_LEAD.hi)}
              </p>
              <ul className="mt-6 space-y-3.5">
                {SUBSIDY_POINTS.map((p) => (
                  <li
                    key={p.en}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                    {tx(p.en, p.hi)}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-border pt-5 text-[12px] leading-relaxed text-muted-foreground">
                {tx(
                  'bhoomix does not publish subsidy percentages, because a single national figure would be wrong for most readers. Check the current rate for your state and category on the official portals.',
                  'भूमिX सब्सिडी का प्रतिशत प्रकाशित नहीं करता, क्योंकि एक ही राष्ट्रीय आँकड़ा ज़्यादातर पाठकों के लिए ग़लत होगा। अपने राज्य और श्रेणी की मौजूदा दर आधिकारिक पोर्टल पर देखें।',
                )}
              </p>
            </div>

            <ul className="grid border-t border-border bg-muted/30 lg:border-l lg:border-t-0">
              {OFFICIAL_LINKS.map((l) => (
                <li key={l.href} className="border-b border-border last:border-0">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[4.5rem] items-center justify-between gap-4 px-7 py-5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {tx(l.label.en, l.label.hi)}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                        {tx(l.note.en, l.note.hi)}
                      </span>
                    </span>
                    <ExternalLink
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* State machinery                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="states-heading" className="mt-20">
        <SectionHeading
          title={tx('Machinery by state', 'राज्यवार मशीनरी')}
          note={tx(
            'The equipment most commonly offered under state mechanisation schemes, and a band to budget against.',
            'राज्य की यंत्रीकरण योजनाओं में आमतौर पर मिलने वाले उपकरण, और बजट बनाने के लिए कीमत की सीमा।',
          )}
        />

        <div className="rounded-lg border border-border bg-card">
          {/* A rail on a phone, a wrapped set on a desk — same control, and it
              never becomes a select that hides where you are. */}
          <div
            role="tablist"
            aria-label={tx('Choose a state', 'राज्य चुनें')}
            className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-border p-4 md:flex-wrap md:overflow-visible"
          >
            {STATE_MACHINERY.map((s, i) => (
              <button
                key={s.state.en}
                role="tab"
                aria-selected={activeState === i}
                onClick={() => setActiveState(i)}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeState === i
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-secondary/50 hover:bg-muted/60',
                )}
              >
                {tx(s.state.en, s.state.hi)}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-7">
            <h3 className="mb-5 flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <MapPin aria-hidden className="h-4 w-4 text-accent-ink" />
              {tx(state.state.en, state.state.hi)}
            </h3>

            <ul className="grid gap-4 md:grid-cols-3">
              {state.machines.map((m) => (
                <li
                  key={m.name.en}
                  className="flex flex-col rounded-md border border-border/70 bg-muted/30 p-5"
                >
                  <h4 className="text-[15px] font-semibold text-foreground">
                    {tx(m.name.en, m.name.hi)}
                  </h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {tx(m.job.en, m.job.hi)}
                  </p>
                  <div className="mt-auto pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {tx('Indicative', 'अनुमानित')}
                    </p>
                    <p data-numeric className="mt-0.5 text-base font-semibold text-foreground">
                      {m.band}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-border pt-5 text-[12px] leading-relaxed text-muted-foreground">
              {tx(STATE_MACHINERY_NOTE.en, STATE_MACHINERY_NOTE.hi)}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Provenance                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="sources-heading" className="mt-20">
        <div className="rounded-lg border border-border bg-muted/30 p-7 sm:p-9">
          <h2
            id="sources-heading"
            className="flex items-center gap-2.5 text-base font-semibold text-foreground"
          >
            <Sprout aria-hidden className="h-4 w-4 text-primary" />
            {tx('Where this came from', 'यह जानकारी कहाँ से आई')}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {tx(
              'Every machine on this page was read off its manufacturer’s own website and carries that link and date. Nothing has been averaged, converted from another currency, or filled in from a press article. Where a manufacturer publishes nothing, the page says so rather than guessing. bhoomix does not sell any of these machines and earns nothing from these links.',
              'इस पन्ने की हर मशीन उसके निर्माता की अपनी वेबसाइट से पढ़ी गई है और उसका लिंक तथा तारीख साथ है। कुछ भी औसत निकालकर, किसी दूसरी मुद्रा से बदलकर या किसी अख़बारी लेख से नहीं लिया गया। जहाँ निर्माता कुछ प्रकाशित नहीं करता, वहाँ पन्ना अनुमान लगाने के बजाय यही कहता है। भूमिX इनमें से कोई मशीन नहीं बेचता और इन लिंक से कुछ नहीं कमाता।',
            )}
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5">
            {Object.values(MANUFACTURERS).map((m) => (
              <li key={m.id}>
                <a
                  href={m.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {m.name}
                  <ExternalLink aria-hidden className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[12px] text-muted-foreground">
            {tx('Catalogue last checked', 'सूची आख़िरी बार जाँची गई')}{' '}
            <span data-numeric>{CATALOGUE_VERIFIED_AT}</span>.{' '}
            {tx(
              'Prices and availability move — confirm with the manufacturer before you commit.',
              'कीमत और उपलब्धता बदलती रहती है — पैसा देने से पहले निर्माता से पुष्टि करें।',
            )}
          </p>
        </div>
      </section>

      <CompareTray
        robots={compareRobots}
        onOpen={() => setCompareOpen(true)}
        onClear={() => setCompareIds([])}
      />
      <RobotCompare
        robots={compareRobots}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemove={(id) => setCompareIds((ids) => ids.filter((i) => i !== id))}
      />
    </PageShell>
  );
};

export default RoboticFarming;
