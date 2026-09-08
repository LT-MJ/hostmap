import { blockRegistry } from "./registry";
import type { HeadingNode } from "./types";
import type { BlockIssue } from "./shared-schemas";

export type ContentIssue = BlockIssue & { code?: string };

type BlockLike = { block_type: string; config: unknown };

/**
 * §28/§90: exactly one H1 per page is a hard requirement, not a suggestion
 * — this is the only heading rule that blocks Publish. Skipped levels are
 * a warning. See docs/architecture/03-cms.md.
 */
export function validateHeadings(blocks: BlockLike[]): ContentIssue[] {
  const outline: HeadingNode[] = [];
  for (const block of blocks) {
    const def = blockRegistry[block.block_type];
    if (def?.getHeadingOutline) outline.push(...def.getHeadingOutline(block.config));
  }

  const issues: ContentIssue[] = [];
  const h1Count = outline.filter((h) => h.level === 1).length;
  if (h1Count === 0) {
    issues.push({ blocking: true, code: "missing_h1", message: "This page has no H1 — add one (usually the Hero block)." });
  } else if (h1Count > 1) {
    issues.push({ blocking: true, code: "multiple_h1", message: `This page has ${h1Count} H1 headings — only one is allowed.` });
  }

  for (let i = 1; i < outline.length; i++) {
    const prev = outline[i - 1].level;
    const curr = outline[i].level;
    if (curr > prev + 1) {
      issues.push({
        blocking: false,
        code: "skipped_level",
        message: `Heading jumps from H${prev} to H${curr} ("${outline[i].text}") — consider an H${prev + 1} in between.`,
      });
    }
  }

  return issues;
}

/** Per-block issues (missing alt text, etc.) — see each block's getIssues(). */
export function validateBlockIssues(blocks: BlockLike[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const block of blocks) {
    const def = blockRegistry[block.block_type];
    if (def?.getIssues) issues.push(...def.getIssues(block.config));
  }
  return issues;
}

export function validateContent(blocks: BlockLike[]): ContentIssue[] {
  return [...validateHeadings(blocks), ...validateBlockIssues(blocks)];
}

export function hasBlockingIssues(issues: ContentIssue[]): boolean {
  return issues.some((issue) => issue.blocking);
}
