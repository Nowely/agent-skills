import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const evalDir = path.dirname(fileURLToPath(import.meta.url));
export const pluginSource = path.resolve(evalDir, '..', 'plugin');
export const tempRoot = fs.realpathSync(process.env.TMPDIR || os.tmpdir());
const idPattern = /^[a-z0-9-]+$/;
const safeTool = /^[A-Za-z][A-Za-z0-9_]*(?:\([^\r\n]*\))?$/;
const readOnly = new Set(['Read', 'Glob', 'Grep', 'NotebookRead', 'Skill', 'AskUserQuestion', 'Agent', 'TodoWrite', 'TaskCreate', 'TaskGet', 'TaskList', 'TaskUpdate', 'TaskStop']);

export function fail(message) { throw new Error(message); }
export function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
export function inside(base, target) {
  const rel = path.relative(base, target);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
}
export function relativeFile(value, field) {
  if (typeof value !== 'string' || !value || value.includes('\0') || value.includes('\\') ||
      value.split('/').some(x => x === '' || x === '.' || x === '..') || path.isAbsolute(value)) fail(`${field}: unsafe relative path`);
  return value;
}
function nonempty(value, field) { if (typeof value !== 'string' || !value.trim()) fail(`${field}: expected nonempty text`); }
function positive(value, field, max) { if (!Number.isSafeInteger(value) || value < 1 || value > max) fail(`${field}: expected integer 1..${max}`); }
function keys(value, allowed, field) { for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${field}.${key}: unknown field`); }
function tools(value, field) {
  if (!Array.isArray(value) || value.some(x => typeof x !== 'string' || !safeTool.test(x)) || new Set(value).size !== value.length)
    fail(`${field}: expected distinct tool names`);
}
function graders(value, field) {
  if (!Array.isArray(value) || !value.length) fail(`${field}: expected nonempty array`);
  const names = new Set();
  value.forEach((g, i) => {
    const at = `${field}[${i}]`;
    if (!object(g)) fail(`${at}: expected object`);
    keys(g, ['name', 'type', 'focus', 'criteria', 'tool', 'input_match', 'min', 'max'], at);
    if (typeof g.name !== 'string' || !idPattern.test(g.name) || g.name === 'clarity_loaded' || names.has(g.name)) fail(`${at}.name: invalid or duplicate`);
    names.add(g.name);
    if (g.type === 'llm') {
      nonempty(g.criteria, `${at}.criteria`);
      if (!/\bPASS\b/.test(g.criteria) || !/\bFAIL\b/.test(g.criteria)) fail(`${at}.criteria: include concrete PASS and FAIL conditions`);
      if (g.focus !== undefined && !['last_message', 'trace'].includes(g.focus)) fail(`${at}.focus: unsupported`);
      if (g.tool !== undefined || g.input_match !== undefined || g.min !== undefined || g.max !== undefined) fail(`${at}: tool fields on llm grader`);
    } else if (g.type === 'tool_used') {
      nonempty(g.tool, `${at}.tool`);
      if (!safeTool.test(g.tool)) fail(`${at}.tool: invalid`);
      if (g.input_match !== undefined) {
        if (typeof g.input_match !== 'string') fail(`${at}.input_match: expected regex string`);
        try { new RegExp(g.input_match); } catch { fail(`${at}.input_match: invalid regex`); }
      }
      for (const limit of ['min', 'max']) if (g[limit] !== undefined && (!Number.isSafeInteger(g[limit]) || g[limit] < 0)) fail(`${at}.${limit}: expected nonnegative integer`);
      if (g.min !== undefined && g.max !== undefined && g.min > g.max) fail(`${at}.min: exceeds max`);
      if (g.focus !== undefined || g.criteria !== undefined) fail(`${at}: llm fields on tool grader`);
    } else fail(`${at}.type: expected llm or tool_used`);
  });
}
export function validateCases(value) {
  if (!Array.isArray(value) || !value.length) fail('cases: expected nonempty JSON array');
  const ids = new Set();
  value.forEach((c, i) => {
    if (!object(c)) fail(`case ${i}: expected object`);
    const id = c.id || `case ${i}`;
    keys(c, ['id', 'candidate', 'set', 'stratum', 'prompt', 'fixtures', 'history', 'allowedTools', 'maxTurns', 'timeoutSeconds', 'key', 'graders', 'recipient'], id);
    if (typeof c.id !== 'string' || !idPattern.test(c.id) || ids.has(c.id)) fail(`${id}.id: invalid or duplicate`);
    ids.add(c.id);
    for (const field of ['candidate', 'set', 'stratum', 'prompt', 'key']) nonempty(c[field], `${id}.${field}`);
    for (const field of ['candidate', 'set', 'stratum']) if (!idPattern.test(c[field])) fail(`${id}.${field}: expected lowercase slug`);
    tools(c.allowedTools, `${id}.allowedTools`);
    if (c.maxTurns !== undefined) positive(c.maxTurns, `${id}.maxTurns`, 200);
    if (c.timeoutSeconds !== undefined) positive(c.timeoutSeconds, `${id}.timeoutSeconds`, 3600);
    if (c.fixtures !== undefined) {
      if (!object(c.fixtures)) fail(`${id}.fixtures: expected path-to-text object`);
      const paths = Object.keys(c.fixtures);
      for (const [name, content] of Object.entries(c.fixtures)) {
        relativeFile(name, `${id}.fixtures.${name}`);
        if (typeof content !== 'string') fail(`${id}.fixtures.${name}: expected text`);
        if (paths.some(other => other !== name && other.startsWith(`${name}/`))) fail(`${id}.fixtures.${name}: file conflicts with nested path`);
      }
    }
    if (c.history !== undefined) {
      if (!Array.isArray(c.history) || !c.history.length) fail(`${id}.history: expected nonempty array`);
      c.history.forEach((h, n) => {
        if (!object(h) || !['user', 'assistant'].includes(h.role) || typeof h.text !== 'string' || !h.text.trim() || Object.keys(h).some(k => !['role', 'text'].includes(k)))
          fail(`${id}.history[${n}]: expected {role: user|assistant, text}`);
      });
    }
    graders(c.graders, `${id}.graders`);
    if (c.recipient !== undefined) {
      if (!object(c.recipient)) fail(`${id}.recipient: expected object`);
      keys(c.recipient, ['allowedTools', 'graders'], `${id}.recipient`);
      tools(c.recipient.allowedTools, `${id}.recipient.allowedTools`);
      graders(c.recipient.graders, `${id}.recipient.graders`);
    }
  });
  return value;
}
export function parseOptions(argv, flags) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (!(flag in flags)) fail(`unknown option: ${flag}`);
    if (flags[flag] === false) options[flag] = true;
    else { if (!argv[i + 1] || argv[i + 1].startsWith('--')) fail(`${flag}: missing value`); options[flag] = argv[++i]; }
  }
  return options;
}
export function validateRunOptions(o) {
  for (const [flag, max] of [['--runs', 50], ['-j', 8]]) if (o[flag] !== undefined) { o[flag] = Number(o[flag]); positive(o[flag], flag, max); }
  for (const flag of ['--model', '--judge-model']) if (o[flag] !== undefined) nonempty(o[flag], flag);
  if (o['--force-skill'] && o['--baseline']) fail('--force-skill cannot be combined with --baseline');
  if (o['--force-skill'] && !/^[a-z][a-z0-9:-]*$/.test(o['--force-skill'])) fail('--force-skill: invalid skill name');
}
export function newOutput(stage, requested) {
  const out = requested ? path.resolve(requested) : path.join(stage, 'out');
  const parent = fs.realpathSync(path.dirname(out));
  if (!inside(tempRoot, parent) || parent === tempRoot && out === tempRoot || fs.existsSync(out)) fail('--out must be a new directory under TMPDIR');
  fs.mkdirSync(out);
  return out;
}
function yamlString(x) { return JSON.stringify(x); }
function shellQuote(x) { return `'${x.replaceAll("'", "'\\''")}'`; }
function historyTranscript(history) {
  const sessionId = randomUUID();
  let parentUuid = null;
  const start = Date.now();
  return history.map((turn, index) => {
    const uuid = randomUUID();
    const common = { parentUuid, isSidechain: false, type: turn.role, uuid,
      timestamp: new Date(start + index * 1000).toISOString(), userType: 'external',
      entrypoint: 'cli', cwd: '.', sessionId, version: '2.1.280', gitBranch: '' };
    const text = [{ type: 'text', text: turn.text }];
    const record = turn.role === 'user'
      ? { ...common, promptId: randomUUID(), permissionMode: 'default', promptSource: 'sdk',
          message: { role: 'user', content: text } }
      : { ...common, apiBlockIndex: 0, requestId: `req_${randomUUID().replaceAll('-', '')}`,
          message: { model: 'claude-sonnet-4-5-20250929', id: `msg_${randomUUID().replaceAll('-', '')}`,
            type: 'message', role: 'assistant', content: text, container: null,
            stop_reason: 'end_turn', stop_sequence: null, stop_details: null,
            usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
            diagnostics: null, context_management: null } };
    parentUuid = uuid;
    return JSON.stringify(record);
  }).join('\n') + '\n';
}
function writeGrader(dir, g, key) {
  const header = [`type: ${g.type}`];
  if (g.type === 'llm') {
    if (g.focus) header.push(`focus: ${g.focus}`);
    fs.writeFileSync(path.join(dir, `${g.name}.md`), `---\n${header.join('\n')}\n---\n\n${g.criteria.trim()}\n\n## Answer key\n\n${key.trim()}\n\nPASS if the response meets the criteria using the answer key.\nFAIL if it omits or contradicts a required fact in the answer key.\n`);
  } else {
    header.push(`tool: ${yamlString(g.tool)}`);
    if (g.input_match !== undefined) header.push(`input_match: ${yamlString(g.input_match)}`);
    if (g.min !== undefined) header.push(`min: ${g.min}`);
    if (g.max !== undefined) header.push(`max: ${g.max}`);
    fs.writeFileSync(path.join(dir, `${g.name}.md`), `---\n${header.join('\n')}\n---\n`);
  }
}
export function writeCase(suite, c, options = {}) {
  const dir = path.join(suite, c.id);
  fs.mkdirSync(path.join(dir, 'graders'), { recursive: true });
  const inline = options.historyInline && c.history?.length;
  const context = [];
  if (c.fixtures && Object.keys(c.fixtures).length) {
    context.push('  scaffold_script: fixture.sh');
    const lines = ['#!/usr/bin/env bash', 'set -euo pipefail'];
    for (const [name, value] of Object.entries(c.fixtures)) {
      const encoded = Buffer.from(value, 'utf8').toString('base64');
      lines.push(`node -e 'const fs=require("node:fs");const path=require("node:path");fs.mkdirSync(path.dirname(process.argv[1]),{recursive:true});fs.writeFileSync(process.argv[1],Buffer.from(process.argv[2],"base64"))' ${shellQuote(name)} ${shellQuote(encoded)}`);
    }
    fs.writeFileSync(path.join(dir, 'fixture.sh'), `${lines.join('\n')}\n`, { mode: 0o700 });
  }
  if (c.history?.length) {
    fs.writeFileSync(path.join(dir, 'history.jsonl'), historyTranscript(c.history));
    if (!inline) context.push('  history_file: history.jsonl');
  }
  const allowedTools = options.forceSkill && !c.allowedTools.includes('Skill') ? [...c.allowedTools, 'Skill'] : c.allowedTools;
  const yaml = ['schema_version: "1.1"', `name: ${yamlString(`${c.candidate}::${c.set}::${c.stratum}::${c.id}`)}`, `tags: [${[c.candidate, c.set, c.stratum].map(yamlString).join(', ')}]`,
    'execution:', `  max_turns: ${c.maxTurns ?? 15}`, `  timeout_seconds: ${c.timeoutSeconds ?? 300}`,
    `  allowed_tools: [${allowedTools.map(yamlString).join(', ')}]`];
  if (options.forceSkill) yaml.push(`  append_system_prompt: ${yamlString(`Before you answer, load the ${options.forceSkill} skill with the Skill tool and apply it to your answer.`)}`);
  if (context.length) yaml.push('context:', ...context);
  fs.writeFileSync(path.join(dir, 'case.yaml'), yaml.join('\n') + '\n');
  let prompt = c.prompt;
  if (inline) prompt = `${c.history.map(h => `> ${h.role.toUpperCase()}: ${h.text.replaceAll('\n', '\n> ')}`).join('\n>\n')}\n\n${prompt}`;
  fs.writeFileSync(path.join(dir, 'prompt.md'), prompt + (prompt.endsWith('\n') ? '' : '\n'));
  for (const g of c.graders) writeGrader(path.join(dir, 'graders'), g, c.key);
  if (!options.recipient) writeGrader(path.join(dir, 'graders'), { name: 'clarity_loaded', type: 'tool_used', tool: 'Skill', input_match: '"skill"\\s*:\\s*"(?:[\\w-]+:)?clarity"' }, c.key);
}
export function stagePlugin({ variant, stub = false }) {
  const stage = fs.mkdtempSync(path.join(tempRoot, 'terse-content-'));
  const plugin = path.join(stage, 'plugin');
  if (stub) {
    fs.mkdirSync(path.join(plugin, '.claude-plugin'), { recursive: true });
    fs.writeFileSync(path.join(plugin, '.claude-plugin', 'plugin.json'), JSON.stringify({ name: 'content-recipient', version: '0.0.1' }, null, 2) + '\n');
  } else fs.cpSync(pluginSource, plugin, { recursive: true });
  if (variant) {
    const v = readJson(path.resolve(variant));
    if (!object(v) || Object.keys(v).some(k => !['name', 'edits'].includes(k)) || typeof v.name !== 'string' || !v.name.trim() || !Array.isArray(v.edits) || !v.edits.length) fail('variant: expected name and nonempty edits');
    v.edits.forEach((edit, i) => {
      const label = `variant edit ${i + 1} (${edit?.file ?? 'file unknown'})`;
      if (!object(edit) || Object.keys(edit).some(k => !['file', 'find', 'replace'].includes(k))) fail(`${label}: invalid object`);
      relativeFile(edit.file, `${label}.file`);
      if (typeof edit.find !== 'string' || !edit.find || typeof edit.replace !== 'string') fail(`${label}: find/replace must be strings, find nonempty`);
      const target = path.join(plugin, edit.file);
      if (!inside(plugin, target) || !fs.lstatSync(target, { throwIfNoEntry: false })?.isFile() || !inside(plugin, fs.realpathSync(target))) fail(`${label}: file missing or outside staged plugin`);
      const before = fs.readFileSync(target, 'utf8');
      if (before.split(edit.find).length !== 2) fail(`${label}: find must occur exactly once`);
      fs.writeFileSync(target, before.replace(edit.find, edit.replace));
    });
  }
  const manifestPath = path.join(plugin, '.claude-plugin', 'plugin.json');
  const manifest = readJson(manifestPath);
  manifest.experimental = { ...manifest.experimental, evals: 'evals/content' };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  const suite = path.join(plugin, 'evals', 'content');
  fs.mkdirSync(suite, { recursive: true });
  return { stage, plugin, suite };
}
export function command(plugin, out, cases, o) {
  const args = ['plugin', 'eval', plugin, '--trust-plugin', '--scaffold', '--no-publish', '--keep-temp', '--judge-model', o['--judge-model'] || 'sonnet', '-j', String(o['-j'] || 3), '--runs', String(o['--runs'] || 3), '--json', path.join(out, 'result.json'), '--output-dir', path.join(out, 'results')];
  if (!o['--baseline']) args.push('--ablation', 'none');
  if (o['--model']) args.push('--model', o['--model']);
  const extras = [...new Set(cases.flatMap(c => c.allowedTools).filter(t => !readOnly.has(t)))];
  if (extras.length) args.push('--allow-tools', ...extras);
  return args;
}
export function printOrRun(plugin, out, args, run) {
  console.log(`Staged official eval: ${plugin}`);
  console.log(`Output: ${out}`);
  console.log(`Command: ${['claude', ...args].map(shellQuote).join(' ')}`);
  if (!run) return;
  const result = spawnSync('claude', args, { stdio: 'inherit' });
  if (result.error) fail(`claude plugin eval: ${result.error.message}`);
  process.exit(result.status ?? 2);
}
