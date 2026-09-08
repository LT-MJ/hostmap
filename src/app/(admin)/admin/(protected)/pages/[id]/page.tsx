import { notFound } from "next/navigation";
import { getPageForEditor, listPageRevisions } from "@/lib/domain/pages";
import { getMyPermissions } from "@/lib/domain/staff";
import { absoluteUrl } from "@/lib/domain/seo/metadata";
import { ContentEditor } from "@/components/admin/content-editor";
import {
  savePageFieldsAction,
  savePageBlocksAction,
  publishPageAction,
  schedulePageAction,
  unpublishPageAction,
  restoreRevisionAction,
} from "@/lib/actions/pages";

type Props = PageProps<"/admin/pages/[id]">;

export default async function PageEditorPage({ params }: Props) {
  const { id } = await params;
  const [result, revisions, permissions] = await Promise.all([
    getPageForEditor(id),
    listPageRevisions(id),
    getMyPermissions(),
  ]);
  if (!result) notFound();

  const { page, blocks } = result;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit page</h1>
      <ContentEditor
        status={page.status}
        scheduledAt={page.scheduled_at}
        publicUrl={absoluteUrl(page.slug === "home" ? "/" : `/${page.slug}`)}
        initialFields={{
          title: page.title,
          slug: page.slug,
          excerpt: page.excerpt ?? "",
          seoTitle: page.seo_title ?? "",
          metaDescription: page.meta_description ?? "",
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
        canPublish={permissions.has("pages.publish")}
        onSaveFields={async (fields) => {
          "use server";
          await savePageFieldsAction(id, {
            title: fields.title,
            slug: fields.slug,
            excerpt: fields.excerpt,
            seo_title: fields.seoTitle,
            meta_description: fields.metaDescription,
          });
        }}
        onSaveBlocks={async (editableBlocks) => {
          "use server";
          await savePageBlocksAction(id, editableBlocks);
        }}
        onPublish={async () => {
          "use server";
          return publishPageAction(id);
        }}
        onSchedule={async (date) => {
          "use server";
          return schedulePageAction(id, date);
        }}
        onUnpublish={async () => {
          "use server";
          await unpublishPageAction(id);
        }}
        onRestoreRevision={async (revisionId) => {
          "use server";
          await restoreRevisionAction(id, revisionId);
        }}
      />
    </div>
  );
}
