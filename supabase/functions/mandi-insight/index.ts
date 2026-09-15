/**
 * Mandi price analytics and projection.
 *
 * Two jobs, because both need the same table and the same price parsing:
 *
 *   capture   append today's AGMARKNET snapshot to `mandi_price_history`.
 *             Meant to run once a day from a scheduler.
 *   analyse   today's cross-market comparison for one commodity, plus a
 *             projection when the stored history can actually support one.
 *
 * Why history is stored at all: the upstream feed is titled "Current Daily
 * Price" and serves exactly that. Verified 15 Sep 2026 — every row carries
 * today's date and an `arrival_date` filter for an earlier day is silently
 * ignored, returning today regardless. There is no series to query, so the
 * only honest route to a forecast is to accumulate one.
 *
 * On refusing to answer: a farmer decides when to sell on these numbers. A
 * projection drawn from three weeks of data and presented as a year-ahead
 * price is not a forecast, it is a guess with a chart around it. So the
 * horizon a caller may ask for is capped by how much history exists, and
 * below the floor this returns `insufficient_data` instead of a number.
 */

import { corsHeaders as buildCorsHeaders, rateLimited, tooManyRequests } from '../_shared/http.ts';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const DATAGOV_BASE = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const PAGE = 1000;
const MAX_PAGES = 20;

/** Fewer distinct days than this and no projection is offered at all. */
const MIN_DAYS_FOR_FORECAST = 21;

/** History needed before a full year of seasonality can be read from the data. */
const DAYS_FOR_SEASONAL = 365;

const RATE = { limit: 40, windowMs: 60_000 };

interface HistoryRow {
  arrival_date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  market: string;
  district: string;
}

/** "15/09/2026" -> "2026-09-15". Returns null on anything unexpected. */
function toIsoDate(ddmmyyyy: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((ddmmyyyy || '').trim());
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function num(value: unknown): number {
  const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/* ------------------------------------------------------------------ */
/* Projection                                                         */
/* ------------------------------------------------------------------ */

/**
 * How far ahead this much history can honestly speak.
 *
 * Extrapolating a year from a month of data is arithmetic, not forecasting.
 * The caps below are deliberately conservative: roughly a third of the
 * observed window, because beyond that the trend line is describing noise.
 */
function maxHorizonMonths(days: number): number {
  if (days < MIN_DAYS_FOR_FORECAST) return 0;
  if (days < 90) return 1;
  if (days < 180) return 3;
  if (days < DAYS_FOR_SEASONAL) return 6;
  return 12;
}

function confidenceLabel(days: number, horizonMonths: number): 'low' | 'moderate' | 'fair' {
  if (days >= DAYS_FOR_SEASONAL && horizonMonths <= 6) return 'fair';
  if (days >= 90 && horizonMonths <= 3) return 'moderate';
  return 'low';
}

/**
 * Least-squares line through the daily medians, projected forward.
 *
 * Deliberately a straight line rather than something more elaborate: with
 * weeks-to-months of daily data, a richer model fits the noise and reports a
 * confidence it has not earned. The uncertainty band is the honest part — it
 * is the residual spread widened by the square root of the horizon, which is
 * how a random walk's uncertainty actually grows.
 */
function project(series: Array<{ t: number; price: number }>, horizonDays: number) {
  const n = series.length;
  const meanT = series.reduce((s, p) => s + p.t, 0) / n;
  const meanY = series.reduce((s, p) => s + p.price, 0) / n;

  let covariance = 0;
  let variance = 0;
  for (const p of series) {
    covariance += (p.t - meanT) * (p.price - meanY);
    variance += (p.t - meanT) ** 2;
  }
  const slope = variance === 0 ? 0 : covariance / variance;
  const intercept = meanY - slope * meanT;

  const lastT = series[n - 1].t;
  const point = intercept + slope * (lastT + horizonDays);

  // Residual spread around the fitted line.
  let sse = 0;
  for (const p of series) sse += (p.price - (intercept + slope * p.t)) ** 2;
  const residualSd = Math.sqrt(sse / Math.max(1, n - 2));

  /* Uncertainty grows with distance from the data, not linearly with it.
     One residual standard deviation is roughly a 68% band; the 1.64 makes it
     about 90%, which is the honest width to show a farmer. */
  const growth = Math.sqrt(horizonDays / 30);
  const band = 1.64 * residualSd * Math.max(1, growth);

  return {
    point: Math.max(1, Math.round(point)),
    low: Math.max(1, Math.round(point - band)),
    high: Math.max(1, Math.round(point + band)),
    perDayChange: slope,
  };
}

/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (rateLimited(req, RATE)) return tooManyRequests(corsHeaders, 60);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    console.error('mandi-insight is not configured');
    return json({ error: 'Price history is not configured' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const rest = (path: string, init?: RequestInit) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

  /* ---------------------------------------------------------------- */
  /* capture                                                          */
  /* ---------------------------------------------------------------- */
  if (body.action === 'capture') {
    /* Writes to the table every client later reads, so it is not open. A
       shared secret rather than a user JWT because the caller is a scheduler,
       not a person. */
    const expected = Deno.env.get('MANDI_CAPTURE_SECRET');
    if (!expected || body.secret !== expected) {
      return json({ error: 'Not authorised' }, 401);
    }

    const apiKey = Deno.env.get('DATAGOV_API_KEY');
    if (!apiKey) return json({ error: 'DATAGOV_API_KEY is not set' }, 500);

    const rows: Record<string, unknown>[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        `${DATAGOV_BASE}?api-key=${apiKey}&format=json&limit=${PAGE}&offset=${page * PAGE}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      const records: Record<string, unknown>[] = data?.records ?? [];
      if (records.length === 0) break;

      for (const r of records) {
        const iso = toIsoDate(String(r.arrival_date ?? ''));
        const modal = num(r.modal_price);
        const min = num(r.min_price);
        const max = num(r.max_price);
        /* A zero means the mandi reported no trade that day. Keeping it would
           drag every average and every trend line toward zero. */
        if (!iso || modal <= 0 || min <= 0 || max <= 0 || min > max) continue;

        rows.push({
          state: String(r.state ?? '').trim(),
          district: String(r.district ?? '').trim(),
          market: String(r.market ?? '').trim(),
          commodity: String(r.commodity ?? '').trim(),
          variety: String(r.variety ?? '').trim(),
          grade: String(r.grade ?? '').trim(),
          arrival_date: iso,
          min_price: min,
          max_price: max,
          modal_price: modal,
        });
      }

      if (records.length < PAGE) break;
    }

    if (rows.length === 0) return json({ captured: 0, note: 'upstream returned nothing usable' });

    /* Chunked: one oversized statement is the difference between a capture
       that completes and one that times out mid-feed. */
    let stored = 0;
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      const res = await rest(
        'mandi_price_history?on_conflict=state,district,market,commodity,variety,grade,arrival_date',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(slice),
        },
      );
      if (res.ok) stored += slice.length;
      else {
        console.error(
          'mandi-insight capture chunk failed',
          res.status,
          (await res.text()).slice(0, 200),
        );
      }
    }

    return json({ captured: stored, scanned: rows.length });
  }

  /* ---------------------------------------------------------------- */
  /* analyse                                                          */
  /* ---------------------------------------------------------------- */
  const commodity = String(body.commodity ?? '').trim();
  const state = String(body.state ?? '').trim();
  const horizonMonths = Math.max(1, Math.min(12, Number(body.horizonMonths ?? 3) || 3));

  if (!commodity) return json({ error: 'commodity is required' }, 400);

  const filters = [
    `commodity=eq.${encodeURIComponent(commodity)}`,
    state ? `state=eq.${encodeURIComponent(state)}` : '',
    'select=arrival_date,modal_price,min_price,max_price,market,district',
    'order=arrival_date.asc',
    'limit=5000',
  ].filter(Boolean);

  const res = await rest(`mandi_price_history?${filters.join('&')}`);
  if (!res.ok) {
    console.error('mandi-insight history read failed', res.status);
    return json({ error: 'Could not read price history' }, 502);
  }
  const history: HistoryRow[] = await res.json();

  /* Today's spread across markets — true right now and useful with no history
     at all. Which mandi is paying most is often worth more to a farmer than
     any forecast. */
  const latestDate = history.length ? history[history.length - 1].arrival_date : null;
  const todayRows = history.filter((r) => r.arrival_date === latestDate);
  const byMarket = todayRows
    .map((r) => ({
      market: r.market,
      district: r.district,
      modal: r.modal_price,
      min: r.min_price,
      max: r.max_price,
    }))
    .sort((a, b) => b.modal - a.modal);

  /* One median per day: several markets quote the same day, and the median
     resists a single outlier mandi dragging the trend. */
  const byDate = new Map<string, number[]>();
  for (const r of history) {
    const list = byDate.get(r.arrival_date) ?? [];
    list.push(r.modal_price);
    byDate.set(r.arrival_date, list);
  }
  const daily = [...byDate.entries()]
    .map(([date, prices]) => {
      const sorted = prices.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
      return { date, price: median };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const days = daily.length;
  const allowed = maxHorizonMonths(days);

  const base = {
    commodity,
    state: state || null,
    latestDate,
    markets: byMarket.slice(0, 25),
    marketCount: byMarket.length,
    history: daily.slice(-180),
    daysOfHistory: days,
    maxHorizonMonths: allowed,
  };

  if (allowed === 0) {
    /* Deliberately not a number. Collection started when the first row landed,
       so the client can say how long the wait is rather than just refusing. */
    return json({
      ...base,
      forecast: null,
      reason: 'insufficient_data',
      needDays: MIN_DAYS_FOR_FORECAST,
      collectingSince: daily[0]?.date ?? null,
    });
  }

  const effectiveHorizon = Math.min(horizonMonths, allowed);
  const firstT = new Date(daily[0].date).getTime();
  const series = daily.map((d) => ({
    t: (new Date(d.date).getTime() - firstT) / 86_400_000,
    price: d.price,
  }));

  const horizonDays = Math.round(effectiveHorizon * 30.44);
  const projection = project(series, horizonDays);
  const current = daily[daily.length - 1].price;

  const target = new Date(daily[daily.length - 1].date);
  target.setMonth(target.getMonth() + effectiveHorizon);

  return json({
    ...base,
    forecast: {
      horizonMonths: effectiveHorizon,
      requestedHorizonMonths: horizonMonths,
      /* Says so plainly when the ask was longer than the data supports. */
      cappedFromRequest: effectiveHorizon < horizonMonths,
      targetDate: target.toISOString().slice(0, 10),
      current,
      point: projection.point,
      low: projection.low,
      high: projection.high,
      changePct: current > 0 ? ((projection.point - current) / current) * 100 : 0,
      confidence: confidenceLabel(days, effectiveHorizon),
      method: 'linear trend on daily median, 90% band widened by sqrt(horizon)',
    },
  });
});
