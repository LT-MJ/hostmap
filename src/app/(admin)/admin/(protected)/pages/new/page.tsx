import { NewContentForm } from "@/components/admin/new-content-form";
import { createPageAction } from "@/lib/actions/pages";

export default function NewPagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New page</h1>
      <NewContentForm create={createPageAction} redirectBasePath="/admin/pages" />
    </div>
  );
}
