import { z } from "zod";

/**
 * Denormalized media reference: the fields a block actually needs to render
 * (url/alt/dimensions), copied into the block's config JSON when an editor
 * picks an image, rather than a bare id Render would need to re-fetch.
 * Two deliberate consequences, both wanted: (1) Render components never do
 * their own data access (see types.ts), and (2) a block's rendered output
 * stays exactly what publish_page() snapshotted even if the underlying
 * media row's alt text is edited later — consistent with revisions being
 * the actual recoverable history of what was published, not a live join.
 * `mediaId` is kept so the editor can re-open/replace the selection.
 */
export const mediaRefSchema = z.object({
  mediaId: z.string().uuid().nullable(),
  url: z.string(),
  alt: z.string(),
  isDecorative: z.boolean().default(false),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export type MediaRef = z.infer<typeof mediaRefSchema>;

export const emptyMediaRef: MediaRef = {
  mediaId: null,
  url: "",
  alt: "",
  isDecorative: false,
  width: null,
  height: null,
};

/** A block-level validation error surfaced in the editor/SEO panel and,
 * for `blocking: true`, disabling Publish — see docs/architecture/03-cms.md. */
export type BlockIssue = { blocking: boolean; message: string };

export function validateMediaRef(ref: MediaRef, fieldLabel: string): BlockIssue[] {
  if (!ref.url) return [];
  if (!ref.isDecorative && ref.alt.trim().length === 0) {
    return [{ blocking: true, message: `${fieldLabel}: missing alt text (or mark it decorative).` }];
  }
  return [];
}
