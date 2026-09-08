"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RepeatingFieldList } from "@/components/admin/repeating-field-list";
import type { Config, FaqItem } from "./Render";

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
      <RepeatingFieldList<FaqItem>
        items={config.items}
        itemLabel="Question"
        makeNewItem={() => ({ question: "", answer: "" })}
        onChange={(items) => onChange({ ...config, items })}
        renderItem={(item, onItemChange) => (
          <div className="space-y-2">
            <Input value={item.question} onChange={(e) => onItemChange({ ...item, question: e.target.value })} placeholder="Question" />
            <Textarea value={item.answer} onChange={(e) => onItemChange({ ...item, answer: e.target.value })} rows={2} placeholder="Answer" />
          </div>
        )}
      />
    </div>
  );
}
