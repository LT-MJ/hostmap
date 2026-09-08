import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listPagesForAdmin } from "@/lib/domain/pages";
import { ContentTable } from "@/components/admin/content-table";

export default async function PagesListPage() {
  const pages = await listPagesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
        <Button render={<Link href="/admin/pages/new" />}>
          <Plus className="mr-1.5 size-4" /> New page
        </Button>
      </div>
      <ContentTable
        basePath="/admin/pages"
        rows={pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug, status: p.status, updatedAt: p.updated_at }))}
      />
    </div>
  );
}
