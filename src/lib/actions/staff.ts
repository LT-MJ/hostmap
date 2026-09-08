"use server";

import { revalidatePath } from "next/cache";
import { inviteStaffMember, updateStaffRoles } from "@/lib/domain/staff";
import type { RoleKey } from "@/lib/domain/rbac";

export async function inviteStaffAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get("email");
  const fullName = formData.get("fullName");
  const roleKeys = formData.getAll("roles") as RoleKey[];

  if (typeof email !== "string" || !email) return { error: "Email is required." };
  if (typeof fullName !== "string" || !fullName) return { error: "Name is required." };

  try {
    await inviteStaffMember({ email, fullName, roleKeys });
    revalidatePath("/admin/users");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not invite staff member." };
  }
}

export async function updateStaffRolesAction(userId: string, roleKeys: RoleKey[]): Promise<void> {
  await updateStaffRoles(userId, roleKeys);
  revalidatePath("/admin/users");
}
