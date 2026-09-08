"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function NewContentForm({
  create,
  redirectBasePath,
}: {
  create: (input: { title: string; slug: string }) => Promise<{ id: string }>;
  redirectBasePath: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const created = await create({ title, slug: slug || slugify(title) });
        router.push(`${redirectBasePath}/${created.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>/</span>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugEdited(true);
            }}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending || !title}>
        {isPending ? "Creating…" : "Create and continue"}
      </Button>
    </form>
  );
}
