"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/media-picker";
import type { Config } from "./Render";

export default function Editor({
  config,
  onChange,
}: {
  config: Config;
  onChange: (config: Config) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Headline (H1)</Label>
        <Input
          value={config.headline}
          onChange={(e) => onChange({ ...config, headline: e.target.value })}
          placeholder="Reliable hosting, built for growth"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Subheadline</Label>
        <Textarea
          value={config.subheadline}
          onChange={(e) => onChange({ ...config, subheadline: e.target.value })}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Primary button label</Label>
          <Input
            value={config.primaryCtaLabel}
            onChange={(e) => onChange({ ...config, primaryCtaLabel: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Primary button link</Label>
          <Input
            value={config.primaryCtaHref}
            onChange={(e) => onChange({ ...config, primaryCtaHref: e.target.value })}
            placeholder="/pricing"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Secondary button label</Label>
          <Input
            value={config.secondaryCtaLabel}
            onChange={(e) => onChange({ ...config, secondaryCtaLabel: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Secondary button link</Label>
          <Input
            value={config.secondaryCtaHref}
            onChange={(e) => onChange({ ...config, secondaryCtaHref: e.target.value })}
          />
        </div>
      </div>
      <MediaPicker
        label="background image"
        value={config.background}
        onChange={(background) => onChange({ ...config, background })}
      />
    </div>
  );
}
