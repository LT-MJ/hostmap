import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, getAuthClaims } from "@/lib/supabase/guards";
import { ROLE_KEYS, type RoleKey, type PermissionKey } from "@/lib/domain/rbac";

export type StaffMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: "staff" | "customer";
  roles: RoleKey[];
};

/** Current user's own permission set — used for nav filtering (UX only,
 * not the security boundary; see requirePermission()) and to pass flags
 * like `canUseCustomHtml` into client components without exposing the
 * whole RBAC catalog to the browser. */
export async function getMyPermissions(): Promise<Set<PermissionKey>> {
  const claims = await getAuthClaims();
  if (!claims) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("roles(role_permissions(permissions(key)))")
    .eq("user_id", claims.sub);

  const keys = new Set<PermissionKey>();
  for (const row of data ?? []) {
    const role = row.roles as unknown as { role_permissions: { permissions: { key: PermissionKey } }[] } | null;
    for (const rp of role?.role_permissions ?? []) {
      keys.add(rp.permissions.key);
    }
  }
  return keys;
}

export async function getMyRoleKeys(): Promise<RoleKey[]> {
  const claims = await getAuthClaims();
  if (!claims) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("user_roles").select("roles(key)").eq("user_id", claims.sub);
  return (data ?? []).map((row) => (row.roles as unknown as { key: RoleKey }).key);
}

export async function listStaff(): Promise<StaffMember[]> {
  await requirePermission("users.manage");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, user_type, user_roles(roles(key))")
    .eq("user_type", "staff");
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: null, // auth.users email isn't queryable via PostgREST from `public` schema; shown from invite flow only for Phase 1
    user_type: row.user_type,
    roles: (row.user_roles as unknown as { roles: { key: RoleKey } }[]).map((ur) => ur.roles.key),
  }));
}

export async function inviteStaffMember(input: { email: string; fullName: string; roleKeys: RoleKey[] }): Promise<void> {
  // Authorize BEFORE touching the admin client — requirePermission() is the
  // only thing standing between this function and full Auth Admin access.
  await requirePermission("users.manage");

  const adminClient = createAdminClient();
  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(input.email, {
    data: { full_name: input.fullName },
  });
  if (inviteError || !invited.user) {
    throw new Error(inviteError?.message ?? "Could not invite user.");
  }

  const { error: promoteError } = await adminClient.rpc("promote_to_staff", {
    p_user_id: invited.user.id,
    p_role_keys: input.roleKeys,
  });
  if (promoteError) throw new Error(promoteError.message);
}

export async function updateStaffRoles(userId: string, roleKeys: RoleKey[]): Promise<void> {
  await requirePermission("users.manage");
  const supabase = await createClient();

  const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (deleteError) throw new Error(deleteError.message);

  if (roleKeys.length === 0) return;
  const { data: roles, error: rolesError } = await supabase.from("roles").select("id, key").in("key", roleKeys);
  if (rolesError) throw new Error(rolesError.message);

  const { error: insertError } = await supabase
    .from("user_roles")
    .insert((roles ?? []).map((role) => ({ user_id: userId, role_id: role.id })));
  if (insertError) throw new Error(insertError.message);
}

export { ROLE_KEYS };
