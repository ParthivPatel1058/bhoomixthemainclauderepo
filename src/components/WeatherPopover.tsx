import { Navigation2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from './WeatherWidget';

/**
 * The weather panel that drops out of the top bar.
 *
 * Modelled on the macOS menu-bar weather widget: one soft-cornered card, a
 * headline temperature, an hourly strip, then a quieter list underneath. The
 * macOS version fills that list with other cities, which is the wrong content
 * here — a farmer deciding whether to spray tomorrow does not care what
 * London is doing. It carries the next four days instead, since that is the
 * question this app is actually being asked.
 *
 * Everything comes from the `useWeather` bundle that already feeds the
 * capsule, so opening the panel costs no extra request.
 */

/** Hour label in the viewer's locale, e.g. "10 AM". */
function hourLabel(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(lang === 'en' ? 'en-IN' : lang, {
    hour: 'numeric',
    hour12: true,
  });
}

/** Weekday label, with today named rather than numbered. */
function dayLabel(iso: string, lang: string, todayWord: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (d.toDateString() === new Date().toDateString()) return todayWord;
  return d.toLocaleDateString(lang === 'en' ? 'en-IN' : lang, { weekday: 'short' });
}

/** WMO code → the icon vocabulary WeatherIcon already speaks. */
function wmoToIcon(code: number): string {
  if (code === 0) return '01d';
  if (code <= 2) return '02d';
  if (code === 3) return '04d';
  if (code === 45 || code === 48) return '50d';
  if (code >= 51 && code <= 57) return '09d';
  if (code >= 61 && code <= 67) return '10d';
  if (code >= 71 && code <= 77) return '13d';
  if (code >= 80 && code <= 82) return '09d';
  if (code >= 85 && code <= 86) return '13d';
  if (code >= 95) return '11d';
  return '02d';
}

interface WeatherPopoverProps {
  children: React.ReactNode;
}

export default function WeatherPopover({ children }: WeatherPopoverProps) {
  const { language, tx } = useLanguage();
  const { weather, hourly, daily, isLive } = useWeather();

  // The API returns the whole day from midnight, so the first entries are
  // already in the past by mid-afternoon. Start from the current hour.
  const now = Date.now();
  const nextHours = hourly.filter((h) => new Date(h.time).getTime() >= now).slice(0, 5);
  const nextDays = daily.slice(0, 5);
  const today = daily[0];
  const rainSoon = nextHours.some((h) => h.precipitationProbability >= 50);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-[320px] overflow-hidden rounded-[26px] border border-white/[0.14] bg-[hsl(200_45%_16%_/_0.72)] p-0 text-white shadow-[0_1px_0_hsl(0_0%_100%_/_0.14)_inset,0_24px_60px_-18px_hsl(200_60%_4%_/_0.75)] backdrop-blur-2xl backdrop-saturate-150"
      >
        {/* A daylight wash over the ink so the card reads as sky rather than
            as one more dark panel — the thing that makes the macOS widget feel
            like weather instead of chrome. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-300/20 via-sky-400/[0.06] to-transparent"
        />

        <div className="relative p-4">
          {/* Place and current conditions */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[15px] font-semibold leading-tight">
                  {weather.city}
                </span>
                {isLive && <Navigation2 className="h-3 w-3 shrink-0 fill-white/80 text-white/80" />}
              </div>
              <div className="mt-0.5 text-[44px] font-light leading-none tracking-tight" data-numeric>
                {weather.temperature}°
              </div>
            </div>

            <div className="shrink-0 text-right">
              <WeatherIcon icon={weather.conditionIcon} className="ml-auto h-7 w-7" />
              <div className="mt-1 text-[11px] font-medium leading-tight text-white/85">
                {weather.condition}
              </div>
              {today && (
                <div className="text-[11px] leading-tight text-white/60" data-numeric>
                  H:{Math.round(today.tempMax)}° L:{Math.round(today.tempMin)}°
                </div>
              )}
            </div>
          </div>

          {/* The one line this gets opened for. Rain in the next five hours is
              what decides whether today is a spraying day, so it is stated
              rather than left to be inferred from five percentages. */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/[0.10] px-2.5 py-1.5 text-[11px] font-medium">
            <WeatherIcon icon={rainSoon ? '10d' : '01d'} className="h-3.5 w-3.5" />
            {rainSoon
              ? tx('Rain likely in the next few hours', 'अगले कुछ घंटों में बारिश संभव')
              : tx('Clear enough to spray', 'छिड़काव के लिए मौसम ठीक है')}
          </div>

          {/* Hourly strip */}
          {nextHours.length > 0 && (
            <div className="mt-3 flex items-stretch justify-between gap-1 rounded-2xl bg-white/[0.07] px-1 py-2.5">
              {nextHours.map((h) => (
                <div key={h.time} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-white/65">
                    {hourLabel(h.time, language)}
                  </span>
                  <WeatherIcon
                    icon={h.precipitationProbability >= 50 ? '10d' : '01d'}
                    className="h-4 w-4"
                  />
                  <span className="text-[12px] font-semibold" data-numeric>
                    {Math.round(h.temperature)}°
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Four-day outlook */}
        {nextDays.length > 1 && (
          <div className="relative border-t border-white/[0.12] px-4 py-1">
            {nextDays.slice(1).map((d) => (
              <div
                key={d.date}
                className="flex items-center justify-between border-b border-white/[0.07] py-2 last:border-0"
              >
                <span className="text-[12px] font-medium text-white/85">
                  {dayLabel(d.date, language, tx('Today', 'आज'))}
                </span>
                <div className="flex items-center gap-3">
                  <WeatherIcon icon={wmoToIcon(d.weatherCode)} className="h-4 w-4" />
                  <span className="w-16 text-right text-[12px] font-semibold" data-numeric>
                    {Math.round(d.tempMax)}° / {Math.round(d.tempMin)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative border-t border-white/[0.12] px-4 py-2 text-[10px] text-white/50">
          {isLive
            ? tx('Open-Meteo · live', 'ओपन-मेटियो · लाइव')
            : tx('Saved values — location unavailable', 'सहेजे गए मान — स्थान उपलब्ध नहीं')}
        </div>
      </PopoverContent>
    </Popover>
  );
}
