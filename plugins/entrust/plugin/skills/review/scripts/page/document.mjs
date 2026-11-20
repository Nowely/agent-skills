// The report as a document: what a reader without JavaScript sees, and what the audit print takes its files and
// details from. It is drawn from the same data the page's runtime gets, in the same words, inside <noscript>
// elements, so a reader with JavaScript never builds it: the summary and every decision card as text
// (#static-report), each file's whole diff with every block's verdict (#code-N, whose rows runtime.js reads), and
// the details (#static-details). Nothing here answers: answering, comments and the export need the runtime.
import { esc, prose } from "../text.mjs";

const block = (text) => {
  let out = "", list = [];
  const flush = () => { if (list.length) { out += `<ul>${list.map((l) => `<li>${prose(l)}</li>`).join("")}</ul>`; list = []; } };
  for (const line of String(text ?? "").split("\n")) {
    if (/^\s*-\s+/.test(line)) list.push(line.replace(/^\s*-\s+/, ""));
    else { flush(); if (line.trim()) out += `<p>${prose(line)}</p>`; }
  }
  flush();
  return out;
};

// `picture(screen, kind)` gives a picture given as a file, as data: the island carries only that it is there.
export function documentOf(data, t, picture) {
  const ids = (prefix, list) => list.map((id) => esc(prefix + id)).join(", ");
  const srcs = (list) => list?.length ? ` <span class="srcs">${esc(t("p.sources"))}: ${list.map((s) => esc(s.text)).join(", ")}</span>` : "";
  const claims = (list) => `<ul>${list.map((c) => `<li>${prose(c.text)}${srcs(c.sources)}</li>`).join("")}</ul>`;
  const def = (label, html) => html ? `<dt>${esc(label)}</dt><dd>${html}</dd>` : "";
  const verdict = (v) => `${esc(t("p.verdict.reviewer"))} <b>${esc(t(`verdict.${v}`).toLowerCase())}</b>`;
  const c = data.counters;

  // ---- the summary
  const reqStatus = (r) => {
    // its state, as review.mjs found it, in words
    const word = `<span class="sstate">${esc(t(`p.req.${r.state}`))}</span>`;
    const main = r.state === "fail" ? `${word}: ${ids("F", r.broken)}` : r.state === "met" ? `${word}, ${esc(t(`evidence.${r.met}`))}` : word;
    return [main, r.not_checked && `${esc(t("p.req.not-checked"))} ${prose(r.not_checked)}`, r.untested.length && `${esc(t("p.req.no-test"))} ${ids("F", r.untested)}`]
      .filter(Boolean).join("<br>");
  };
  const notChecked = [...data.coverageStructured.filter((x) => x.kind === "not_checked").map((x) => `<li>${prose(x.text)}${srcs(x.sources)}</li>`),
    ...data.requirements.filter((r) => r.not_checked).map((r) => `<li>R${esc(r.id)}: ${prose(r.not_checked)}</li>`)];
  const summary = `<section id="summary"><h2>${esc(t("p.tab.summary"))}</h2>
<p class="muted">${esc([t.count("p.count.files", c.files), t("p.count.lines", c.lines.added.toLocaleString(data.language), c.lines.removed.toLocaleString(data.language)), t.count("p.count.blocks", c.blocks)].join(" · "))}</p>
<h3>${esc(t("verdict"))}</h3>${block(data.verdict)}
<h3>${esc(t("recommendation"))}</h3><p>${prose(data.recommendation)}</p>
${data.steps.length ? `<ol>${data.steps.map((s) => `<li>${prose(s.text)}${s.findings.length ? ` (${ids("F", s.findings)})` : ""}</li>`).join("")}</ol>` : ""}
<h3>${esc(t("requirements"))}</h3><table class="stbl"><tr><th>#</th><th>${esc(t("requirement"))}</th><th>${esc(t("status"))}</th><th>${esc(t("p.code"))}</th></tr>
${data.requirements.map((r) => `<tr><td>R${esc(r.id)}</td><td>${prose(r.text)}<div class="muted">${esc(t("source"))}: ${esc(t(`source.${r.source}`))}</div>${r.doubt ? `<div class="muted">${esc(t("p.req.doubt"))}: ${prose(r.doubt)}</div>` : ""}</td><td>${reqStatus(r)}</td><td>${r.blocks.length ? ids("B", r.blocks) : esc(t("p.req.none-linked"))}</td></tr>`).join("\n")}
</table>
<h3>${esc(t("p.limits"))}</h3>${notChecked.length ? `<ul>${notChecked.join("")}</ul>` : ""}${data.coverage ? `<p>${prose(data.coverage)}</p>` : ""}
<h3>${esc(t("change"))}</h3><p>${prose(data.change.goal)}${data.change.why ? ` ${prose(data.change.why)}` : ""}</p><ul>${data.change.parts.map((p) => `<li>${prose(p)}</li>`).join("")}</ul>
<p class="muted">${esc(t("sources"))}: ${data.change.sources.map(prose).join("; ")}</p></section>`;

  // ---- every decision card, as text
  const card = (key, head, body) => `<article class="scard" id="decisions/${esc(key)}"><h4>${head}</h4>${body}</article>`;
  const question = (q) => {
    const variant = (v) => `<li><b>${prose(v.text)}</b>${q.recommendation?.variant === v.id ? ` <i>(${esc(t("p.recommended"))})</i>` : ""}${v.consequences.length ? claims(v.consequences) : ""}</li>`;
    return card(`q${q.id}`, `Q${esc(q.id)} · ${esc(t(`p.type.${q.kind}`))}${q.resolver ? ` · ${esc(q.resolver)}` : ""}`, `<p class="stitle">${prose(q.text)}</p><p class="sat">${esc(q.at)}</p>
${q.parent ? `<p>${esc(t("p.applies-while"))} Q${esc(q.parent.question)} ${esc(t("p.applies-with"))} ${q.parent.texts.map((v) => `<b>${prose(v)}</b>`).join(` ${esc(t("p.or"))} `)}.</p>` : ""}
${q.context.length ? `<h5>${esc(t("question.context"))}</h5>${claims(q.context)}` : ""}
${q.variants.length ? `<h5>${esc(t("question.variants"))}</h5><ol>${q.variants.map(variant).join("")}</ol>` : ""}
${q.recommendation ? `<p><b>${esc(t("p.recommendation"))}</b> ${prose(q.recommendation.text)}${srcs(q.recommendation.sources)}</p>` : ""}
${q.zones.length ? `<h5>${esc(t("question.zones"))}</h5>${claims(q.zones)}` : ""}
${q.remainingEvidence.length ? `<p>${esc(t("p.rel.evidence-kept"))}: ${ids("Q", q.remainingEvidence)}</p>` : ""}
${q.blocks.length ? `<p class="muted">${esc(t("p.code"))}: ${ids("B", q.blocks)}</p>` : ""}`);
  };
  const finding = (f) => card(`f${f.id}`, `F${esc(f.id)} · ${esc(t("p.type.finding"))} · ${esc(t(`direction.${f.direction}`))} · ${esc(t(`evidence.${f.evidence}`))}`,
    `<p class="stitle">${prose(f.title)}</p><p class="sat">${esc(f.at)}</p><p>${prose(f.what)}</p><p><b>${esc(t("p.fix.proposed"))}:</b> ${prose(f.fix)}</p>
<p><b>${esc(t("shown-by"))}:</b> ${prose(f.shown_by)}</p>${f.breaks.length ? `<p>${esc(t("p.rel.breaks"))}: ${ids("R", f.breaks)}</p>` : ""}${f.untested.length ? `<p>${esc(t("p.rel.no-test-for"))}: ${ids("R", f.untested)}</p>` : ""}
${f.blocks.length ? `<p class="muted">${esc(t("p.code"))}: ${ids("B", f.blocks)}</p>` : ""}`);
  const idea = (i) => card(`i${i.id}`, `I${esc(i.id)} · ${esc(t("p.type.idea"))}`, `<p class="stitle">${prose(i.title)}</p>${i.at ? `<p class="sat">${esc(i.at)}</p>` : ""}<p>${prose(i.text)}</p>`);
  const groups = [["p.group.decision", data.questions.filter((q) => q.kind === "decision").map(question)], ["p.group.finding", data.findings.map(finding)],
    ["p.group.idea", data.ideas.map(idea)], ["p.group.fact", data.questions.filter((q) => q.kind !== "decision").map(question)]];
  const decisions = `<section id="decisions"><h2>${esc(t("p.tab.decisions"))}</h2>
${groups.filter(([, cards]) => cards.length).map(([head, cards]) => `<h3>${esc(t(head))}</h3>${cards.join("\n")}`).join("\n")}</section>`;

  // ---- the details
  // a unit's lines under each verdict, as review.mjs counted them
  const shares = (lines) => Object.entries(lines).filter(([, k]) => k).map(([v, k]) => `${t(`verdict.${v}`).toLowerCase()} ${k.toLocaleString(data.language)}`).join(", ");
  const weight = (w) => w && (w.rows.map((row) => `${esc(row.kind)}: ${esc(row.text)}`).join("<br>") || esc(t("weight.unchanged")))
    + (w.shared.length ? `<br>${esc(t.count("p.count.shared", w.shared.length))}` : "");
  const side = (s) => s ? `${esc(t("edit"))}: ${s.edit.map(prose).join("; ") || esc(t("nothing"))}. ${esc(t("read"))}: ${s.read.map(prose).join("; ") || esc(t("nothing"))}.` : esc(t("as-now"));
  const screen = (s, si) => `<h4>${esc(s.name)}</h4>
<p>${esc(t(`p.screen.${s.provenance}`, s.revision))}${s.provenance.startsWith("historical") ? `. ${esc(t("p.screen.historical-note"))}` : ""}</p>${srcs(s.sources)}
${s.pictures.map((p) => p.embedded ? `<figure><figcaption>${esc(t(p.kind))}</figcaption><img data-pic="${si}-${p.kind}" src="${picture(si, p.kind)}" alt="${esc(`${t(p.kind)}: ${s.name}`)}"></figure>` : `<p>${esc(t(p.kind))}: ${esc(p.link)}</p>`).join("")}
${s.match ? `<p>${esc(t("matches"))}</p>` : ""}${s.differences.length ? `<ul>${s.differences.map((d) => `<li>${prose(d.what)}${d.why ? ` — ${prose(d.why)}` : ""}${d.finding ? ` (F${esc(d.finding)})` : ""}</li>`).join("")}</ul>` : ""}
${s.missing ? `<p>${esc(t("not-compared"))}: ${prose(s.missing)}</p>` : ""}`;
  const p = data.passport;
  const details = `<section id="details"><h2>${esc(t("p.tab.details"))}</h2>
<h3>${esc(t("p.details.structure"))}</h3><h4>${esc(t("now"))}</h4>${block(data.now)}<h4>${esc(t("target"))}</h4>${block(data.target)}
${data.units.length ? `<table class="stbl"><tr><th>${esc(t("unit"))}</th><th>${esc(t("jobs"))}</th><th>${esc(t("p.unit.verdict"))}</th><th>${esc(t("p.unit.lines-by"))}</th><th>${esc(t("p.unit.uses-by"))}</th></tr>
${data.units.map((u) => `<tr><td><code>${esc(u.name)}</code></td><td>${u.jobs.map(prose).join("; ")}</td><td>${u.existing ? esc(t("p.unit.existing")) : `${esc(t(`verdict.${u.verdict ?? "keep"}`))}${u.findings.length || u.questions.length ? ` (${[ids("F", u.findings), ids("Q", u.questions)].filter(Boolean).join(", ")})` : ""}${u.reason ? `<br>${prose(u.reason)}` : ""}`}</td><td class="sshares">${esc(shares(u.lines))}</td><td>${esc(u.uses.join(", ") || "—")} · ${esc(data.units.filter((x) => x.uses.includes(u.name)).map((x) => x.name).join(", ") || "—")}</td></tr>`).join("\n")}</table>` : ""}
${data.targetUnits.length ? `<h4>${esc(t("p.units.target"))}</h4><ul>${data.targetUnits.map((u) => `<li><code>${esc(u.name)}</code>: ${u.jobs.map(prose).join("; ")}${u.uses.length ? ` → ${esc(u.uses.join(", "))}` : ""} (${esc(t(u.existing ? "existing" : data.units.some((x) => x.name === u.name && !x.existing) ? "from-change" : "to-write"))})</li>`).join("")}</ul>` : ""}
${data.mechanisms.length ? `<h3>${esc(t("p.details.mechanisms"))}</h3>${data.together ? `<p><b>${esc(t("weight.together"))}</b> (${esc(data.together.names.join(", "))}): ${esc(data.together.rows.map((row) => `${row.kind}: ${row.text}`).join(" · ") || t("weight.unchanged"))}</p>` : ""}${data.mechanisms.map((m) => `<h4>${esc(m.name)} (${esc(t(`change.${m.change}`))})</h4><dl>${def(t("purpose"), prose(m.purpose ?? ""))}${def(t("basis"), prose(m.basis ?? ""))}${def(t("instead"), m.instead && prose(m.instead))}${def(t("benefit"), prose(m.benefit ?? ""))}${def(t("cost"), prose(m.cost ?? ""))}${def(t("decision"), prose(m.decision ?? ""))}${def(t("p.evidence"), esc(t(`evidence.${m.evidence}`)))}${def(t("units"), esc(m.units.join(", ")))}${def(t("findings"), ids("F", m.findings))}${def(t("weight"), weight(m.weight))}${def(t("p.code"), ids("B", m.blocks))}</dl>`).join("")}<p class="muted">${esc(t("weight.note"))}</p>` : ""}
${data.scenarios.length ? `<h3>${esc(t("p.details.scenarios"))}</h3><p class="muted">${esc(t("scenarios-note"))}</p><ol>${data.scenarios.map((s) => `<li>${prose(s.change)}${s.requirements.length ? ` (${ids("R", s.requirements)})` : ""}<br>${esc(t("as-written"))}: ${side(s.now)}<br>${esc(t("target"))}: ${side(s.target)}${s.findings.length ? `<br>${esc(t("findings"))}: ${ids("F", s.findings)}` : ""}</li>`).join("")}</ol>` : ""}
${data.checks.length ? `<h3>${esc(t("p.details.checks"))}</h3><p class="muted">${esc(t("checks-note"))}</p><ol>${data.checks.map((x) => `<li>${x.from ? `${esc(t("from"))}: ${prose(x.from)}<br>` : ""}${esc(t("do"))}: ${x.do.map(prose).join("; ")}<br>${esc(t("expect"))}: ${prose(x.expect)}${x.requirements.length ? ` (${ids("R", x.requirements)})` : ""}</li>`).join("")}</ol>` : ""}
${data.challenges.length ? `<h3>${esc(t("p.details.challenges"))}</h3><p class="muted">${esc(t("challenges-note"))}</p><ol>${data.challenges.map((x) => `<li>${esc(t(`challenger.${x.from}`))}: ${prose(x.point)}<br><b>${esc(t(`outcome.${x.outcome}`))}</b>: ${prose(x.note)}${x.at ? ` (${esc(x.at)})` : ""}</li>`).join("")}</ol>` : ""}
${data.screens.length ? `<h3>${esc(t("p.details.screens"))}</h3>${data.screens.map(screen).join("")}` : ""}
<h3>${esc(t("p.details.coverage"))}</h3>
${data.unasked.assumed.length ? `<p>${esc(t.count("p.warn.assumed", data.unasked.assumed.length))} ${ids("B", data.unasked.assumed)}. ${esc(t("p.warn.do"))}</p>` : ""}${data.unasked.unlinked.length ? `<p>${esc(t.count("p.warn.unlinked", data.unasked.unlinked.length))} ${ids("B", data.unasked.unlinked)}. ${esc(t("p.warn.do"))}</p>` : ""}
${data.coverageStructured.length ? `<ul>${data.coverageStructured.map((x) => `<li><b>${esc(t(x.kind === "not_checked" ? "coverage.not-checked" : `coverage.${x.kind}`))}</b>: ${prose(x.text)}${x.revision ? ` (${esc(t("p.coverage.at", x.revision))})` : ""}${srcs(x.sources)}</li>`).join("")}</ul>` : ""}
${block(data.coverage)}${data.tradeoffs.length ? `<h4>${esc(t("tradeoffs"))}</h4><ul>${data.tradeoffs.map((x) => `<li>${prose(x.text)} ${esc(t("tradeoff.consequence"))}: ${prose(x.consequence)}${srcs(x.sources)}</li>`).join("")}</ul>` : ""}
<h3>${esc(t("p.details.report"))}</h3><dl>${def(t("p.scope"), prose(data.range))}${p ? def(t("p.report.repository"), esc(p.repository ?? "")) + def(t("p.report.base-head"), `${esc(p.base ?? "")} → ${esc(p.head ?? "")}`) + def(t("passport.reviewed-at"), esc(p.reviewedAt ?? "")) + (p.links ?? []).map((l) => def(l.kind, `${esc(l.label)}: ${esc(l.url)}`)).join("") : ""}${def(t("p.report.diff"), `${esc(data.digest.diffFile)} · sha256 ${esc(data.digest.diff)}`)}${def(t("passport.record"), `sha256 ${esc(data.digest.record)}`)}</dl></section>`;

  return {
    report: `<noscript id="static-report"><div class="static"><header><p class="muted">${esc(t("kind"))}</p><h1>${esc(data.title)}</h1><p class="static-note">${esc(t("p.static.note"))}</p>
<nav><a href="#summary">${esc(t("p.tab.summary"))}</a> · <a href="#decisions">${esc(t("p.tab.decisions"))}</a> · <a href="#code">${esc(t("p.tab.code"))}</a> · <a href="#details">${esc(t("p.tab.details"))}</a></nav></header>
${summary}
${decisions}
<h2 id="code">${esc(t("p.tab.code"))}</h2></div></noscript>`,
    details: `<noscript id="static-details"><div class="static">${details}</div></noscript>`,
    // The line before a block's first row, and before a row where it resumes after other code: its verdict and what it does.
    blockLine: (b, resumed) => resumed ? `<tr class="bn v-${b.verdict}"><td colspan="3">${esc(t("p.continues", `B${b.id}`))}</td></tr>`
      : `<tr class="bn v-${b.verdict}" id="code/b${b.id}"><td colspan="3"><b>B${b.id}</b> ${verdict(b.verdict)}${b.does ? ` · ${prose(b.does)}` : ""} · ${b.serves.length ? `${esc(t("serves"))} ${ids("R", b.serves)}` : esc(t("serves-nothing"))}${b.findings.length || b.questions.length ? ` · ${[ids("F", b.findings), ids("Q", b.questions)].filter(Boolean).join(", ")}` : ""}</td></tr>`,
  };
}
