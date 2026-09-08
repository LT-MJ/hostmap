import Image from "next/image";
import { listMedia, mediaPublicUrl } from "@/lib/domain/media";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { Card } from "@/components/ui/card";

export default async function MediaLibraryPage() {
  const media = await listMedia();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Media library</h1>
      <MediaUploadForm />
      {media.length === 0 ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          No media uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-square bg-muted">
                {item.mime_type === "image/svg+xml" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- SVGs render fine unoptimized; avoids next/image's raster-only optimizer for this one type
                  <img src={mediaPublicUrl(item)} alt={item.alt_text ?? ""} className="size-full object-contain" />
                ) : (
                  <Image src={mediaPublicUrl(item)} alt={item.alt_text ?? ""} fill className="object-cover" />
                )}
              </div>
              <div className="p-2 text-xs">
                <p className="truncate font-medium">{item.title || "(untitled)"}</p>
                {!item.alt_text && <p className="text-amber-600">Missing alt text</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
