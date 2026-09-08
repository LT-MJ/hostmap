import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listPostsForAdmin } from "@/lib/domain/blog";
import { ContentTable } from "@/components/admin/content-table";

export default async function BlogListPage() {
  const posts = await listPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <Button render={<Link href="/admin/blog/new" />}>
          <Plus className="mr-1.5 size-4" /> New post
        </Button>
      </div>
      <ContentTable
        basePath="/admin/blog"
        rows={posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug, status: p.status, updatedAt: p.updated_at }))}
      />
    </div>
  );
}
