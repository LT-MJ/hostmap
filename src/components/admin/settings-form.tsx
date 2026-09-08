"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/use-autosave";
import { SaveStateIndicator } from "@/components/admin/save-state-indicator";
import { updateSiteSettingsAction } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/domain/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);

  const save = useCallback(async (next: SiteSettings) => {
    const result = await updateSiteSettingsAction(next);
    if (result.error) throw new Error(result.error);
  }, []);
  const saveState = useAutosave(settings, save);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-end">
        <SaveStateIndicator state={saveState} />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">General</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Site name</Label>
            <Input value={settings.site_name} onChange={(e) => update("site_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Default currency</Label>
            <Input value={settings.default_currency} onChange={(e) => update("default_currency", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Tagline</Label>
          <Textarea value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} rows={2} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Contact</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Contact email</Label>
            <Input
              value={settings.contact_email ?? ""}
              onChange={(e) => update("contact_email", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contact phone</Label>
            <Input
              value={settings.contact_phone ?? ""}
              onChange={(e) => update("contact_phone", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Textarea value={settings.address ?? ""} onChange={(e) => update("address", e.target.value)} rows={2} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">SEO defaults</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Title separator</Label>
            <Input
              value={settings.seo_title_separator}
              onChange={(e) => update("seo_title_separator", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default robots directive</Label>
            <Input value={settings.robots_default} onChange={(e) => update("robots_default", e.target.value)} />
          </div>
        </div>
      </section>
    </div>
  );
}
