/**
 * Mandi price proxy.
 *
 * Exists to keep the data.gov.in key server-side. A `VITE_`-prefixed key is
 * inlined into the JavaScript bundle at build time, so shipping it to the
 * browser publishes it to anyone who opens devtools — and the key is rate
 * limited per account, so an abuser silently breaks prices for every farmer.
 *
 * POST { state?, commodity?, district?, limit? }
 */

import { corsHeaders as buildCorsHeaders } from '../_shared/http.ts';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

/** Upstream publishes once a day, so an hour of staleness costs a farmer nothing. */
const TTL_MS = 60 * 60 * 1000;

/** Rows per upstream request. 1000 is the ceiling for a registered key. */
const PAGE = 1000;

/**
 * Ceiling on pages per state per refresh. The largest state (Tamil Nadu) runs
 * ~6,500 rows, so 20 pages is generous headroom; it exists only so a malformed
 * `total` cannot spin us through the whole daily quota in one request. It must
 * also stay at or below the platform's 10,000-row search window (10 × PAGE).
 */
const MAX_PAGES = 10;

interface Price {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

interface Snapshot {
  at: number;
  prices: Price[];
  updated: string | null;
}

/**
 * Where the snapshot lives.
 *
 * Not in a module-level variable — that was the first attempt and it never hit.
 * Supabase gives each request its own isolate at this traffic level, so a
 * module-level cache misses every single time and re-scans the whole feed:
 * measured 6 Sep 2026, five consecutive requests each reported `scanned: 7317`
 * with `cached: false`, ~40 upstream calls, and the fifth got the account rate
 * limited. Per-request cost has to be one database read, not eight API calls.
 *
 * The whole day's feed is one `jsonb` row, read in full and filtered in this
 * function. That transfers ~2 MB per request, which is fine at this scale and
 * inside the same datacentre; if traffic ever makes that the bottleneck, the
 * next step is a real row table with indexed columns and a `WHERE` clause.
 */
const CACHE_TABLE = 'mandi_cache';
const CACHE_ID = 'daily';

/** Guards against two concurrent requests in one isolate both scanning. */
let inFlight: Promise<Snapshot> | null = null;

interface DbConfig {
  url: string;
  key: string;
}

function dbConfig(): DbConfig | null {
  const url = Deno.env.get('SUPABASE_URL');
  // Both names are injected depending on project age.
  const key =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  return url && key ? { url, key } : null;
}

function dbHeaders(db: DbConfig) {
  return {
    apikey: db.key,
    Authorization: `Bearer ${db.key}`,
    'Content-Type': 'application/json',
  };
}

/** The stored snapshot, or null when absent or unreadable. */
async function readCache(db: DbConfig): Promise<Snapshot | null> {
  try {
    const res = await fetch(
      `${db.url}/rest/v1/${CACHE_TABLE}?id=eq.${CACHE_ID}&select=fetched_at,payload`,
      { headers: dbHeaders(db), signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) {
      console.error('cache read failed', res.status, (await res.text()).slice(0, 200));
      return null;
    }

    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.payload) return null;

    return {
      at: Date.parse(row.fetched_at),
      prices: row.payload.prices ?? [],
      updated: row.payload.updated ?? null,
    };
  } catch (e) {
    console.error('cache read threw', e);
    return null;
  }
}

/** Best-effort write. A failure here costs a re-scan next hour, not correctness. */
async function writeCache(db: DbConfig, snap: Snapshot): Promise<void> {
  try {
    const res = await fetch(`${db.url}/rest/v1/${CACHE_TABLE}`, {
      method: 'POST',
      headers: { ...dbHeaders(db), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: CACHE_ID,
        fetched_at: new Date(snap.at).toISOString(),
        payload: { prices: snap.prices, updated: snap.updated },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) console.error('cache write failed', res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error('cache write threw', e);
  }
}

/** Fold away the differences that are noise: case, padding, doubled spaces. */
function norm(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function toPrice(r: Record<string, string>): Price {
  return {
    state: r.state ?? '',
    district: r.district ?? '',
    market: r.market ?? '',
    commodity: r.commodity ?? '',
    variety: r.variety ?? '',
    arrivalDate: r.arrival_date ?? '',
    minPrice: Number(r.min_price) || 0,
    maxPrice: Number(r.max_price) || 0,
    modalPrice: Number(r.modal_price) || 0,
  };
}

/**
 * States exactly as the feed spells them. Sent as `filters[state]` and matched
 * back exactly, so a spelling here that the feed does not use returns nothing —
 * which is how "Kerala" (feed: "Keralam") and "Uttrakhand" (feed: "Uttarakhand")
 * were silently empty. Verified against the live resource on 12 Sep 2026.
 */
const FEED_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Keralam', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'NCT of Delhi', 'Odisha', 'Pondicherry',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

/** Gap between upstream calls. A burst of ~40 got the key throttled once. */
const CALL_GAP_MS = 150;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Pull the day's feed, one state at a time.
 *
 * It used to page the whole feed unfiltered. That silently lost data: the
 * platform's search index refuses `offset + limit > 10000`, and the feed
 * passed that size — 11,972 rows on 12 Sep 2026, so rows 10,001 onward were
 * unreachable. Which rows fall past the line depends on the feed's internal
 * order; Tamil Nadu alone was 6,429 of the first 10,000, and Madhya Pradesh —
 * the page's default — surfaced 258 of its 1,384. Filtering upstream keeps
 * every state far below the window, so nothing is cut.
 *
 * `filters[state]` was avoided before because on 6 Sep it returned other
 * states' rows. Re-verified on 12 Sep: bodies now match the filter exactly.
 * The match is token-based, though ("Delhi" also hits "NCT of Delhi"), so each
 * state's rows are still re-checked exactly before they are kept.
 */
async function fetchAll(key: string): Promise<Snapshot> {
  const rows: Price[] = [];
  let updated: string | null = null;

  for (const state of FEED_STATES) {
    const want = norm(state);
    let got = 0;
    let total = Infinity;

    for (let page = 0; page < MAX_PAGES && got < total; page++) {
      if (rows.length > 0 || page > 0) await sleep(CALL_GAP_MS);

      const params = new URLSearchParams({
        'api-key': key,
        format: 'json',
        limit: String(PAGE),
        offset: String(page * PAGE),
        'filters[state]': state,
      });

      const res = await fetch(`${BASE}?${params}`, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`data.gov.in HTTP ${res.status}`);

      const data = await res.json();
      // The platform answers 200 with an error body for a bad or throttled key,
      // so a successful status alone is not enough to trust the payload.
      if (data?.error) throw new Error(String(data.error).slice(0, 200));

      const records: Record<string, string>[] = data?.records ?? [];
      for (const r of records) {
        const price = toPrice(r);
        if (norm(price.state) === want) rows.push(price);
      }
      got += records.length;

      updated = data?.updated_date ?? updated;
      if (typeof data?.total === 'number') total = data.total;

      // A short page means this state is exhausted; asking again burns quota.
      if (records.length < PAGE) break;
    }
  }

  return { at: Date.now(), prices: rows, updated };
}

/**
 * The feed, from cache when it is fresh enough and from upstream when it is not.
 *
 * Returns the stale snapshot rather than throwing when a refresh fails, so one
 * bad hour upstream does not blank the page. Only a completely empty cache plus
 * a failed fetch is a real error.
 */
async function getSnapshot(key: string, db: DbConfig | null): Promise<Snapshot> {
  const cached = db ? await readCache(db) : null;
  if (cached && Date.now() - cached.at < TTL_MS) return cached;

  if (inFlight) return inFlight;

  inFlight = fetchAll(key)
    .then(async (fresh) => {
      if (db) await writeCache(db, fresh);
      return fresh;
    })
    .finally(() => {
      inFlight = null;
    });

  try {
    return await inFlight;
  } catch (e) {
    if (cached) {
      // Stale rates beat no rates: a farmer comparing an older mandi price is
      // still better informed than one staring at an error card.
      console.error('refresh failed, serving stale snapshot', e);
      return cached;
    }
    throw e;
  }
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

  const KEY = Deno.env.get('DATAGOV_API_KEY');
  if (!KEY) {
    console.error('DATAGOV_API_KEY is not set on this function');
    return json({ error: 'Price service is not configured' }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const state = typeof body.state === 'string' ? body.state.slice(0, 60) : '';
  const commodity = typeof body.commodity === 'string' ? body.commodity.slice(0, 60) : '';
  const district = typeof body.district === 'string' ? body.district.slice(0, 60) : '';
  // Clamp: an unbounded limit lets one caller pull the whole feed every request.
  const limit = Math.min(Math.max(Number(body.limit) || 100, 1), 500);

  const db = dbConfig();
  if (!db) console.error('No service-role credentials; every request will re-scan the feed');

  let feed: Snapshot;
  try {
    feed = await getSnapshot(KEY, db);
  } catch (e) {
    console.error('mandi-prices upstream failed with no cache to fall back on', e);
    return json({ error: 'Could not load prices right now' }, 502);
  }

  const wantState = norm(state);
  const wantCommodity = norm(commodity);
  const wantDistrict = norm(district);

  const matches = feed.prices.filter(
    (p) =>
      (!wantState || norm(p.state) === wantState) &&
      (!wantCommodity || norm(p.commodity) === wantCommodity) &&
      (!wantDistrict || norm(p.district) === wantDistrict),
  );

  return json({
    prices: matches.slice(0, limit),
    total: matches.length,
    updated: feed.updated,
    scanned: feed.prices.length,
    ageSeconds: Math.round((Date.now() - feed.at) / 1000),
  });
});
