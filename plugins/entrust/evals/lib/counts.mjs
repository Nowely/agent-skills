// The count a suite states about itself in that line, parsed beside the printer rather than tallied by
// run-all: a second place to count is a second thing that can disagree with the suite it is counting.
// A live-only suite exits 0 having run nothing and says so in its own words; those are repeated as
// "skipped" or "not run" so that "all N suites green" cannot come to mean "nothing was measured".
// A suite that ran with some cases announced reports both numbers, which run-all counts as green.
export function parseCount(out) {
  const all = out.match(/^all (\d+)\b/m);
  const partial = out.match(/^all (\d+) passed, (\d+) skipped/m);
  const absent = out.match(/^(\d+) skipped \(codex binary absent\)/m);
  if (absent && !/\ball \d+ cases that ran agree/.test(out)) return `${absent[1]} skipped`;
  if (!all && /NOT RUN/.test(out)) return "not run";
  if (partial) return `${partial[1]} passed, ${partial[2]} skipped`;
  return all ? all[1] : "?";
}

// Which of those forms means the suite measured something. A bare number and the partial form did, and
// the number in front has to be above zero: "all 0 passed, 11 skipped" parses and measured nothing. A
// whole suite that skipped, a summary line nobody could parse ("?") and "not run" did not, and they
// have to leave the green numerator or "all 9 suites green" comes to mean "nothing was measured".
export const measured = (count) => /^\d+( passed, \d+ skipped)?$/.test(count) && Number.parseInt(count, 10) > 0;
