import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/supabase/guards";

export type DashboardStats = {
  pagesByStatus: Record<string, number>;
  postsByStatus: Record<string, number>;
  mediaCount: number;
  staffCount: number;
  recentActivity: Array<{ id: string; action: string; entity_type: string; actor_email: string | null; created_at: string }>;
};

function countByStatus(rows: Array<{ status: string }> | null): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows ?? []) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

/** Every number here comes from a real query — no invented placeholder
 * statistics (§36/§48). Commerce widgets (revenue/orders) don't appear at
 * all since those tables don't exist yet — an empty/fake widget would be
 * worse than no widget. */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Any authenticated staff member sees the dashboard — it's the landing
  // page, not a gated report, so this checks authentication only. Its
  // per-table RLS policies (pages.view/blog.view/etc. via has_permission)
  // still independently govern what each query actually returns.
  await requireStaffSession();
  const supabase = await createClient();

  const [{ data: pages }, { data: posts }, { count: mediaCount }, { count: staffCount }, { data: activity }] =
    await Promise.all([
      supabase.from("pages").select("status").is("deleted_at", null),
      supabase.from("blog_posts").select("status").is("deleted_at", null),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("user_type", "staff"),
      supabase
        .from("audit_logs")
        .select("id, action, entity_type, actor_email, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  return {
    pagesByStatus: countByStatus(pages),
    postsByStatus: countByStatus(posts),
    mediaCount: mediaCount ?? 0,
    staffCount: staffCount ?? 0,
    recentActivity: activity ?? [],
  };
}
