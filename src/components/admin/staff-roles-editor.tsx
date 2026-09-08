"use client";

import { useTransition } from "react";
import { Card } from "@/components/ui/card";
import { updateStaffRolesAction } from "@/lib/actions/staff";
import { ROLE_KEYS, type RoleKey } from "@/lib/domain/rbac";
import type { StaffMember } from "@/lib/domain/staff";

const STAFF_ROLE_KEYS = ROLE_KEYS.filter((key): key is Exclude<RoleKey, "customer"> => key !== "customer");

export function StaffRolesEditor({ members }: { members: StaffMember[] }) {
  const [isPending, startTransition] = useTransition();

  function toggleRole(member: StaffMember, role: RoleKey, checked: boolean) {
    const nextRoles = checked ? [...member.roles, role] : member.roles.filter((r) => r !== role);
    startTransition(() => updateStaffRolesAction(member.id, nextRoles));
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <Card key={member.id} className="p-4">
          <p className="font-medium">{member.full_name || "(no name)"}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {STAFF_ROLE_KEYS.map((role) => (
              <label key={role} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={member.roles.includes(role)}
                  disabled={isPending}
                  onChange={(e) => toggleRole(member, role, e.target.checked)}
                />
                {role.replace("_", " ")}
              </label>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
