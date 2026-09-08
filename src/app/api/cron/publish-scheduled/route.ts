import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Vercel Cron target (see vercel.json). Idempotent — see
 * publish_scheduled_content() in supabase/migrations/0008_scheduled_publish.sql
 * and docs/architecture/02-auth.md#privilege-escalation for why this is the
 * one route that legitimately uses the secret-key client: there is no user
 * session here to authorize against, only a shared secret proving the
 * caller is actually Vercel Cron.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("publish_scheduled_content");

  if (error) {
    console.error("publish_scheduled_content failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ published: data ?? [] });
}
