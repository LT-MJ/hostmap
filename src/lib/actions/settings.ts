"use server";

import { revalidatePath } from "next/cache";
import { updateSiteSettings, type SiteSettings } from "@/lib/domain/settings";

export async function updateSiteSettingsAction(fields: Partial<SiteSettings>): Promise<{ error: string | null }> {
  try {
    await updateSiteSettings(fields);
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save settings." };
  }
}
