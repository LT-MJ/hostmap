/**
 * Single source of truth for role/permission keys used by application code.
 * Mirrored (not imported — this is plain TS, the seed migration is SQL) into
 * `supabase/migrations/0002_rbac_seed.sql`. Keep both in sync by hand; a
 * mismatch only matters if app code references a key the database doesn't
 * have, which `requirePermission()` turns into a clean 403, not a crash.
 */

export const ROLE_KEYS = [
  "super_admin",
  "admin",
  "billing",
  "support",
  "content_editor",
  "seo_manager",
  "customer",
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

/** `resource.action` convention, per spec §6. Reserved keys (no owning
 * table/UI yet) are marked so it's clear they're not dead code — they're
 * seeded now so Phase 5+ doesn't have to touch the RBAC migration again. */
export const PERMISSION_KEYS = [
  "pages.view",
  "pages.create",
  "pages.update",
  "pages.delete",
  "pages.publish",
  "pages.custom_html",
  "blog.view",
  "blog.create",
  "blog.update",
  "blog.publish",
  "media.manage",
  "navigation.manage",
  "users.manage",
  "settings.manage",
  "seo.manage",
  "reports.view",
  // Reserved for later phases:
  "products.manage",
  "domains.manage",
  "orders.manage",
  "invoices.manage",
  "payments.manage",
  "tickets.manage",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
