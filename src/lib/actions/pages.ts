"use server";

import { revalidatePath } from "next/cache";
import {
  createPage,
  updatePageFields,
  savePageBlocks,
  publishPage,
  schedulePage,
  unpublishPage,
  deletePage,
  restorePage,
  restoreRevisionIntoDraft,
  PublishBlockedError,
  type PageRow,
} from "@/lib/domain/pages";
import type { EditableBlock } from "@/components/admin/page-builder";

export type ActionResult = { error: string | null };

export async function createPageAction(input: { title: string; slug: string }): Promise<PageRow> {
  const page = await createPage(input);
  revalidatePath("/admin/pages");
  return page;
}

export async function savePageFieldsAction(
  pageId: string,
  fields: Parameters<typeof updatePageFields>[1],
): Promise<void> {
  await updatePageFields(pageId, fields);
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function savePageBlocksAction(pageId: string, blocks: EditableBlock[]): Promise<void> {
  await savePageBlocks(
    pageId,
    blocks.map((b) => ({ position: b.position, block_type: b.block_type, config: b.config, is_hidden: b.is_hidden })),
  );
}

export async function publishPageAction(pageId: string): Promise<ActionResult> {
  try {
    await publishPage(pageId);
    revalidatePath(`/admin/pages/${pageId}`);
    revalidatePath("/", "layout");
    return { error: null };
  } catch (e) {
    if (e instanceof PublishBlockedError) {
      return { error: e.issues.filter((i) => i.blocking).map((i) => i.message).join(" ") };
    }
    return { error: e instanceof Error ? e.message : "Could not publish." };
  }
}

export async function schedulePageAction(pageId: string, scheduledAt: string): Promise<ActionResult> {
  try {
    await schedulePage(pageId, scheduledAt);
    revalidatePath(`/admin/pages/${pageId}`);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not schedule." };
  }
}

export async function unpublishPageAction(pageId: string): Promise<void> {
  await unpublishPage(pageId);
  revalidatePath(`/admin/pages/${pageId}`);
  revalidatePath("/", "layout");
}

export async function deletePageAction(pageId: string): Promise<void> {
  await deletePage(pageId);
  revalidatePath("/admin/pages");
}

export async function restorePageAction(pageId: string): Promise<void> {
  await restorePage(pageId);
  revalidatePath("/admin/pages");
}

export async function restoreRevisionAction(pageId: string, revisionId: string): Promise<void> {
  await restoreRevisionIntoDraft(pageId, revisionId);
  revalidatePath(`/admin/pages/${pageId}`);
}
