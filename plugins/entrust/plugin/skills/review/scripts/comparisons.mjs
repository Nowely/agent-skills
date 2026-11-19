// Source facts for the independent reader. Compare only snapshots that agree with the saved patch.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

function optionalModule(name, require) {
  let id;
  try { id = require.resolve(name); }
  catch (e) { if (e.code === "MODULE_NOT_FOUND") return undefined; throw e; }
  return require(id);
}

function snapshot(root, file, side) {
  if ((side === "base" && file.status === "A") || (side === "head" && file.status === "D")) return "";
  const resolved = fs.realpathSync(path.resolve(root, file.path));
  const relative = path.relative(root, resolved);
  if (relative.startsWith(".." + path.sep) || relative === ".." || path.isAbsolute(relative))
    throw new Error("source is outside the supplied root");
  const content = fs.readFileSync(resolved, "utf8");
  const lines = content.split("\n");
  for (const hunk of file.hunks) for (const entry of hunk) {
    const n = side === "base" ? entry.old : entry.new;
    if (n !== undefined && lines[n - 1]?.replace(/\r$/, "") !== entry.text.replace(/\r$/, ""))
      throw new Error(side + ":" + n + " differs from the saved patch");
  }
  return content;
}

function witness(side, line, value) {
  return { side, line, value };
}
function add(rows, file, stage, property, left, right, contrast) {
  const identity = JSON.stringify([file, stage, property, left, right]);
  const key = createHash("sha256").update(identity).digest("hex").slice(0, 20);
  if (!rows.has(key)) rows.set(key, { key, stage, file, property, left, right, ...(contrast && { contrast }) });
}

// Every two-sided run remains available on languages with no parser. One-sided edits need a peer supplied by the reviewer.
function patchPairs(file, rows) {
  for (const hunk of file.hunks) {
    let removed = [], added = [];
    function flush() {
      if (removed.length && added.length) {
        const excerpt = (range) => range.slice(0, 3).map(l => l.text).join("\n");
        add(rows, file.path, "paths", "replacement in the same hunk",
          witness("base", removed[0].old, excerpt(removed)), witness("head", added[0].new, excerpt(added)));
      }
      removed = []; added = [];
    }
    for (const line of hunk) {
      if (line.kind === "ctx") flush();
      else (line.kind === "del" ? removed : added).push(line);
    }
    flush();
  }
}

function cssScopes(parser, text) {
  const result = new Map();
  parser.parse(text).walkRules(rule => {
    const scope = [];
    for (let p = rule.parent; p && p.type !== "root"; p = p.parent)
      scope.unshift(p.type === "rule" ? p.selector : "@" + p.name + " " + p.params);
    const id = JSON.stringify([...scope, rule.selector]);
    if (!result.has(id)) result.set(id, []);
    result.get(id).push(rule);
  });
  return result;
}
function stylePairs(parser, file, base, head, rows) {
  const prev = cssScopes(parser, base);
  for (const [selector, rules] of cssScopes(parser, head)) {
    const old = prev.get(selector) ?? [];
    if (rules.length > 1 && rules.length !== old.length) {
      const scope = JSON.parse(selector).join(" > ");
      const first = rules[0], last = rules.at(-1);
      const siblings = first.parent.nodes;
      const between = first.parent === last.parent ? siblings.slice(siblings.indexOf(first) + 1, siblings.indexOf(last))
        .filter(n => n.type !== "comment").map(n => (n.selector || n.prop || n.name || n.type) + ":" + n.source.start.line) : null;
      add(rows, file.path, "structure", "number of blocks governing the same scope, and their ordering",
        witness("head", first.source.start.line, scope), witness("head", last.source.start.line, scope),
        { baseOccurrences: old.map(n => n.source.start.line), headOccurrences: rules.map(n => n.source.start.line), interveningSiblings: between });
    }
  }
}

function syntaxPairs(ts, file, base, head, rows) {
  const tree = (text) => ts.createSourceFile(file.path, text, ts.ScriptTarget.Latest, true);
  const before = tree(base), after = tree(head);
  if (before.parseDiagnostics.length || after.parseDiagnostics.length) throw new Error("source has syntax diagnostics");
  const line = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const additions = file.hunks.flat().filter(l => l.kind === "add").map(l => l.new).sort((a, b) => a - b);
  function touchesAdded(start, end) {
    let lo = 0, hi = additions.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (additions[mid] < start) lo = mid + 1;
      else hi = mid;
    }
    return lo < additions.length && additions[lo] <= end;
  }
  const top = (sf) => {
    const declarations = new Map();
    for (const n of sf.statements) {
      const name = n.name?.getText(sf);
      if (!name) continue;
      if (declarations.has(name)) { declarations.set(name, null); continue; }
      const docs = n.jsDoc ?? [];
      declarations.set(name, {
        line: line(sf, n), docLine: docs.length ? line(sf, docs[0]) : line(sf, n),
        kind: ts.SyntaxKind[n.kind], modifiers: (n.modifiers ?? []).map(m => m.getText(sf)).join(" "),
        documentation: docs.map(d => d.getText(sf)).join("\n"),
      });
    }
    return declarations;
  };
  const initial = top(before);
  for (const [name, next] of top(after)) {
    const old = initial.get(name);
    if (!old || !next) continue;
    for (const prop of ["kind", "modifiers", "documentation"]) if (old[prop] !== next[prop]) {
      const at = prop === "documentation" ? "docLine" : "line";
      add(rows, file.path, "structure", name + ": " + prop + " attached to the declaration",
        witness("base", old[at], old[prop] || "(absent)"), witness("head", next[at], next[prop] || "(absent)"),
        { baseForm: old[prop] ? "present" : "absent", headForm: next[prop] ? "present" : "absent", observer: "TypeScript syntax tree" });
    }
  }

  function walk(node, fn) { fn(node); ts.forEachChild(node, child => walk(child, fn)); }
  function groups(sf) {
    const tables = [];
    walk(sf, node => {
      if (!ts.isArrayLiteralExpression(node)) return;
      const objects = node.elements.filter(ts.isObjectLiteralExpression);
      if (objects.length < 2) return;
      let owner = node.parent;
      while (owner && !ts.isVariableDeclaration(owner) && !ts.isPropertyAssignment(owner) && !ts.isFunctionDeclaration(owner)) owner = owner.parent;
      const entries = objects.map(o => {
        const properties = o.properties.filter(ts.isPropertyAssignment);
        const fields = new Map(properties.map(p => [p.name.getText(sf), p.initializer.getText(sf)]));
        const forms = new Map(properties.map(p => {
          const v = p.initializer;
          const expr = ts.isArrowFunction(v) ? v.body : v;
          return [p.name.getText(sf), ts.SyntaxKind[expr.kind]];
        }));
        const literals = new Map(properties.filter(p => ts.isStringLiteral(p.initializer) || ts.isNumericLiteral(p.initializer))
          .map(p => [p.name.getText(sf), p.initializer.getText(sf)]));
        return { line: line(sf, o), end: sf.getLineAndCharacterOfPosition(o.end).line + 1, fields, forms, literals };
      });
      const key = [...entries[0].literals.keys()].find(k => entries.every(e => e.literals.has(k)) && new Set(entries.map(e => e.literals.get(k))).size === entries.length);
      tables.push({ owner: owner?.name?.getText(sf), entries, key });
    });
    return tables;
  }
  const imports = after.statements.filter(ts.isImportDeclaration).filter(n => n.importClause)
    .map(n => n.getText(after));
  const suiteFile = /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file.path);
  walk(after, node => {
    if (suiteFile && ts.isCallExpression(node) && /^describe(?:\.\w+)*$/.test(node.expression.getText(after)) && node.arguments[0])
      add(rows, file.path, "structure", "subject promised by the file and exercised by the suite",
        witness("head", 1, path.basename(file.path)), witness("head", line(after, node), node.arguments[0].getText(after)), { imports });
    if (ts.isConditionalExpression(node)) {
      const left = line(after, node.whenTrue), right = line(after, node.whenFalse);
      const end = after.getLineAndCharacterOfPosition(node.end).line + 1;
      const start = line(after, node);
      if (!touchesAdded(start, end)) return;
      const spans = n => ts.isTemplateExpression(n) ? n.templateSpans.map(s => s.expression.getText(after)) : [];
      const leftInputs = spans(node.whenTrue), rightInputs = spans(node.whenFalse);
      add(rows, file.path, "paths", "result across alternatives for " + node.condition.getText(after),
        witness("head", left, node.whenTrue.getText(after)), witness("head", right, node.whenFalse.getText(after)),
        leftInputs.length && JSON.stringify(leftInputs) === JSON.stringify(rightInputs) ? { sameInterpolatedInputs: leftInputs } : undefined);
    }
  });
  const originals = groups(before);
  const show = o => [...o.fields].map(([k,v]) => k + " = " + v).join(", ");
  for (const group of groups(after)) {
    if (!group.entries.some(e => touchesAdded(e.line, e.end))) continue;
    const matching = originals.filter(g => group.owner && group.key && group.owner === g.owner && group.key === g.key);
    for (const [i, item] of group.entries.entries()) {
      const old = matching.length === 1 && matching[0].entries.find(e => e.literals.get(group.key) === item.literals.get(group.key));
      const peer = group.entries[i === 0 ? 1 : i - 1];
      const differences = Object.create(null);
      for (const [name, form] of item.forms) {
        const peerForms = [...new Set(group.entries.filter(e => e !== item && e.forms.has(name)).map(e => e.forms.get(name)))];
        if ((old && old.forms.get(name) !== form) || (peerForms.length && !peerForms.includes(form))) {
          differences[name] = { base: old ? old.forms.get(name) : undefined, head: form, peers: peerForms };
        }
      }
      add(rows, file.path, "paths", old ? "source of the same record's fields across revisions" : "source of fields in neighbouring records",
        old ? witness("base", old.line, show(old)) : witness("head", peer.line, show(peer)), witness("head", item.line, show(item)),
        Object.keys(differences).length ? { fieldForms: differences } : undefined);
    }
  }
}

export function comparisons(review, files, baseDirectory, headDirectory) {
  const baseRoot = baseDirectory && fs.realpathSync(baseDirectory), headRoot = headDirectory && fs.realpathSync(headDirectory);
  const require = createRequire(path.resolve("package.json"));
  const hasSyntax = name => /\.[cm]?[jt]sx?$/.test(name), hasStyles = name => /\.(?:scss|css)$/.test(name);
  const ts = baseRoot && files.some(f => hasSyntax(f.path)) && optionalModule("typescript", require);
  const scss = baseRoot && files.some(f => hasStyles(f.path)) && optionalModule("postcss-scss", require);
  const rows = new Map(), limits = [];
  for (const file of files) {
    const syntax = hasSyntax(file.path), styles = hasStyles(file.path);
    if ((syntax && ts) || (styles && scss)) {
      try {
        const oldText = snapshot(baseRoot, file, "base"), newText = snapshot(headRoot, file, "head");
        const count = rows.size;
        if (syntax) syntaxPairs(ts, file, oldText, newText, rows);
        else stylePairs(scss, file, oldText, newText, rows);
        if (rows.size === count) limits.push({file: file.path, reason: "No structural pair indexed for this file."});
        continue;
      } catch (e) { limits.push({file: file.path, reason: e.message}); }
    } else {
      limits.push({file: file.path, reason: !baseRoot || !headRoot ? "Snapshots not supplied; using patch replacements." :
        syntax || styles ? "Project parser unavailable; using patch replacements." : "Only patch replacements indexed."});
    }
    patchPairs(file, rows);
  }
  return { diffSha256: review.diff.sha256, comparisons: [...rows.values()], limits };
}

export function comparisonFaults(review, directory) {
  const pass = review.comparisonReview;
  if (pass === undefined) return [];
  const nonempty = v => typeof v === "string" && v.trim() !== "";
  if (!pass || !nonempty(pass.inventory) || path.basename(pass.inventory) !== pass.inventory ||
      [".", ".."].includes(pass.inventory) || !Array.isArray(pass.decisions) || !directory)
    return ["comparisonReview needs an inventory filename beside the record and a list of decisions"];
  let inventory;
  try {
    const bytes = fs.readFileSync(path.join(directory, pass.inventory));
    if (createHash("sha256").update(bytes).digest("hex") !== pass.sha256)
      return ["comparison inventory digest differs from the frozen input"];
    inventory = JSON.parse(bytes);
  } catch (e) { return ["Cannot read comparison inventory: " + e.message]; }
  if (inventory?.diffSha256 !== review.diff?.sha256 || !Array.isArray(inventory?.comparisons))
    return ["comparison inventory needs the saved diff digest and a list of comparisons"];
  const errors = [], issued = new Set(), decided = new Set();
  for (const row of inventory.comparisons) {
    if (!row || !nonempty(row.key) || issued.has(row.key)) {
      errors.push("comparison inventory has a missing or duplicate key");
      continue;
    }
    issued.add(row.key);
    if (!["structure", "paths"].includes(row.stage) || !nonempty(row.file) || !nonempty(row.property))
      errors.push(row.key + ": missing stage, file or comparable property");
    for (const w of [row.left, row.right]) {
      if (!w || !["base", "head"].includes(w.side) || !Number.isSafeInteger(w.line) || w.line < 1 ||
          typeof w.value !== "string" || (w.file !== undefined && !nonempty(w.file)))
        errors.push(row.key + ": each witness needs a revision side, a line and its observed value");
    }
  }
  for (const decision of pass.decisions) {
    const key = decision?.key;
    if (!issued.has(key) || decided.has(key)) errors.push("unknown or duplicate comparison decision: " + key);
    decided.add(key);
    const outcomes = ["ref", "settled", "unchecked"].filter(k => decision && Object.hasOwn(decision, k));
    if (outcomes.length !== 1 || !nonempty(decision[outcomes[0]])) {
      errors.push(key + ": choose one report ref, evidence settling the comparison, or what is unchecked");
    } else if (outcomes[0] === "ref") {
      const match = /^\/(findings|questions|ideas)\/(0|[1-9]\d*)$/.exec(decision.ref);
      if (!match || !Array.isArray(review[match[1]]) || Number(match[2]) >= review[match[1]].length)
        errors.push(key + ": comparison ref does not resolve to an author-facing item: " + decision.ref);
    }
  }
  for (const key of issued) if (!decided.has(key)) errors.push("missing decision for comparison " + key);
  return errors;
}
