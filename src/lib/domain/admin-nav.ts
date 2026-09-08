import type { PermissionKey } from "@/lib/domain/rbac";
import {
  LayoutDashboard,
  FileText,
  Rss,
  Image as ImageIcon,
  Menu as MenuIcon,
  Users,
  Settings,
  Link2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiresPermission?: PermissionKey;
};

/**
 * Only surfaces sections that actually exist in this build — no nav
 * entries for Products/Orders/Billing/Support/Reports/Integrations, which
 * aren't built yet (see docs/architecture/ROADMAP.md). A nav link to a
 * route that 404s is worse than no link at all (§59).
 */
export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: FileText, requiresPermission: "pages.view" },
  { href: "/admin/blog", label: "Blog", icon: Rss, requiresPermission: "blog.view" },
  { href: "/admin/media", label: "Media", icon: ImageIcon, requiresPermission: "media.manage" },
  { href: "/admin/navigation", label: "Navigation", icon: MenuIcon, requiresPermission: "navigation.manage" },
  { href: "/admin/redirects", label: "SEO & Redirects", icon: Link2, requiresPermission: "seo.manage" },
  { href: "/admin/users", label: "Users & Roles", icon: Users, requiresPermission: "users.manage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, requiresPermission: "settings.manage" },
];
