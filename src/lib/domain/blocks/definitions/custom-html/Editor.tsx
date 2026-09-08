"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import type { Config } from "./Render";

export default function Editor({
  config,
  onChange,
}: {
  config: Config;
  onChange: (config: Config) => void;
}) {
  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <TriangleAlert className="size-4" />
        <AlertTitle>Rendered exactly as written</AlertTitle>
        <AlertDescription>
          This HTML is not sanitized and runs on the public page. Only use content you trust.
        </AlertDescription>
      </Alert>
      <div className="space-y-1.5">
        <Label>HTML</Label>
        <Textarea
          value={config.html}
          onChange={(e) => onChange({ html: e.target.value })}
          rows={10}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
