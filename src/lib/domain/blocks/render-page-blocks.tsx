import "server-only";

import { Fragment, type ReactElement } from "react";
import { blockRegistry } from "./registry";
import { getPublishedPostsForGrid } from "@/lib/domain/blog";
import { getNonce } from "@/lib/domain/seo/nonce";
import { toJsonLd } from "@/lib/domain/seo/json-ld";
import type { Config as BlogGridConfig } from "./definitions/blog-grid/Render";

type BlockRecord = { id?: string; block_type: string; config: unknown; is_hidden?: boolean };

/**
 * Server-only rendering orchestrator for an ordered block list (a page's
 * published snapshot, or a blog post's). Never imported by the admin
 * editor bundle — that's what keeps every block's Render component free to
 * stay pure/presentational (see types.ts): the one block needing live data
 * (Blog Grid) gets it resolved here, and any block emitting JSON-LD
 * (getJsonLd, pure) gets it wrapped in a nonce'd <script> here too, rather
 * than each Render component reaching for request-scoped headers() itself
 * — that dependency is exactly what would leak into the client editor
 * bundle through the shared registry, as it briefly did during development.
 */
export async function renderPageBlocks(blocks: BlockRecord[]) {
  const visible = blocks.filter((b) => !b.is_hidden);
  const nonce = await getNonce();

  const rendered = await Promise.all(
    visible.map(async (block, index) => {
      const def = blockRegistry[block.block_type];
      if (!def) return null;
      const Render = def.Render;
      const key = block.id ?? index;

      let data: unknown;
      if (block.block_type === "blog_grid") {
        data = await getPublishedPostsForGrid(block.config as BlogGridConfig);
      }

      const jsonLd = def.getJsonLd?.(block.config);

      return (
        <Fragment key={key}>
          {jsonLd && <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />}
          <Render config={block.config} data={data} />
        </Fragment>
      );
    }),
  );
  return rendered.filter((el): el is ReactElement => el !== null);
}
