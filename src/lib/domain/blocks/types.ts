import type { ComponentType } from "react";
import type { z } from "zod";
import type { PermissionKey } from "@/lib/domain/rbac";
import type { BlockIssue } from "./shared-schemas";

export type HeadingNode = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

/**
 * One block type = one entry here. Render components are pure/presentational
 * (config + optional pre-fetched `data` in, JSX out) — deliberately never
 * doing their own data access, so this module (imported by both the public
 * page renderer and the client-side admin editor) never pulls a
 * `server-only`-marked dependency into the editor's client bundle. Where a
 * block needs real data (Blog Grid), the fetch happens in
 * `render-page-blocks.tsx`, which is server-only and never imported by the
 * editor. See docs/architecture/03-cms.md.
 */
export type BlockDefinition<Config, Data = undefined> = {
  key: string;
  label: string;
  category: "layout" | "content" | "commerce-display" | "advanced";
  configSchema: z.ZodType<Config>;
  defaultConfig: Config;
  Editor: ComponentType<{ config: Config; onChange: (config: Config) => void }>;
  Render: ComponentType<{ config: Config; data?: Data }>;
  requiresPermission?: PermissionKey;
  getHeadingOutline?: (config: Config) => HeadingNode[];
  getIssues?: (config: Config) => BlockIssue[];
  /**
   * Pure — returns a plain JSON-LD object or null, never touches
   * request-scoped APIs. Safe in both bundles for the same reason
   * getHeadingOutline is; render-page-blocks.tsx (server-only) is what
   * wraps the result in a nonce'd <script> tag, so no block's Render
   * component needs its own server-only dependency just to emit structured
   * data. See docs/architecture/03-cms.md.
   */
  getJsonLd?: (config: Config) => object | null;
};

// Type-erased view used by the registry map/heading validator, which handle
// many different Config types uniformly and don't need to know which one.
export type AnyBlockDefinition = BlockDefinition<unknown, unknown>;
