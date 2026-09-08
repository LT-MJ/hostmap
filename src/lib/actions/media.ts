"use server";

import { uploadMedia, listMedia, mediaPublicUrl } from "@/lib/domain/media";

export type MediaPickerItem = {
  id: string;
  url: string;
  title: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export async function listMediaAction(): Promise<MediaPickerItem[]> {
  const rows = await listMedia();
  return rows.map((row) => ({
    id: row.id,
    url: mediaPublicUrl(row),
    title: row.title,
    altText: row.alt_text,
    width: row.width,
    height: row.height,
  }));
}

export async function uploadMediaAction(formData: FormData): Promise<MediaPickerItem> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file provided.");
  }
  const title = formData.get("title");
  const altText = formData.get("altText");
  const row = await uploadMedia({
    file,
    title: typeof title === "string" && title ? title : undefined,
    altText: typeof altText === "string" && altText ? altText : undefined,
  });
  return {
    id: row.id,
    url: mediaPublicUrl(row),
    title: row.title,
    altText: row.alt_text,
    width: row.width,
    height: row.height,
  };
}
