import { describe, expect, it } from "vitest";
import { extractHeadings } from "./markdown";

describe("extractHeadings", () => {
  it("extracts heading level and text from Markdown", () => {
    const headings = extractHeadings("# Title\n\nSome text.\n\n## Section one\n\n### Sub-section");
    expect(headings).toEqual([
      { level: 1, text: "Title" },
      { level: 2, text: "Section one" },
      { level: 3, text: "Sub-section" },
    ]);
  });

  it("flattens inline formatting (bold/links) into plain text", () => {
    const headings = extractHeadings("## A **bold** [linked](/x) heading");
    expect(headings).toEqual([{ level: 2, text: "A bold linked heading" }]);
  });

  it("returns an empty array when there are no headings", () => {
    expect(extractHeadings("Just a paragraph, no headings.")).toEqual([]);
  });
});
