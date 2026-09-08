import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/supabase/guards";

export type SiteSettings = {
  site_name: string;
  tagline: string;
  default_currency: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  logo_media_id: string | null;
  logo_dark_media_id: string | null;
  favicon_media_id: string | null;
  seo_title_separator: string;
  robots_default: string;
};

export type ThemeSettings = {
  tokens: Record<string, unknown>;
  dark_mode_enabled: boolean;
};

/** Public — world-readable, see migration 0003. Falls back to sane
 * defaults rather than throwing if the singleton row hasn't been seeded
 * yet (e.g. a fresh database before the seed script runs). */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    (data as SiteSettings | null) ?? {
      site_name: "",
      tagline: "",
      default_currency: "USD",
      contact_email: null,
      contact_phone: null,
      address: null,
      logo_media_id: null,
      logo_dark_media_id: null,
      favicon_media_id: null,
      seo_title_separator: "|",
      robots_default: "index, follow",
    }
  );
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("theme_settings").select("*").eq("id", 1).maybeSingle();
  return (data as ThemeSettings | null) ?? { tokens: {}, dark_mode_enabled: true };
}

export async function updateSiteSettings(fields: Partial<SiteSettings>): Promise<void> {
  await requirePermission("settings.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...fields });
  if (error) throw new Error(error.message);
}
