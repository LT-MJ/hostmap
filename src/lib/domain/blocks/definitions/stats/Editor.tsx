"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RepeatingFieldList } from "@/components/admin/repeating-field-list";
import type { Config, StatItem } from "./Render";

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
        <Label>Heading (H2, optional)</Label>
        <Input value={config.heading} onChange={(e) => onChange({ ...config, heading: e.target.value })} />
      </div>
      <RepeatingFieldList<StatItem>
        items={config.items}
        itemLabel="Stat"
        makeNewItem={() => ({ value: "", label: "" })}
        onChange={(items) => onChange({ ...config, items })}
        renderItem={(item, onItemChange) => (
          <div className="grid grid-cols-2 gap-2">
            <Input value={item.value} onChange={(e) => onItemChange({ ...item, value: e.target.value })} placeholder="99.9%" />
            <Input value={item.label} onChange={(e) => onItemChange({ ...item, label: e.target.value })} placeholder="Uptime SLA" />
          </div>
        )}
      />
    </div>
  );
}
