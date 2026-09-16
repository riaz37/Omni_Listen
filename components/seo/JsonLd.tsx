/**
 * Serializes a value into a JSON-LD block. Server component, so nothing here
 * reaches the client bundle beyond the emitted markup.
 *
 * Why the escaping matters: schema values come from the i18n dictionaries, and
 * a `<script>` element has no entity decoding, so the only defence against a
 * string breaking out of it is to stop the dangerous characters ever appearing
 * literally. `</script` would close the element early and let the remainder
 * parse as HTML; `<!--` can flip the parser into script-comment state and
 * swallow the rest of the document. Escaping `<`, `>` and `&` to their \u
 * forms removes both, and JSON-LD parsers decode them back, so the data that
 * reaches a consumer is unchanged.
 *
 * This is why dangerouslySetInnerHTML is the right tool here rather than a
 * sanitizer: the payload is script content, not HTML, so there are no tags or
 * attributes for something like DOMPurify to clean. Serialize and escape.
 */
const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
};

export function serializeJsonLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/[<>&]/g, (char) => ESCAPES[char]);
}

export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
