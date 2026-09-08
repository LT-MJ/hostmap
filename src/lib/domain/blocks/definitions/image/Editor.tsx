"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/media-picker";
import type { Config } from "./Render";

export default function Editor({
  config,
  onChange,
}: {
  config: Config;
  onChange: (config: Config) => void;
}) {
  return (
    <div className="space-y-4">
      <MediaPicker value={config.image} onChange={(image) => onChange({ ...config, image })} />
      <div className="space-y-1.5">
        <Label>Caption (optional)</Label>
        <Input value={config.caption} onChange={(e) => onChange({ ...config, caption: e.target.value })} />
      </div>
    </div>
  );
}
