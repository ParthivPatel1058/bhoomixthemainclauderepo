-- =============================================================
-- Support messages.
--
-- The Support page's form did nothing: handleSubmit showed "Message Sent!
-- We will get back to you soon" and dropped the text on the floor. Nobody
-- ever saw a message. The rest of that page was a template — a toll-free
-- number, an email at a different company, a WhatsApp number that belongs
-- to a stranger, an office at "123 Kisan Bhawan" — all invented.
--
-- This table makes the form a real channel: a signed-in user's message
-- lands here and the team reads it in the dashboard. Nothing else on the
-- page claims a channel that does not exist.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.support_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email       text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone       text CHECK (phone IS NULL OR char_length(phone) <= 20),
  subject     text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  message     text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_messages_status_idx
  ON public.support_messages (status, created_at DESC);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- A user may file a message as themselves, and see their own.
DROP POLICY IF EXISTS "Users send their own support messages" ON public.support_messages;
CREATE POLICY "Users send their own support messages" ON public.support_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users read their own support messages" ON public.support_messages;
CREATE POLICY "Users read their own support messages" ON public.support_messages
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admins triage everything.
DROP POLICY IF EXISTS "Admins manage support messages" ON public.support_messages;
CREATE POLICY "Admins manage support messages" ON public.support_messages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
