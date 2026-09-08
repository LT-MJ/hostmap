import { remark } from "remark";
import { visit } from "unist-util-visit";
import type { Heading, Root, PhrasingContent } from "mdast";
import type { HeadingNode } from "./types";

function flattenText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if ("value" in node && typeof node.value === "string") return node.value;
      if ("children" in node && Array.isArray(node.children)) {
        return flattenText(node.children as PhrasingContent[]);
      }
      return "";
    })
    .join("");
}

/**
 * Parses Markdown to a real AST and pulls out its heading structure — this
 * is the whole reason Rich Text blocks store Markdown instead of an HTML
 * blob (see docs/architecture/03-cms.md): heading validation inspects
 * actual heading nodes, not a regex over rendered markup.
 */
export function extractHeadings(markdown: string): HeadingNode[] {
  const tree = remark().parse(markdown) as Root;
  const headings: HeadingNode[] = [];
  visit(tree, "heading", (node: Heading) => {
    headings.push({
      level: node.depth as HeadingNode["level"],
      text: flattenText(node.children),
    });
  });
  return headings;
}
