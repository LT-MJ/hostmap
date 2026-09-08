/**
 * Safely serializes a JSON-LD object for a <script type="application/ld+json">
 * tag. Escaping `<` prevents a value containing `</script>` (or any other
 * tag) from breaking out of the script element — the JSON-LD equivalent of
 * the "escape structured-data values correctly" requirement in the spec's
 * SEO section. Never build this string by concatenation.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
