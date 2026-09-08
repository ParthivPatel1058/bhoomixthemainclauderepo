import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import RobotImage from './RobotImage';
import { PriceBlock } from './RobotMeta';
import {
  MANUFACTURERS,
  OPERATION_LABELS,
  PLATFORM_LABELS,
  POWER_LABELS,
  USE_CASE_LABELS,
  type AgriRobot,
  type Bi,
} from '@/data/robotics';

export const MAX_COMPARE = 4;

/** Spec labels the fixed rows already show, so the union below skips them. */
const FIXED_ROW_LABELS = ['Type', 'Main purpose', 'Operation', 'Power', 'Best suited for'];

/**
 * Side-by-side comparison of two to four machines.
 *
 * The interesting problem here is that no two manufacturers publish the same
 * fields. Rather than forcing a fixed schema — which would mean either
 * inventing values or showing a table of blanks — the rows are the union of
 * whatever the selected machines actually publish, and anything a given
 * machine is missing reads "Not published". That is the honest answer and it
 * is also useful: a column full of "not published" tells a farmer something
 * real about how much that manufacturer is willing to commit to in writing.
 */

interface RobotCompareProps {
  robots: AgriRobot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: string) => void;
}

/**
 * One comparison row. Module scope for the same reason as elsewhere in this
 * folder: a component defined inside a render body remounts its whole subtree
 * whenever the parent re-renders, which here is every time a machine is
 * removed from the tray.
 */
function Row({
  label,
  robots,
  render,
}: {
  label: string;
  robots: AgriRobot[];
  render: (r: AgriRobot) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/70 last:border-0">
      <th
        scope="row"
        className="sticky left-0 z-10 min-w-[9rem] bg-card py-3 pr-4 text-left align-top text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </th>
      {robots.map((r) => (
        <td key={r.id} className="min-w-[11rem] py-3 pr-6 align-top text-[13px] text-foreground">
          {render(r)}
        </td>
      ))}
    </tr>
  );
}

export default function RobotCompare({
  robots,
  open,
  onOpenChange,
  onRemove,
}: RobotCompareProps) {
  const { tx } = useLanguage();

  // Union of spec labels, in the order the first machine that has them lists
  // them — so the most fully documented product sets the reading order.
  //
  // Seeded with the labels the fixed rows above already cover. Without that,
  // a manufacturer who publishes its own "Power" spec produced two Power rows
  // in the table — one saying "Electric" and one saying "Fully electric — no
  // fuel" — which reads as a data error rather than as two levels of detail.
  const specRows: Bi[] = [];
  const seen = new Set<string>(FIXED_ROW_LABELS);
  for (const r of robots) {
    for (const s of r.specs) {
      if (!seen.has(s.label.en)) {
        seen.add(s.label.en);
        specRows.push(s.label);
      }
    }
  }

  const missing = (
    <span className="text-muted-foreground">{tx('Not published', 'प्रकाशित नहीं')}</span>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-semibold tracking-[-0.02em]">
            {tx('Compare machines', 'मशीनों की तुलना')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {tx(
              'Only what each manufacturer publishes. Blank rows are genuine gaps, not omissions on our side.',
              'सिर्फ़ वही जो हर निर्माता प्रकाशित करता है। खाली पंक्तियाँ असली कमी हैं, हमारी चूक नहीं।',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto px-6 pb-6">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              {tx('Specification comparison', 'स्पेसिफिकेशन तुलना')}
            </caption>
            <thead>
              <tr>
                <td className="sticky left-0 z-10 bg-card" />
                {robots.map((r) => (
                  <th key={r.id} scope="col" className="min-w-[11rem] pb-4 pr-6 align-bottom">
                    <div className="relative">
                      <RobotImage
                        src={r.image}
                        alt={r.name}
                        fit={r.platform === 'ground-robot' ? 'cover' : 'contain'}
                        className="mb-3 aspect-[4/3] w-full"
                      />
                      <button
                        type="button"
                        onClick={() => onRemove(r.id)}
                        aria-label={tx(`Remove ${r.name}`, `${r.name} हटाएँ`)}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 text-foreground backdrop-blur-sm transition-colors hover:border-destructive/50 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X aria-hidden className="h-3.5 w-3.5" />
                      </button>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {MANUFACTURERS[r.manufacturerId]?.name}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{r.name}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <Row
                robots={robots}
                label={tx('Type', 'प्रकार')}
                render={(r) => tx(PLATFORM_LABELS[r.platform].en, PLATFORM_LABELS[r.platform].hi)}
              />
              <Row
                robots={robots}
                label={tx('Main purpose', 'मुख्य काम')}
                render={(r) =>
                  r.useCases.map((u) => tx(USE_CASE_LABELS[u].en, USE_CASE_LABELS[u].hi)).join(' · ')
                }
              />
              <Row
                robots={robots}
                label={tx('Operation', 'संचालन')}
                render={(r) =>
                  r.operation
                    .map((o) => tx(OPERATION_LABELS[o].en, OPERATION_LABELS[o].hi))
                    .join(' · ')
                }
              />
              <Row
                robots={robots}
                label={tx('Power', 'ऊर्जा')}
                render={(r) => tx(POWER_LABELS[r.power].en, POWER_LABELS[r.power].hi)}
              />
              <Row
                robots={robots}
                label={tx('Best suited for', 'किसके लिए उपयुक्त')}
                render={(r) =>
                  r.suitableFor?.length
                    ? r.suitableFor.map((s) => tx(s.en, s.hi)).join(', ')
                    : missing
                }
              />

              {specRows.map((label) => (
                <Row
                  key={label.en}
                  robots={robots}
                  label={tx(label.en, label.hi)}
                  render={(r) => {
                    const spec = r.specs.find((s) => s.label.en === label.en);
                    return spec ? <span data-numeric>{spec.value}</span> : missing;
                  }}
                />
              ))}

              <Row
                robots={robots}
                label={tx('Price', 'कीमत')}
                render={(r) => <PriceBlock price={r.price} />}
              />
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The persistent tray at the bottom of the catalogue while machines are
 * selected. Pinned rather than inline because the selection is made while
 * scrolling a long grid, and a control that scrolls away with it is a control
 * nobody finds again.
 */
export function CompareTray({
  robots,
  onOpen,
  onClear,
}: {
  robots: AgriRobot[];
  onOpen: () => void;
  onClear: () => void;
}) {
  const { tx } = useLanguage();
  if (robots.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="glass pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-full py-2 pl-4 pr-2 shadow-floating">
        <span className="flex -space-x-2" aria-hidden>
          {robots.map((r) => (
            <RobotImage
              key={r.id}
              src={r.image}
              alt=""
              fit="contain"
              className="h-9 w-9 rounded-full border-2 border-background"
            />
          ))}
        </span>

        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
          {tx(
            `${robots.length} selected`,
            `${robots.length} चुनी गईं`,
          )}
          {robots.length < 2 && (
            <span className="ml-1 text-muted-foreground">
              {tx('— pick one more', '— एक और चुनें')}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={onClear}
          className="min-h-9 rounded-full px-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {tx('Clear', 'हटाएँ')}
        </button>

        <button
          type="button"
          onClick={onOpen}
          disabled={robots.length < 2}
          className="min-h-9 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-[filter,opacity] hover:brightness-110 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {tx('Compare', 'तुलना करें')}
        </button>
      </div>
    </div>
  );
}
