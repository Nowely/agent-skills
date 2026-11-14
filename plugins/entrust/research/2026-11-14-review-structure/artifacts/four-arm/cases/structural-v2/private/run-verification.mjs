import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const headDir = path.join(rootDir, "head");
const baseDir = path.join(rootDir, "base");
const repoDir = path.join(rootDir, "repo");
const controlSuitePath = path.join(__dirname, "control-acceptance.test.js");
const tmpRoot = path.join(__dirname, ".tmp-mutants");

function runCmd(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    encoding: "utf8",
    ...opts,
  });
  return {
    status: res.status,
    passed: res.status === 0,
    stdout: res.stdout,
    stderr: res.stderr,
  };
}

const mutants = [
  {
    id: "M01_swap_study_and_timestamp_priority",
    file: "src/checkin.js",
    find: `  if (typeof request.studyId !== "string" || request.studyId.trim().length === 0) {
    return { ok: false, code: "INVALID_STUDY" };
  }
  if (
    !Number.isFinite(request.collectedAtMs) ||
    !Number.isFinite(request.nowMs) ||
    request.collectedAtMs > request.nowMs
  ) {
    return { ok: false, code: "INVALID_TIMESTAMP" };
  }`,
    replace: `  if (
    !Number.isFinite(request.collectedAtMs) ||
    !Number.isFinite(request.nowMs) ||
    request.collectedAtMs > request.nowMs
  ) {
    return { ok: false, code: "INVALID_TIMESTAMP" };
  }
  if (typeof request.studyId !== "string" || request.studyId.trim().length === 0) {
    return { ok: false, code: "INVALID_STUDY" };
  }`,
  },
  {
    id: "M02_swap_hazard_class_and_thaw_limit_priority",
    file: "src/checkin.js",
    find: `  if (
    request.hazardClass !== undefined &&
    request.hazardClass !== "standard" &&
    request.hazardClass !== "bsl2"
  ) {
    return { ok: false, code: "INVALID_HAZARD_CLASS" };
  }

  if (request.thawCount > box.maxThawCount) {
    return { ok: false, code: "THAW_LIMIT_EXCEEDED" };
  }`,
    replace: `  if (request.thawCount > box.maxThawCount) {
    return { ok: false, code: "THAW_LIMIT_EXCEEDED" };
  }

  if (
    request.hazardClass !== undefined &&
    request.hazardClass !== "standard" &&
    request.hazardClass !== "bsl2"
  ) {
    return { ok: false, code: "INVALID_HAZARD_CLASS" };
  }`,
  },
  {
    id: "M03_swap_urgent_mismatch_and_containment_priority",
    file: "src/checkin.js",
    find: `    if (state.atThawLimit && !targetsUrgentRow) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }
    if (!state.atThawLimit && targetsUrgentRow && state.regularCompatible.length > 0) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }
    if (hasContainmentConflict(box, parsed.rowIndex, parsed.col, studyId, hazardClass)) {
      return { ok: false, code: "CONTAINMENT_CONFLICT" };
    }`,
    replace: `    if (hasContainmentConflict(box, parsed.rowIndex, parsed.col, studyId, hazardClass)) {
      return { ok: false, code: "CONTAINMENT_CONFLICT" };
    }
    if (state.atThawLimit && !targetsUrgentRow) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }
    if (!state.atThawLimit && targetsUrgentRow && state.regularCompatible.length > 0) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }`,
  },
  {
    id: "M04_diagonal_treated_as_containment_conflict",
    file: "src/box-grid.js",
    find: `const ORTHOGONAL_DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];`,
    replace: `const ORTHOGONAL_DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [1, 1],
];`,
  },
  {
    id: "M05_one_way_bsl2_containment",
    file: "src/box-grid.js",
    find: `(hazardClass === "bsl2" || neighborHazard === "bsl2")`,
    replace: `(hazardClass === "bsl2")`,
  },
  {
    id: "M06_allow_below_limit_preferred_urgent_without_overflow",
    file: "src/checkin.js",
    find: `    if (!state.atThawLimit && targetsUrgentRow && state.regularCompatible.length > 0) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }`,
    replace: `    if (false) {
      return { ok: false, code: "URGENT_ROW_MISMATCH" };
    }`,
  },
  {
    id: "M07_omit_overflow_flag",
    file: "src/box-grid.js",
    find: `    state.overflowUsed = true;
    state.flags.push("OVERFLOW_URGENT_ROW");`,
    replace: `    state.overflowUsed = true;`,
  },
  {
    id: "M08_wrong_flag_order_bsl2_after_thaw_limit",
    file: "src/box-grid.js",
    find: `  if (state.hazardClass === "bsl2") {
    state.flags.push("BSL2");
  }
  if (state.atThawLimit) {
    state.flags.push("AT_THAW_LIMIT");
  }`,
    replace: `  if (state.atThawLimit) {
    state.flags.push("AT_THAW_LIMIT");
  }
  if (state.hazardClass === "bsl2") {
    state.flags.push("BSL2");
  }`,
  },
  {
    id: "M09_reverse_label_and_audit_effect_order",
    file: "src/checkin.js",
    find: `  ports.labelQueue.enqueue({
    barcode: request.barcode,
    slot,
    flags: state.flags,
  });
  ports.auditLog.record({
    action: "CHECKIN",
    barcode: request.barcode,
    slot,
    studyId,
    hazardClass,
    overflowUsed: state.overflowUsed,
    timestampMs: request.nowMs,
  });`,
    replace: `  ports.auditLog.record({
    action: "CHECKIN",
    barcode: request.barcode,
    slot,
    studyId,
    hazardClass,
    overflowUsed: state.overflowUsed,
    timestampMs: request.nowMs,
  });
  ports.labelQueue.enqueue({
    barcode: request.barcode,
    slot,
    flags: state.flags,
  });`,
  },
  {
    id: "M10_mutate_box_before_containment_rejection",
    file: "src/checkin.js",
    find: `    if (hasContainmentConflict(box, parsed.rowIndex, parsed.col, studyId, hazardClass)) {
      return { ok: false, code: "CONTAINMENT_CONFLICT" };
    }`,
    replace: `    box.slots[parsed.code] = { barcode: request.barcode };
    if (hasContainmentConflict(box, parsed.rowIndex, parsed.col, studyId, hazardClass)) {
      return { ok: false, code: "CONTAINMENT_CONFLICT" };
    }`,
  },
  {
    id: "M11_confuse_box_full_with_no_compatible_slot",
    file: "src/checkin.js",
    find: `    if (!state.hasOpenSlot) {
      return { ok: false, code: "BOX_FULL" };
    }`,
    replace: `    if (!state.hasOpenSlot) {
      return { ok: false, code: "NO_COMPATIBLE_SLOT" };
    }`,
  },
  {
    id: "M12_ignore_custom_urgent_row_in_scanner",
    file: "src/box-grid.js",
    find: `  const urgentRowIndex =
    box.urgentRow !== undefined
      ? box.urgentRow.charCodeAt(0) - 65
      : box.rows - 1;`,
    replace: `  const urgentRowIndex = box.rows - 1;`,
  },
  {
    id: "M13_skip_study_id_trim",
    file: "src/checkin.js",
    find: `  const studyId = request.studyId.trim();`,
    replace: `  const studyId = request.studyId;`,
  },
  {
    id: "M14_allow_leading_zero_in_slot_code",
    file: "src/box-grid.js",
    find: `const SLOT_CODE_PATTERN = /^([A-Z])([1-9][0-9]*)$/;`,
    replace: `const SLOT_CODE_PATTERN = /^([A-Z])([0-9]+)$/;`,
  },
];

const baselineChecks = {
  baseTests: runCmd("node", ["--test", "test/checkin.test.js"], { cwd: baseDir }),
  headTests: runCmd("node", ["--test", "test/checkin.test.js"], { cwd: headDir }),
  repoTests: runCmd("node", ["--test", "test/checkin.test.js"], { cwd: repoDir }),
  controlOnHead: runCmd("node", ["--test", controlSuitePath], {
    cwd: rootDir,
    env: {
      ...process.env,
      TARGET_CHECKIN_PATH: path.join(headDir, "src/checkin.js"),
    },
  }),
};

for (const [name, outcome] of Object.entries(baselineChecks)) {
  if (!outcome.passed) {
    console.error(`Baseline failed: ${name}\n${outcome.stdout}\n${outcome.stderr}`);
    process.exit(1);
  }
}

fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

const mutantResults = [];
try {
  for (const mutant of mutants) {
    const mDir = path.join(tmpRoot, mutant.id);
    fs.cpSync(headDir, mDir, { recursive: true });
    const targetFile = path.join(mDir, mutant.file);
    const original = fs.readFileSync(targetFile, "utf8");
    if (!original.includes(mutant.find)) {
      throw new Error(`Pattern not found for mutant ${mutant.id}`);
    }
    const mutated = original.replace(mutant.find, mutant.replace);
    fs.writeFileSync(targetFile, mutated, "utf8");

    const headSuite = runCmd("node", ["--test", "test/checkin.test.js"], { cwd: mDir });
    const controlSuite = runCmd("node", ["--test", controlSuitePath], {
      cwd: rootDir,
      env: {
        ...process.env,
        TARGET_CHECKIN_PATH: path.join(mDir, "src/checkin.js"),
      },
    });

    mutantResults.push({
      id: mutant.id,
      file: mutant.file,
      killedByHeadTests: !headSuite.passed,
      killedByControlSuite: !controlSuite.passed,
    });
  }
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

const report = {
  verifiedAt: new Date().toISOString(),
  nodeVersion: process.version,
  baseline: {
    baseTestsPassed: baselineChecks.baseTests.passed,
    headTestsPassed: baselineChecks.headTests.passed,
    repoTestsPassed: baselineChecks.repoTests.passed,
    controlOnHeadPassed: baselineChecks.controlOnHead.passed,
  },
  mutantsTotal: mutantResults.length,
  killedByHeadTestsCount: mutantResults.filter((m) => m.killedByHeadTests).length,
  killedByControlSuiteCount: mutantResults.filter((m) => m.killedByControlSuite).length,
  mutants: mutantResults,
};

const reportPath = path.join(__dirname, "verification-report.json");
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));

if (
  report.killedByHeadTestsCount !== report.mutantsTotal ||
  report.killedByControlSuiteCount !== report.mutantsTotal
) {
  process.exit(1);
}
