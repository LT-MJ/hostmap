"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { RepeatingFieldList } from "@/components/admin/repeating-field-list";
import type { Config, Plan } from "./Render";

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
      <RepeatingFieldList<Plan>
        items={config.plans}
        itemLabel="Plan"
        makeNewItem={() => ({
          name: "",
          priceLabel: "$0",
          billingPeriodLabel: "/mo",
          features: [],
          ctaLabel: "Get started",
          ctaHref: "/pricing",
          highlighted: false,
        })}
        onChange={(plans) => onChange({ ...config, plans })}
        renderItem={(plan, onPlanChange) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input value={plan.name} onChange={(e) => onPlanChange({ ...plan, name: e.target.value })} placeholder="Plan name" />
              <Input value={plan.priceLabel} onChange={(e) => onPlanChange({ ...plan, priceLabel: e.target.value })} placeholder="$9.99" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={plan.highlighted}
                onChange={(e) => onPlanChange({ ...plan, highlighted: e.target.checked })}
              />
              Highlight as most popular
            </label>
            <div className="space-y-1">
              <Label className="text-xs">Features</Label>
              {plan.features.map((feature, fi) => (
                <div key={fi} className="flex gap-1">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const features = [...plan.features];
                      features[fi] = e.target.value;
                      onPlanChange({ ...plan, features });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlanChange({ ...plan, features: plan.features.filter((_, i) => i !== fi) })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPlanChange({ ...plan, features: [...plan.features, ""] })}
              >
                <Plus className="mr-1 size-3.5" /> Add feature
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={plan.ctaLabel} onChange={(e) => onPlanChange({ ...plan, ctaLabel: e.target.value })} placeholder="Button label" />
              <Input value={plan.ctaHref} onChange={(e) => onPlanChange({ ...plan, ctaHref: e.target.value })} placeholder="Button link" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
