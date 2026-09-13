import { useFarmAdvisory, type AdvisoryLevel } from '@/hooks/useFarmAdvisory';
import { useLanguage } from '@/contexts/LanguageContext';
import { WeatherIcon } from '@/components/WeatherWidget';
import { conditionLabel, wmoToIcon } from '@/hooks/useWeather';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  CloudRain,
  Loader2,
  SprayCan,
} from 'lucide-react';

const STYLES: Record<AdvisoryLevel, { ring: string; chip: string; Icon: typeof Info }> = {
  danger: {
    ring: 'border-red-500/40 bg-red-500/[0.07]',
    chip: 'bg-red-500/15 text-red-500',
    Icon: AlertTriangle,
  },
  warn: {
    ring: 'border-amber-500/40 bg-amber-500/[0.07]',
    chip: 'bg-amber-500/15 text-amber-500',
    Icon: AlertTriangle,
  },
  ok: {
    ring: 'border-emerald-500/40 bg-emerald-500/[0.07]',
    chip: 'bg-emerald-500/15 text-emerald-500',
    Icon: CheckCircle2,
  },
  info: {
    ring: 'border-sky-500/40 bg-sky-500/[0.07]',
    chip: 'bg-sky-500/15 text-sky-500',
    Icon: Info,
  },
};

/**
 * Actionable weather advice: when to spray, when to irrigate, what extreme is
 * coming. Derived entirely from the free Open-Meteo forecast, so it costs
 * nothing per farmer and needs no field hardware.
 */
export default function FarmAdvisory() {
  const { tx, language } = useLanguage();
  const { advisories, daily, loading } = useFarmAdvisory();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-border bg-card p-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          {tx('Reading the forecast…', 'मौसम पढ़ा जा रहा है…')}
        </span>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <SprayCan className="h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {tx("Today's farm advice", 'आज की खेती सलाह')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tx('Based on the live forecast for your location', 'आपके स्थान के ताज़ा मौसम पर आधारित')}
          </p>
        </div>
      </div>

      {advisories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-muted-foreground">
            {tx(
              'Nothing urgent in the forecast. Conditions look steady.',
              'मौसम में कुछ ज़रूरी नहीं। स्थिति सामान्य है।',
            )}
          </p>
        </div>
      ) : (
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          {advisories.map((a) => {
            const s = STYLES[a.level];
            return (
              <article key={a.id} className={`rounded-2xl border bg-card p-5 ${s.ring}`}>
                <div className="mb-2 flex items-start gap-3">
                  <span className={`rounded-lg p-1.5 ${s.chip}`}>
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <h3 className="pt-1 font-bold text-foreground">{tx(a.title, a.titleHi)}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tx(a.detail, a.detailHi)}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {daily.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CloudRain className="h-4 w-4 text-primary" />
            {tx('Next 7 days', 'अगले 7 दिन')}
          </p>
          <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1">
            {daily.map((d) => (
              <div
                key={d.date}
                /* `relative` is load-bearing: the sr-only label below is
                   absolutely positioned, and an absolute element is only
                   clipped by an overflow ancestor that is its containing
                   block. Without a positioned tile the labels escaped the
                   scroller and stretched the page 279px sideways on a phone. */
                className="relative flex min-w-[5.5rem] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl bg-muted/60 p-3 sm:flex-1"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {/* Open-Meteo dates are plain "YYYY-MM-DD". `new Date()` on
                      that form parses as UTC midnight, and the weekday is then
                      rendered in local time — west of UTC every tile shifts
                      back a day. Parsing the parts pins it to the local day
                      the API actually meant. */}
                  {localDate(d.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : undefined, {
                    weekday: 'short',
                  })}
                </span>
                <WeatherIcon icon={wmoToIcon(d.weatherCode)} className="h-6 w-6" />
                <span className="text-sm font-bold text-foreground">{Math.round(d.tempMax)}°</span>
                <span className="text-xs text-muted-foreground">{Math.round(d.tempMin)}°</span>
                {/* Always rendered, so a dry day reads "0mm" instead of a gap
                    that made the row look truncated. Previously a 0.3mm day
                    passed a >0.2 gate and printed "0mm" while a 0.0mm day
                    printed nothing — two renderings of the same outcome.
                    The chance is the figure that decides whether to spray:
                    "1mm" alone hid that Thursday's rain was a 26% call. */}
                <span className="text-[11px] font-medium text-sky-500">
                  {formatRain(d.precipitation)}
                  {d.precipitationProbability > 0 && (
                    <span className="text-muted-foreground"> · {Math.round(d.precipitationProbability)}%</span>
                  )}
                </span>
                <span className="sr-only">{conditionLabel(d.weatherCode, language)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** "YYYY-MM-DD" as a local-time date, not the UTC midnight `new Date()` gives it. */
function localDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Whole millimetres, except that a trace is labelled as one rather than
 * rounded to "0mm" — a value the farmer would read as dry.
 */
function formatRain(mm: number): string {
  if (mm <= 0) return '0mm';
  if (mm < 0.5) return '<1mm';
  return `${Math.round(mm)}mm`;
}
