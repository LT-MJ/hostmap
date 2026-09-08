"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Config } from "./Render";

export default function Editor({
  config,
  onChange,
}: {
  config: Config;
  onChange: (config: Config) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Content (Markdown)</Label>
      <Textarea
        value={config.markdown}
        onChange={(e) => onChange({ markdown: e.target.value })}
        rows={12}
        className="font-mono text-sm"
        placeholder={"## A heading\n\nA paragraph with **bold** and a [link](/pricing)."}
      />
      <p className="text-xs text-muted-foreground">
        Supports Markdown headings, lists, bold/italic, and links. Start headings at H2 — the
        block above your content usually provides the page&apos;s H1.
      </p>
    </div>
  );
}
