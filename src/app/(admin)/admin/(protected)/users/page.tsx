import { listStaff } from "@/lib/domain/staff";
import { InviteStaffForm } from "@/components/admin/invite-staff-form";
import { StaffRolesEditor } from "@/components/admin/staff-roles-editor";

export default async function UsersPage() {
  const staff = await listStaff();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users &amp; roles</h1>
      <InviteStaffForm />
      {staff.length === 0 ? (
        <p className="text-sm text-muted-foreground">No staff members yet.</p>
      ) : (
        <StaffRolesEditor members={staff} />
      )}
    </div>
  );
}
