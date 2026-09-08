import { Loader2, Check, AlertCircle } from "lucide-react";
import type { SaveState } from "@/hooks/use-autosave";

export function SaveStateIndicator({ state }: { state: SaveState }) {
  switch (state) {
    case "saving":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Saving…
        </span>
      );
    case "saved":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5 text-green-600" /> Saved
        </span>
      );
    case "unsaved":
      return <span className="text-xs text-muted-foreground">Unsaved changes</span>;
    case "error":
      return (
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> Couldn&apos;t save — check your connection
        </span>
      );
    default:
      return null;
  }
}
