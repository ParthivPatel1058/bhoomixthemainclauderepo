/**
 * Address lookup for the delivery-address flow.
 *
 * Proxies OpenStreetMap's Nominatim rather than calling it from the browser:
 * their usage policy requires a User-Agent identifying the application, which
 * a browser will not let us set, and going through the function keeps the
 * per-second rate limit in one place.
 *
 * POST { mode: 'reverse', lat, lng }
 * POST { mode: 'search',  query }
 */

import { corsHeaders as buildCorsHeaders } from '../_shared/http.ts';

// Nominatim asks for a contactable UA. Anonymous traffic gets blocked.
const UA = 'BhoomiX/1.0 (https://bhoomix.vercel.app)';
const BASE = 'https://nominatim.openstreetmap.org';

interface Address {
  house: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  label: string;
}

/** The subset of Nominatim's `address` object this function actually reads. */
interface NominatimAddress {
  house_number?: string;
  building?: string;
  house_name?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  hamlet?: string;
  city?: string;
  town?: string;
  municipality?: string;
  city_district?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface NominatimResult {
  address?: NominatimAddress;
  lat?: string | number;
  lon?: string | number;
  display_name?: string;
  /** Present instead of the fields above when the coordinate resolves to nothing. */
  error?: string;
}

/** Flatten Nominatim's address parts into the fields our form actually has. */
function toAddress(item: NominatimResult): Address {
  const a = item.address ?? {};
  const house = [a.house_number, a.building, a.house_name].filter(Boolean).join(', ');
  const area = [a.road, a.neighbourhood, a.suburb, a.village, a.hamlet]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 2)
    .join(', ');

  return {
    house,
    area,
    city: a.city || a.town || a.municipality || a.city_district || a.county || '',
    state: a.state || '',
    pincode: a.postcode || '',
    lat: Number(item.lat),
    lng: Number(item.lon),
    label: item.display_name ?? '',
  };
}

/**
 * Fetches and parses one Nominatim response.
 *
 * Generic rather than `any`: the two call sites below want different shapes
 * back — one object for `/reverse`, an array for `/search` — and both already
 * narrow the untyped JSON with a runtime check before using it, so the type
 * parameter just names what each call site is asking for and expects to get.
 */
async function nominatim<T>(path: string): Promise<T | null> {
  const res = await fetch(BASE + path, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
  if (!res.ok) {
    console.error('Nominatim error', res.status, (await res.text()).slice(0, 300));
    return null;
  }
  return res.json() as Promise<T>;
}

Deno.serve(async (req) => {
  // Fresh per invocation — see create-staff-account/index.ts for why this is
  // not a module-level variable.
  const corsHeaders = buildCorsHeaders(req);
  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  try {
    if (body.mode === 'reverse') {
      const lat = Number(body.lat);
      const lng = Number(body.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return json({ error: 'Valid lat and lng are required' }, 400);
      }
      const data = await nominatim<NominatimResult>(
        `/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
      );
      if (!data || data.error) return json({ error: 'Could not find that location' }, 502);
      return json({ address: toAddress(data) });
    }

    if (body.mode === 'search') {
      const query = typeof body.query === 'string' ? body.query.trim() : '';
      if (query.length < 3) return json({ results: [] });
      if (query.length > 200) return json({ error: 'Query is too long' }, 400);

      // countrycodes=in — this is an India-only product, and unfiltered results
      // surface same-named towns on other continents above the local one.
      const data = await nominatim<NominatimResult[]>(
        `/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=in&limit=6`,
      );
      if (!Array.isArray(data)) return json({ error: 'Could not search right now' }, 502);
      return json({ results: data.map(toAddress) });
    }

    return json({ error: 'mode must be "reverse" or "search"' }, 400);
  } catch (e) {
    console.error('geocode failed', e);
    return json({ error: 'Could not look up that address' }, 500);
  }
});
