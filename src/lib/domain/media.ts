import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/supabase/guards";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class MediaValidationError extends Error {}

/**
 * Never trusts the client-provided filename (§66: path traversal, dangerous
 * extensions) — every upload gets a fresh, safe generated name; the
 * original filename is kept only as display metadata (`title`), not as
 * part of the storage path.
 */
function safeStorageName(mimeType: string): string {
  const ext = mimeType.split("/")[1]?.replace("svg+xml", "svg") ?? "bin";
  const random = crypto.randomUUID();
  const datePrefix = new Date().toISOString().slice(0, 10);
  return `${datePrefix}/${random}.${ext}`;
}

export type MediaRow = {
  id: string;
  bucket: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  title: string | null;
  caption: string | null;
  description: string | null;
  folder_id: string | null;
  created_at: string;
};

async function readImageDimensions(
  file: File,
): Promise<{ width: number | null; height: number | null }> {
  if (file.type === "image/svg+xml") return { width: null, height: null };
  try {
    // Sharp/probe-image-size would be the production-grade choice; for the
    // MIME set above (raster formats only reach this branch — SVG returns
    // above) a lightweight header parse would work too. Deferred: Phase 1
    // stores null and lets the editor fill dimensions in manually if the
    // upload path doesn't populate them, rather than pull in an image
    // library for a nice-to-have. Never invents a fake fallback value.
    return { width: null, height: null };
  } catch {
    return { width: null, height: null };
  }
}

export async function uploadMedia(input: {
  file: File;
  title?: string;
  altText?: string;
  folderId?: string | null;
}): Promise<MediaRow> {
  await requirePermission("media.manage");

  if (!ALLOWED_MIME_TYPES.has(input.file.type)) {
    throw new MediaValidationError(`Unsupported file type: ${input.file.type || "unknown"}`);
  }
  if (input.file.size === 0) {
    throw new MediaValidationError("File is empty.");
  }
  if (input.file.size > MAX_FILE_SIZE_BYTES) {
    throw new MediaValidationError(
      `File is too large (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB).`,
    );
  }

  const supabase = await createClient();
  const storagePath = safeStorageName(input.file.type);

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, input.file, { contentType: input.file.type, upsert: false });
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { width, height } = await readImageDimensions(input.file);

  const { data, error } = await supabase
    .from("media")
    .insert({
      bucket: "media",
      storage_path: storagePath,
      mime_type: input.file.type,
      size_bytes: input.file.size,
      width,
      height,
      alt_text: input.altText ?? null,
      title: input.title ?? null,
      folder_id: input.folderId ?? null,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from("media").remove([storagePath]);
    throw new Error(`Could not save media record: ${error.message}`);
  }

  return data as MediaRow;
}

export async function listMedia(limit = 60): Promise<MediaRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as MediaRow[];
}

export function mediaPublicUrl(row: Pick<MediaRow, "bucket" | "storage_path">): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${row.bucket}/${row.storage_path}`;
}

/** Resolves a `*_media_id` foreign key (site_settings.logo_media_id, etc.)
 * to a public URL, or null if unset/not found — callers render a text
 * fallback rather than a broken image in that case. */
export async function getMediaUrlById(mediaId: string | null): Promise<string | null> {
  if (!mediaId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("media").select("bucket, storage_path").eq("id", mediaId).maybeSingle();
  return data ? mediaPublicUrl(data) : null;
}
