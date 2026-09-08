import type { PermissionKey } from "@/lib/domain/rbac";

// Icon names only, not component references — this array is built in a
// Server Component (the protected admin layout) and passed as props into
// AdminSidebar, a Client Component; a live component reference (what
// lucide-react exports) can't cross that boundary as a prop, only as
// serializable data. AdminSidebar resolves these names to the actual
// icon components itself.
export type AdminNavIconName =
  | "LayoutDashboard"
  | "FileText"
  | "Rss"
  | "Image"
  | "Menu"
  | "Users"
  | "Settings"
  | "Link2";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIconName;
  requiresPermission?: PermissionKey;
};

/**
 * Only surfaces sections that actually exist in this build — no nav
 * entries for Products/Orders/Billing/Support/Reports/Integrations, which
 * aren't built yet (see docs/architecture/ROADMAP.md). A nav link to a
 * route that 404s is worse than no link at all (§59).
 */
export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/pages", label: "Pages", icon: "FileText", requiresPermission: "pages.view" },
  { href: "/admin/blog", label: "Blog", icon: "Rss", requiresPermission: "blog.view" },
  { href: "/admin/media", label: "Media", icon: "Image", requiresPermission: "media.manage" },
  { href: "/admin/navigation", label: "Navigation", icon: "Menu", requiresPermission: "navigation.manage" },
  { href: "/admin/redirects", label: "SEO & Redirects", icon: "Link2", requiresPermission: "seo.manage" },
  { href: "/admin/users", label: "Users & Roles", icon: "Users", requiresPermission: "users.manage" },
  { href: "/admin/settings", label: "Settings", icon: "Settings", requiresPermission: "settings.manage" },
];
