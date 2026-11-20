// A source as text: an internal ref by the name the report gives its item, resolved only against the record; an
// external place with its revision and quote.
export function sourceOf(source, review) {
  if (source?.ref !== undefined) {
    const m = /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(source.ref));
    if (!m) return { text: String(source.ref) };
    const [, field, at] = m, index = +at, item = Array.isArray(review[field]) ? review[field][index] : undefined;
    const names = { requirements: `R${item?.id}`, findings: `F${item?.id}`, questions: `Q${index + 1}`, blocks: `B${index + 1}`, mechanisms: `M${index + 1}` };
    return { text: names[field] ?? `${field} ${index + 1}` };
  }
  if (source?.at !== undefined) return { text: [source.at, source.revision && `@ ${source.revision}`, source.quote && `“${source.quote}”`].filter(Boolean).join(" ") };
  return { text: "" };
}
