#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function fail(message) { throw new Error(message); }
function read(file) {
  const x = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (x.schemaVersion !== 1 || !Array.isArray(x.cases)) fail(`${file}: expected schemaVersion 1 result with cases`);
  if (x.partial) fail(`${file}: partial result (${x.partialReason || 'unknown'})`);
  return x;
}
const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
function binomial(n, k) { let v = 1; for (let i = 1; i <= k; i++) v = v * (n - i + 1) / i; return v; }
function signTest(positive, negative) {
  const n = positive + negative;
  if (!n) return { positive, negative, ties: null, pTwoSided: 1 };
  let tail = 0;
  for (let i = 0; i <= Math.min(positive, negative); i++) tail += binomial(n, i) / 2 ** n;
  return { positive, negative, pTwoSided: Math.min(1, 2 * tail) };
}
function label(c) { return c.name; }
function tags(c) {
  const t = c.tags || [];
  const encoded = /^([a-z0-9-]+)::([a-z0-9-]+)::([a-z0-9-]+)::([a-z0-9-]+)$/.exec(c.name || '');
  return { candidate: t[0] || encoded?.[1] || 'unknown', stratum: t[2] || encoded?.[3] || 'unknown' };
}
function runs(c, arm, side) {
  const r = c.arms?.[arm];
  if (!Array.isArray(r) || !r.length) fail(`${side}/${label(c)}: missing ${arm} arm`);
  for (const [i, run] of r.entries()) if (typeof run.score !== 'number' || !Array.isArray(run.graders) || run.skippedPaidGraders) fail(`${side}/${label(c)} run ${i}: invalid or skipped judge result`);
  return r;
}
function stats(r) {
  const names = [...new Set(r.flatMap(run => run.graders.map(g => g.name)))];
  const graders = Object.fromEntries(names.map(name => {
    const verdicts = r.flatMap(run => run.graders.filter(g => g.name === name));
    return [name, { passes: verdicts.filter(g => g.passed === true).length, runs: verdicts.length }];
  }));
  const outcomeScores = r.map(run => {
    if (run.aborted) return 0;
    const scored = run.graders.filter(g => g.name !== 'clarity_loaded' && g.scored !== false);
    if (!scored.length) fail('run has no scored outcome graders');
    return scored.reduce((sum, g) => sum + (g.passed ? (g.weight ?? 1) : 0), 0) /
      scored.reduce((sum, g) => sum + (g.weight ?? 1), 0);
  });
  return { mean: mean(outcomeScores), runs: r.length, graders };
}
function format(n) { return n === null ? 'unknown' : n.toFixed(3); }
function compare(a, b, armA, armB) {
  const bm = new Map(b.cases.map(c => [label(c), c]));
  if (bm.size !== b.cases.length) fail('duplicate case in B');
  const cases = a.cases.map(c => {
    const other = bm.get(label(c));
    if (!other) fail(`${label(c)}: missing from B`);
    const x = stats(runs(c, armA, 'A'));
    const y = stats(runs(other, armB, 'B'));
    const names = [...new Set([...Object.keys(x.graders), ...Object.keys(y.graders)])];
    const graders = Object.fromEntries(names.filter(n => n !== 'clarity_loaded').map(n => [n, { a: x.graders[n] || null, b: y.graders[n] || null }]));
    return { name: label(c), ...tags(c), a: x.mean, b: y.mean, delta: x.mean - y.mean, runsA: x.runs, runsB: y.runs,
      graders, clarity_loaded: { a: x.graders.clarity_loaded || null, b: y.graders.clarity_loaded || null } };
  });
  if (cases.length !== b.cases.length) fail('A and B have different case sets');
  const group = key => Object.fromEntries([...new Set(cases.map(c => c[key]))].map(v => {
    const subset = cases.filter(c => c[key] === v);
    return [v, { cases: subset.length, a: mean(subset.map(c => c.a)), b: mean(subset.map(c => c.b)), delta: mean(subset.map(c => c.delta)) }];
  }));
  const positive = cases.filter(c => c.delta > 0).length;
  const negative = cases.filter(c => c.delta < 0).length;
  return { arms: [armA, armB], cases, totals: { candidate: group('candidate'), stratum: group('stratum') }, signTest: { ...signTest(positive, negative), ties: cases.length - positive - negative } };
}
function table(result) {
  const lines = ['| Case | Candidate | Stratum | A mean | B mean | Δ | Outcome graders A/B | Clarity loaded A/B |', '|---|---|---|---:|---:|---:|---|---|'];
  for (const c of result.cases) {
    const graders = Object.entries(c.graders).map(([n, s]) => `${n} ${s.a ? `${s.a.passes}/${s.a.runs}` : 'unknown'}/${s.b ? `${s.b.passes}/${s.b.runs}` : 'unknown'}`).join('<br>');
    const cl = c.clarity_loaded;
    lines.push(`| ${c.name} | ${c.candidate} | ${c.stratum} | ${format(c.a)} | ${format(c.b)} | ${format(c.delta)} | ${graders} | ${cl.a ? `${cl.a.passes}/${cl.a.runs}` : 'unknown'} / ${cl.b ? `${cl.b.passes}/${cl.b.runs}` : 'unknown'} |`);
  }
  for (const [kind, groups] of Object.entries(result.totals)) {
    lines.push('', `| ${kind} | Cases | A mean | B mean | Δ |`, '|---|---:|---:|---:|---:|');
    for (const [name, s] of Object.entries(groups)) lines.push(`| ${name} | ${s.cases} | ${format(s.a)} | ${format(s.b)} | ${format(s.delta)} |`);
  }
  const s = result.signTest;
  lines.push('', `Exact two-sided sign test: ${s.positive} positive, ${s.negative} negative, ${s.ties} ties; p = ${format(s.pTwoSided)}.`);
  return lines.join('\n');
}
try {
  const args = process.argv.slice(2);
  const o = { files: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--arms' || args[i] === '--json') { if (!args[i + 1]) fail(`${args[i]} missing value`); o[args[i]] = args[++i]; }
    else if (args[i].startsWith('-')) fail(`unknown option ${args[i]}`);
    else o.files.push(args[i]);
  }
  if (![1, 2].includes(o.files.length)) fail('usage: content.compare.mjs A.json [B.json] [--arms with,without] [--json FILE]');
  if (o['--arms'] && o['--arms'] !== 'with,without') fail('--arms must be with,without');
  if (o.files.length === 1 && !o['--arms']) fail('one file requires --arms with,without');
  const a = read(o.files[0]);
  const b = o.files[1] ? read(o.files[1]) : a;
  const result = compare(a, b, 'with', o['--arms'] ? 'without' : 'with');
  console.log(table(result));
  if (o['--json']) fs.writeFileSync(path.resolve(o['--json']), JSON.stringify(result, null, 2) + '\n');
} catch (error) { console.error(error.message); process.exit(2); }
