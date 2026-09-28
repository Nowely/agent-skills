#!/usr/bin/env node
// Follow-up delivery test for briefs from a kept official eval trace.
import fs from 'node:fs';
import path from 'node:path';
import { command, fail, newOutput, parseOptions, printOrRun, readJson, stagePlugin, validateCases, validateRunOptions, writeCase } from './content.lib.mjs';

function finalText(tracePath) {
  let last = '';
  for (const [i, line] of fs.readFileSync(tracePath, 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { fail(`${tracePath} line ${i + 1}: invalid JSON`); }
    if (event.type === 'result' && typeof event.result === 'string' && event.result.trim()) last = event.result;
    else if (event.type === 'assistant' || event.role === 'assistant') {
      const content = event.message?.content ?? event.content;
      const text = typeof content === 'string' ? content : Array.isArray(content) ? content.filter(b => b.type === 'text').map(b => b.text || '').join('') : '';
      if (text.trim()) last = text;
    }
  }
  if (!last.trim()) fail(`${tracePath}: no final assistant text`);
  return last;
}
try {
  const o = parseOptions(process.argv.slice(2), { '--from': true, '--cases': true, '--run': false,
    '--runs': true, '--judge-model': true, '--model': true, '-j': true, '--out': true });
  if (!o['--from'] || !o['--cases']) fail('--from and --cases are required');
  validateRunOptions(o);
  const source = path.resolve(o['--from']);
  const result = readJson(path.join(source, 'result.json'));
  if (result.schemaVersion !== 1 || result.partial || !Array.isArray(result.cases)) fail('--from/result.json: complete schemaVersion 1 result required');
  const original = validateCases(readJson(path.resolve(o['--cases'])));
  const byId = new Map(original.map(c => [c.id, c]));
  const cases = [];
  for (const scored of result.cases) {
    const match = /^([a-z0-9-]+)::([a-z0-9-]+)::([a-z0-9-]+)::([a-z0-9-]+)$/.exec(scored.name || '');
    if (!match) fail(`result case ${scored.name}: expected staged content case name`);
    const sourceCase = byId.get(match[4]);
    if (!sourceCase) fail(`${match[4]}: missing in case file`);
    if (!sourceCase.recipient) continue;
    if (!Array.isArray(scored.arms?.with) || !scored.arms.with.length) fail(`${match[4]}: no with-arm runs`);
    scored.arms.with.forEach((run, i) => {
      if (!run.tracePath) fail(`${match[4]} run ${i + 1}: missing tracePath; use --keep-temp`);
      const trace = path.isAbsolute(run.tracePath) ? run.tracePath : path.resolve(source, run.tracePath);
      cases.push({ ...sourceCase, id: `${sourceCase.id}-r${i + 1}`, prompt: finalText(trace), history: undefined,
        allowedTools: sourceCase.recipient.allowedTools, graders: sourceCase.recipient.graders, recipient: undefined });
    });
  }
  if (!cases.length) fail('no recipient cases');
  const { stage, plugin, suite } = stagePlugin({ stub: true });
  const out = newOutput(stage, o['--out']);
  for (const c of cases) writeCase(suite, c, { recipient: true, criterionOnly: true });
  printOrRun(plugin, out, command(plugin, out, cases, o), o['--run']);
} catch (error) { console.error(error.message); process.exit(2); }
