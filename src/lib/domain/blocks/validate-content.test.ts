import { describe, expect, it } from "vitest";
import { validateHeadings, validateContent, hasBlockingIssues } from "./validate-content";

function heroBlock(headline: string) {
  return { block_type: "hero", config: { headline, subheadline: "", alignment: "center" as const, primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "", background: { mediaId: null, url: "", alt: "", isDecorative: false, width: null, height: null } } };
}

function richTextBlock(markdown: string) {
  return { block_type: "rich_text", config: { markdown } };
}

describe("validateHeadings", () => {
  it("blocks publish when there is no H1", () => {
    const issues = validateHeadings([richTextBlock("## Just a subheading")]);
    expect(issues.some((i) => i.code === "missing_h1" && i.blocking)).toBe(true);
  });

  it("blocks publish when there are multiple H1s", () => {
    const issues = validateHeadings([heroBlock("First"), richTextBlock("# Second H1")]);
    expect(issues.some((i) => i.code === "multiple_h1" && i.blocking)).toBe(true);
  });

  it("passes with exactly one H1 and correctly nested headings", () => {
    const issues = validateHeadings([heroBlock("Welcome"), richTextBlock("## A section\n\n### A subsection")]);
    expect(hasBlockingIssues(issues)).toBe(false);
  });

  it("warns (but does not block) on a skipped heading level", () => {
    const issues = validateHeadings([heroBlock("Welcome"), richTextBlock("#### Jumped straight to H4")]);
    expect(issues.some((i) => i.code === "skipped_level" && !i.blocking)).toBe(true);
    expect(hasBlockingIssues(issues)).toBe(false);
  });
});

describe("validateContent — image alt text", () => {
  it("blocks publish when an Image block has no alt text and isn't marked decorative", () => {
    const issues = validateContent([
      heroBlock("Welcome"),
      {
        block_type: "image",
        config: { image: { mediaId: "x", url: "https://example.com/a.jpg", alt: "", isDecorative: false, width: 100, height: 100 }, caption: "" },
      },
    ]);
    expect(hasBlockingIssues(issues)).toBe(true);
  });

  it("allows publish when the image is explicitly marked decorative", () => {
    const issues = validateContent([
      heroBlock("Welcome"),
      {
        block_type: "image",
        config: { image: { mediaId: "x", url: "https://example.com/a.jpg", alt: "", isDecorative: true, width: 100, height: 100 }, caption: "" },
      },
    ]);
    expect(hasBlockingIssues(issues)).toBe(false);
  });
});
