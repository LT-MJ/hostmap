"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listMediaAction, uploadMediaAction, type MediaPickerItem } from "@/lib/actions/media";
import type { MediaRef } from "@/lib/domain/blocks/shared-schemas";

export function MediaPicker({
  value,
  onChange,
  label = "Image",
}: {
  value: MediaRef;
  onChange: (ref: MediaRef) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaPickerItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    listMediaAction()
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, [open]);

  function select(item: MediaPickerItem) {
    onChange({
      mediaId: item.id,
      url: item.url,
      alt: item.altText ?? "",
      isDecorative: false,
      width: item.width,
      height: item.height,
    });
    setOpen(false);
  }

  function handleUpload(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const item = await uploadMediaAction(formData);
        setItems((prev) => [item, ...prev]);
        select(item);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value.url ? (
          <div className="relative h-16 w-24 overflow-hidden rounded-md border bg-muted">
            <Image src={value.url} alt={value.alt} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
            No image
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
            {value.url ? "Change" : "Select"} {label}
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select {label}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="library">
              <TabsList>
                <TabsTrigger value="library">Media Library</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="library" className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                {items.length === 0 && (
                  <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">
                    No media yet — upload one.
                  </p>
                )}
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(item)}
                    className="relative aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-ring"
                  >
                    <Image src={item.url} alt={item.altText ?? ""} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </TabsContent>
              <TabsContent value="upload">
                <form action={handleUpload} className="space-y-3">
                  <Input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml" required />
                  <Input type="text" name="title" placeholder="Title (optional)" />
                  <Input type="text" name="altText" placeholder="Alt text" />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Uploading…" : "Upload"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </DialogContent>
        </Dialog>
      </div>
      {value.url && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.isDecorative}
            onChange={(e) => onChange({ ...value, isDecorative: e.target.checked })}
          />
          Decorative image (no alt text needed)
        </label>
      )}
      {value.url && !value.isDecorative && (
        <Input
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Alt text (required)"
        />
      )}
    </div>
  );
}
