/**
 * Remove JSON-LD schema blocks from markdown body content.
 *
 * Uploaded .md files carry their schema as a fenced block. Anything the
 * upload parser doesn't extract stays in the body, and react-markdown then
 * renders it as a visible code block on the live page. Schema is emitted
 * separately as <script type="application/ld+json">, so no copy belongs in
 * the body.
 *
 * Matches, whatever the fence language (json, html, none) or count:
 *   - fenced blocks containing "@context" or application/ld+json
 *   - bare <script type="application/ld+json">…</script> tags
 */
const SCHEMA_MARKER = /"@context"|application\/ld\+json/i;

export function stripSchemaBlocks(md: string): string {
  return md
    .replace(/\r\n?/g, '\n')
    .replace(/(^|\n)[ \t]*(`{3,}|~{3,})[^\n]*\n([\s\S]*?)\n[ \t]*\2[ \t]*(?=\n|$)/g, (m, lead, _fence, inner) =>
      SCHEMA_MARKER.test(inner) ? lead : m,
    )
    .replace(/<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
