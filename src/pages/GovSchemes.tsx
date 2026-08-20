import { useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSchemes } from '@/hooks/useSchemes';
import { CATEGORY_LABELS, type Scheme, type SchemeCategory } from '@/data/schemes';
import { ExternalLink, Building2, MapPin, Search, X } from 'lucide-react';

const GovSchemes = () => {
  const { tx, language } = useLanguage();
  const { schemes } = useSchemes();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SchemeCategory | 'all'>('all');
  const [state, setState] = useState('all');

  const states = useMemo(
    () => [...new Set(schemes.filter((s) => s.state).map((s) => s.state as string))].sort(),
    [schemes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return schemes.filter((s) => {
      if (category !== 'all' && s.category !== category) return false;
      if (state === 'central' && s.state) return false;
      if (state !== 'all' && state !== 'central' && s.state !== state) return false;
      if (!q) return true;
      // Search both scripts, so a query typed in Hindi still matches.
      return [s.name, s.nameHi, s.description, s.descriptionHi, s.benefits, s.benefitsHi]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [schemes, query, category, state]);

  const central = filtered.filter((s) => !s.state);
  const stateWise = filtered.filter((s) => s.state);

  // Schemes can come from the database, where `category` is free text and may
  // not match this app's vocabulary — an editor fixing a link could type
  // anything. Falling back to the raw value keeps an unknown category
  // displayable instead of taking the whole page down.
  const catLabel = (c: SchemeCategory) => {
    const label = CATEGORY_LABELS[c];
    return label ? tx(label.en, label.hi) : String(c);
  };

  const Card = ({ s }: { s: Scheme }) => (
    <article className="glass flex flex-col rounded-2xl p-6 transition-all hover:shadow-xl">
      <div className="mb-3 flex flex-wrap gap-2">
        {s.state && (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-foreground">
            {tx(s.state, s.state)}
          </span>
        )}
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {catLabel(s.category)}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-bold text-foreground">{tx(s.name, s.nameHi)}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{tx(s.description, s.descriptionHi)}</p>

      <dl className="mb-5 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-primary">{tx('Who can apply', 'कौन आवेदन कर सकता है')}</dt>
          <dd className="text-muted-foreground">{tx(s.eligibility, s.eligibilityHi)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-primary">{tx('What you get', 'आपको क्या मिलता है')}</dt>
          <dd className="text-muted-foreground">{tx(s.benefits, s.benefitsHi)}</dd>
        </div>
      </dl>

      <a
        href={s.link}
        target="_blank"
        rel="noopener noreferrer"
        /* min-h-11 (44px) not larger text: the hit area has to clear the
           touch guideline for a gloved hand outdoors, while the label stays
           the size the card layout expects. */
        className="mt-auto inline-flex min-h-11 items-center gap-2 py-2 text-sm font-semibold text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        {tx('Apply now', 'अभी आवेदन करें')}
      </a>
    </article>
  );

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="px-4 pt-5 lg:px-6">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl pb-8">
          <h1 className="page-title mb-3 text-foreground">
            {tx('Government Schemes', 'सरकारी योजनाएं')}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {tx(
              'Central and state schemes for farmers — eligibility, benefits, and direct links to apply.',
              'किसानों के लिए केंद्र और राज्य की योजनाएं — पात्रता, लाभ और आवेदन के सीधे लिंक।',
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx('Search schemes — try "insurance" or "loan"', 'योजना खोजें — जैसे "बीमा" या "ऋण"')}
            className="glass w-full rounded-2xl border-primary/20 py-3.5 pl-12 pr-11 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label={tx('Clear search', 'खोज साफ़ करें')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="scrollbar-hide -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-2">
          <button
            onClick={() => setCategory('all')}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              category === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'glass text-foreground hover:bg-primary/10'
            }`}
          >
            {tx('All categories', 'सभी श्रेणियां')}
          </button>
          {(Object.keys(CATEGORY_LABELS) as SchemeCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                category === c
                  ? 'bg-primary text-primary-foreground'
                  : 'glass text-foreground hover:bg-primary/10'
              }`}
            >
              {catLabel(c)}
            </button>
          ))}
        </div>

        {/* Central vs state filter */}
        <div className="scrollbar-hide -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2">
          {[
            { id: 'all', label: tx('Everywhere', 'सभी जगह') },
            { id: 'central', label: tx('Central only', 'केवल केंद्रीय') },
            ...states.map((s) => ({ id: s, label: tx(s, s) })),
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setState(opt.id)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm transition-all ${
                state === opt.id
                  ? 'bg-secondary font-semibold text-secondary-foreground'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          {tx('{n} schemes', '{n} योजनाएं').replace('{n}', String(filtered.length))}
        </p>

        {filtered.length === 0 && (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-lg font-semibold text-foreground">
              {tx('No schemes match your search', 'आपकी खोज से कोई योजना नहीं मिली')}
            </p>
            <p className="mt-2 text-muted-foreground">
              {tx('Try a different word or clear the filters.', 'कोई दूसरा शब्द आज़माएं या फ़िल्टर हटाएं।')}
            </p>
          </div>
        )}

        {central.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-foreground">
              <Building2 className="h-8 w-8 text-primary" />
              {tx('Central Government Schemes', 'केंद्र सरकार की योजनाएं')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {central.map((s) => (
                <Card key={s.id} s={s} />
              ))}
            </div>
          </section>
        )}

        {stateWise.length > 0 && (
          <section>
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-foreground">
              <MapPin className="h-8 w-8 text-primary" />
              {tx('State Government Schemes', 'राज्य सरकार की योजनाएं')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stateWise.map((s) => (
                <Card key={s.id} s={s} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-xs text-muted-foreground">
          {tx(
            'Scheme terms change with policy. Always confirm details on the official portal before applying.',
            'योजना की शर्तें नीति के साथ बदलती हैं। आवेदन से पहले आधिकारिक पोर्टल पर विवरण अवश्य जांचें।',
          )}
        </p>
      </div>
    </div>
  );
};

export default GovSchemes;
