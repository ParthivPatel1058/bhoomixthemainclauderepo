import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMandiPrices } from '@/hooks/useMandiPrices';
import { useAddresses } from '@/hooks/useAddresses';
import { IndianRupee, Search, KeyRound, Loader2, ExternalLink } from 'lucide-react';

/**
 * Every state the dataset reports. `value` is the feed's own spelling and is
 * what gets sent as the filter, so it has to match exactly — "Kerala" and
 * "Uttrakhand" were previously in this list and returned nothing, because
 * the feed spells them "Keralam" and "Uttarakhand". `label` is what a farmer
 * reads. Kept in step with FEED_STATES in supabase/functions/mandi-prices.
 */
const STATES: { value: string; label: string }[] = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Chattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Keralam', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'NCT of Delhi', label: 'Delhi' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Pondicherry', label: 'Puducherry' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
];

/**
 * Map a state as a saved address names it (Nominatim's spelling — "Delhi",
 * "Kerala", "Chhattisgarh") onto the feed's spelling. Null when it is not a
 * state the feed covers, so the caller can fall back rather than query for
 * something that will never match.
 */
function toFeedState(name: string | null | undefined): string | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  const hit = STATES.find((s) => s.value.toLowerCase() === n || s.label.toLowerCase() === n);
  return hit?.value ?? null;
}

/** Where to start when the farmer has not told us where they are. */
const DEFAULT_STATE = 'NCT of Delhi';

/**
 * The crops a farmer is most likely to be selling; the rest via search.
 * `value` is the feed's exact commodity string — the function matches it
 * exactly, so "Paddy(Dhan)(Common)" and "Gram" (the old values) matched
 * nothing and those two chips always read "No rates found".
 */
const COMMODITIES: { value: string; label: string; labelHi: string }[] = [
  { value: 'Wheat', label: 'Wheat', labelHi: 'गेहूं' },
  { value: 'Paddy(Common)', label: 'Paddy', labelHi: 'धान' },
  { value: 'Soyabean', label: 'Soyabean', labelHi: 'सोयाबीन' },
  { value: 'Maize', label: 'Maize', labelHi: 'मक्का' },
  { value: 'Cotton', label: 'Cotton', labelHi: 'कपास' },
  { value: 'Onion', label: 'Onion', labelHi: 'प्याज़' },
  { value: 'Potato', label: 'Potato', labelHi: 'आलू' },
  { value: 'Tomato', label: 'Tomato', labelHi: 'टमाटर' },
  { value: 'Bengal Gram(Gram)(Whole)', label: 'Gram', labelHi: 'चना' },
  { value: 'Mustard', label: 'Mustard', labelHi: 'सरसों' },
];

/**
 * Where to send a farmer whose state reported no crop rates today. Delhi is
 * the common case: its only mandi rows are the Gazipur fish market, so a
 * Delhi farmer sells in these instead.
 */
const NEARBY: Record<string, string[]> = {
  'NCT of Delhi': ['Haryana', 'Uttar Pradesh', 'Punjab'],
  Chandigarh: ['Punjab', 'Haryana'],
  Goa: ['Karnataka', 'Maharashtra'],
  Sikkim: ['West Bengal'],
  Pondicherry: ['Tamil Nadu'],
};

/** ₹ with Indian digit grouping: 12,50,000 not 1,250,000. */
const inr = (n: number) => n.toLocaleString('en-IN');

/**
 * Today's mandi rates, so a farmer walks into the market already knowing the
 * going price instead of taking whatever the first trader offers.
 */
export default function MandiPrices() {
  const { tx } = useLanguage();
  const { defaultAddress } = useAddresses();
  // Start on the farmer's own state. This was hardcoded to Madhya Pradesh,
  // so a farmer in Delhi opened the page to another state's rates — the same
  // silent wrong-place failure the weather capsule had.
  const [state, setState] = useState(() => toFeedState(defaultAddress?.state) ?? DEFAULT_STATE);
  const [stateTouched, setStateTouched] = useState(false);
  useEffect(() => {
    // The address loads after first render; follow it unless the farmer has
    // already picked a state by hand.
    if (stateTouched) return;
    const s = toFeedState(defaultAddress?.state);
    if (s) setState(s);
  }, [defaultAddress?.state, stateTouched]);
  const [commodity, setCommodity] = useState('');
  const [query, setQuery] = useState('');
  // Filtering by commodity server-side rather than client-side: the API caps a
  // response at `limit`, so narrowing here is what surfaces a farmer's crop in
  // a state that reports thousands of rows a day.
  const { prices, status, total, updated } = useMandiPrices({ state, commodity: commodity || undefined, limit: 100 });

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
                'Live prices come from the Government of India open data platform. The key is free and takes about two minutes — register, open My Account, and copy the key. It is then set once on the server, not in the app.',
                'भाव भारत सरकार के ओपन डेटा प्लेटफ़ॉर्म से आते हैं। कुंजी निःशुल्क है और लगभग दो मिनट लगते हैं — पंजीकरण करें, My Account खोलें, और कुंजी कॉपी करें। इसे सर्वर पर एक बार सेट किया जाता है, ऐप में नहीं।',
              )}
            </p>
            <pre className="mb-4 overflow-x-auto rounded-xl bg-black/[0.06] p-4 text-sm dark:bg-white/[0.06]">
              <code>supabase secrets set DATAGOV_API_KEY=your-key-here</code>
            </pre>
            <p className="mb-5 text-sm text-muted-foreground">
              {tx(
                'Run that once, then redeploy the mandi-prices function.',
                'इसे एक बार चलाएँ, फिर mandi-prices फ़ंक्शन दोबारा डिप्लॉय करें।',
              )}
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
                onChange={(e) => {
                  setStateTouched(true);
                  setState(e.target.value);
                }}
                aria-label={tx('State', 'राज्य')}
                className="glass min-h-11 rounded-2xl border-primary/20 px-4 py-3.5 text-foreground outline-none focus:border-primary/40"
              >
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {tx('All crops', 'सभी फसलें')}
              </button>
              {COMMODITIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCommodity(c.value)}
                  className={`min-h-11 flex-shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                    commodity === c.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tx(c.label, c.labelHi)}
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
                  {query
                    ? tx('Clear the search, or pick a crop to load more rates.', 'खोज हटाएं, या और भाव लाने के लिए फसल चुनें।')
                    : tx('No crop rates were reported from this state today.', 'आज इस राज्य से फसलों के भाव नहीं आए।')}
                </p>
                {!query && (NEARBY[state] ?? []).length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="self-center text-sm text-muted-foreground">{tx('Nearby:', 'पास में:')}</span>
                    {NEARBY[state].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setStateTouched(true); setState(s); }}
                        className="min-h-9 rounded-full border border-primary/40 px-3 text-sm font-semibold text-primary hover:bg-primary/10"
                      >
                        {STATES.find((x) => x.value === s)?.label ?? s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {status === 'ok' && filtered.length > 0 && (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {/* Say "100 of 752", not "100 rates": the function caps a
                      page at 100 and the old label passed that cap off as
                      the total. The search box only sees these 100, so the
                      farmer needs to know narrowing by crop is the way in. */}
                  {query
                    ? tx('{n} matching', '{n} मिले').replace('{n}', String(filtered.length))
                    : total > prices.length
                      ? tx('Showing {a} of {b} — pick a crop to narrow', '{b} में से {a} — फसल चुनकर छाँटें')
                          .replace('{a}', String(prices.length)).replace('{b}', String(total))
                      : tx('{n} rates', '{n} भाव').replace('{n}', String(prices.length))}
                  {updated && (
                    <span className="ml-2 text-xs opacity-70">
                      · {tx('Feed updated', 'फ़ीड अपडेट')} {new Date(updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
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
                      </div>

                      <div className="mb-3 flex items-baseline gap-1.5">
                        <IndianRupee className="h-5 w-5 text-foreground" />
                        <span data-numeric className="text-2xl font-bold text-foreground">{inr(p.modalPrice)}</span>
                        <span className="text-sm text-muted-foreground">
                          {tx('/ quintal', '/ क्विंटल')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {/* A quarter of rows quote one flat figure; "Range:
                            ₹2505 – ₹2505" read as a data error. */}
                        <span data-numeric>
                          {p.minPrice === p.maxPrice
                            ? tx('Single quote', 'एक ही भाव')
                            : `${tx('Range', 'सीमा')}: ₹${inr(p.minPrice)} – ₹${inr(p.maxPrice)}`}
                        </span>
                        {p.arrivalDate && <span>{p.arrivalDate}</span>}
                      </div>

                      {/* 60% of rows carry "Other" or just repeat the crop
                          name here; neither tells a farmer anything. */}
                      {p.variety && p.variety !== 'Other' && p.variety.toLowerCase() !== p.commodity.toLowerCase() && (
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
