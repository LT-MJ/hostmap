import { describe, expect, it } from "vitest";
import { mediaRefSchema, emptyMediaRef, validateMediaRef } from "./shared-schemas";

describe("mediaRefSchema", () => {
  it("accepts the empty/unset media reference", () => {
    expect(mediaRefSchema.safeParse(emptyMediaRef).success).toBe(true);
  });

  it("rejects a non-uuid mediaId", () => {
    const result = mediaRefSchema.safeParse({ ...emptyMediaRef, mediaId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("validateMediaRef", () => {
  it("reports no issue when no image is selected", () => {
    expect(validateMediaRef(emptyMediaRef, "Test image")).toEqual([]);
  });

  it("blocks when an image is selected but has no alt text and isn't decorative", () => {
    const issues = validateMediaRef({ ...emptyMediaRef, url: "https://example.com/a.jpg" }, "Test image");
    expect(issues).toHaveLength(1);
    expect(issues[0].blocking).toBe(true);
  });

  it("allows a decorative image with empty alt text", () => {
    const issues = validateMediaRef(
      { ...emptyMediaRef, url: "https://example.com/a.jpg", isDecorative: true },
      "Test image",
    );
    expect(issues).toEqual([]);
  });
});
