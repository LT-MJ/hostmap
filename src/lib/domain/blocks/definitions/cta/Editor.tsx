"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
        <Label>Heading (H2)</Label>
        <Input value={config.heading} onChange={(e) => onChange({ ...config, heading: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Subtext</Label>
        <Textarea value={config.subtext} onChange={(e) => onChange({ ...config, subtext: e.target.value })} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Button label</Label>
          <Input value={config.buttonLabel} onChange={(e) => onChange({ ...config, buttonLabel: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Button link</Label>
          <Input value={config.buttonHref} onChange={(e) => onChange({ ...config, buttonHref: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
