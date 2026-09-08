"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Shared add/reorder/remove UI for a block's array-of-items config (Feature
 * Grid, Testimonials, FAQ, Stats, Pricing Table) — one implementation
 * instead of five near-identical ones. Reordering swaps array positions
 * directly (no drag-and-drop library) rather than pulling in a dependency
 * for a five-item list; the page-level block list (many more items, higher
 * reorder frequency) is where a real drag-and-drop interaction pays for
 * itself — see the page builder's block list, not here.
 */
export function RepeatingFieldList<T>({
  items,
  onChange,
  makeNewItem,
  renderItem,
  itemLabel = "Item",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeNewItem: () => T;
  renderItem: (item: T, onItemChange: (item: T) => void, index: number) => React.ReactNode;
  itemLabel?: string;
}) {
  function update(index: number, item: T) {
    const next = [...items];
    next[index] = item;
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card key={index} className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <GripVertical className="size-3.5" />
              {itemLabel} {index + 1}
            </span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
              >
                ↓
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          {renderItem(item, (updated) => update(index, updated), index)}
        </Card>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, makeNewItem()])}>
        <Plus className="mr-1 size-3.5" /> Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}
