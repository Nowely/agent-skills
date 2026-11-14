import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const privateDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(privateDir, '..');
const original = readFileSync(join(root, 'head/src/intake.js'), 'utf8');
const work = join(privateDir, '.mutation-work');

const mutations = [
  {
    name: 'overweight-guard-disabled',
    expectedTest: 'stops at an overweight crate',
    from: 'if (rule.maxKg < crate.kg) {',
    to: 'if (false) {'
  },
  {
    name: 'wrong-total',
    expectedTest: 'emits a complete ordered trace and summary',
    from: 'totalKg += crate.kg;',
    to: 'totalKg += 1;'
  },
  {
    name: 'failure-event-omitted',
    expectedTest: 'stops at an overweight crate',
    from: 'emit({ type: \'intake.failed\', shipmentId, code: error.code, crateId: error.crateId });',
    to: 'void error;'
  },
  {
    name: 'acceptance-event-omitted',
    expectedTest: 'emits a complete ordered trace and summary',
    from: 'emit({ type: \'crate.accepted\', shipmentId, crateId: crate.id, kind: crate.kind, kg: crate.kg });',
    to: 'void crate;'
  },
  {
    name: 'duplicate-guard-disabled',
    expectedTest: 'reports duplicate crate IDs after earlier acceptances',
    from: 'if (seen.has(crate.id)) {',
    to: 'if (false) {'
  },
  {
    name: 'loader-error-misclassified',
    expectedTest: 'reports loader failures with their cause',
    from: "return fail(new IntakeError('RULE_LOAD_FAILED', `Could not load rule: ${crate.kind}`, {",
    to: "return fail(new IntakeError('INVALID_RULE', `Could not load rule: ${crate.kind}`, {"
  }
];

function failedTestNames(output) {
  return output.split(/\r?\n/).flatMap(line => {
    const match = /^not ok \d+ - (.+)$/.exec(line);
    return match ? [match[1]] : [];
  });
}

function assertExpectedFailure(run, output, expectedTest) {
  assert.notEqual(run.status, 0, 'mutant survived acceptance tests');
  const failures = failedTestNames(output);
  assert.ok(
    failures.includes(expectedTest),
    `expected test did not fail: ${expectedTest}; actual failing tests: ${failures.join('; ') || 'none'}`
  );
}

rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

try {
  for (const mutation of mutations) {
    assert.ok(original.includes(mutation.from), `${mutation.name}: mutation point missing`);
    const directory = mkdtempSync(join(work, `${mutation.name}-`));
    mkdirSync(join(directory, 'src'));
    writeFileSync(join(directory, 'package.json'), '{"type":"module"}\n');
    writeFileSync(join(directory, 'src/intake.js'), original.replace(mutation.from, mutation.to));
    copyFileSync(join(root, 'head/src/rule-cache.js'), join(directory, 'src/rule-cache.js'));

    const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', join(privateDir, 'acceptance.test.mjs')], {
      cwd: root,
      env: { ...process.env, CASE_IMPL: join(directory, 'src/intake.js') },
      encoding: 'utf8'
    });
    const output = `${run.stdout}\n${run.stderr}`;
    if (mutation.name === 'wrong-total') {
      const passingButPresent = 'stops at an overweight crate';
      assert.equal(
        run.status !== 0 && output.includes(passingButPresent),
        true,
        'attribution control precondition: old name-only predicate must accept this false positive'
      );
      assert.throws(
        () => assertExpectedFailure(run, output, passingButPresent),
        /expected test did not fail/
      );
      console.log(`attribution control: passing test name is not a failure: ${passingButPresent}`);
    }
    assertExpectedFailure(run, output, mutation.expectedTest);
    console.log(`detected ${mutation.name}: ${mutation.expectedTest}`);
  }
  console.log(`${mutations.length}/${mutations.length} mutants detected for their intended contract violations`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
