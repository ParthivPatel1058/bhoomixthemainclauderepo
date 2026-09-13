import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MandiPrice {
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

/**
 * Daily mandi prices from the Government of India's open data platform.
 *
 * Covers 3,000+ regulated markets and 200+ commodities, refreshed daily by the
 * Directorate of Marketing & Inspection.
 *
 * Everything goes through the `mandi-prices` edge function. There used to be a
 * direct browser call here as a fallback, reading `VITE_DATAGOV_API_KEY`, and
 * it was removed for two reasons: Vite inlines any `VITE_`-prefixed value into
 * the public bundle, and — worse — that path trusted the upstream
 * `filters[state]` parameter, which returns rows from other states. A farmer
 * being shown Andhra Pradesh's rate under a "Madhya Pradesh" heading is a
 * costlier failure than the page saying it cannot load.
 */
export type MandiStatus = 'loading' | 'ok' | 'no-key' | 'error' | 'empty';

interface Options {
  /** Restrict to one state, e.g. "Madhya Pradesh". */
  state?: string;
  commodity?: string;
  limit?: number;
}

/** The function answers 503 when its DATAGOV_API_KEY secret is missing. */
async function statusFromError(error: unknown): Promise<MandiStatus> {
  const context = (error as { context?: unknown })?.context as Response | undefined;
  return context?.status === 503 ? 'no-key' : 'error';
}

export function useMandiPrices({ state, commodity, limit = 30 }: Options = {}) {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [status, setStatus] = useState<MandiStatus>('loading');
  // The function caps a response at `limit` but reports the true match count
  // and the feed's publish date; the page needs both to say "100 of 752"
  // rather than "100 rates", and to date the figures.
  const [total, setTotal] = useState(0);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke<{
          prices?: MandiPrice[];
          total?: number;
          updated?: string | null;
        }>(
          'mandi-prices',
          { body: { state, commodity, limit } },
        );

        if (cancelled) return;

        if (error) {
          setStatus(await statusFromError(error));
          return;
        }

        const rows = Array.isArray(data?.prices) ? data.prices : null;
        if (!rows) {
          setStatus('error');
          return;
        }

        setPrices(rows);
        setTotal(typeof data?.total === 'number' ? data.total : rows.length);
        setUpdated(data?.updated ?? null);
        setStatus(rows.length ? 'ok' : 'empty');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state, commodity, limit]);

  return { prices, status, total, updated };
}
