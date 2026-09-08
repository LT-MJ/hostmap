import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/supabase/guards";

export type NavigationItemRow = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string | null;
  page_id: string | null;
  position: number;
  open_in_new_tab: boolean;
};

export type NavigationTree = NavigationItemRow & { children: NavigationTree[] };

function buildTree(items: NavigationItemRow[]): NavigationTree[] {
  const byParent = new Map<string | null, NavigationItemRow[]>();
  for (const item of items) {
    const list = byParent.get(item.parent_id) ?? [];
    list.push(item);
    byParent.set(item.parent_id, list);
  }
  function attach(parentId: string | null): NavigationTree[] {
    return (byParent.get(parentId) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((item) => ({ ...item, children: attach(item.id) }));
  }
  return attach(null);
}

/** Public — relies on RLS (navigation is world-readable, see migration 0005). */
export async function getMenuTree(menuKey: "primary" | "footer"): Promise<NavigationTree[]> {
  const supabase = await createClient();
  const { data: menu } = await supabase.from("hostmap_navigation_menus").select("id").eq("key", menuKey).maybeSingle();
  if (!menu) return [];
  const { data: items, error } = await supabase
    .from("hostmap_navigation_items")
    .select("*")
    .eq("menu_id", menu.id);
  if (error) throw new Error(error.message);
  return buildTree((items ?? []) as NavigationItemRow[]);
}

export async function listMenuItemsForAdmin(menuKey: "primary" | "footer"): Promise<NavigationItemRow[]> {
  await requirePermission("navigation.manage");
  const supabase = await createClient();
  const { data: menu, error: menuError } = await supabase
    .from("hostmap_navigation_menus")
    .select("id")
    .eq("key", menuKey)
    .single();
  if (menuError) throw new Error(menuError.message);
  const { data, error } = await supabase.from("hostmap_navigation_items").select("*").eq("menu_id", menu.id).order("position");
  if (error) throw new Error(error.message);
  return (data ?? []) as NavigationItemRow[];
}

export async function upsertMenuItem(
  menuKey: "primary" | "footer",
  item: Partial<NavigationItemRow> & { label: string },
): Promise<void> {
  await requirePermission("navigation.manage");
  const supabase = await createClient();
  const { data: menu, error: menuError } = await supabase
    .from("hostmap_navigation_menus")
    .select("id")
    .eq("key", menuKey)
    .single();
  if (menuError) throw new Error(menuError.message);

  const { error } = await supabase.from("hostmap_navigation_items").upsert({ ...item, menu_id: menu.id });
  if (error) throw new Error(error.message);
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await requirePermission("navigation.manage");
  const supabase = await createClient();
  const { error } = await supabase.from("hostmap_navigation_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
}
