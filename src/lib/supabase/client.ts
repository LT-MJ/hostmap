import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-only Supabase client. Uses the publishable key — safe to expose,
 * every query it makes is bound by RLS. Only import this from Client
 * Components that need live/interactive Supabase access (e.g. an autosave
 * hook); most of the app should use the Server Component/Server Action
 * client in `./server.ts` instead.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
