import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/supabase/guards";
import { validateContent, hasBlockingIssues } from "@/lib/domain/blocks/validate-content";
import type { Json } from "@/lib/supabase/database.types";

export type PageBlockRow = {
  id: string;
  page_id: string;
  position: number;
  block_type: string;
  config: unknown;
  is_hidden: boolean;
};

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "scheduled" | "published" | "archived";
  template: string;
  excerpt: string | null;
  featured_media_id: string | null;
  published_revision_id: string | null;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots_directive: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_media_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublishedPageContent = {
  page: PageRow;
  blocks: PageBlockRow[];
  seo: Record<string, unknown>;
};

/** Public rendering path — relies entirely on RLS (anon can only select
 * published, non-deleted rows; see supabase/migrations/0004_pages.sql) to
 * enforce visibility. No permission check needed here: there is no
 * privileged caller in this path, only what RLS already allows. */
export async function getPublishedPageBySlug(slug: string): Promise<PublishedPageContent | null> {
  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from("hostmap_pages")
    .select("*, page_revisions:hostmap_page_revisions!hostmap_pages_published_revision_id_fkey(blocks_snapshot, seo_snapshot)")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !page) return null;

  const revision = (page as unknown as {
    page_revisions: { blocks_snapshot: PageBlockRow[]; seo_snapshot: Record<string, unknown> } | null;
  }).page_revisions;

  if (!revision) return null;

  return {
    page: page as unknown as PageRow,
    blocks: revision.blocks_snapshot ?? [],
    seo: revision.seo_snapshot ?? {},
  };
}

export async function listPagesForAdmin(): Promise<PageRow[]> {
  await requirePermission("pages.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostmap_pages")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PageRow[];
}

export async function getPageForEditor(
  pageId: string,
): Promise<{ page: PageRow; blocks: PageBlockRow[] } | null> {
  await requirePermission("pages.view");
  const supabase = await createClient();
  const [{ data: page, error: pageError }, { data: blocks, error: blocksError }] = await Promise.all([
    supabase.from("hostmap_pages").select("*").eq("id", pageId).maybeSingle(),
    supabase.from("hostmap_page_blocks").select("*").eq("page_id", pageId).order("position"),
  ]);
  if (pageError) throw new Error(pageError.message);
  if (blocksError) throw new Error(blocksError.message);
  if (!page) return null;
  return { page: page as PageRow, blocks: (blocks ?? []) as PageBlockRow[] };
}

export async function createPage(input: { title: string; slug: string }): Promise<PageRow> {
  await requirePermission("pages.create");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostmap_pages")
    .insert({ title: input.title, slug: input.slug })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PageRow;
}

/** Autosave target — only the columns granted to `authenticated` (see
 * migration 0004) can appear here; status/deleted_at/etc. go through the
 * dedicated publish/schedule/unpublish/delete functions below. */
export async function updatePageFields(
  pageId: string,
  fields: Partial<
    Pick<
      PageRow,
      | "title"
      | "slug"
      | "excerpt"
      | "template"
      | "featured_media_id"
      | "seo_title"
      | "meta_description"
      | "canonical_url"
      | "robots_directive"
      | "og_title"
      | "og_description"
      | "og_image_media_id"
    >
  >,
): Promise<void> {
  await requirePermission("pages.update");
  const supabase = await createClient();
  const { error } = await supabase.from("hostmap_pages").update(fields).eq("id", pageId);
  if (error) throw new Error(error.message);
}

export async function savePageBlocks(
  pageId: string,
  blocks: Array<{ id?: string; position: number; block_type: string; config: unknown; is_hidden: boolean }>,
): Promise<void> {
  await requirePermission("pages.update");
  const supabase = await createClient();

  // Simplest correct strategy for a page's full block list: replace it
  // wholesale in one transaction-equivalent pair of calls. Fine at CMS
  // scale (dozens of blocks per page, not thousands) — see
  // docs/architecture/03-cms.md's autosave section for the debounce/
  // stale-response guard this is called from.
  const { error: deleteError } = await supabase.from("hostmap_page_blocks").delete().eq("page_id", pageId);
  if (deleteError) throw new Error(deleteError.message);

  if (blocks.length === 0) return;

  const { error: insertError } = await supabase.from("hostmap_page_blocks").insert(
    blocks.map((b) => ({
      page_id: pageId,
      position: b.position,
      block_type: b.block_type,
      config: b.config as Json,
      is_hidden: b.is_hidden,
    })),
  );
  if (insertError) throw new Error(insertError.message);
}

export class PublishBlockedError extends Error {
  constructor(public issues: ReturnType<typeof validateContent>) {
    super("Content has blocking issues and cannot be published.");
  }
}

export async function publishPage(pageId: string, changeNote?: string): Promise<void> {
  await requirePermission("pages.publish");
  const supabase = await createClient();

  const { data: blocks, error: blocksError } = await supabase
    .from("hostmap_page_blocks")
    .select("block_type, config")
    .eq("page_id", pageId)
    .eq("is_hidden", false);
  if (blocksError) throw new Error(blocksError.message);

  const issues = validateContent((blocks ?? []) as Array<{ block_type: string; config: unknown }>);
  if (hasBlockingIssues(issues)) {
    throw new PublishBlockedError(issues);
  }

  const { error } = await supabase.rpc("hostmap_publish_page", { p_page_id: pageId, p_change_note: changeNote });
  if (error) throw new Error(error.message);
}

export async function schedulePage(pageId: string, scheduledAt: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hostmap_schedule_page", { p_page_id: pageId, p_scheduled_at: scheduledAt });
  if (error) throw new Error(error.message);
}

export async function unpublishPage(pageId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hostmap_unpublish_page", { p_page_id: pageId });
  if (error) throw new Error(error.message);
}

export async function deletePage(pageId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hostmap_delete_page", { p_page_id: pageId });
  if (error) throw new Error(error.message);
}

export async function restorePage(pageId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hostmap_restore_page", { p_page_id: pageId });
  if (error) throw new Error(error.message);
}

export async function listPageRevisions(pageId: string) {
  await requirePermission("pages.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostmap_page_revisions")
    .select("id, revision_number, author_id, change_note, created_at")
    .eq("page_id", pageId)
    .order("revision_number", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function restoreRevisionIntoDraft(pageId: string, revisionId: string): Promise<void> {
  await requirePermission("pages.update");
  const supabase = await createClient();
  const { data: revision, error: revisionError } = await supabase
    .from("hostmap_page_revisions")
    .select("blocks_snapshot")
    .eq("id", revisionId)
    .eq("page_id", pageId)
    .single();
  if (revisionError) throw new Error(revisionError.message);

  const snapshot = (revision.blocks_snapshot ?? []) as PageBlockRow[];
  await savePageBlocks(
    pageId,
    snapshot.map((b) => ({
      position: b.position,
      block_type: b.block_type,
      config: b.config,
      is_hidden: b.is_hidden,
    })),
  );
}
