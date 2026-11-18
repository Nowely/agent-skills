import { esc, prose } from "./text.mjs";

// References are resolved only against the record; external places remain text.
export function sourceOf(source, review) {
  if (source?.ref !== undefined) {
    const m = /^\/([A-Za-z_]+)\/(\d+)$/.exec(String(source.ref));
    if (!m) return { text: String(source.ref) };
    const [, field, at] = m, index = +at, item = Array.isArray(review[field]) ? review[field][index] : undefined;
    const anchors = { requirements: "#requirements", findings: `#f${item?.id}`, questions: `#q${index + 1}`, blocks: `#b${index + 1}`,
      mechanisms: `#m${index + 1}`, ideas: `#i${index + 1}`, checks: "#checks", scenarios: "#scenarios", screens: "#screens",
      challenges: "#challenges", units: "#structure", target_units: "#structure", tradeoffs: "#tradeoffs", coverageStructured: "#coverage" };
    const names = { requirements: `R${item?.id}`, findings: `F${item?.id}`, questions: `Q${index + 1}`, blocks: `B${index + 1}`, mechanisms: `M${index + 1}` };
    const anchor = anchors[field] && (item !== undefined || !["requirements", "findings"].includes(field)) ? anchors[field] : undefined;
    return { text: names[field] ?? `${field} ${index + 1}`, anchor };
  }
  if (source?.at !== undefined) return { text: [source.at, source.revision && `@ ${source.revision}`, source.quote && `“${source.quote}”`].filter(Boolean).join(" ") };
  return { text: "" };
}

// Compare the complete ordered JSON data, not the rendered source text.
export function commonClaimSources(list) {
  if (!Array.isArray(list) || list.length < 2 || !Array.isArray(list[0]?.sources) || !list[0].sources.length
    || !list[0].sources.every((source) => source && typeof source === "object" && !Array.isArray(source))) return null;
  try {
    const first = JSON.stringify(list[0].sources);
    return list.every((claim) => Array.isArray(claim?.sources) && JSON.stringify(claim.sources) === first) ? list[0].sources : null;
  } catch {
    return null;
  }
}

export function srcHtml(sources, review, t, questionId) {
  return (sources ?? []).map((s) => {
    const { text, anchor } = sourceOf(s, review);
    const label = s.ref !== undefined ? (questionId && s.ref === `/questions/${questionId - 1}` ? "source.self" : "source.internal") : s.quote ? "source.quoted" : "source.mention";
    return `${esc(t(label))}: ${anchor ? `<a href="${esc(anchor)}">${esc(text)}</a>` : esc(text)}`;
  }).filter(Boolean).join(", ");
}

export function claimsHtml(list, review, t, questionId, field = "claims") {
  const shared = commonClaimSources(list);
  const items = list.map((claim, index) => {
    const sources = !shared && claim.sources?.length ? ` <span class="sub" data-ann-field="${esc(field)}.${index}.sources">(${srcHtml(claim.sources, review, t, questionId)})</span>` : "";
    return `<li><span data-ann-field="${esc(field)}.${index}.text">${prose(claim.text)}</span>${sources}</li>`;
  }).join("");
  const sources = shared ? `<span class="sub" data-ann-field="${esc(field)}.sources">${esc(t("source.each"))}: ${srcHtml(shared, review, t, questionId)}</span>` : "";
  return `<ul class="plain">${items}</ul>${sources}`;
}
