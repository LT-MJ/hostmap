"use server";

import { revalidatePath } from "next/cache";
import {
  createPost,
  updatePostFields,
  savePostBlocks,
  publishPost,
  schedulePost,
  unpublishPost,
  deletePost,
  restoreRevisionIntoDraft,
  PublishBlockedError,
  type BlogPostRow,
} from "@/lib/domain/blog";
import type { EditableBlock } from "@/components/admin/page-builder";

export type ActionResult = { error: string | null };

export async function createPostAction(input: { title: string; slug: string }): Promise<BlogPostRow> {
  const post = await createPost(input);
  revalidatePath("/admin/blog");
  return post;
}

export async function savePostFieldsAction(
  postId: string,
  fields: Parameters<typeof updatePostFields>[1],
): Promise<void> {
  await updatePostFields(postId, fields);
  revalidatePath(`/admin/blog/${postId}`);
}

export async function savePostBlocksAction(postId: string, blocks: EditableBlock[]): Promise<void> {
  await savePostBlocks(
    postId,
    blocks.map((b) => ({ position: b.position, block_type: b.block_type, config: b.config, is_hidden: b.is_hidden })),
  );
}

export async function publishPostAction(postId: string): Promise<ActionResult> {
  try {
    await publishPost(postId);
    revalidatePath(`/admin/blog/${postId}`);
    revalidatePath("/blog");
    return { error: null };
  } catch (e) {
    if (e instanceof PublishBlockedError) {
      return { error: e.issues.filter((i) => i.blocking).map((i) => i.message).join(" ") };
    }
    return { error: e instanceof Error ? e.message : "Could not publish." };
  }
}

export async function schedulePostAction(postId: string, scheduledAt: string): Promise<ActionResult> {
  try {
    await schedulePost(postId, scheduledAt);
    revalidatePath(`/admin/blog/${postId}`);
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not schedule." };
  }
}

export async function unpublishPostAction(postId: string): Promise<void> {
  await unpublishPost(postId);
  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/blog");
}

export async function deletePostAction(postId: string): Promise<void> {
  await deletePost(postId);
  revalidatePath("/admin/blog");
}

export async function restorePostRevisionAction(postId: string, revisionId: string): Promise<void> {
  await restoreRevisionIntoDraft(postId, revisionId);
  revalidatePath(`/admin/blog/${postId}`);
}
