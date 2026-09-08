import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/supabase/guards";
import { validateContent, hasBlockingIssues } from "@/lib/domain/blocks/validate-content";
import { mediaPublicUrl } from "@/lib/domain/media";
import type { Config as BlogGridConfig, BlogGridPost } from "@/lib/domain/blocks/definitions/blog-grid/Render";

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  category_id: string | null;
  featured_media_id: string | null;
  published_revision_id: string | null;
  seo_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  deleted_at: string | null;
  updated_at: string;
};

export type BlogPostBlockRow = {
  id: string;
  post_id: string;
  position: number;
  block_type: string;
  config: unknown;
  is_hidden: boolean;
};

export async function getPublishedPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*, blog_post_revisions!blog_posts_published_revision_id_fkey(blocks_snapshot, seo_snapshot)")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !post) return null;

  const revision = (post as unknown as {
    blog_post_revisions: { blocks_snapshot: BlogPostBlockRow[]; seo_snapshot: Record<string, unknown> } | null;
  }).blog_post_revisions;
  if (!revision) return null;

  return { post: post as unknown as BlogPostRow, blocks: revision.blocks_snapshot ?? [], seo: revision.seo_snapshot ?? {} };
}

/** Live query backing the Blog Grid block — deliberately not a snapshot,
 * see docs/architecture/03-cms.md. Called only from render-page-blocks.tsx. */
export async function getPublishedPostsForGrid(config: BlogGridConfig): Promise<BlogGridPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select("slug, title, excerpt, featured_media_id, media:featured_media_id(bucket, storage_path)")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(config.limit);

  if (config.categorySlug) {
    const { data: category } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", config.categorySlug)
      .maybeSingle();
    if (category) query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const media = row.media as unknown as { bucket: string; storage_path: string } | null;
    return {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      featuredImageUrl: media ? mediaPublicUrl(media) : null,
    };
  });
}

export async function listPostsForAdmin(): Promise<BlogPostRow[]> {
  await requirePermission("blog.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPostRow[];
}

export async function getPostForEditor(postId: string) {
  await requirePermission("blog.view");
  const supabase = await createClient();
  const [{ data: post, error: postError }, { data: blocks, error: blocksError }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", postId).maybeSingle(),
    supabase.from("blog_post_blocks").select("*").eq("post_id", postId).order("position"),
  ]);
  if (postError) throw new Error(postError.message);
  if (blocksError) throw new Error(blocksError.message);
  if (!post) return null;
  return { post: post as BlogPostRow, blocks: (blocks ?? []) as BlogPostBlockRow[] };
}

export async function createPost(input: { title: string; slug: string }): Promise<BlogPostRow> {
  await requirePermission("blog.create");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as BlogPostRow;
}

export async function updatePostFields(
  postId: string,
  fields: Partial<Pick<BlogPostRow, "title" | "slug" | "excerpt" | "category_id" | "featured_media_id" | "seo_title" | "meta_description">>,
): Promise<void> {
  await requirePermission("blog.update");
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").update(fields).eq("id", postId);
  if (error) throw new Error(error.message);
}

export async function savePostBlocks(
  postId: string,
  blocks: Array<{ position: number; block_type: string; config: unknown; is_hidden: boolean }>,
): Promise<void> {
  await requirePermission("blog.update");
  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("blog_post_blocks").delete().eq("post_id", postId);
  if (deleteError) throw new Error(deleteError.message);
  if (blocks.length === 0) return;
  const { error } = await supabase
    .from("blog_post_blocks")
    .insert(blocks.map((b) => ({ ...b, post_id: postId })));
  if (error) throw new Error(error.message);
}

export class PublishBlockedError extends Error {
  constructor(public issues: ReturnType<typeof validateContent>) {
    super("Content has blocking issues and cannot be published.");
  }
}

export async function publishPost(postId: string, changeNote?: string): Promise<void> {
  await requirePermission("blog.publish");
  const supabase = await createClient();
  const { data: blocks, error: blocksError } = await supabase
    .from("blog_post_blocks")
    .select("block_type, config")
    .eq("post_id", postId)
    .eq("is_hidden", false);
  if (blocksError) throw new Error(blocksError.message);

  const issues = validateContent((blocks ?? []) as Array<{ block_type: string; config: unknown }>);
  if (hasBlockingIssues(issues)) throw new PublishBlockedError(issues);

  const { error } = await supabase.rpc("publish_blog_post", { p_post_id: postId, p_change_note: changeNote ?? null });
  if (error) throw new Error(error.message);
}

export async function schedulePost(postId: string, scheduledAt: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("schedule_blog_post", { p_post_id: postId, p_scheduled_at: scheduledAt });
  if (error) throw new Error(error.message);
}

export async function unpublishPost(postId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("unpublish_blog_post", { p_post_id: postId });
  if (error) throw new Error(error.message);
}

export async function listPostRevisions(postId: string) {
  await requirePermission("blog.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_post_revisions")
    .select("id, revision_number, author_id, change_note, created_at")
    .eq("post_id", postId)
    .order("revision_number", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function restoreRevisionIntoDraft(postId: string, revisionId: string): Promise<void> {
  await requirePermission("blog.update");
  const supabase = await createClient();
  const { data: revision, error: revisionError } = await supabase
    .from("blog_post_revisions")
    .select("blocks_snapshot")
    .eq("id", revisionId)
    .eq("post_id", postId)
    .single();
  if (revisionError) throw new Error(revisionError.message);

  const snapshot = (revision.blocks_snapshot ?? []) as BlogPostBlockRow[];
  await savePostBlocks(
    postId,
    snapshot.map((b) => ({ position: b.position, block_type: b.block_type, config: b.config, is_hidden: b.is_hidden })),
  );
}

export async function deletePost(postId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_blog_post", { p_post_id: postId });
  if (error) throw new Error(error.message);
}
