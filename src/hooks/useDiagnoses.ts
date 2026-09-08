import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Outcome = 'cured' | 'improved' | 'no_change' | 'worsened' | 'not_treated';

export interface Diagnosis {
  id: string;
  crop_name: string | null;
  disease_name: string | null;
  confidence: number | null;
  severity: string;
  treatment: string | null;
  is_healthy: boolean;
  outcome: Outcome | null;
  created_at: string;
}

/** Days to wait before asking whether the treatment worked. */
export const FOLLOW_UP_DAYS = 7;

/** Session flag so a missing table is probed once, not on every mount. */
const SCHEMA_ABSENT = 'bx_diagnoses_absent';

interface SaveInput {
  cropName?: string;
  diseaseName?: string;
  confidence?: number;
  severity?: string;
  treatment?: string[];
  isHealthy: boolean;
}

type Severity = 'none' | 'low' | 'medium' | 'high' | 'critical';

/**
 * App severity words to the database enum.
 *
 * `crop-vision`'s response schema constrains its own `severity` field to
 * exactly High/Medium/Low/None (see supabase/functions/crop-vision/index.ts),
 * so those four are the only inputs this ever actually receives — 'critical'
 * is a real value in the database enum but not one the model can produce, so
 * it is not mapped to here.
 *
 * Typed to return `Severity` rather than `string`: a `string` return was the
 * reason `save()`'s `.insert()` call failed to typecheck against the
 * (now-corrected) generated column type, since no width of `string` narrows
 * to a literal union on its own.
 */
function toSeverity(s?: string): Severity {
  const v = (s ?? '').toLowerCase();
  if (v === 'high') return 'high';
  if (v === 'medium') return 'medium';
  if (v === 'low') return 'low';
  return 'none';
}

/**
 * Persists crop diagnoses and drives the follow-up loop.
 *
 * The follow-up is the point. Any app can name a disease from a photo; the
 * scarce thing is knowing whether the treatment actually worked. A diagnosis
 * without an outcome is a guess nobody ever graded, so the whole reason to
 * store these rows is to come back a week later and ask.
 */
export function useDiagnoses() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Diagnosis[]>([]);
  const [history, setHistory] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || sessionStorage.getItem(SCHEMA_ABSENT) === '1') {
      setPending([]);
      setHistory([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('crop_diagnoses')
      .select('id, crop_name, disease_name, confidence, severity, treatment, is_healthy, outcome, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // 404 means the migration has not run on this project.
      if (error.code === 'PGRST205' || /does not exist/i.test(error.message)) {
        sessionStorage.setItem(SCHEMA_ABSENT, '1');
      }
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Diagnosis[];
    const cutoff = Date.now() - FOLLOW_UP_DAYS * 86400000;

    setHistory(rows);
    // Only unhealthy scans are worth following up: "your plant is fine" has
    // no treatment to grade.
    setPending(
      rows.filter(
        (r) => !r.is_healthy && r.outcome === null && new Date(r.created_at).getTime() <= cutoff,
      ),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  /** Store a scan. Never throws — a failed write must not lose the diagnosis. */
  const save = useCallback(
    async (input: SaveInput) => {
      if (!user || sessionStorage.getItem(SCHEMA_ABSENT) === '1') return null;

      const { data, error } = await supabase
        .from('crop_diagnoses')
        .insert({
          user_id: user.id,
          crop_name: input.cropName ?? null,
          disease_name: input.diseaseName ?? null,
          confidence: typeof input.confidence === 'number' ? input.confidence : null,
          severity: toSeverity(input.severity),
          treatment: input.treatment?.length ? input.treatment.join('\n') : null,
          is_healthy: input.isHealthy,
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === 'PGRST205' || /does not exist/i.test(error.message)) {
          sessionStorage.setItem(SCHEMA_ABSENT, '1');
        }
        return null;
      }
      refresh();
      return data?.id ?? null;
    },
    [user, refresh],
  );

  /** Record what actually happened. This is the row that has value. */
  const recordOutcome = useCallback(
    async (id: string, outcome: Outcome, notes?: string) => {
      const { error } = await supabase
        .from('crop_diagnoses')
        .update({ outcome, outcome_notes: notes ?? null, outcome_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) {
        setPending((p) => p.filter((d) => d.id !== id));
        refresh();
      }
      return !error;
    },
    [refresh],
  );

  const answered = history.filter((d) => d.outcome !== null).length;

  return { pending, history, loading, save, recordOutcome, answered, refresh };
}
