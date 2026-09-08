"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/media-picker";
import { RepeatingFieldList } from "@/components/admin/repeating-field-list";
import { emptyMediaRef } from "../../shared-schemas";
import type { Config, Testimonial } from "./Render";

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
      <RepeatingFieldList<Testimonial>
        items={config.items}
        itemLabel="Testimonial"
        makeNewItem={() => ({ quote: "", authorName: "", authorRole: "", avatar: emptyMediaRef })}
        onChange={(items) => onChange({ ...config, items })}
        renderItem={(item, onItemChange) => (
          <div className="space-y-2">
            <Textarea value={item.quote} onChange={(e) => onItemChange({ ...item, quote: e.target.value })} rows={3} placeholder="Quote" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={item.authorName} onChange={(e) => onItemChange({ ...item, authorName: e.target.value })} placeholder="Author name" />
              <Input value={item.authorRole} onChange={(e) => onItemChange({ ...item, authorRole: e.target.value })} placeholder="Role/company" />
            </div>
            <MediaPicker label="avatar" value={item.avatar} onChange={(avatar) => onItemChange({ ...item, avatar })} />
          </div>
        )}
      />
    </div>
  );
}
