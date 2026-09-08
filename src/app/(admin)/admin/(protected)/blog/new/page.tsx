import { NewContentForm } from "@/components/admin/new-content-form";
import { createPostAction } from "@/lib/actions/blog";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <NewContentForm create={createPostAction} redirectBasePath="/admin/blog" />
    </div>
  );
}
