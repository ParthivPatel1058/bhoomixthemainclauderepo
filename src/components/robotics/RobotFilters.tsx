import { useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  CATEGORY_ORDER,
  OPERATION_LABELS,
  POWER_LABELS,
  ROBOTS,
  categoryLabel,
  countInCategory,
  matchesCategory,
  type CategoryKey,
  type Operation,
  type Power,
  type RobotFilters as Filters,
} from '@/data/robotics';

interface RobotFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
}

/**
 * Search and filtering for the catalogue.
 *
 * Two decisions worth stating. Empty filters are never rendered: a chip for a
 * facet with nothing behind it is a promise the catalogue cannot keep, so
 * `CATEGORY_ORDER` is filtered by actual counts and the operation and power
 * rows are derived from what the rows really contain. And on a phone the
 * secondary facets move into a bottom sheet rather than stacking into a wall
 * of chips — a sidebar of filters is a desktop idea, and this page is read on
 * a phone in a field.
 */
/**
 * A filter pill. Module scope, not a closure inside the component: declaring
 * a component inside a render body gives it a new identity every render, so
 * React unmounts and remounts the entire chip row on every keystroke in the
 * search box. That is wasted work, and it is the kind of thing that quietly
 * becomes a focus bug the first time one of these gains an input.
 */
function Chip({
  on,
  onClick,
  children,
  count,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        on
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-secondary/50 hover:bg-muted/60',
      )}
    >
      {children}
      {count !== undefined && (
        <span
          data-numeric
          className={cn('text-[11px]', on ? 'opacity-75' : 'text-muted-foreground')}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** The operation and power groups, shared by the desktop row and the mobile
 *  sheet so the two can never drift apart. */
function SecondaryFacets({
  stacked = false,
  filters,
  set,
  operations,
  powers,
}: {
  stacked?: boolean;
  filters: Filters;
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  operations: Operation[];
  powers: Power[];
}) {
  const { tx } = useLanguage();
  return (
    <div className={cn('gap-6', stacked ? 'grid' : 'flex flex-wrap items-center')}>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tx('How it is controlled', 'नियंत्रण कैसे होता है')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip on={filters.operation === 'all'} onClick={() => set('operation', 'all')}>
            {tx('Any', 'कोई भी')}
          </Chip>
          {operations.map((o) => (
            <Chip
              key={o}
              on={filters.operation === o}
              onClick={() => set('operation', filters.operation === o ? 'all' : o)}
            >
              {tx(OPERATION_LABELS[o].en, OPERATION_LABELS[o].hi)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Hidden while every machine in the catalogue runs on the same thing.
          A facet with one option filters nothing and only adds a control to
          read past. It reappears on its own the day a diesel row is added. */}
      <div className={cn(powers.length < 2 && 'hidden')}>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tx('Power', 'ऊर्जा')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip on={filters.power === 'all'} onClick={() => set('power', 'all')}>
            {tx('Any', 'कोई भी')}
          </Chip>
          {powers.map((p) => (
            <Chip
              key={p}
              on={filters.power === p}
              onClick={() => set('power', filters.power === p ? 'all' : p)}
            >
              {tx(POWER_LABELS[p].en, POWER_LABELS[p].hi)}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RobotFilters({ filters, onChange, resultCount }: RobotFiltersProps) {
  const { tx } = useLanguage();

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => countInCategory(c) > 0),
    [],
  );

  const operations = useMemo(() => {
    const set = new Set<Operation>();
    ROBOTS.forEach((r) => r.operation.forEach((o) => set.add(o)));
    return [...set];
  }, []);

  const powers = useMemo(() => {
    const set = new Set<Power>();
    ROBOTS.forEach((r) => set.add(r.power));
    return [...set];
  }, []);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const secondaryActive =
    (filters.operation !== 'all' ? 1 : 0) +
    (powers.length > 1 && filters.power !== 'all' ? 1 : 0);

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor="robot-search" className="sr-only">
          {tx('Search machines', 'मशीन खोजें')}
        </label>
        <input
          id="robot-search"
          type="search"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          placeholder={tx(
            'Search — try “weeding robot”, “FarmRobo”, “orchard”, “spraying drone”',
            'खोजें — जैसे "निराई रोबोट", "फार्मरोबो", "बाग़", "छिड़काव ड्रोन"',
          )}
          className="w-full rounded-full border border-border bg-background py-3.5 pl-11 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary/60 focus:ring-2 focus:ring-ring/30"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => set('query', '')}
            aria-label={tx('Clear search', 'खोज साफ़ करें')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Categories — a scrolling rail on a phone, a wrapped row on a desk. */}
      <div className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <Chip
          on={filters.category === 'all'}
          onClick={() => set('category', 'all')}
          count={ROBOTS.length}
        >
          {tx('All machines', 'सभी मशीनें')}
        </Chip>
        {categories.map((c) => {
          const label = categoryLabel(c);
          return (
            <Chip
              key={c}
              on={filters.category === c}
              onClick={() => set('category', filters.category === c ? 'all' : c)}
              count={countInCategory(c)}
            >
              {tx(label.en, label.hi)}
            </Chip>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-[13px] text-muted-foreground">
          <span data-numeric className="font-semibold text-foreground">
            {resultCount}
          </span>{' '}
          {tx(
            resultCount === 1 ? 'machine' : 'machines',
            'मशीनें',
          )}
        </p>

        {/* Phone: the rest of the facets live in a sheet. */}
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold text-foreground transition-colors hover:border-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SlidersHorizontal aria-hidden className="h-3.5 w-3.5" />
                {tx('Filters', 'फ़िल्टर')}
                {secondaryActive > 0 && (
                  <span
                    data-numeric
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground"
                  >
                    {secondaryActive}
                  </span>
                )}
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{tx('Filters', 'फ़िल्टर')}</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <SecondaryFacets stacked filters={filters} set={set} operations={operations} powers={powers} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Desktop: inline, because there is room and hiding them costs a click. */}
      <div className="mt-5 hidden md:block">
        <SecondaryFacets filters={filters} set={set} operations={operations} powers={powers} />
      </div>
    </div>
  );
}
