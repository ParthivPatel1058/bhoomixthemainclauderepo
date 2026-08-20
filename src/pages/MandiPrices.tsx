import { useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMandiPrices } from '@/hooks/useMandiPrices';
import { IndianRupee, Search, TrendingUp, KeyRound, Loader2, ExternalLink } from 'lucide-react';

/** Every state the dataset reports, so no farmer is left without their own. */
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chattisgarh', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'NCT of Delhi', 'Odisha', 'Pondicherry', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttrakhand',
  'West Bengal',
];

/** The crops a farmer is most likely to be selling; the rest via search. */
const COMMODITIES = [
  'Wheat', 'Paddy(Dhan)(Common)', 'Soyabean', 'Maize', 'Cotton',
  'Onion', 'Potato', 'Tomato', 'Gram', 'Mustard',
];

/**
 * Today's mandi rates, so a farmer walks into the market already knowing the
 * going price instead of taking whatever the first trader offers.
 */
export default function MandiPrices() {
  const { tx } = useLanguage();
  const [state, setState] = useState('Madhya Pradesh');
  const [commodity, setCommodity] = useState('');
  const [query, setQuery] = useState('');
  // Filtering by commodity server-side rather than client-side: the API caps a
  // response at `limit`, so narrowing here is what surfaces a farmer's crop in
  // a state that reports thousands of rows a day.
  const { prices, status } = useMandiPrices({ state, commodity: commodity || undefined, limit: 100 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prices;
    return prices.filter((p) =>
      [p.commodity, p.market, p.district, p.variety].join(' ').toLowerCase().includes(q),
    );
  }, [prices, query]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="px-4 pt-5 lg:px-6">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <h1 className="page-title mb-3 text-foreground">
            {tx('Mandi Prices', 'मंडी भाव')}
          </h1>
          <p className="text-muted-foreground">
            {tx(
              "Today's rates from government-regulated markets. Know the price before you sell.",
              'सरकारी मंडियों से आज के भाव। बेचने से पहले दाम जानें।',
            )}
          </p>
        </header>

        {status === 'no-key' && (
          <div className="glass rounded-3xl p-8">
            <KeyRound className="mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-2 text-xl font-bold text-foreground">
              {tx('One free key needed', 'एक निःशुल्क कुंजी चाहिए')}
            </h2>
            <p className="mb-4 max-w-2xl text-muted-foreground">
              {tx(
                'Live prices come from the Government of India open data platform. The key is free and takes about two minutes — register, open My Account, and copy the key.',
                'भाव भारत सरकार के ओपन डेटा प्लेटफ़ॉर्म से आते हैं। कुंजी निःशुल्क है और लगभग दो मिनट लगते हैं — पंजीकरण करें, My Account खोलें, और कुंजी कॉपी करें।',
              )}
            </p>
            <pre className="mb-4 overflow-x-auto rounded-xl bg-black/[0.06] p-4 text-sm dark:bg-white/[0.06]">
              <code>VITE_DATAGOV_API_KEY="your-key-here"</code>
            </pre>
            <p className="mb-5 text-sm text-muted-foreground">
              {tx('Add that line to .env, then restart the dev server.', 'इसे .env में जोड़ें, फिर सर्वर पुनः चालू करें।')}
            </p>
            <a
              href="https://www.data.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
            >
              {tx('Get a free key', 'निःशुल्क कुंजी लें')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {status !== 'no-key' && (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tx('Search crop or market…', 'फसल या मंडी खोजें…')}
                  className="glass w-full rounded-2xl border-primary/20 py-3.5 pl-12 pr-4 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
                />
              </div>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                aria-label={tx('State', 'राज्य')}
                className="glass min-h-11 rounded-2xl border-primary/20 px-4 py-3.5 text-foreground outline-none focus:border-primary/40"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop chips: a farmer sells one crop and wants its rate, not a
                thousand rows to scroll. */}
            <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCommodity('')}
                className={`min-h-11 flex-shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                  commodity === ''
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {tx('All crops', 'सभी फसलें')}
              </button>
              {COMMODITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCommodity(c)}
                  className={`min-h-11 flex-shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                    commodity === c
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c.replace(/\(.*\)/, '')}
                </button>
              ))}
            </div>

            {status === 'loading' && (
              <div className="glass flex items-center justify-center gap-3 rounded-2xl p-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">{tx('Loading rates…', 'भाव लोड हो रहे हैं…')}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="font-semibold text-foreground">
                  {tx('Could not load prices', 'भाव लोड नहीं हो सके')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tx(
                    'The government service may be busy, or the key may be rate limited. Try again shortly.',
                    'सरकारी सेवा व्यस्त हो सकती है, या कुंजी की सीमा पार हो गई है। थोड़ी देर बाद कोशिश करें।',
                  )}
                </p>
              </div>
            )}

            {(status === 'empty' || (status === 'ok' && filtered.length === 0)) && (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="font-semibold text-foreground">
                  {tx('No rates found', 'कोई भाव नहीं मिला')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tx('Try another state, or clear the search.', 'दूसरा राज्य चुनें, या खोज हटाएं।')}
                </p>
              </div>
            )}

            {status === 'ok' && filtered.length > 0 && (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {tx('{n} rates', '{n} भाव').replace('{n}', String(filtered.length))}
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p, i) => (
                    <article
                      key={`${p.market}-${p.commodity}-${p.variety}-${i}`}
                      className="rounded-2xl border border-border bg-card p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-foreground">{p.commodity}</h3>
                          <p className="truncate text-sm text-muted-foreground">
                            {p.market}
                            {p.district ? `, ${p.district}` : ''}
                          </p>
                        </div>
                        <TrendingUp className="h-5 w-5 flex-shrink-0 text-primary" />
                      </div>

                      <div className="mb-3 flex items-baseline gap-1.5">
                        <IndianRupee className="h-5 w-5 text-foreground" />
                        <span data-numeric className="text-2xl font-bold text-foreground">{p.modalPrice}</span>
                        <span className="text-sm text-muted-foreground">
                          {tx('/ quintal', '/ क्विंटल')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span data-numeric>
                          {tx('Range', 'सीमा')}: ₹{p.minPrice} – ₹{p.maxPrice}
                        </span>
                        {p.arrivalDate && <span>{p.arrivalDate}</span>}
                      </div>

                      {p.variety && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tx('Variety', 'किस्म')}: {p.variety}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
