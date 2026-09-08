import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/lib/actions/auth";

export function AdminTopbar({ email }: { email: string | undefined }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <p className="text-sm font-medium">Admin</p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {email && <span className="text-sm text-muted-foreground">{email}</span>}
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="mr-1.5 size-4" /> Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
