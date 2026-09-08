import { notFound } from "next/navigation";
import { getPostForEditor, listPostRevisions } from "@/lib/domain/blog";
import { getMyPermissions } from "@/lib/domain/staff";
import { absoluteUrl } from "@/lib/domain/seo/metadata";
import { ContentEditor } from "@/components/admin/content-editor";
import {
  savePostFieldsAction,
  savePostBlocksAction,
  publishPostAction,
  schedulePostAction,
  unpublishPostAction,
  restorePostRevisionAction,
} from "@/lib/actions/blog";

type Props = PageProps<"/admin/blog/[id]">;

export default async function PostEditorPage({ params }: Props) {
  const { id } = await params;
  const [result, revisions, permissions] = await Promise.all([
    getPostForEditor(id),
    listPostRevisions(id),
    getMyPermissions(),
  ]);
  if (!result) notFound();

  const { post, blocks } = result;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <ContentEditor
        status={post.status}
        scheduledAt={null}
        publicUrl={absoluteUrl(`/blog/${post.slug}`)}
        initialFields={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          seoTitle: post.seo_title ?? "",
          metaDescription: post.meta_description ?? "",
        }}
        initialBlocks={blocks.map((b) => ({
          id: b.id,
          position: b.position,
          block_type: b.block_type,
          config: b.config,
          is_hidden: b.is_hidden,
        }))}
        revisions={revisions}
        canUseCustomHtml={permissions.has("pages.custom_html")}
        canPublish={permissions.has("blog.publish")}
        onSaveFields={async (fields) => {
          "use server";
          await savePostFieldsAction(id, {
            title: fields.title,
            slug: fields.slug,
            excerpt: fields.excerpt,
            seo_title: fields.seoTitle,
            meta_description: fields.metaDescription,
          });
        }}
        onSaveBlocks={async (editableBlocks) => {
          "use server";
          await savePostBlocksAction(id, editableBlocks);
        }}
        onPublish={async () => {
          "use server";
          return publishPostAction(id);
        }}
        onSchedule={async (date) => {
          "use server";
          return schedulePostAction(id, date);
        }}
        onUnpublish={async () => {
          "use server";
          await unpublishPostAction(id);
        }}
        onRestoreRevision={async (revisionId) => {
          "use server";
          await restorePostRevisionAction(id, revisionId);
        }}
      />
    </div>
  );
}
