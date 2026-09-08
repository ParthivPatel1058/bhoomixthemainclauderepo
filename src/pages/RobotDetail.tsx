import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Building2,
  CircleAlert,
  ExternalLink,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Reveal from '@/components/Reveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

import RobotImage from '@/components/robotics/RobotImage';
import {
  ExternalAction,
  OperationBadges,
  PowerChip,
  PriceBlock,
  SourceLine,
} from '@/components/robotics/RobotMeta';

import {
  MANUFACTURERS,
  PLATFORM_LABELS,
  USE_CASE_LABELS,
  getRobot,
  robotsByManufacturer,
} from '@/data/robotics';

/**
 * One machine, in full.
 *
 * Its own route rather than a modal, so a farmer can send the link to whoever
 * is paying, and so the back control behaves the way the rest of the app's
 * back control behaves.
 *
 * The section order is the order a purchase question actually runs: what it is
 * → why you would want it → what the maker publishes → what the maker claims
 * (labelled as theirs, never as fact) → what they have not published → what to
 * check → what it costs → how to reach them. The gaps section is not an
 * apology; on some rows it is the most useful thing on the page, because a
 * manufacturer who will not put a battery capacity in writing is telling you
 * something.
 */
export default function RobotDetail() {
  const { id } = useParams<{ id: string }>();
  const { tx } = useLanguage();
  const robot = id ? getRobot(id) : undefined;
  const [shot, setShot] = useState(0);

  if (!robot) {
    return (
      <PageShell width="default" backTo="/robotic-farming">
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            {tx('That machine is not in the catalogue', 'यह मशीन सूची में नहीं है')}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {tx(
              'It may have been removed, or the link may be wrong. The full catalogue is one step back.',
              'हो सकता है इसे हटा दिया गया हो, या लिंक ग़लत हो। पूरी सूची एक कदम पीछे है।',
            )}
          </p>
          <Link
            to="/robotic-farming"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {tx('Back to farm robotics', 'कृषि रोबोटिक्स पर वापस')}
          </Link>
        </div>
      </PageShell>
    );
  }

  const maker = MANUFACTURERS[robot.manufacturerId];
  const gallery = robot.gallery?.length ? robot.gallery : robot.image ? [robot.image] : [];
  const siblings = robotsByManufacturer(robot.manufacturerId, robot.id);
  const fit = robot.platform === 'ground-robot' ? 'cover' : 'contain';

  return (
    <PageShell width="wide" backTo="/robotic-farming">
      {/* -------------------------------------------------------------- */}
      {/* Hero                                                            */}
      {/* -------------------------------------------------------------- */}
      <Reveal immediate blur distance={18}>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <RobotImage
              src={gallery[shot]}
              alt={tx(
                `${robot.name} — ${robot.summary.en}`,
                `${robot.name} — ${robot.summary.hi}`,
              )}
              fit={fit}
              priority
              className="aspect-[4/3] w-full"
            />

            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3">
                {gallery.map((g, i) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setShot(i)}
                    aria-label={tx(`View photograph ${i + 1}`, `तस्वीर ${i + 1} देखें`)}
                    aria-current={shot === i}
                    className={cn(
                      'overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      shot === i ? 'border-primary' : 'border-transparent hover:border-border',
                    )}
                  >
                    <RobotImage src={g} alt="" fit={fit} className="h-16 w-20 rounded-none" />
                  </button>
                ))}
              </div>
            )}

            {robot.imageCredit && (
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                {tx(robot.imageCredit.en, robot.imageCredit.hi)}
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="mb-4 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-accent-ink" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-ink">
                {tx(PLATFORM_LABELS[robot.platform].en, PLATFORM_LABELS[robot.platform].hi)}
              </span>
            </span>

            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {maker?.name}
            </p>
            <h1 className="mt-1.5 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-[-0.03em] text-foreground">
              {robot.name}
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              {tx(robot.summary.en, robot.summary.hi)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <OperationBadges robot={robot} />
              <PowerChip robot={robot} />
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {robot.useCases.map((u) => (
                <span
                  key={u}
                  className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground"
                >
                  {tx(USE_CASE_LABELS[u].en, USE_CASE_LABELS[u].hi)}
                </span>
              ))}
            </div>

            {/* Price and the action, together — the two things somebody
                scrolled here for. */}
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <PriceBlock price={robot.price} size="lg" />
              {robot.price.note && (
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  {tx(robot.price.note.en, robot.price.note.hi)}
                </p>
              )}
              {robot.availability && (
                <p className="mt-3 text-[13px] font-medium text-primary">
                  {tx(robot.availability.en, robot.availability.hi)}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <ExternalAction href={robot.cta.href}>
                  {tx(robot.cta.label.en, robot.cta.label.hi)}
                </ExternalAction>
                {robot.secondaryCta && (
                  <ExternalAction href={robot.secondaryCta.href} variant="ghost">
                    {tx(robot.secondaryCta.label.en, robot.secondaryCta.label.hi)}
                  </ExternalAction>
                )}
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                {tx(
                  'These links go to the manufacturer. bhoomix does not sell this machine and takes nothing from the sale.',
                  'ये लिंक निर्माता तक जाते हैं। भूमिX यह मशीन नहीं बेचता और बिक्री से कुछ नहीं लेता।',
                )}
              </p>
            </div>

            <SourceLine verification={robot.verification} className="mt-5" />
          </div>
        </div>
      </Reveal>

      {/* -------------------------------------------------------------- */}
      {/* In plain language                                               */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="plain-heading" className="mt-16">
        <div className="rounded-lg border border-secondary/30 bg-secondary/[0.06] p-7 sm:p-9">
          <h2
            id="plain-heading"
            className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-ink"
          >
            {tx('In plain language', 'सीधी भाषा में')}
          </h2>
          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-foreground">
            {tx(robot.farmerSummary.en, robot.farmerSummary.hi)}
          </p>

          {robot.operationNote && (
            <p className="mt-5 flex max-w-3xl gap-2.5 border-t border-secondary/30 pt-5 text-[13px] leading-relaxed text-muted-foreground">
              <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
              {tx(robot.operationNote.en, robot.operationNote.hi)}
            </p>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Specifications                                                  */}
      {/* -------------------------------------------------------------- */}
      <section aria-labelledby="specs-heading" className="mt-16">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            <h2
              id="specs-heading"
              className="text-2xl font-semibold tracking-[-0.02em] text-foreground"
            >
              {tx('What the manufacturer publishes', 'निर्माता क्या प्रकाशित करता है')}
            </h2>

            {robot.specs.length > 0 ? (
              <dl className="mt-6 overflow-hidden rounded-lg border border-border">
                {robot.specs.map((s, i) => (
                  <div
                    key={s.label.en}
                    className={cn(
                      'flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6',
                      i % 2 === 0 ? 'bg-card' : 'bg-muted/30',
                    )}
                  >
                    <dt className="w-full text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:w-52 sm:shrink-0">
                      {tx(s.label.en, s.label.hi)}
                    </dt>
                    <dd data-numeric className="text-[15px] font-medium text-foreground">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-6 flex gap-2.5 rounded-lg border border-border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground">
                <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
                {tx(
                  'The manufacturer has not published a specification sheet for this machine. Ask for one in writing before paying anything.',
                  'निर्माता ने इस मशीन की कोई स्पेसिफिकेशन शीट प्रकाशित नहीं की है। कुछ भी देने से पहले इसे लिखित में माँगें।',
                )}
              </p>
            )}

            {/* Claims are quoted, never absorbed into the spec table — the
                difference between "the maker says" and "it is" is the whole
                integrity of this page. */}
            {robot.claims && robot.claims.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tx('What the manufacturer claims', 'निर्माता का दावा')}
                </h3>
                <ul className="mt-4 space-y-4">
                  {robot.claims.map((c) => (
                    <li key={c.en} className="flex gap-3 border-l-2 border-secondary/50 pl-4">
                      <Quote aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-secondary" />
                      <p className="text-sm leading-relaxed text-foreground">{tx(c.en, c.hi)}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12px] text-muted-foreground">
                  {tx(
                    'These are the manufacturer’s own figures, reproduced as stated. bhoomix has not tested them.',
                    'ये निर्माता के अपने आँकड़े हैं, जैसे कहे गए वैसे ही दिए गए। भूमिX ने इनकी जाँच नहीं की है।',
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {robot.suitableFor && robot.suitableFor.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tx('Best suited for', 'किसके लिए उपयुक्त')}
                </h3>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {robot.suitableFor.map((s) => (
                    <li
                      key={s.en}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary"
                    >
                      {tx(s.en, s.hi)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {robot.crops && robot.crops.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tx('Crops the maker names', 'निर्माता द्वारा बताई फसलें')}
                </h3>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {robot.crops.map((c) => (
                    <li
                      key={c.en}
                      className="rounded-full bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground"
                    >
                      {tx(c.en, c.hi)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {robot.dataGaps && robot.dataGaps.length > 0 && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/[0.05] p-6">
                <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive">
                  <CircleAlert aria-hidden className="h-3.5 w-3.5" />
                  {tx('Not published', 'प्रकाशित नहीं')}
                </h3>
                <ul className="mt-3.5 space-y-3">
                  {robot.dataGaps.map((g) => (
                    <li key={g.en} className="text-[13px] leading-relaxed text-foreground">
                      {tx(g.en, g.hi)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/* Attachments                                                     */}
      {/* -------------------------------------------------------------- */}
      {robot.attachments && robot.attachments.length > 0 && (
        <section aria-labelledby="attachments-heading" className="mt-16">
          <h2
            id="attachments-heading"
            className="text-2xl font-semibold tracking-[-0.02em] text-foreground"
          >
            {tx('Attachments', 'अटैचमेंट')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {tx(
              'One machine, different jobs. Attachments are sold separately — price the ones you actually need alongside the robot.',
              'एक मशीन, अलग-अलग काम। अटैचमेंट अलग से बिकते हैं — रोबोट के साथ उन्हीं की कीमत जोड़ें जो सच में चाहिए।',
            )}
          </p>

          <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {robot.attachments.map((a, i) => (
              <li key={a.name.en}>
                <Reveal delay={Math.min(i, 5) * 0.04} distance={12} className="h-full">
                  <div className="flex h-full flex-col rounded-lg border border-border bg-card">
                    <RobotImage
                      src={a.image}
                      alt={tx(
                        `${a.name.en} attachment for the ${robot.name}`,
                        `${robot.name} के लिए ${a.name.hi} अटैचमेंट`,
                      )}
                      fit="contain"
                      className="aspect-square w-full rounded-b-none"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[15px] font-semibold text-foreground">
                        {tx(a.name.en, a.name.hi)}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {tx(a.description.en, a.description.hi)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Before you buy this one                                         */}
      {/* -------------------------------------------------------------- */}
      {robot.considerations && robot.considerations.length > 0 && (
        <section aria-labelledby="consider-heading" className="mt-16">
          <h2
            id="consider-heading"
            className="text-2xl font-semibold tracking-[-0.02em] text-foreground"
          >
            {tx('Check these before you buy', 'खरीदने से पहले यह जाँचें')}
          </h2>
          <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {robot.considerations.map((c, i) => (
              <li key={c.en} className="flex gap-3 bg-card p-6">
                <span
                  data-numeric
                  aria-hidden
                  className="text-[11px] font-semibold leading-6 text-accent-ink"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm leading-relaxed text-foreground">{tx(c.en, c.hi)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------------------------------------------------------------- */}
      {/* Manufacturer                                                    */}
      {/* -------------------------------------------------------------- */}
      {maker && (
        <section aria-labelledby="maker-heading" className="mt-16">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid lg:grid-cols-[1fr_1fr]">
              <div className="p-7 sm:p-9">
                <h2
                  id="maker-heading"
                  className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-ink"
                >
                  <Building2 aria-hidden className="h-3.5 w-3.5" />
                  {tx('The manufacturer', 'निर्माता')}
                </h2>

                <p className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                  {maker.name}
                </p>
                {maker.legalName && maker.legalName !== maker.name && (
                  <p className="mt-1 text-sm text-muted-foreground">{maker.legalName}</p>
                )}

                <dl className="mt-6 space-y-3.5">
                  {maker.location && (
                    <div className="flex gap-2.5 text-sm text-muted-foreground">
                      <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                      <dd>{tx(maker.location.en, maker.location.hi)}</dd>
                    </div>
                  )}
                  {maker.phone && (
                    <div className="flex gap-2.5 text-sm">
                      <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd>
                        <a
                          href={`tel:${maker.phone.replace(/\s/g, '')}`}
                          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          {maker.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {maker.email && (
                    <div className="flex gap-2.5 text-sm">
                      <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd>
                        <a
                          href={`mailto:${maker.email}`}
                          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          {maker.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {maker.whatsapp && (
                    <div className="flex gap-2.5 text-sm">
                      <MessageCircle
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      />
                      <dd>
                        <a
                          href={maker.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                        >
                          {tx('WhatsApp', 'व्हाट्सऐप')}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-7 flex flex-wrap gap-3">
                  <ExternalAction href={maker.website} variant="ghost">
                    {tx(`Visit ${maker.name}`, `${maker.name} पर जाएँ`)}
                  </ExternalAction>
                  {maker.youtube && (
                    <ExternalAction href={maker.youtube} variant="ghost">
                      {tx('Watch on YouTube', 'यूट्यूब पर देखें')}
                    </ExternalAction>
                  )}
                </div>
              </div>

              {/* Their other machines in this catalogue. Only real rows —
                  no "explore the range" link to a page we do not have. */}
              <div className="border-t border-border bg-muted/30 p-7 sm:p-9 lg:border-l lg:border-t-0">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tx(`Also from ${maker.name}`, `${maker.name} की अन्य मशीनें`)}
                </h3>

                {siblings.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {siblings.map((s) => (
                      <li key={s.id}>
                        <Link
                          to={`/robotic-farming/${s.id}`}
                          className="group flex items-center gap-4 rounded-md border border-border bg-background p-3 transition-[border-color] hover:border-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <RobotImage
                            src={s.image}
                            alt=""
                            fit={s.platform === 'ground-robot' ? 'cover' : 'contain'}
                            className="h-14 w-16 shrink-0"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-foreground">
                              {s.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                              {tx(s.summary.en, s.summary.hi)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {tx(
                      'This is the only machine from this manufacturer in the catalogue so far.',
                      'फ़िलहाल सूची में इस निर्माता की यही एक मशीन है।',
                    )}
                  </p>
                )}

                <a
                  href={maker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
                >
                  {tx('See their full range on their site', 'उनकी पूरी श्रृंखला उनकी साइट पर देखें')}
                  <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-16 border-t border-border pt-8">
        <SourceLine verification={robot.verification} />
        <Link
          to="/robotic-farming#catalogue"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
        >
          {tx('Back to the catalogue', 'सूची पर वापस')}
        </Link>
      </div>
    </PageShell>
  );
}
