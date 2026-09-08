import { z } from "zod";

export const configSchema = z.object({
  html: z.string().default(""),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = { html: "" };

/**
 * Deliberately not sanitized — sanitizing would defeat this block's entire
 * purpose. The trust boundary is "who can add/edit this block" (gated by
 * the `pages.custom_html` permission, enforced by RLS on page_blocks, not
 * by this component), the same trust level as editing a template file.
 * See docs/architecture/03-cms.md#custom-html-trust-model.
 */
export default function Render({ config }: { config: Config }) {
  if (!config.html) return null;
  return <div dangerouslySetInnerHTML={{ __html: config.html }} />;
}
