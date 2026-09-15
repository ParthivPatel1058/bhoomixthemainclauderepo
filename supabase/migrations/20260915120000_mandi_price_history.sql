-- Daily mandi price history.
--
-- The AGMARKNET feed this app reads (resource 9ef84268-…) is titled "Current
-- Daily Price" and lives up to it: verified 15 Sep 2026, every row carries
-- today's arrival_date, and an `arrival_date` filter for any earlier day is
-- silently ignored and returns today anyway. There is no series to query.
--
-- Forecasting needs one, so we keep our own. A daily job appends the snapshot
-- here; once enough days accumulate the projection endpoint has something real
-- to extrapolate from. Until then it reports insufficient data rather than
-- inventing a number a farmer might sell on.

create table if not exists public.mandi_price_history (
  id           bigserial primary key,

  -- Natural key of a quote. Variety and grade are part of it: the same
  -- commodity in one market can quote very differently by grade, and
  -- collapsing them would average away the signal.
  state        text        not null,
  district     text        not null,
  market       text        not null,
  commodity    text        not null,
  variety      text        not null default '',
  grade        text        not null default '',

  arrival_date date        not null,
  min_price    integer     not null,
  max_price    integer     not null,
  modal_price  integer     not null,

  captured_at  timestamptz not null default now(),

  -- Rupees per quintal. Zero or negative means the mandi reported no trade,
  -- and a zero silently averaged into a forecast drags it toward nonsense.
  constraint mandi_price_history_positive check (
    min_price > 0 and max_price > 0 and modal_price > 0
  ),
  constraint mandi_price_history_ordered check (min_price <= max_price)
);

-- One quote per commodity/market/day. Re-running the capture is then safe:
-- the upsert refreshes the row instead of stacking duplicates, which matters
-- because the feed is revised during the day.
create unique index if not exists mandi_price_history_unique
  on public.mandi_price_history (
    state, district, market, commodity, variety, grade, arrival_date
  );

-- The forecast query is "this commodity, this state, ordered by date", and the
-- series walk is the hot path.
create index if not exists mandi_price_history_series
  on public.mandi_price_history (commodity, state, arrival_date desc);

-- Used by the "where else can I sell this today" comparison.
create index if not exists mandi_price_history_daily
  on public.mandi_price_history (arrival_date desc, commodity);

alter table public.mandi_price_history enable row level security;

-- Public market rates published by a government feed. Readable by anyone,
-- including signed-out visitors, because the mandi price page is reachable
-- before sign-in.
drop policy if exists "mandi history is public" on public.mandi_price_history;
create policy "mandi history is public"
  on public.mandi_price_history
  for select
  using (true);

-- No insert/update/delete policy on purpose. Only the capture function writes
-- here, and it does so with the service role, which bypasses RLS. Leaving the
-- write side unpolicied means no client can forge a price — and a forged
-- history would poison every forecast built on it.

comment on table public.mandi_price_history is
  'Daily AGMARKNET snapshots, accumulated because the upstream API serves only the current day. Source of truth for price projections.';
