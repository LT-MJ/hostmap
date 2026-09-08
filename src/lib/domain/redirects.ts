import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/supabase/guards";

export type RedirectRow = {
  id: string;
  source_path: string;
  destination_path: string;
  status_code: 301 | 302;
  is_active: boolean;
  hit_count: number;
};

/** Checked only on an actual CMS-page cache miss (see app/(public)/[slug]/
 * page.tsx), not on every request — see docs/architecture ROADMAP for why
 * this isn't in proxy.ts. */
export async function findRedirect(path: string): Promise<RedirectRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("redirects").select("*").eq("source_path", path).eq("is_active", true).maybeSingle();
  if (data) {
    await supabase.rpc("increment_redirect_hit", { p_redirect_id: data.id });
  }
  return (data as RedirectRow | null) ?? null;
}

export async function recordNotFound(url: string, referrer: string | null): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("log_not_found", { p_url: url, p_referrer: referrer });
}

export async function listRedirectsForAdmin(): Promise<RedirectRow[]> {
  await requirePermission("seo.manage");
  const supabase = await createClient();
  const { data, error } = await supabase.from("redirects").select("*").order("hit_count", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RedirectRow[];
}

export class RedirectLoopError extends Error {}

export async function createRedirect(input: {
  sourcePath: string;
  destinationPath: string;
  statusCode?: 301 | 302;
}): Promise<void> {
  await requirePermission("seo.manage");
  if (input.sourcePath === input.destinationPath) {
    throw new RedirectLoopError("Source and destination cannot be the same path.");
  }
  const supabase = await createClient();
  // Cheap one-hop cycle guard: reject creating A->B when B->A already
  // exists. Longer chains are a rarer, lower-stakes edge case for Phase 1's
  // admin-curated redirect list (not user-generated at scale) — not worth
  // a recursive query here yet.
  const { data: reverse } = await supabase
    .from("redirects")
    .select("id")
    .eq("source_path", input.destinationPath)
    .eq("destination_path", input.sourcePath)
    .maybeSingle();
  if (reverse) {
    throw new RedirectLoopError(`${input.destinationPath} already redirects back to ${input.sourcePath}.`);
  }

  const { error } = await supabase.from("redirects").insert({
    source_path: input.sourcePath,
    destination_path: input.destinationPath,
    status_code: input.statusCode ?? 301,
  });
  if (error) throw new Error(error.message);
}

export type NotFoundLogRow = {
  id: string;
  url: string;
  referrer: string | null;
  hit_count: number;
  last_seen_at: string;
};

export async function listNotFoundLog(): Promise<NotFoundLogRow[]> {
  await requirePermission("seo.manage");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("not_found_log")
    .select("*")
    .order("hit_count", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as NotFoundLogRow[];
}

export async function dismissNotFoundEntry(id: string): Promise<void> {
  await requirePermission("seo.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("not_found_log").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRedirect(id: string): Promise<void> {
  await requirePermission("seo.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("redirects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
