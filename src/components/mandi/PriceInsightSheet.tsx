import { useCallback, useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Info, Loader2, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MarketRow {
  market: string;
  district: string;
  modal: number;
  min: number;
  max: number;
}

interface Forecast {
  horizonMonths: number;
  requestedHorizonMonths: number;
  cappedFromRequest: boolean;
  targetDate: string;
  current: number;
  point: number;
  low: number;
  high: number;
  changePct: number;
  confidence: 'low' | 'moderate' | 'fair';
  method: string;
}

interface Insight {
  commodity: string;
  latestDate: string | null;
  markets: MarketRow[];
  marketCount: number;
  history: Array<{ date: string; price: number }>;
  daysOfHistory: number;
  maxHorizonMonths: number;
  forecast: Forecast | null;
  reason?: string;
  needDays?: number;
  collectingSince?: string | null;
}

interface PriceInsightSheetProps {
  commodity: string | null;
  state?: string;
  /** The row the farmer tapped, so the panel opens with a price already shown. */
  currentPrice?: number;
  onClose: () => void;
}

const HORIZONS = [1, 3, 6, 12];

/** Rupees with Indian digit grouping. */
const rupees = (n: number) => '₹' + n.toLocaleString('en-IN');

/**
 * Price analytics for one commodity.
 *
 * Two halves, and the order is deliberate. Today's spread across markets comes
 * first because it is fact and immediately actionable — a farmer who learns
 * the next mandi is paying more per quintal has been told something worth
 * money. The projection comes second, because it is an estimate.
 *
 * The projection is allowed to be absent. The upstream feed publishes only the
 * current day, so history is something this app accumulates rather than
 * queries; until enough days exist, this says so instead of drawing a
 * confident line through three weeks of noise.
 */
const PriceInsightSheet = ({ commodity, state, currentPrice, onClose }: PriceInsightSheetProps) => {
  const { tx } = useLanguage();
  const [horizon, setHorizon] = useState(3);
  const [data, setData] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (months: number) => {
      if (!commodity) return;
      setLoading(true);
      setError(null);
      try {
        const { data: result, error: err } = await supabase.functions.invoke<Insight>(
          'mandi-insight',
          { body: { action: 'analyse', commodity, state, horizonMonths: months } },
        );
        if (err || !result) throw new Error('unavailable');
        setData(result);
      } catch {
        setError(
          tx('Could not load price analysis right now.', 'अभी मूल्य विश्लेषण लोड नहीं हो सका।'),
        );
      } finally {
        setLoading(false);
      }
    },
    [commodity, state, tx],
  );

  useEffect(() => {
    if (commodity) void load(horizon);
  }, [commodity, horizon, load]);

  // Escape closes, as with any dialog.
  useEffect(() => {
    if (!commodity) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commodity, onClose]);

  if (!commodity) return null;

  const forecast = data?.forecast ?? null;
  const rising = forecast ? forecast.changePct > 1 : false;
  const falling = forecast ? forecast.changePct < -1 : false;

  const confidenceCopy: Record<Forecast['confidence'], string> = {
    low: tx('Low confidence', 'कम भरोसा'),
    moderate: tx('Moderate confidence', 'मध्यम भरोसा'),
    fair: tx('Fair confidence', 'ठीक-ठाक भरोसा'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={tx('Close', 'बंद करें')}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={tx('Price analysis', 'मूल्य विश्लेषण')}
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border/60 bg-card shadow-2xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border/60 bg-card/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-foreground">{commodity}</h2>
            <p className="text-xs text-muted-foreground">
              {state ? state + ' · ' : ''}
              {data?.latestDate
                ? tx('Rates for ', 'दरें ') + data.latestDate
                : tx('Market analysis', 'बाज़ार विश्लेषण')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tx('Close', 'बंद करें')}
            className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {typeof currentPrice === 'number' && currentPrice > 0 && (
            <div className="rounded-2xl bg-foreground/[0.04] px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {tx('Rate you tapped', 'आपने जो दर चुनी')}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {rupees(currentPrice)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {tx('/quintal', '/क्विंटल')}
                </span>
              </p>
            </div>
          )}

          {/* ---------------- projection ---------------- */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {tx('Price outlook', 'मूल्य अनुमान')}
              </h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {tx('Horizon', 'अवधि')}
                <select
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className="rounded-lg border border-border/60 bg-background px-2 py-1 text-xs text-foreground"
                >
                  {HORIZONS.map((h) => (
                    <option key={h} value={h}>
                      {h === 12 ? tx('1 year', '1 वर्ष') : h + ' ' + tx('months', 'महीने')}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl bg-foreground/[0.04] px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {tx('Analysing market history…', 'बाज़ार इतिहास का विश्लेषण…')}
              </div>
            )}

            {!loading && error && (
              <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {error}
              </p>
            )}

            {/* Not enough history. Says what is missing and how far along it is,
                rather than showing a number it cannot stand behind. */}
            {!loading && !error && data && !forecast && (
              <div className="space-y-2 rounded-2xl border border-border/60 bg-foreground/[0.03] px-4 py-4">
                <p className="flex items-start gap-2 text-sm font-medium text-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {tx(
                    'Not enough history yet to project a price.',
                    'अभी मूल्य अनुमान के लिए पर्याप्त इतिहास नहीं है।',
                  )}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {tx(
                    'The government feed publishes only the current day, so we build the history ourselves — one snapshot a day.',
                    'सरकारी फ़ीड केवल आज का भाव देती है, इसलिए हम रोज़ एक स्नैपशॉट सहेजकर इतिहास बनाते हैं।',
                  )}
                </p>
                <p className="text-xs font-medium tabular-nums text-foreground">
                  {data.daysOfHistory} / {data.needDays ?? 21} {tx('days collected', 'दिन एकत्र')}
                </p>
              </div>
            )}

            {!loading && !error && forecast && (
              <div className="space-y-3 rounded-2xl border border-border/60 bg-foreground/[0.03] p-4">
                <div className="flex items-baseline gap-2">
                  {rising ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : falling ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    {rupees(forecast.point)}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      rising
                        ? 'text-emerald-600'
                        : falling
                          ? 'text-red-600'
                          : 'text-muted-foreground',
                    )}
                  >
                    {forecast.changePct >= 0 ? '+' : ''}
                    {forecast.changePct.toFixed(1)}%
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {tx('Likely range', 'संभावित दायरा')}{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {rupees(forecast.low)} – {rupees(forecast.high)}
                  </span>{' '}
                  {tx('by', 'तक')} {forecast.targetDate}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      forecast.confidence === 'fair'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : forecast.confidence === 'moderate'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-red-500/15 text-red-700 dark:text-red-300',
                    )}
                  >
                    {confidenceCopy[forecast.confidence]}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {tx('from', 'आधार')} {data?.daysOfHistory} {tx('days of data', 'दिन का डेटा')}
                  </span>
                </div>

                {/* The ask was longer than the data can carry. Better to say so
                    than to quietly answer a different question. */}
                {forecast.cappedFromRequest && (
                  <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                    {tx(
                      'Showing a ' +
                        forecast.horizonMonths +
                        '-month outlook — there is not enough history for ' +
                        forecast.requestedHorizonMonths +
                        ' months yet.',
                      forecast.horizonMonths +
                        ' महीने का अनुमान दिखाया गया है — ' +
                        forecast.requestedHorizonMonths +
                        ' महीने के लिए पर्याप्त इतिहास नहीं है।',
                    )}
                  </p>
                )}

                <p className="border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {tx(
                    'An estimate from past rates, not a guarantee. Mandi prices move with weather, arrivals and policy that no trend line can see. Use it alongside your own judgement, not instead of it.',
                    'यह पिछले भावों पर आधारित अनुमान है, गारंटी नहीं। मंडी भाव मौसम, आवक और नीति से बदलते हैं। अपने अनुभव के साथ ही इसका उपयोग करें।',
                  )}
                </p>
              </div>
            )}
          </section>

          {/* ---------------- today's spread ---------------- */}
          {!loading && data && data.markets.length > 0 && (
            <section>
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                {tx('Where it is selling highest today', 'आज सबसे ऊँचा भाव कहाँ')}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                {tx(
                  'Actual rates reported today across ' + data.marketCount + ' markets.',
                  'आज ' + data.marketCount + ' मंडियों के वास्तविक भाव।',
                )}
              </p>

              <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
                {data.markets.slice(0, 8).map((m, i) => {
                  const best = data.markets[0].modal;
                  const delta = m.modal - best;
                  return (
                    <li
                      key={m.market + m.district + i}
                      className="flex items-center justify-between gap-3 bg-card px-4 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{m.market}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {m.district}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">
                          {rupees(m.modal)}
                        </p>
                        {i > 0 && delta < 0 && (
                          <p className="text-[11px] tabular-nums text-red-600">
                            {rupees(delta)} {tx('vs best', 'सर्वोच्च से')}
                          </p>
                        )}
                        {i === 0 && (
                          <p className="text-[11px] font-semibold text-emerald-600">
                            {tx('Highest', 'सर्वोच्च')}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceInsightSheet;
