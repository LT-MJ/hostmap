import { requireStaffSession } from "@/lib/supabase/guards";
import { getMyPermissions } from "@/lib/domain/staff";
import { adminNavItems } from "@/lib/domain/admin-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

// Routing gotcha (see docs/architecture/02-auth.md): this layout's guard
// applies to every route nested under it. /admin/login is a sibling route
// OUTSIDE this (protected) group specifically so an unauthenticated visitor
// doesn't get redirected to a login page that redirects again, forever.
export default async function AdminProtectedLayout({ children }: LayoutProps<"/admin">) {
  const claims = await requireStaffSession("/admin");
  const permissions = await getMyPermissions();

  const visibleNavItems = adminNavItems.filter(
    (item) => !item.requiresPermission || permissions.has(item.requiresPermission),
  );

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-56 shrink-0 border-r bg-muted/20 md:block">
        <div className="flex h-14 items-center border-b px-4 font-semibold">hostmap</div>
        <AdminSidebar items={visibleNavItems} />
      </aside>
      <div className="flex flex-1 flex-col">
        <AdminTopbar email={typeof claims.email === "string" ? claims.email : undefined} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
