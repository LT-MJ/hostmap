"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { NavigationItemRow } from "@/lib/domain/navigation";
import { saveMenuItemAction, deleteMenuItemAction } from "@/lib/actions/navigation";

export function MenuEditor({
  menuKey,
  initialItems,
}: {
  menuKey: "primary" | "footer";
  initialItems: NavigationItemRow[];
}) {
  const [items, setItems] = useState(
    [...initialItems].sort((a, b) => a.position - b.position),
  );
  const [isPending, startTransition] = useTransition();

  function persist(item: NavigationItemRow) {
    startTransition(() => saveMenuItemAction(menuKey, item));
  }

  function addItem() {
    const newItem: NavigationItemRow = {
      id: crypto.randomUUID(),
      menu_id: "",
      parent_id: null,
      label: "New link",
      url: "/",
      page_id: null,
      position: items.length,
      open_in_new_tab: false,
    };
    setItems([...items, newItem]);
    persist(newItem);
  }

  function updateItem(id: string, patch: Partial<NavigationItemRow>) {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item));
      const updated = next.find((item) => item.id === id);
      if (updated) persist(updated);
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    startTransition(() => deleteMenuItemAction(id));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      const renumbered = next.map((item, i) => ({ ...item, position: i }));
      renumbered.forEach((item, i) => {
        if (item.position !== prev[i]?.position) persist(item);
      });
      return renumbered;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card key={item.id} className="flex flex-wrap items-center gap-2 p-3">
          <Input
            value={item.label}
            onChange={(e) => updateItem(item.id, { label: e.target.value })}
            placeholder="Label"
            className="w-40"
          />
          <Input
            value={item.url ?? ""}
            onChange={(e) => updateItem(item.id, { url: e.target.value })}
            placeholder="/path"
            className="w-48"
          />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={item.open_in_new_tab}
              onChange={(e) => updateItem(item.id, { open_in_new_tab: e.target.checked })}
            />
            New tab
          </label>
          <div className="ml-auto flex gap-1">
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, -1)}>
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(item.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={addItem} disabled={isPending}>
        <Plus className="mr-1.5 size-4" /> Add link
      </Button>
    </div>
  );
}
