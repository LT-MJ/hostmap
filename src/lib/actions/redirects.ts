"use server";

import { revalidatePath } from "next/cache";
import { createRedirect, deleteRedirect, dismissNotFoundEntry } from "@/lib/domain/redirects";

export async function createRedirectAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const sourcePath = formData.get("sourcePath");
  const destinationPath = formData.get("destinationPath");
  const statusCode = formData.get("statusCode") === "302" ? 302 : 301;

  if (typeof sourcePath !== "string" || !sourcePath.startsWith("/")) {
    return { error: "Source path must start with /." };
  }
  if (typeof destinationPath !== "string" || !destinationPath) {
    return { error: "Destination path is required." };
  }

  try {
    await createRedirect({ sourcePath, destinationPath, statusCode });
    revalidatePath("/admin/redirects");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create redirect." };
  }
}

export async function deleteRedirectAction(id: string): Promise<void> {
  await deleteRedirect(id);
  revalidatePath("/admin/redirects");
}

export async function dismissNotFoundAction(id: string): Promise<void> {
  await dismissNotFoundEntry(id);
  revalidatePath("/admin/redirects");
}
