-- =============================================================
-- Order integrity, role privacy
--
-- Two findings from the September 2026 security pass, both of which are
-- enforced here rather than in the client because the client is not a
-- security boundary — every one of these operations is reachable directly
-- from the anon key with a valid session.
--
-- 1. `orders` was updatable by its owner with no column restrictions.
--    RLS decides which *rows* you may touch, never which *columns*, so
--    "Users can update their own orders" let a signed-in customer rewrite
--    `total_amount`, flip `status` to 'delivered', or reassign the row.
--    Postgres has no column-level RLS, so a trigger does the job.
--
-- 2. `user_roles` was readable by everyone (`USING (true)`), so any signed-in
--    account could enumerate exactly who holds admin and manager. That is a
--    free target list for a phishing or credential-stuffing attempt.
--
-- Deliberately NOT changed: the shape of the tables, the existing policies
-- for partners and admins, or any application code path. Cancel-an-order,
-- partner accept, and partner status advance all still work — they are the
-- transitions the trigger explicitly permits.
-- =============================================================


-- ═══ 1. Orders: freeze the columns a customer must not set ═══

/**
 * Which columns each kind of actor may change on an existing order.
 *
 *   customer  status → 'cancelled' only, and only before dispatch
 *   partner   the delivery lifecycle on orders assigned to them
 *   staff     anything (admins and managers run support)
 *
 * `total_amount`, `user_id`, `order_number` and `items` are immutable for
 * everyone below staff: an order's money and ownership are settled when it is
 * placed, and a later edit is either a mistake or an attack.
 */
CREATE OR REPLACE FUNCTION public.enforce_order_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_staff       boolean;
  is_own_partner boolean;
BEGIN
  -- A service-role connection has no auth.uid(); edge functions and the
  -- dashboard must keep working, so they bypass these rules.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  is_staff := public.is_admin() OR public.is_manager();
  IF is_staff THEN
    RETURN NEW;
  END IF;

  -- Money and identity are immutable outside staff, whoever is asking.
  IF NEW.total_amount IS DISTINCT FROM OLD.total_amount THEN
    RAISE EXCEPTION 'order total cannot be changed' USING ERRCODE = '42501';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'order ownership cannot be changed' USING ERRCODE = '42501';
  END IF;
  IF NEW.order_number IS DISTINCT FROM OLD.order_number THEN
    RAISE EXCEPTION 'order number cannot be changed' USING ERRCODE = '42501';
  END IF;
  IF NEW.items IS DISTINCT FROM OLD.items THEN
    RAISE EXCEPTION 'order contents cannot be changed' USING ERRCODE = '42501';
  END IF;

  is_own_partner := EXISTS (
    SELECT 1 FROM public.partners p
    WHERE p.user_id = auth.uid()
      AND (OLD.assigned_partner = auth.uid() OR OLD.assigned_partner IS NULL)
  );

  IF is_own_partner THEN
    -- Partners drive the delivery lifecycle and nothing else.
    RETURN NEW;
  END IF;

  -- Remaining case: the customer who owns the row. The one transition they
  -- are entitled to is cancelling something that has not shipped.
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status <> 'cancelled' THEN
      RAISE EXCEPTION 'only staff can move an order to %', NEW.status
        USING ERRCODE = '42501';
    END IF;
    IF OLD.status IN ('out_for_delivery', 'delivered', 'cancelled') THEN
      RAISE EXCEPTION 'an order that is % cannot be cancelled', OLD.status
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NEW.assigned_partner IS DISTINCT FROM OLD.assigned_partner THEN
    RAISE EXCEPTION 'delivery assignment is not yours to change'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_update_rules ON public.orders;
CREATE TRIGGER orders_update_rules
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_update_rules();


-- ═══ 2. Orders: the stated total must match the stated lines ═══

/**
 * Rejects an order whose `total_amount` disagrees with its own `items`.
 *
 * This does NOT make the price trustworthy. The catalogue lives in the
 * front-end bundle (`src/data/agriProducts.ts`, `martProducts.ts`) and not in
 * `public.products`, so the database has nothing authoritative to compare a
 * unit price against — a caller who lies consistently, sending both a low
 * `price` on each line and a matching low total, still gets through.
 *
 * What it does remove is the trivial version of the attack: a cart of real
 * lines with the total rewritten to ₹1. Closing the rest requires the
 * catalogue to move into `public.products` and the total to be recomputed
 * here from that table; that is a schema change with real migration risk and
 * is written up rather than done blind.
 *
 * The tolerance is a *range*, not a fixed slack, because a real order is not
 * simply the sum of its lines: `CartDrawer.tsx` adds a flat delivery fee
 * (`DELIVERY_FEE`, currently ₹25) whenever the cart subtotal is under
 * `FREE_DELIVERY_OVER` (currently ₹500), and `orders` has no column of its
 * own to hold that fee separately. A first version of this check compared
 * the total to the item sum with only a ₹1 rounding allowance and would have
 * rejected every real order that carried a delivery fee — caught before this
 * migration shipped, by re-reading the checkout code it was meant to guard.
 * `MAX_DELIVERY_FEE` must stay in sync with `DELIVERY_FEE` on the client; if
 * that figure changes, raise it here too or legitimate orders start failing.
 */
CREATE OR REPLACE FUNCTION public.check_order_total_matches_items()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  computed numeric := 0;
  -- Mirrors CartDrawer.tsx's DELIVERY_FEE. A rupee of slack on each side
  -- absorbs client-side rounding; it is not the delivery-fee allowance.
  max_delivery_fee CONSTANT numeric := 25;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.total_amount IS NULL OR NEW.total_amount <= 0 THEN
    RAISE EXCEPTION 'order total must be a positive amount' USING ERRCODE = '22023';
  END IF;

  -- `items` is a JSON array of { price, quantity, ... }. A row that is not
  -- shaped that way is left alone: older orders predate the current shape and
  -- must stay readable.
  IF jsonb_typeof(NEW.items::jsonb) = 'array' THEN
    SELECT COALESCE(SUM(
             COALESCE((line ->> 'price')::numeric, 0)
             * COALESCE((line ->> 'quantity')::numeric, 0)
           ), 0)
      INTO computed
      FROM jsonb_array_elements(NEW.items::jsonb) AS line;

    -- Only enforce when the lines actually carry prices. Valid range:
    -- [items sum, items sum + delivery fee], each edge with a rupee of
    -- rounding slack.
    IF computed > 0
       AND (NEW.total_amount < computed - 1
            OR NEW.total_amount > computed + max_delivery_fee + 1)
    THEN
      RAISE EXCEPTION 'order total % does not match its line items (%, +fee up to %)',
        NEW.total_amount, computed, max_delivery_fee USING ERRCODE = '22023';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_total_matches_items ON public.orders;
CREATE TRIGGER orders_total_matches_items
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.check_order_total_matches_items();


-- ═══ 3. user_roles: stop broadcasting who the admins are ═══

DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

-- You may see your own roles. The app needs this: `my_role()` is SECURITY
-- DEFINER and unaffected, but the client also reads the table directly in
-- places, and a farmer seeing 'user' against their own id leaks nothing.
DROP POLICY IF EXISTS "Users read their own roles" ON public.user_roles;
CREATE POLICY "Users read their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_admin());


-- ═══ 4. profiles: pin the update to the row you own ═══

/**
 * The original policy carried `USING (auth.uid() = id)` and no `WITH CHECK`.
 * Postgres reuses USING as the check in that case, so this was not exploitable
 * — it is restated explicitly because relying on that implicit behaviour for a
 * table holding names and phone numbers is a footgun for the next editor.
 */
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
