/**
 * Creates manager and delivery-partner accounts.
 *
 * Creating an auth user needs the service-role key, which can never ship in
 * the browser bundle — hence a function. The important consequence is that
 * this endpoint holds the only credential in the system that can mint an
 * account, so it re-derives the caller's authority from the database and
 * ignores anything the client asserts about itself.
 *
 * Who may create what:
 *   admin   → manager, partner
 *   manager → partner only
 *   anyone else → nothing
 *
 * POST { role: 'manager'|'partner', email, password, fullName, phone?,
 *        region?, employeeCode?, vehicleType? }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders as buildCorsHeaders } from '../_shared/http.ts';

/** Who may create which roles. The only place this is decided. */
const MAY_CREATE: Record<string, string[]> = {
  admin: ['manager', 'partner'],
  manager: ['partner'],
};

function badPassword(pw: string): string | null {
  if (pw.length < 10) return 'Password must be at least 10 characters';
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) return 'Password needs an upper and a lower case letter';
  if (!/\d/.test(pw)) return 'Password needs a number';
  return null;
}

Deno.serve(async (req) => {
  // Declared fresh per invocation and closed over by `json()` below, rather
  // than held in a module-level variable: `Deno.serve` interleaves concurrent
  // requests on one isolate, awaits included, so a shared mutable binding
  // reassigned at the top of the handler can be overwritten by a second
  // request before the first one finishes and reads it back — one caller's
  // response headers leaking another caller's Origin.
  const corsHeaders = buildCorsHeaders(req);
  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Sign in first' }, 401);

  // Identify the caller from their own JWT, never from the request body.
  const asCaller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await asCaller.auth.getUser();
  if (userErr || !userData?.user) return json({ error: 'Sign in first' }, 401);
  const caller = userData.user;

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Authority comes from the roles table, read with the service role so a
  // restrictive policy can never make a caller look less privileged.
  const { data: roleRows, error: roleErr } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', caller.id);
  if (roleErr) {
    console.error('role lookup failed', roleErr);
    return json({ error: 'Could not verify your permissions' }, 500);
  }

  const roles = (roleRows ?? []).map((r: { role: string }) => r.role);
  const callerRole = roles.includes('admin') ? 'admin' : roles.includes('manager') ? 'manager' : 'user';
  const allowed = MAY_CREATE[callerRole] ?? [];
  if (allowed.length === 0) {
    return json({ error: 'Your account cannot create staff accounts' }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON in request body' }, 400);
  }

  const role = String(body.role ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const fullName = String(body.fullName ?? '').trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const region = body.region ? String(body.region).trim() : null;
  const employeeCode = body.employeeCode ? String(body.employeeCode).trim() : null;
  const vehicleType = body.vehicleType ? String(body.vehicleType).trim() : null;

  if (!allowed.includes(role)) {
    // A manager reaching for 'manager' or 'admin' lands here.
    return json({ error: `A ${callerRole} may only create: ${allowed.join(', ')}` }, 403);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Enter a valid email' }, 400);
  if (!fullName || fullName.length < 2) return json({ error: 'Full name is required' }, 400);
  const pwProblem = badPassword(password);
  if (pwProblem) return json({ error: pwProblem }, 400);

  // Create the auth user. email_confirm skips the verification mail: staff
  // accounts are handed over in person, not self-registered.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, staff_role: role },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Could not create the account';
    const dupe = /already|exists|registered/i.test(msg);
    return json({ error: dupe ? 'An account with that email already exists' : msg }, dupe ? 409 : 400);
  }

  const newUserId = created.user.id;

  /** Undo the auth user if a follow-up write fails, so no orphan can sign in. */
  async function rollback(reason: string, detail: unknown) {
    console.error('rolling back staff account:', reason, detail);
    await admin.auth.admin.deleteUser(newUserId).catch((e) => console.error('rollback failed', e));
  }

  const { error: roleInsertErr } = await admin
    .from('user_roles')
    .insert({ user_id: newUserId, role });
  if (roleInsertErr) {
    await rollback('role insert', roleInsertErr);
    return json({ error: 'Could not assign the role' }, 500);
  }

  if (role === 'partner') {
    const { error } = await admin.from('partners').insert({
      user_id: newUserId,
      full_name: fullName,
      phone_number: phone,
      vehicle_type: vehicleType,
      region,
      employee_code: employeeCode,
      created_by: caller.id,
      // Staff-created partners are vetted by the person creating them, so
      // unlike self-registration they start able to work immediately.
      is_active: true,
    });
    if (error) {
      await rollback('partner insert', error);
      return json({ error: 'Could not create the partner profile' }, 500);
    }
  } else {
    const { error } = await admin.from('managers').insert({
      user_id: newUserId,
      full_name: fullName,
      phone,
      region,
      employee_code: employeeCode,
      created_by: caller.id,
      is_active: true,
    });
    if (error) {
      await rollback('manager insert', error);
      return json({ error: 'Could not create the manager profile' }, 500);
    }
  }

  // Audit last: the account exists and is coherent by this point.
  await admin.from('staff_audit').insert({
    actor_id: caller.id,
    actor_role: callerRole,
    action: 'create',
    target_user_id: newUserId,
    target_role: role,
    target_email: email,
    details: { fullName, region, employeeCode, vehicleType },
  });

  return json({
    ok: true,
    user: { id: newUserId, email, role, fullName },
  }, 201);
});
