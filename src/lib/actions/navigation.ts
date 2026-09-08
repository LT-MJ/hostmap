"use server";

import { revalidatePath } from "next/cache";
import { upsertMenuItem, deleteMenuItem, type NavigationItemRow } from "@/lib/domain/navigation";

export async function saveMenuItemAction(
  menuKey: "primary" | "footer",
  item: Partial<NavigationItemRow> & { label: string },
): Promise<void> {
  await upsertMenuItem(menuKey, item);
  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}

export async function deleteMenuItemAction(itemId: string): Promise<void> {
  await deleteMenuItem(itemId);
  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}
