#!/usr/bin/env node
// Offline checks only: never invokes claude.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const temp = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'terse-content-selftest-'));
const casesFile = path.join(dir, 'content/examples/smoke.json');
const variant = path.join(dir, 'content/variants/noop.json');
const smoke = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
function run(script, args, cwd = dir) {
  const r = spawnSync(process.execPath, [path.join(dir, script), ...args], { cwd, encoding: 'utf8' });
  if (r.error) throw r.error;
  return r;
}
function stage(args = []) {
  const r = run('content.official.mjs', ['--cases', casesFile, '--variant', variant, ...args]);
  assert.equal(r.status, 0, r.stderr); checks++;
  const plugin = /^Staged official eval: (.+)$/m.exec(r.stdout)?.[1];
  check(plugin && fs.existsSync(plugin), 'staged plugin path');
  check(r.stdout.includes("'claude' 'plugin' 'eval'"), 'printed command');
  return plugin;
}
const plugin = stage();
const suite = path.join(plugin, 'evals/content');
check(fs.readFileSync(path.join(plugin, 'skills/clarity/SKILL.md'), 'utf8').includes('Use fewer words per thought'), 'variant edit applied');
const fixture = path.join(suite, 'fixture-fact');
const history = path.join(suite, 'history-followup');
for (const caseDir of [fixture, history]) for (const name of ['case.yaml', 'prompt.md', 'graders/clarity_loaded.md']) check(fs.existsSync(path.join(caseDir, name)), `${caseDir}/${name}`);
const yaml = fs.readFileSync(path.join(fixture, 'case.yaml'), 'utf8');
check(yaml.includes('schema_version: "1.1"') && yaml.includes('scaffold_script: fixture.sh') && yaml.includes('max_turns: 15'), 'case schema');
const grader = fs.readFileSync(path.join(fixture, 'graders/port-answer.md'), 'utf8');
check(grader.startsWith('---\ntype: llm\nfocus: last_message\n---\n'), 'llm frontmatter');
check(grader.indexOf('## Answer key') > grader.indexOf('FAIL if'), 'answer key follows rubric');
check(grader.includes(smoke[0].key), 'answer key present');
check(!fs.readFileSync(path.join(fixture, 'prompt.md'), 'utf8').includes(smoke[0].key), 'answer key absent from prompt');
check(fs.readFileSync(path.join(fixture, 'graders/read-note.md'), 'utf8').includes('type: tool_used'), 'tool grader');
const cwd = path.join(temp, 'fixture-cwd');
fs.mkdirSync(cwd);
const fixtureRun = spawnSync('bash', [path.join(fixture, 'fixture.sh')], { cwd, encoding: 'utf8' });
assert.equal(fixtureRun.status, 0, fixtureRun.stderr); checks++;
for (const [name, value] of Object.entries(smoke[0].fixtures)) {
  assert.deepEqual(fs.readFileSync(path.join(cwd, name)), Buffer.from(value)); checks++;
}
const lines = fs.readFileSync(path.join(history, 'history.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
assert.deepEqual(lines.map(l => l.type), ['user', 'assistant']); checks++;
assert.deepEqual(lines.map(l => l.message.content[0].text), smoke[1].history.map(h => h.text)); checks++;
for (const [i, line] of lines.entries()) {
  for (const field of ['uuid', 'parentUuid', 'sessionId', 'timestamp', 'type', 'message', 'cwd', 'version', 'userType', 'isSidechain', 'gitBranch'])
    check(Object.hasOwn(line, field), `history line ${i + 1} has ${field}`);
  check(/^[0-9a-f-]{36}$/.test(line.uuid) && /^[0-9a-f-]{36}$/.test(line.sessionId), 'history UUIDs');
  check(line.parentUuid === (i ? lines[i - 1].uuid : null), 'history parent chain');
  check(line.sessionId === lines[0].sessionId, 'history session ID consistent');
  check(line.message.role === line.type && line.isSidechain === false && line.userType === 'external', 'history message shape');
  check(!Number.isNaN(Date.parse(line.timestamp)), 'history timestamp');
}
check(lines[0].promptId && lines[0].permissionMode, 'history user metadata');
check(lines[1].message.type === 'message' && lines[1].message.stop_reason === 'end_turn' && lines[1].message.usage, 'history assistant metadata');
check(fs.readFileSync(path.join(history, 'case.yaml'), 'utf8').includes('history_file: history.jsonl'), 'history reference');
const forced = stage(['--force-skill', 'terse:clarity']);
check(fs.readFileSync(path.join(forced, 'evals/content/fixture-fact/prompt.md'), 'utf8').trim() === smoke[0].prompt, 'forced prompt unchanged');
check(fs.readFileSync(path.join(forced, 'evals/content/fixture-fact/case.yaml'), 'utf8').includes('append_system_prompt: "Before you answer, load the terse:clarity skill with the Skill tool and apply it to your answer."'), 'forced system prompt');
const inline = stage(['--history-inline']);
check(fs.readFileSync(path.join(inline, 'evals/content/history-followup/prompt.md'), 'utf8').startsWith('> USER:'), 'inline history');
check(!fs.readFileSync(path.join(inline, 'evals/content/history-followup/case.yaml'), 'utf8').includes('history_file:'), 'inline omits history reference');
const badVariant = path.join(temp, 'bad.json');
fs.writeFileSync(badVariant, JSON.stringify({ name: 'bad', edits: [{ file: 'skills/clarity/SKILL.md', find: 'nonexistent unique text', replace: 'x' }] }));
const bad = run('content.official.mjs', ['--cases', casesFile, '--variant', badVariant]);
assert.equal(bad.status, 2); checks++;
check(bad.stderr.includes('variant edit 1') && bad.stderr.includes('exactly once'), 'bad edit diagnostic');
const incompatible = run('content.official.mjs', ['--cases', casesFile, '--force-skill', 'terse:clarity', '--baseline']);
assert.equal(incompatible.status, 2); checks++;
check(incompatible.stderr.includes('--force-skill cannot be combined with --baseline'), 'force/baseline refusal');

function result(aScore, bScore) {
  return { schemaVersion: 1, partial: false, cases: [
    { name: 'k1::smoke::fixture::fixture-fact', arms: { with: [{ score: aScore, graders: [
      { name: 'port-answer', passed: aScore === 1, scored: true, weight: 1 },
      { name: 'clarity_loaded', passed: true, scored: false, weight: 1 }] }],
      without: [{ score: bScore, graders: [{ name: 'port-answer', passed: bScore === 1, scored: true, weight: 1 },
        { name: 'clarity_loaded', passed: false, scored: false, weight: 1 }] }] } } ] };
}
const a = path.join(temp, 'a.json');
const b = path.join(temp, 'b.json');
const comparison = path.join(temp, 'comparison.json');
fs.writeFileSync(a, JSON.stringify(result(1, 0)));
fs.writeFileSync(b, JSON.stringify(result(0, 0)));
const compared = run('content.compare.mjs', [a, b, '--json', comparison]);
assert.equal(compared.status, 0, compared.stderr); checks++;
check(compared.stdout.includes('Exact two-sided sign test'), 'comparison markdown');
const data = JSON.parse(fs.readFileSync(comparison, 'utf8'));
assert.equal(data.cases[0].delta, 1); checks++;
assert.equal(data.signTest.pTwoSided, 1); checks++;
check(data.totals.candidate.k1.cases === 1 && data.totals.stratum.fixture.cases === 1, 'group totals');
check(data.cases[0].clarity_loaded.a.passes === 1 && !('clarity_loaded' in data.cases[0].graders), 'clarity separately reported');
const arms = run('content.compare.mjs', [a, '--arms', 'with,without']);
assert.equal(arms.status, 0, arms.stderr); checks++;
check(arms.stdout.includes('1.000'), 'two-arm comparison');
const sourceOut = path.join(temp, 'brief-out');
fs.mkdirSync(sourceOut);
const trace = path.join(sourceOut, 'trace.jsonl');
fs.writeFileSync(trace, JSON.stringify({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'The configured port is 4317.' }] } }) + '\n');
const recipientSource = result(1, 0);
recipientSource.cases[0].arms.with[0].tracePath = trace;
fs.writeFileSync(path.join(sourceOut, 'result.json'), JSON.stringify(recipientSource));
const recipient = run('content.recipient.mjs', ['--from', sourceOut, '--cases', casesFile]);
assert.equal(recipient.status, 0, recipient.stderr); checks++;
const recipientPlugin = /^Staged official eval: (.+)$/m.exec(recipient.stdout)?.[1];
check(recipientPlugin && fs.existsSync(recipientPlugin), 'recipient stage');
const recipientCase = path.join(recipientPlugin, 'evals/content/fixture-fact-r1');
check(fs.readFileSync(path.join(recipientCase, 'prompt.md'), 'utf8').trim() === 'The configured port is 4317.', 'recipient prompt from trace');
check(fs.existsSync(path.join(recipientCase, 'graders/recipient-port.md')) && !fs.existsSync(path.join(recipientCase, 'graders/clarity_loaded.md')), 'recipient graders');
check(fs.existsSync(path.join(recipientCase, 'fixture.sh')), 'recipient fixture');
check(!fs.existsSync(path.join(recipientPlugin, 'skills')), 'recipient stub has no skills');
console.log(`content.selftest: ${checks} checks passed`);
