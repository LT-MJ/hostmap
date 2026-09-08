import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { PermissionKey } from "@/lib/domain/rbac";

/** Thrown by `requirePermission()` — callers turn this into a 403/inline error. */
export class ForbiddenError extends Error {
  constructor(permissionKey: string) {
    super(`Missing permission: ${permissionKey}`);
    this.name = "ForbiddenError";
  }
}

export type AuthClaims = {
  sub: string;
  email?: string;
  [key: string]: unknown;
};

/**
 * Validates the session JWT locally (`getClaims`) — never `getSession`,
 * which returns the cookie's contents without verifying them. Returns null
 * rather than throwing so callers can decide redirect vs. inline handling.
 */
export async function getAuthClaims(): Promise<AuthClaims | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return data.claims as AuthClaims;
}

/**
 * The real gate for any staff-only Server Component/layout. `proxy.ts`'s
 * redirect is a UX nicety only — this is what actually stops an
 * unauthenticated render, called again here even though a layout further up
 * the tree may have already checked, per the Next.js data-security guidance
 * that a page-level check does not extend to Server Actions or nested
 * fetches.
 */
export async function requireStaffSession(nextPath?: string): Promise<AuthClaims> {
  const claims = await getAuthClaims();
  if (!claims) {
    const search = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/admin/login${search}`);
  }
  return claims;
}

/**
 * Authorization, not just authentication: checks the caller's roles against
 * one permission key via the same `has_permission` SQL function the RLS
 * policies use (see docs/architecture/02-auth.md) — one definition of "can
 * this user do X," enforced at two layers. Throws `ForbiddenError` rather
 * than redirecting, since a missing permission on an already-authenticated
 * user is a 403 (they exist, they just can't do this), not a login prompt.
 */
export async function requirePermission(
  permissionKey: PermissionKey,
): Promise<AuthClaims> {
  const claims = await requireStaffSession();
  const supabase = await createClient();
  const { data: allowed, error } = await supabase.rpc("hostmap_has_permission", {
    p_user_id: claims.sub,
    p_permission_key: permissionKey,
  });
  if (error || !allowed) {
    throw new ForbiddenError(permissionKey);
  }
  return claims;
}
