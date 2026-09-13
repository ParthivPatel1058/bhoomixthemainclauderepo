-- =============================================================
-- Analytics dashboard, read inside Supabase.
--
-- One schema of views the team opens in the Table Editor or SQL editor to
-- see how the product is used: who signs up, who comes back, what sells,
-- what the crop scanner finds, how much support arrives. Everything is
-- derived from tables that already exist — nothing here adds tracking.
--
-- Locked to the dashboard. The schema is revoked from `anon` and
-- `authenticated`, so no browser session can read it through PostgREST;
-- only the postgres role (the dashboard) and the service role can. That is
-- the same posture as `staff_roster`, and it is what lets these views read
-- `auth.users` and `auth.audit_log_entries` safely.
--
-- "Active" means the user's session touched Auth that day — a sign-in or a
-- token refresh — taken from auth.audit_log_entries. It is the closest
-- thing to "opened the app" that exists without adding client tracking.
-- =============================================================

CREATE SCHEMA IF NOT EXISTS analytics;

REVOKE ALL ON SCHEMA analytics FROM PUBLIC;
REVOKE ALL ON SCHEMA analytics FROM anon, authenticated;
GRANT USAGE ON SCHEMA analytics TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT SELECT ON TABLES TO postgres, service_role;

COMMENT ON SCHEMA analytics IS
  'Product usage views for the team. Dashboard-only: not exposed to the app.';


-- ─── Overview: one row of headline numbers ─────────────────────────────

CREATE OR REPLACE VIEW analytics.overview AS
WITH active AS (
  SELECT (payload->>'actor_id')::uuid AS user_id, created_at
  FROM auth.audit_log_entries
  WHERE payload->>'action' IN ('login', 'token_refreshed')
    AND created_at >= now() - interval '30 days'
)
SELECT
  (SELECT count(*) FROM auth.users)                                              AS total_users,
  (SELECT count(*) FROM auth.users WHERE created_at >= now() - interval '7 days')  AS new_users_7d,
  (SELECT count(*) FROM auth.users WHERE created_at >= now() - interval '30 days') AS new_users_30d,
  (SELECT count(DISTINCT user_id) FROM active WHERE created_at >= now() - interval '1 day')   AS active_users_24h,
  (SELECT count(DISTINCT user_id) FROM active WHERE created_at >= now() - interval '7 days')  AS active_users_7d,
  (SELECT count(DISTINCT user_id) FROM active)                                   AS active_users_30d,
  (SELECT count(*) FROM public.orders WHERE created_at >= now() - interval '7 days')  AS orders_7d,
  (SELECT count(*) FROM public.orders WHERE created_at >= now() - interval '30 days') AS orders_30d,
  (SELECT coalesce(sum(total_amount), 0) FROM public.orders
     WHERE created_at >= now() - interval '30 days' AND status <> 'cancelled')      AS revenue_30d_rupees,
  (SELECT count(*) FROM public.crop_diagnoses WHERE created_at >= now() - interval '30 days') AS diagnoses_30d,
  (SELECT count(*) FROM public.support_messages WHERE status = 'open')            AS support_open,
  now()                                                                          AS as_of;

COMMENT ON VIEW analytics.overview IS
  'Headline numbers. Active = signed in or refreshed a session in the window.';


-- ─── Users ─────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW analytics.daily_signups AS
SELECT
  date_trunc('day', created_at)::date AS day,
  count(*)                            AS signups,
  count(*) FILTER (WHERE raw_app_meta_data->>'provider' = 'google') AS via_google,
  count(*) FILTER (WHERE raw_app_meta_data->>'provider' = 'email')  AS via_email
FROM auth.users
WHERE created_at >= now() - interval '90 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW analytics.daily_signups IS 'New accounts per day, last 90 days, split by sign-up method.';

CREATE OR REPLACE VIEW analytics.daily_active_users AS
SELECT
  date_trunc('day', created_at)::date               AS day,
  count(DISTINCT (payload->>'actor_id'))            AS active_users,
  count(*) FILTER (WHERE payload->>'action' = 'login') AS sign_ins
FROM auth.audit_log_entries
WHERE payload->>'action' IN ('login', 'token_refreshed')
  AND created_at >= now() - interval '90 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW analytics.daily_active_users IS
  'Distinct users whose session touched Auth each day (sign-in or refresh), last 90 days.';

CREATE OR REPLACE VIEW analytics.users_by_role AS
SELECT r.role::text AS role, count(DISTINCT r.user_id) AS users
FROM public.user_roles r
GROUP BY 1
ORDER BY 2 DESC;

COMMENT ON VIEW analytics.users_by_role IS 'Accounts per role (user, partner, manager, admin).';

CREATE OR REPLACE VIEW analytics.signups_by_provider AS
SELECT
  coalesce(raw_app_meta_data->>'provider', 'unknown') AS provider,
  count(*)                                             AS users,
  round(100.0 * count(*) / nullif((SELECT count(*) FROM auth.users), 0), 1) AS percent
FROM auth.users
GROUP BY 1
ORDER BY 2 DESC;

COMMENT ON VIEW analytics.signups_by_provider IS 'How accounts were created: google, email, phone.';


-- ─── Orders and revenue ────────────────────────────────────────────────

CREATE OR REPLACE VIEW analytics.daily_orders AS
SELECT
  date_trunc('day', created_at)::date                               AS day,
  count(*)                                                          AS orders,
  count(*) FILTER (WHERE status = 'cancelled')                      AS cancelled,
  coalesce(sum(total_amount) FILTER (WHERE status <> 'cancelled'), 0) AS revenue_rupees,
  count(DISTINCT user_id)                                           AS buyers
FROM public.orders
WHERE created_at >= now() - interval '90 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW analytics.daily_orders IS 'Orders, cancellations, revenue (₹) and distinct buyers per day, last 90 days.';

CREATE OR REPLACE VIEW analytics.orders_by_status AS
SELECT status, count(*) AS orders, coalesce(sum(total_amount), 0) AS rupees
FROM public.orders
GROUP BY 1
ORDER BY 2 DESC;

COMMENT ON VIEW analytics.orders_by_status IS 'Current order pipeline by status.';

CREATE OR REPLACE VIEW analytics.top_products_30d AS
SELECT
  i.name,
  sum(i.quantity)                    AS units,
  round(sum(i.line_paise) / 100.0, 0) AS revenue_rupees,
  count(DISTINCT i.order_id)         AS orders
FROM public.order_items i
JOIN public.orders o ON o.id = i.order_id
WHERE o.created_at >= now() - interval '30 days'
  AND o.status <> 'cancelled'
GROUP BY 1
ORDER BY units DESC
LIMIT 50;

COMMENT ON VIEW analytics.top_products_30d IS 'Best-selling products by units in the last 30 days.';


-- ─── Crop scanner ──────────────────────────────────────────────────────

CREATE OR REPLACE VIEW analytics.daily_diagnoses AS
SELECT
  date_trunc('day', created_at)::date            AS day,
  count(*)                                       AS scans,
  count(*) FILTER (WHERE NOT is_healthy)         AS disease_found,
  count(DISTINCT user_id)                        AS farmers
FROM public.crop_diagnoses
WHERE created_at >= now() - interval '90 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW analytics.daily_diagnoses IS 'Crop photos scanned per day and how many found a disease, last 90 days.';

CREATE OR REPLACE VIEW analytics.top_diseases_30d AS
SELECT
  disease_name,
  count(*)                       AS cases,
  count(DISTINCT user_id)        AS farmers,
  round(avg(confidence)::numeric, 2) AS avg_confidence
FROM public.crop_diagnoses
WHERE created_at >= now() - interval '30 days'
  AND NOT is_healthy
  AND disease_name IS NOT NULL
GROUP BY 1
ORDER BY cases DESC
LIMIT 30;

COMMENT ON VIEW analytics.top_diseases_30d IS 'Most-detected crop diseases in the last 30 days.';


-- ─── Support ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW analytics.daily_support AS
SELECT
  date_trunc('day', created_at)::date       AS day,
  count(*)                                  AS messages,
  count(*) FILTER (WHERE status = 'open')   AS still_open
FROM public.support_messages
WHERE created_at >= now() - interval '90 days'
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW analytics.daily_support IS 'Support messages received per day and how many remain open, last 90 days.';


-- Explicit grants for the views created above (default privileges only
-- apply to objects created after they were set, within this session they do,
-- but being explicit costs nothing and survives a re-run).
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO postgres, service_role;
REVOKE ALL ON ALL TABLES IN SCHEMA analytics FROM anon, authenticated;
