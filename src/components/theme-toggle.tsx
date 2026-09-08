"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const subscribeNoop = () => () => {};

/**
 * next-themes can't know the resolved theme until after hydration (it
 * depends on localStorage/system preference) — rendering a guess on the
 * server would flash/mismatch. useSyncExternalStore's getServerSnapshot is
 * the React-recommended way to express "this value differs between server
 * and client" without a setState-in-effect (flagged by this project's
 * react-hooks lint config as a cascading-render anti-pattern).
 */
function useHasMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasMounted = useHasMounted();

  if (!hasMounted) return <div className="size-8" />;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
