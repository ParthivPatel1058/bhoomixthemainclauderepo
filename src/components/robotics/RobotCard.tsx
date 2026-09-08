import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, GitCompare, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import RobotImage from './RobotImage';
import { OperationBadges, PowerChip, PriceBlock } from './RobotMeta';
import {
  MANUFACTURERS,
  PLATFORM_LABELS,
  USE_CASE_LABELS,
  type AgriRobot,
} from '@/data/robotics';

interface RobotCardProps {
  robot: AgriRobot;
  /** Rendered in the compare tray? Shows a filled toggle if so. */
  selected?: boolean;
  onToggleCompare?: (id: string) => void;
  /** Disable the compare toggle when the tray is full. */
  compareDisabled?: boolean;
  priority?: boolean;
}

/**
 * One machine, as a product rather than a paragraph.
 *
 * The image is the largest thing on the card because an agricultural machine
 * is understood by looking at it — a farmer can tell in a second whether a
 * thing will fit between their rows, and no amount of specification text does
 * that job. Everything below the photograph is ordered the way the buying
 * question actually runs: what is it, who makes it, how is it controlled, what
 * does it do, what does it cost.
 *
 * The whole card is one link, with the compare toggle lifted out of it as a
 * sibling button — nesting an interactive control inside an anchor is invalid
 * and breaks keyboard users, and this grid is one of the few places in the app
 * where a card genuinely needs two actions.
 */
export default function RobotCard({
  robot,
  selected = false,
  onToggleCompare,
  compareDisabled = false,
  priority = false,
}: RobotCardProps) {
  const { tx } = useLanguage();
  const maker = MANUFACTURERS[robot.manufacturerId];
  const headline = robot.specs.filter((s) => s.headline).slice(0, 4);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-raised transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-editorial)] focus-within:border-secondary/50 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-floating">
      {/* Media. Fixed ratio so a grid row stays level whatever the source
          image is shaped like, and no wheel or propeller gets cropped off. */}
      <div className="relative">
        <RobotImage
          src={robot.image}
          alt={tx(
            `${robot.name} — ${robot.summary.en}`,
            `${robot.name} — ${robot.summary.hi}`,
          )}
          fit={robot.platform === 'ground-robot' ? 'cover' : 'contain'}
          priority={priority}
          className="aspect-[4/3] w-full rounded-none"
        />

        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
          {tx(PLATFORM_LABELS[robot.platform].en, PLATFORM_LABELS[robot.platform].hi)}
        </span>

        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(robot.id)}
            disabled={compareDisabled && !selected}
            aria-pressed={selected}
            className={cn(
              'absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-foreground backdrop-blur-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background/85 hover:border-secondary/50',
              compareDisabled && !selected && 'cursor-not-allowed opacity-40',
            )}
            aria-label={
              selected
                ? tx(`Remove ${robot.name} from comparison`, `${robot.name} को तुलना से हटाएँ`)
                : tx(`Add ${robot.name} to comparison`, `${robot.name} को तुलना में जोड़ें`)
            }
          >
            {selected ? (
              <Check aria-hidden className="h-4 w-4" />
            ) : (
              <GitCompare aria-hidden className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {maker?.name}
        </p>

        <h3 className="mt-1 text-lg font-semibold leading-tight tracking-[-0.01em] text-foreground">
          {/* The stretched pseudo-element makes the whole card clickable
              without wrapping the compare button in the anchor. */}
          <Link
            to={`/robotic-farming/${robot.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {robot.name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {tx(robot.summary.en, robot.summary.hi)}
        </p>

        <div className="mt-3.5">
          <OperationBadges robot={robot} />
        </div>

        {headline.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border/70 pt-4">
            {headline.map((s) => (
              <div key={s.label.en} className="min-w-0">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {tx(s.label.en, s.label.hi)}
                </dt>
                {/* Clamped, not truncated. Several published values are a
                    phrase rather than a figure ("Camera row guidance · RTK
                    support"), and cutting those at one line hid the half that
                    said what the machine can do. */}
                <dd data-numeric className="mt-0.5 line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* No published specifications at all is itself the headline. Saying
            so beats an empty gap that reads as a rendering bug. */}
        {headline.length === 0 && (
          <p className="mt-4 flex items-start gap-2 border-t border-border/70 pt-4 text-[13px] leading-snug text-muted-foreground">
            <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {tx(
              'No specifications published by the manufacturer',
              'निर्माता ने कोई स्पेसिफिकेशन प्रकाशित नहीं किया',
            )}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {robot.useCases.slice(0, 4).map((u) => (
            <span
              key={u}
              className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {tx(USE_CASE_LABELS[u].en, USE_CASE_LABELS[u].hi)}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <PriceBlock price={robot.price} />
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
            {tx('Details', 'विवरण')}
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-editorial)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>

        <div className="mt-3 border-t border-border/70 pt-3">
          <PowerChip robot={robot} />
        </div>
      </div>
    </article>
  );
}
