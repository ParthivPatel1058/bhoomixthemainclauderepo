import { ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  OPERATION_LABELS,
  POWER_LABELS,
  PRICE_KIND_LABELS,
  type AgriRobot,
  type Operation,
  type Price,
  type Verification,
} from '@/data/robotics';

/**
 * The small, repeated pieces of a product's chrome: how it is controlled, what
 * it runs on, what it costs, and where the claim came from.
 *
 * They live together because they are the four things that have to stay
 * consistent between a card and a detail page. Operation in particular: the
 * badge is a tooltip, not a decoration, because "semi-autonomous" and
 * "autonomous" mean different amounts of money and different amounts of
 * supervision, and a farmer reading the word for the first time deserves the
 * definition next to it rather than in a glossary.
 */

/* ---------------- Operation ---------------- */

const OPERATION_TONE: Record<Operation, string> = {
  'remote-controlled': 'border-border bg-muted/60 text-foreground',
  'semi-autonomous': 'border-secondary/40 bg-secondary/15 text-accent-ink',
  autonomous: 'border-primary/40 bg-primary/10 text-primary',
  'ai-assisted': 'border-primary/30 bg-primary/[0.07] text-primary',
  'operator-driven': 'border-border bg-muted/60 text-foreground',
};

export function OperationBadge({ mode }: { mode: Operation }) {
  const { tx } = useLanguage();
  const label = OPERATION_LABELS[mode];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            'inline-flex cursor-help items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            OPERATION_TONE[mode],
          )}
        >
          {tx(label.en, label.hi)}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[15rem] text-xs">
        {tx(label.detail.en, label.detail.hi)}
      </TooltipContent>
    </Tooltip>
  );
}

export function OperationBadges({ robot }: { robot: AgriRobot }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {robot.operation.map((m) => (
        <OperationBadge key={m} mode={m} />
      ))}
    </div>
  );
}

/* ---------------- Power ---------------- */

export function PowerChip({ robot }: { robot: AgriRobot }) {
  const { tx } = useLanguage();
  const label = POWER_LABELS[robot.power];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      <Zap aria-hidden className="h-3 w-3" />
      {tx(label.en, label.hi)}
    </span>
  );
}

/* ---------------- Price ---------------- */

/**
 * A figure and, above it, how firm that figure is.
 *
 * The kind label is not fine print. "Price on request" is the honest answer
 * for most of this catalogue, and rendering it at the same weight as a real
 * number is what stops the page from implying a price it does not have.
 */
export function PriceBlock({
  price,
  size = 'sm',
}: {
  price: Price;
  size?: 'sm' | 'lg';
}) {
  const { tx } = useLanguage();
  const known = price.kind === 'listed' || price.kind === 'range' || price.kind === 'starting';

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {tx(PRICE_KIND_LABELS[price.kind].en, PRICE_KIND_LABELS[price.kind].hi)}
      </p>
      <p
        data-numeric
        className={cn(
          'mt-1 font-semibold leading-none tracking-tight',
          size === 'lg' ? 'text-3xl' : 'text-lg',
          known ? 'text-accent-ink' : 'text-muted-foreground',
        )}
      >
        {tx(price.display.en, price.display.hi)}
      </p>
    </div>
  );
}

/* ---------------- Provenance ---------------- */

/**
 * Where the row came from and when it was read.
 *
 * Printed on every product, not tucked into a footer. A catalogue of ₹10 lakh
 * machines is only worth anything if the reader can go and check it, and the
 * date is there because a verified figure quietly becomes a wrong one.
 */
export function SourceLine({
  verification,
  className,
}: {
  verification: Verification;
  className?: string;
}) {
  const { tx, language } = useLanguage();
  const date = new Date(verification.verifiedAt);
  const when = Number.isNaN(date.getTime())
    ? verification.verifiedAt
    : date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        month: 'long',
        year: 'numeric',
      });

  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground',
        className,
      )}
    >
      <ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary/70" />
      <span>
        {tx('Read from', 'स्रोत')}{' '}
        <a
          href={verification.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
        >
          {verification.sourceName}
          <ExternalLink aria-hidden className="ml-0.5 inline h-3 w-3 align-[-1px]" />
        </a>
      </span>
      <span aria-hidden className="text-border">·</span>
      <span>
        {tx('checked', 'जाँचा गया')} {when}
      </span>
    </p>
  );
}

/**
 * An external destination, labelled so nobody mistakes it for a bhoomix page.
 *
 * bhoomix does not sell any of these machines and has no checkout for them, so
 * every action here leaves the app. Saying so on the control — arrow, domain,
 * new tab — is the difference between a link and a trap.
 */
export function ExternalAction({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
}) {
  const { tx } = useLanguage();
  let host = '';
  try {
    host = new URL(href).hostname.replace(/^www\./, '');
  } catch {
    host = '';
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${typeof children === 'string' ? children : ''} — ${tx(
        `opens ${host} in a new tab`,
        `${host} नए टैब में खुलेगा`,
      )}`}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold',
        'transition-[transform,box-shadow,border-color,background-color,color] duration-300 ease-[var(--ease-editorial)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98]'
          : 'border border-border bg-transparent text-foreground hover:border-secondary/50 hover:bg-muted/50',
        className,
      )}
    >
      {children}
      <ExternalLink aria-hidden className="h-3.5 w-3.5" />
    </a>
  );
}
