"use client";

import { Input } from "@/components/ui/input";
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category slug (optional)</Label>
          <Input
            value={config.categorySlug}
            onChange={(e) => onChange({ ...config, categorySlug: e.target.value })}
            placeholder="Leave blank for all categories"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Number of posts</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={config.limit}
            onChange={(e) => onChange({ ...config, limit: Number(e.target.value) || 3 })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Always shows the latest published posts at render time — not frozen when this page is
        published.
      </p>
    </div>
  );
}
