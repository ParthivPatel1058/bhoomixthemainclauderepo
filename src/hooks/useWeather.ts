import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  /** OpenWeatherMap-style icon code, kept so WeatherIcon needs no change. */
  conditionIcon: string;
  windSpeed: number;
  feelsLike: number;
}

/** One forecast hour, used by the spray and irrigation advisories. */
export interface ForecastHour {
  time: string;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipitationProbability: number;
  windMax: number;
  weatherCode: number;
}

/**
 * Weather from Open-Meteo.
 *
 * Replaces OpenWeatherMap, which needed a key that had stopped working: the
 * configured key returned 401 on every load and the app was silently falling
 * back to OpenWeatherMap's public sample key — shared with every tutorial on
 * the internet and revocable without notice. Open-Meteo needs no key at all,
 * so there is nothing to expire, leak, or rate-limit per account.
 */
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Placeholder figures for the rare case where Open-Meteo answers 200 but omits
 * a field. Not a location: the capsule only renders these once a real position
 * has been resolved, so the city here is never shown as somebody's whereabouts.
 */
export const WEATHER_FALLBACK: WeatherData = {
  city: "New Delhi",
  temperature: 28,
  humidity: 65,
  condition: "Partly Cloudy",
  conditionIcon: "02d",
  windSpeed: 12,
  feelsLike: 30,
};

/**
 * Last-resort location when neither the device nor a saved address answers.
 *
 * This is a labelled default, not a guess passed off as a fix: the capsule
 * marks it with an amber pin and offers to ask for real location, where the
 * old hardcoded Indore wore the green "live" dot and read as fact. That
 * distinction is the whole reason the previous bug went unnoticed.
 */
const DEFAULT_COORDS = { lat: 28.6139, lon: 77.209 };

/**
 * WMO weather codes (Open-Meteo) mapped to OpenWeatherMap icon prefixes, so the
 * existing WeatherIcon component keeps working unchanged. Exported so the
 * forecast strip uses this table too — it carried its own copy, which had
 * drifted (no snow-shower codes) and would have kept drifting.
 */
export function wmoToIcon(code: number): string {
  if (code === 0) return "01d";
  if (code <= 2) return "02d";
  if (code === 3) return "04d";
  if (code === 45 || code === 48) return "50d";
  if (code >= 51 && code <= 57) return "09d";
  if (code >= 61 && code <= 67) return "10d";
  if (code >= 71 && code <= 77) return "13d";
  if (code >= 80 && code <= 82) return "09d";
  if (code >= 85 && code <= 86) return "13d";
  if (code >= 95) return "11d";
  return "02d";
}

/** Human-readable label for a WMO code. */
export function conditionLabel(code: number | string, lang: string): string {
  const c = Number(code);
  const hi = lang === "hi";
  if (c === 0) return hi ? "साफ मौसम" : "Clear Sky";
  if (c <= 2) return hi ? "आंशिक बादल" : "Partly Cloudy";
  if (c === 3) return hi ? "बादल छाए" : "Overcast";
  if (c === 45 || c === 48) return hi ? "धुंध" : "Fog";
  if (c >= 51 && c <= 57) return hi ? "बूँदा बाँदी" : "Drizzle";
  if (c >= 61 && c <= 67) return hi ? "बारिश" : "Rain";
  if (c >= 71 && c <= 77) return hi ? "बर्फबारी" : "Snow";
  if (c >= 80 && c <= 82) return hi ? "तेज़ बारिश" : "Rain Showers";
  if (c >= 95) return hi ? "बिजली गरजना" : "Thunderstorm";
  return hi ? "आंशिक बादल" : "Partly Cloudy";
}

interface WeatherBundle {
  city: string;
  current: {
    temperature: number;
    humidity: number;
    apparent: number;
    wind: number;
    code: number;
  };
  hourly: ForecastHour[];
  daily: ForecastDay[];
  coords: { lat: number; lon: number };
  /** Live device fix, the address on file, or the labelled default city. */
  source: "address" | "gps" | "default";
}

/* -- Module-level cache so every consumer shares one network call -- */
let cached: WeatherBundle | null = null;
let inFlight: Promise<WeatherBundle | null> | null = null;
const subscribers = new Set<() => void>();

interface ResolvedLocation {
  /** Null when the device would not say and no address is saved. */
  coords: { lat: number; lon: number } | null;
  /** Place name from the saved address; skips the reverse-geocode when set. */
  cityHint: string | null;
  /** How the position was obtained. Null only if even the default failed. */
  source: "address" | "gps" | "default" | null;
}

/** Cleared when the saved address changes, so the next read re-resolves. */
let locationPromise: Promise<ResolvedLocation> | null = null;

/** Device GPS. Null when unsupported, denied, or timed out — never a guess. */
function gpsCoords(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 300_000 },
    );
  });
}

/**
 * Where to report weather for.
 *
 * The live device position wins. The capsule answers "what is the weather
 * where I am standing", so a farmer who has travelled to Delhi must not be
 * shown their saved village's weather as though it were current — that reads
 * as fact and feeds the spray and irrigation advisories.
 *
 * The saved address is the fallback, not the preference: it only applies when
 * the device will not say, which is the common case on a first visit where the
 * permission prompt gets dismissed. It is a real place the user told us about,
 * so it beats reporting nothing, but it never overrides an actual fix.
 *
 * The address is queried directly here rather than through useAddresses(),
 * which refetches per mount: useWeather has six consumers, so routing it
 * through that hook would fire six identical address queries on every page.
 */
async function resolveLocation(): Promise<ResolvedLocation> {
  const gps = await gpsCoords();
  if (gps) return { coords: gps, cityHint: null, source: "gps" };

  // Device declined or timed out — fall back to the address on file.
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("addresses")
        .select("city, state, pincode, lat, lng")
        .eq("user_id", session.user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        // Pinned from the device or picked from search — exact, use as-is.
        if (data.lat != null && data.lng != null) {
          return {
            coords: { lat: Number(data.lat), lon: Number(data.lng) },
            cityHint: data.city,
            source: "address",
          };
        }
        // Typed by hand with no pin: geocode what they wrote.
        const query = [data.city, data.state, data.pincode].filter(Boolean).join(", ");
        if (query) {
          const { data: geo } = await supabase.functions.invoke("geocode", {
            body: { mode: "search", query },
          });
          const hit = geo?.results?.[0];
          if (hit?.lat != null && hit?.lng != null) {
            return {
              coords: { lat: Number(hit.lat), lon: Number(hit.lng) },
              cityHint: data.city,
              source: "address",
            };
          }
        }
      }
    }
  } catch {
    /* Signed out, offline, or the lookup failed — fall through to default. */
  }
  return { coords: DEFAULT_COORDS, cityHint: null, source: "default" };
}

/**
 * Re-ask the device for a position, bypassing the cached resolution.
 *
 * Bound to the nav-bar capsule so a farmer who dismissed the permission prompt
 * can grant it later without reloading. If the browser has hard-denied the
 * origin it will not re-prompt, and the capsule keeps offering the address
 * route instead, which is the only remaining way to say where they are.
 */
export async function requestLocation(): Promise<boolean> {
  locationPromise = null;
  cached = null;
  const { source } = await (locationPromise = resolveLocation());
  subscribers.forEach((fn) => fn());
  return source !== null;
}

/**
 * Drop the resolved place and its weather so the next read starts over.
 * Called when a saved address is added, edited, removed, or made default.
 */
export function resetWeatherLocation() {
  cached = null;
  locationPromise = null;
  subscribers.forEach((fn) => fn());
}

/** Open-Meteo returns no place name, so resolve one separately. */
async function resolveCity(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `${GEOCODE_URL}?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    // Empty, never a stand-in city name: the coordinates are the user's real
    // position, so the reading is correct even when the name lookup fails.
    // The capsule labels an unnamed place rather than inventing one.
    if (!res.ok) return "";
    const data = await res.json();
    const a = data?.address ?? {};
    return a.city || a.town || a.village || a.county || a.state_district || "";
  } catch {
    return "";
  }
}

async function loadWeather(): Promise<WeatherBundle | null> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      locationPromise ??= resolveLocation();
      const { coords, cityHint, source } = await locationPromise;
      // Location unknown: report nothing rather than a plausible-looking
      // reading for a city the farmer is not standing in. The advisories are
      // built on this data, so a confident wrong number is the worst outcome.
      if (!coords) return null;

      const params = new URLSearchParams({
        latitude: String(coords.lat),
        longitude: String(coords.lon),
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        hourly: "temperature_2m,precipitation,precipitation_probability,wind_speed_10m,relative_humidity_2m",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
        forecast_days: "7",
        timezone: "auto",
      });

      const res = await fetch(`${FORECAST_URL}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();

      // The saved address already names the place; only fall back to the
      // reverse-geocode when weather came from a raw GPS fix.
      const city = cityHint ?? (await resolveCity(coords.lat, coords.lon));

      const hourly: ForecastHour[] = (d.hourly?.time ?? []).map((t: string, i: number) => ({
        time: t,
        temperature: d.hourly.temperature_2m?.[i] ?? 0,
        precipitation: d.hourly.precipitation?.[i] ?? 0,
        precipitationProbability: d.hourly.precipitation_probability?.[i] ?? 0,
        windSpeed: d.hourly.wind_speed_10m?.[i] ?? 0,
        humidity: d.hourly.relative_humidity_2m?.[i] ?? 0,
      }));

      const daily: ForecastDay[] = (d.daily?.time ?? []).map((t: string, i: number) => ({
        date: t,
        tempMax: d.daily.temperature_2m_max?.[i] ?? 0,
        tempMin: d.daily.temperature_2m_min?.[i] ?? 0,
        precipitation: d.daily.precipitation_sum?.[i] ?? 0,
        precipitationProbability: d.daily.precipitation_probability_max?.[i] ?? 0,
        windMax: d.daily.wind_speed_10m_max?.[i] ?? 0,
        weatherCode: d.daily.weather_code?.[i] ?? 2,
      }));

      cached = {
        city,
        current: {
          temperature: d.current?.temperature_2m ?? WEATHER_FALLBACK.temperature,
          humidity: d.current?.relative_humidity_2m ?? WEATHER_FALLBACK.humidity,
          apparent: d.current?.apparent_temperature ?? WEATHER_FALLBACK.feelsLike,
          wind: d.current?.wind_speed_10m ?? 12,
          code: d.current?.weather_code ?? 2,
        },
        hourly,
        daily,
        coords,
        // Non-null here: loadWeather returns early when coords is null, and
        // coords is only set on the two branches that name a source.
        source: source!,
      };

      subscribers.forEach((fn) => fn());
      return cached;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * Shared weather hook. The first mount triggers a single geolocation + API call;
 * the result is cached at module scope and reused by every other consumer, so
 * the top-bar capsule and any weather card never duplicate the request.
 */
export function useWeather() {
  const { language } = useLanguage();
  const [bundle, setBundle] = useState<WeatherBundle | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (!active) return;
      if (cached) return setBundle(cached);
      // resetWeatherLocation() cleared it: the address moved, so refetch for
      // the new place rather than leaving every consumer on the fallback.
      loadWeather().then(() => active && setBundle(cached));
    };
    subscribers.add(sync);
    loadWeather().then(() => {
      if (!active) return;
      setBundle(cached);
      setLoading(false);
    });
    return () => {
      active = false;
      subscribers.delete(sync);
    };
  }, []);

  const weather: WeatherData = bundle
    ? {
        city: bundle.city,
        temperature: Math.round(bundle.current.temperature),
        humidity: Math.round(bundle.current.humidity),
        condition: conditionLabel(bundle.current.code, language),
        conditionIcon: wmoToIcon(bundle.current.code),
        windSpeed: Math.round(bundle.current.wind),
        feelsLike: Math.round(bundle.current.apparent),
      }
    : WEATHER_FALLBACK;

  return {
    weather,
    loading,
    isLive: !!bundle,
    /**
     * False when neither a saved address nor the device could place the user.
     * The capsule must not render a temperature in that state — see the note
     * in loadWeather about confident wrong readings.
     */
    locationKnown: !!bundle,
    /**
     * "gps" is the live device fix; "address" means the device declined and
     * this is the address on file, which may be nowhere near where the user
     * currently is. The UI has to distinguish them — an unlabelled address
     * reading is the same silent lie the hardcoded city used to tell.
     */
    locationSource: bundle?.source ?? null,
    requestLocation,
    hourly: bundle?.hourly ?? [],
    daily: bundle?.daily ?? [],
    coords: bundle?.coords ?? null,
  };
}
