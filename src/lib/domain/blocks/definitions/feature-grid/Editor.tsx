"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RepeatingFieldList } from "@/components/admin/repeating-field-list";
import type { Config, FeatureItem } from "./Render";

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
      <RepeatingFieldList<FeatureItem>
        items={config.items}
        itemLabel="Feature"
        makeNewItem={() => ({ icon: "Sparkles", title: "", description: "" })}
        onChange={(items) => onChange({ ...config, items })}
        renderItem={(item, onItemChange) => (
          <div className="space-y-2">
            <Input
              value={item.icon}
              onChange={(e) => onItemChange({ ...item, icon: e.target.value })}
              placeholder="Icon name (e.g. Shield, Zap, Server) — see lucide.dev/icons"
            />
            <Input
              value={item.title}
              onChange={(e) => onItemChange({ ...item, title: e.target.value })}
              placeholder="Title"
            />
            <Textarea
              value={item.description}
              onChange={(e) => onItemChange({ ...item, description: e.target.value })}
              rows={2}
              placeholder="Description"
            />
          </div>
        )}
      />
    </div>
  );
}
