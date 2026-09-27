#!/usr/bin/env node
// Stage only by default. --run spends Claude tokens.
import path from 'node:path';
import { command, fail, parseOptions, printOrRun, readJson, stagePlugin, validateCases, validateRunOptions, newOutput, writeCase } from './content.lib.mjs';

try {
  const o = parseOptions(process.argv.slice(2), { '--cases': true, '--variant': true, '--baseline': false,
    '--force-skill': true, '--runs': true, '--judge-model': true, '--model': true, '-j': true,
    '--out': true, '--run': false, '--history-inline': false });
  if (!o['--cases']) fail('--cases is required');
  validateRunOptions(o);
  const cases = validateCases(readJson(path.resolve(o['--cases'])));
  const { stage, plugin, suite } = stagePlugin({ variant: o['--variant'] });
  const out = newOutput(stage, o['--out']);
  for (const c of cases) writeCase(suite, c, { forceSkill: o['--force-skill'], historyInline: o['--history-inline'] });
  printOrRun(plugin, out, command(plugin, out, cases, o), o['--run']);
} catch (error) { console.error(error.message); process.exit(2); }
