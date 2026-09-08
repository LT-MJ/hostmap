import "server-only";

import type { ReactElement } from "react";
import { blockRegistry } from "./registry";
import { getPublishedPostsForGrid } from "@/lib/domain/blog";
import type { Config as BlogGridConfig } from "./definitions/blog-grid/Render";

type BlockRecord = { id?: string; block_type: string; config: unknown; is_hidden?: boolean };

/**
 * Server-only rendering orchestrator for an ordered block list (a page's
 * published snapshot, or a blog post's). Never imported by the admin
 * editor bundle — that's what keeps every block's Render component free to
 * stay pure/presentational (see types.ts) while still allowing the one
 * block that needs live data (Blog Grid) to get it, resolved here rather
 * than inside the component itself.
 */
export async function renderPageBlocks(blocks: BlockRecord[]) {
  const visible = blocks.filter((b) => !b.is_hidden);
  const rendered = await Promise.all(
    visible.map(async (block, index) => {
      const def = blockRegistry[block.block_type];
      if (!def) return null;
      const Render = def.Render;

      let data: unknown;
      if (block.block_type === "blog_grid") {
        data = await getPublishedPostsForGrid(block.config as BlogGridConfig);
      }

      return <Render key={block.id ?? index} config={block.config} data={data} />;
    }),
  );
  return rendered.filter((el): el is ReactElement => el !== null);
}
