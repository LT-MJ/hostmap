"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { inviteStaffAction } from "@/lib/actions/staff";
import { ROLE_KEYS, type RoleKey } from "@/lib/domain/rbac";

const STAFF_ROLE_KEYS = ROLE_KEYS.filter((key): key is Exclude<RoleKey, "customer"> => key !== "customer");

const initialState = { error: null as string | null };

export function InviteStaffForm() {
  const [state, formAction, isPending] = useActionState(inviteStaffAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Invite staff member</h2>
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="invite-name">Full name</Label>
          <Input id="invite-name" name="fullName" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input id="invite-email" name="email" type="email" required />
        </div>
      </div>
      <fieldset className="space-y-1.5">
        <legend className="text-sm">Roles</legend>
        <div className="flex flex-wrap gap-3">
          {STAFF_ROLE_KEYS.map((role) => (
            <label key={role} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="roles" value={role} />
              {role.replace("_", " ")}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}
