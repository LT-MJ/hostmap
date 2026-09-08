import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Server-only Supabase client for Server Components, Server Actions, and
 * Route Handlers. Always create a new one per request — never cache at
 * module scope, or one user's session leaks into another user's request
 * under Vercel's shared serverless instances.
 *
 * Uses the publishable key, same as the browser client — RLS is the
 * boundary, not which key was used. See docs/architecture/02-auth.md.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component during render, which can't set
            // cookies. Safe to ignore — proxy.ts refreshes the session on
            // every request, so an expired write here doesn't strand the user.
          }
        },
      },
    },
  );
}
