import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Secret-key client for the narrow set of operations that genuinely need
 * to bypass RLS or call Supabase's Admin API (`auth.admin.*`, which the
 * publishable-key client cannot do at all). Every caller of this function
 * must have already run `requirePermission()` first — this client itself
 * enforces nothing. See docs/architecture/02-auth.md#privilege-escalation
 * for why this is deliberately not the default client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
