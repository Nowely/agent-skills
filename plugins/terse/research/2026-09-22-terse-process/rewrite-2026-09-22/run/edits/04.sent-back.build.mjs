#!/usr/bin/env node
// Builds edits/04.json — round 04, the last under the cap of four, of the rewrite of plugins/terse/README.md,
// from 03-review.md. The round carries the 15 SENTENCE findings of reviews/03/lens6-fable-dedup.md (L6.3-01,
// 03, 04, 08, 09, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21), the SCOPE line of L6.3-02 (how to install the commit
// the README describes, at level 3), and the coordinator's decisions: (d) covers `main`, (a) reaches its
// section only (L6.3-16 not applied), (i) the round-01 cut reasons go into cuts.md, (j) rewrite's guess route
// is not named, the language sentence stays (L6.3-28), the code findings go to code-defects.md (D7, D8).
// Every `old` is taken from 03-review.md itself and occurs there once; every pattern escapes its sentence
// the way ledger-seed.mjs does; a re-pin reuses the ledger's name exactly; every edit's `new` holds only
// the sentences its own claims are about. The edits are applied here as round.mjs applies them, and the
// result is held to the protected passages and to every ledger entry this round does not re-pin or drop.
import fs from "node:fs";
const RUN = "$TMPDIR/terse/runs/20260922-233021-terse-readme";
const REPO = "~/Git/agent-skills";
const SK = `${REPO}/plugins/terse/skills`;
const CH = `${REPO}/research/2026-09-10-chain`;
const PROBE = `${RUN}/probe-04`;
const T = fs.readFileSync(`${RUN}/03-review.md`, "utf8");
const seedFile = fs.existsSync(`${RUN}/ledger.04.json`) ? `${RUN}/ledger.04.json` : `${RUN}/ledger.json`;   // the ledger as it stood before this round
const ledger = JSON.parse(fs.readFileSync(seedFile, "utf8"));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const pin = (s) => esc(norm(s));
const count = (t, s) => t.split(s).length - 1;
const at = (words) => {
  const hits = [...T.matchAll(new RegExp(norm(words).split(" ").map(esc).join("\\s+"), "g"))];
  if (hits.length !== 1) throw new Error(`${hits.length} match(es) in 03 for: ${words}`);
  return hits[0][0];
};
const name = (id) => {
  const hits = ledger.filter((c) => c.name === id || c.name.startsWith(id + " "));
  if (hits.length !== 1) throw new Error(`${hits.length} ledger entries for ${id}`);
  return hits[0].name;
};
const entry = (id) => ledger.find((c) => c.name === name(id));
const sed = (range, file) => `sed -n '${range}' ${file}`;
const any = "[\\s\\S]*";
// A literal of the page in an expect: escaped, any run of spaces matching any whitespace, so a line the page wraps still matches.
const L = (s) => esc(s).replace(/ +/g, "\\s+");
const E = (...parts) => parts.join(any);   // literal-or-regex parts, in order, anything between
const edits = [];
const edit = (nm, old, nu, claims, check, drop) => edits.push({ name: nm, old, new: nu, ...(claims ? { claims } : {}), ...(check ? { check } : {}), ...(drop ? { drop } : {}) });

// ---- What each one does ---------------------------------------------------------------------------
// L6.3-17 (lens 2 P5): the frame covers the references the section cites, not only the pages. R03a re-pinned.
{
  const old = "Each skill is a page of instructions for Claude; below is what each page says.";
  const nu = "Each skill is a page of instructions for Claude; below is what each page and its references say.";
  const e = entry("R03a");
  edit("L6.3-17 the frame names each page and its references (R03a re-pinned)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "Each of the three skills is a page of instructions written for Claude, with reference files beside it, and the section that follows describes each skill by what its page and those references say." }],
    { level: 2,
      run: `${e.run}; for k in audit rethink rewrite; do printf '%s/references: ' $k; ls ${SK}/$k/references | tr '\\n' ' '; echo; done; ${sed("167p;171p", `${SK}/audit/SKILL.md`)}; ${sed("85p;87p", `${SK}/rethink/SKILL.md`)}; ${sed("217p;222p", `${SK}/rewrite/SKILL.md`)}`,
      expect: E(e.expect, "audit/references: ledgers\\.md measure\\.md reader-profile\\.md truth-pass\\.md", "rethink/references: stages\\.md",
                "rewrite/references: bake-off\\.md critic-briefs\\.md curse-of-knowledge\\.md loop\\.md measurements\\.md writing-rules\\.md",
                L("## Reference"), L("- The reader protocol and re-measurement: [measure.md](references/measure.md)."),
                L("## Reference"), L("- The four stages, the measurements, and the content rules: [stages.md](references/stages.md)."),
                L("## Reference"), L("- Writer briefs and judging sheets, both routes: [bake-off.md](references/bake-off.md).")) });
}
// L6.3-08 (lens 1 F1): the readers are model agents the audit spawns. C06 re-pinned.
{
  const old = at("**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh reader to each question. Readers start at the entry file and may open only Markdown.");
  const nu = "**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh\nreader, a model agent, to each question. Readers start at the entry file and may open only Markdown.";
  edit("L6.3-08 the readers are model agents (C06 re-pinned)", old, nu,
    [{ name: name("C06"), pattern: pin(nu),
       asks: "audit writes a reader profile, a claim ledger and an answer key before it assigns one fresh reader to each question, each reader being a model agent that audit spawns; the readers start at the entry file and may open only Markdown." }],
    { level: 2,
      run: `${sed("13,16p;46p;54,57p;69p;74p;84,87p;89,90p", `${SK}/audit/SKILL.md`)}; ${sed("40,42p", `${SK}/audit/references/measure.md`)}`,
      expect: E("both exist before the first reader is spawned", L("## Step 2. The reader profile"), L("## Step 3. The truth pass"), "becomes one ledger entry",
                L("## Step 4. The questions and the answer key"), L("Write the correct answer to each from the ledger"), L("## Step 5. The readers"),
                L("Announce the plan before spawning anything: how many readers, which model, roughly what it costs."),
                L("One fresh reader per question"), "Each one starts at the entry\\s+file, may open only `\\.md` files",
                L("Use a cheap model; the 2026-09-10 run used Haiku and the failures it found were real."),
                "Announce the count\\s+and the model to the user and wait for their word before spawning") });
}
// L6.3-13 (lens 1 F2) and L6.3-14 (lens 2 W2): the survey reaches beyond the genre; "works before prose" cut
// as carried by the pipeline sentence and by the skeleton sentence that follows. C09 re-pinned.
{
  const old = at("**`/terse:rethink`** works before prose. It compares documents in the same genre, settles terms, and explores structures.");
  const nu = "**`/terse:rethink`** surveys documents in and beyond the genre, settles terms, and explores\nstructures.";
  edit("L6.3-13/14 rethink surveys in and beyond the genre; the water cut (C09 re-pinned)", old, nu,
    [{ name: name("C09"), pattern: pin(nu),
       asks: "rethink surveys documents both in the document's genre and beyond it, settles the terms, and explores structures." }],
    { level: 2, run: sed("25,32p;43,47p;54,57p", `${SK}/rethink/SKILL.md`),
      expect: E(L("## Step 1. What comparable documents already solved"), "six agents\\s+on six slices return a sample",
                "Default slices, one\\s+surveyor each: the exact genre, the same structural position, the most used regardless of genre, vendor\\s+guidance, whatever this document's hard part is, and one slice whose job is what \\*not\\* to copy",
                L("## Step 2. The words"), "For each load-bearing term: who parses\\s+it and as what", L("## Step 3. The structure"), L("About ten structures")) });
}
// L6.3-11 (lens 1 F3): the skeleton carries the rules the writing must pass. C10 re-pinned.
{
  const old = at("Its output is a skeleton: each section's title, purpose, exclusions, and word budget. It then waits for your word.");
  const nu = "Its output is a skeleton: each section's title, purpose, exclusions, and word budget, and the\nrules the writing must pass. It then waits for your word.";
  edit("L6.3-11 the skeleton's contents include the rules the writing must pass (C10 re-pinned)", old, nu,
    [{ name: name("C10"), pattern: pin(nu),
       asks: "rethink's output is a skeleton that gives each section's title, purpose, exclusions and word budget, together with the rules the writing must pass; rethink then waits for the user's word." }],
    { level: 2, run: sed("13,15p;70p;76,83p", `${SK}/rethink/SKILL.md`),
      expect: E("The output is a\\s+skeleton: section titles, what each is for, what each deliberately leaves out, a word budget, and the\\s+rules that will gate the writing",
                L("## Step 4. What you hand over"), L("- each section: title, one sentence of purpose, what it deliberately excludes, a word budget"),
                L("- the mechanical rules the writing must pass, written so that passing is a fact rather than an opinion"),
                L("Then stop and wait."), L("`rewrite` starts from the skeleton the user agreed to")) });
}
// L6.3-12 (lens 1 F4; lens 2 R4's "run file"): the audit's input by its diagram name, and the resumed run.
// The guess route of rewrite/SKILL.md:21 is not named, by the coordinator's decision (j). C11 re-pinned.
{
  const old = "**`/terse:rewrite`** starts from that skeleton or an audit run.";
  const nu = "**`/terse:rewrite`** starts from that skeleton or an audit's run file, or resumes a run of its own that\nalready holds rounds.";
  edit("L6.3-12 rewrite's ways in: the skeleton, an audit's run file, or its own run with rounds (C11 re-pinned)", old, nu,
    [{ name: name("C11"), pattern: pin(nu),
       asks: "rewrite starts from the skeleton rethink produced or from an audit's run file, or it resumes a run directory of its own that already holds rounds." }],
    { level: 2, run: sed("16,20p;29p;74p", `${SK}/rewrite/SKILL.md`),
      expect: E(L("| a run directory with rounds in it already — whatever else you have | step 4, at the next round; steps 1 to 3 are not repeated |"),
                L("| a skeleton `rethink` agreed | step 2 |"), L("| an `audit` run file | step 1 |"),
                L("Ask the user for the run directory from `audit` and read `audit.md` there."),
                L("a resumed run is given it by the user and cannot guess it")) });
}
// L6.3-21 (lens 2, skipped item; the pin check lens 6's): the frame of l23 already says these are the page's
// instructions, so "The instructions say to" repeats it. The sentence was unpinned; its claim is new.
{
  const old = "The instructions say to hand over a candidate and its diff from the original.";
  const nu = "A round is handed over as a candidate and its diff from the original.";
  edit("L6.3-21 the hand-over without the repeated frame (R04a new)", old, nu,
    [{ name: "R04a a round is handed over as a candidate and its diff from the original", pattern: pin(nu),
       asks: "rewrite's instructions hand a round over to the user as a candidate together with its diff against the original document." }],
    { level: 2, run: sed("188,192p", `${SK}/rewrite/SKILL.md`),
      expect: E(L("**The loop stops when the user reads the round and says whether they would send it as it is.**"),
                "Hand over the round and\\s+`diff-NN\\.patch`, the diff against `00-original\\.md`, written into the run directory",
                "applying\\s+the candidate to the user's files needs their word") });
}
// L6.3-18 (lens 2 P6): "declared" said as who declares it, the verb repeated so that "a round declares its
// source" cannot be read as a clause. R03g re-pinned; its check held in round 03 and is kept as it is.
{
  const old = at("Every cut of twenty words or more must carry a reason, and every declared behavioural claim its source and evidence.");
  const nu = "Every cut of twenty words or\nmore must carry a reason, and every behavioural claim a round declares must carry its source and\nevidence.";
  const e = entry("R03g");
  edit("L6.3-18 the claims a round declares (R03g re-pinned)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "rewrite's instructions require every cut of twenty words or more to carry a reason, and every behavioural claim a round declares to carry its source and the level of evidence it reached." }],
    { level: 2, run: e.run, expect: e.expect });
}
// L6.3-04 (lens 2 R4; the round-03 Q5 reader guessed): "pinned" and "retired as false" said in the reader's
// words. The sentence was unpinned and states a script's behaviour: level 3, a planted ledger.
{
  const old = at("The shipped check rejects a new round that loses a pinned sentence or restores wording retired as false.");
  const nu = "The shipped check rejects a new round that loses a sentence an earlier round\nverified, or brings back wording one retired as false.";
  edit("L6.3-04 the ratchet in the reader's words (R04b new, level 3)", old, nu,
    [{ name: "R04b the shipped check rejects a new round that loses a sentence an earlier round verified or brings back wording one retired as false", pattern: pin(nu),
       asks: "The check that ships with the plugin rejects a new round, exiting 1, when the round loses a sentence an earlier round verified (a pinned claim absent from the new round) or brings back wording an earlier round retired as false (a retired phrase present in the new round); a round that does neither passes." }],
    { level: 3, run: `sh ${PROBE}/ledger-guard.sh`,
      expect: E(L("round 02 that loses: ledger.mjs exit 1; rows: verified L2 yes yes LOST;retired L? - - - ; 1 failure(s) in 02-loses.md"),
                L("round 02 that revives: ledger.mjs exit 1; rows: verified L2 yes yes yes ;retired L? - - YES ; 1 failure(s) in 02-revives.md"),
                L("round 02 that keeps: ledger.mjs exit 0; rows: verified L2 yes yes yes ;retired L? - - - ; 0 failure(s) in 02-keeps.md"),
                "exit 1 when the new round loses a verified claim or revives a retired phrase",
                L("want true  : a verified claim that must be present (LOST when absent)"), L("want false : a phrasing found false, which must be absent (YES when present)")) });
}

// ---- Install --------------------------------------------------------------------------------------
// L6.3-20 (lens 2): "page" is the skills' word; the boundary names this README. R03i re-pinned; its check held.
{
  const old = "This page describes commit `2f29a8f`.";
  const nu = "This README describes commit `2f29a8f`.";
  const e = entry("R03i");
  edit("L6.3-20 the boundary names the README, not a page (R03i re-pinned)", old, nu,
    [{ name: e.name, pattern: pin(nu), asks: "This README describes the plugin as it is at commit 2f29a8f." }],
    { level: 2, run: e.run, expect: e.expect });
}
// L6.3-02, the SCOPE line (lens 1 F5; lens 2 P1; round 02's L6-04): no line installed the commit the README
// describes. It takes the place of the 2026-09-22 sentence, which the next edit rewrites in place of l75.
// Level 3: probe-04/install-checkout.sh installs from the checkout and from a clone at 2f29a8f.
{
  const old = at("At the 2026-09-22 audit, the install commands resolved the marketplace's `main` at `8c041b7`, whose rewrite page wrote into the document repository without asking.");
  const nu = "To install that commit, run\n`claude plugin marketplace add` with the path of a local clone checked out at it in place of\n`Nowely/agent-skills`, then `claude plugin install terse@nowely`.";
  edit("L6.3-02 the SCOPE line: installing the commit this README describes (R04c new, level 3)", old, nu,
    [{ name: "R04c to install commit 2f29a8f, marketplace add takes the path of a local clone checked out at it in place of Nowely/agent-skills, then plugin install terse@nowely", pattern: pin(nu),
       asks: "A reader who wants commit 2f29a8f, the commit this README describes, installs it by running claude plugin marketplace add with the path of a local clone checked out at that commit in place of Nowely/agent-skills, and then claude plugin install terse@nowely; what gets installed is that commit's plugin tree." }],
    { level: 3, run: `sh ${PROBE}/install-checkout.sh`,
      expect: E("A auth status: not logged in", "B auth status: not logged in",
                L("plugins/terse, HEAD against 2f29a8f: 0 lines of diff --stat"),
                L("working tree against 2f29a8f, plugins/terse and .claude-plugin: diff exit 0"),
                L("untracked or ignored files under plugins/terse: 0"), L("clone B: HEAD 2f29a8f"), L("archive of 2f29a8f: 28 files"),
                L("A $ claude plugin marketplace add <checkout, absolute path> -> exit 0"), L("A $ claude plugin install terse@nowely -> exit 0"),
                L("A installed files: 28"), L("A installed tree against its source's plugins/terse: identical (diff -rq exit 0)"),
                L("A installed tree against git archive 2f29a8f: identical (diff -rq exit 0)"),
                L("B $ claude plugin marketplace add ../clone-2f29a8f (relative to the working directory) -> exit 0"),
                L("B $ claude plugin install terse@nowely -> exit 0"),
                L("B installed at: <config-B>/plugins/cache/nowely/terse/0.1.1; recorded commit: 2f29a8f"), L("B installed files: 28"),
                L("B installed tree against its source's plugins/terse: identical (diff -rq exit 0)"),
                L("B installed tree against git archive 2f29a8f: identical (diff -rq exit 0)")) });
}
// L6.3-03 (lens 1 F5 b/c; lens 2 W1) and L6.3-15 (lens 2 R1) under decision (d), which now covers `main`:
// the date without the review event, no branch name, both pages named; "with `Nowely/agent-skills`" keeps
// the sentence off the clone route just given. It replaces l75, which repeated l73; G4, pinned on l75, is
// dropped. R03j re-pinned with its check, plus the brief's dated heading; R04d on the ten-file diff.
{
  const old = "The section below describes this commit, not that one.";
  const nu = "On 2026-09-22 the install commands with `Nowely/agent-skills` resolved to `8c041b7`, whose audit and\nrewrite pages differ from the ones described here; its rewrite page wrote into the document repository\nwithout asking.";
  const e = entry("R03j");
  const differ = "whose audit and rewrite pages differ from the ones described here";
  // R03j's round-03 run, kept in what it shows, reordered and trimmed so that the whole output, with the
  // dated heading and the diff added, stays under round.mjs's 2000-character clip of `saw`.
  const run = [
    `git -C ${REPO} diff --quiet 2f29a8f HEAD -- plugins/terse .claude-plugin; echo "plugin tree at HEAD against 2f29a8f: diff exit $?"`,
    `${sed("196p", `${RUN}/brief.md`)} | grep -o 'adversarial whole-document read (Codex Astra L3, 2026-09-22'`,
    `${sed("198p", `${RUN}/brief.md`)} | grep -o 'the advertised install commands fetch[^;]*'`,
    `${sed("209p", `${RUN}/audit.md`)} | grep -o 'is github.com/Nowely/agent-skills and [^;]*'`,
    `echo '8c041b7 against 2f29a8f, plugins/terse:'; git -C ${REPO} diff --shortstat 8c041b7 2f29a8f -- plugins/terse; git -C ${REPO} diff --stat=100 8c041b7 2f29a8f -- plugins/terse/skills/audit/SKILL.md plugins/terse/skills/rewrite/SKILL.md | sed '$d'`,
    `echo '8c041b7, rewrite/SKILL.md:66-67, 112-113:'; git -C ${REPO} show 8c041b7:plugins/terse/skills/rewrite/SKILL.md | sed -n '66,67p;112,113p'`,
    `echo '8c041b7, audit/SKILL.md:33:'; git -C ${REPO} show 8c041b7:plugins/terse/skills/audit/SKILL.md | sed -n '33p'`,
    `echo '2f29a8f = HEAD, audit/SKILL.md:33, 44:'; ${sed("33p;44p", `${SK}/audit/SKILL.md`)}`,
    `echo '2f29a8f = HEAD, rewrite/SKILL.md:66, 78-79:'; ${sed("66p;78,79p", `${SK}/rewrite/SKILL.md`)}`,
  ].join("; ");
  edit("L6.3-03/15 the 2026-09-22 boundary: no branch, both pages, l75 cut (R03j re-pinned, R04d new, G4 dropped)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "On 2026-09-22 the install commands given with Nowely/agent-skills resolved to commit 8c041b7, and that revision's rewrite page wrote into the document's repository without asking the user." },
     { name: "R04d at 8c041b7 the audit and rewrite pages differ from the ones this README describes", pattern: pin(differ),
       asks: "At 8c041b7, the revision the install commands resolved to on 2026-09-22, the audit page and the rewrite page differ from the pages at 2f29a8f that this README describes." }],
    { level: 2, run,
      expect: E("plugin tree at HEAD against 2f29a8f: diff exit 0", L("adversarial whole-document read (Codex Astra L3, 2026-09-22"),
                "the advertised install commands fetch the marketplace's `main`, which at 8c041b7 ships terse 0\\.1\\.1 with the old `rewrite` page that wrote into the repository unasked",
                L("`origin/main` (8c041b7) lists terse 0.1.1"),
                L("8c041b7 against 2f29a8f, plugins/terse:"), L("10 files changed, 487 insertions(+), 50 deletions(-)"),
                "plugins/terse/skills/audit/SKILL\\.md\\s+\\|\\s+27 ", "plugins/terse/skills/rewrite/SKILL\\.md\\s+\\|\\s+92 ",
                L("Work in a run directory of the document's own — `research/<date>-<slug>/` at the root of the") + "\\s+repository that holds the document",
                L("a code defect to the repository's") + "\\s+" + L("`ISSUES.md`"), L('RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/'),
                L('D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/'), L("Write nothing into the audited repository."),
                L("Work in a run directory of the document's own, outside the repository that holds it"), L("Nothing goes into that repository without the user's word")) },
    [name("G4")]);
}

// ---- What it will and will not do to your text ----------------------------------------------------
// L6.3-01 (lens 1 F6; lens 2 P2): no page grants "reword", and the pages conflict on "correct" (D8). Unpinned;
// R03l, the sentence before it, untouched. Cut, 12 words.
edit("L6.3-01 cut: the permission no page grants", " " + at("A writer may reword one or correct it when it is false."), "");

// ---- What was measured ----------------------------------------------------------------------------
// L6.3-09 (lens 2 R4, the fact lens 6's): the measured chain preceded the procedure the page describes.
// The sentence was unpinned; its claim is new. l97 unchanged (C24 stays).
{
  const old = "The chain covered one README.";
  const nu = "The chain, four passes that preceded the plugin's bake-off and rounds,\n  covered one README.";
  edit("L6.3-09 the chain preceded the plugin's bake-off and rounds (R04f new)", old, nu,
    [{ name: "R04f the chain, four passes that preceded the plugin's bake-off and rounds, covered one README", pattern: pin(nu),
       asks: "The 2026-09-10 chain was four passes run before the plugin had its bake-off and its rounds, and it covered one README." }],
    { level: 2, run: `${sed("1,5p;14,30p;36p", `${CH}/README.md`)}; ${sed("81p;93,95p", `${REPO}/plugins/terse/CHANGELOG.md`)}`,
      expect: E(L("# The 2026-09-10 chain and bake-off"), L("The evidence the `terse` plugin was built on"), L("## `chain/`"),
                L("The four-pass rewrite of one README, stage by stage, and the artifacts it produced."),
                L("| `00-original.md` | the README as it stood, 2,725 words |"), L("| `01-reader-pass.md` | after the reader profile, 2,482 words |"),
                L("| `02-writing-pass.md` | after the writing rules, 2,377 words |"), L("| `03-prerequisite-pass.md` | after the curse of knowledge, 2,482 words |"),
                L("| `README.md` | the final result after repairing the measured reader failures, 2,571 words |"), L("## `run-2x5/`"),
                L("## 0.1.0 — 2026-09-12"), "`rewrite` writes against a skeleton or an audit's run file: one bake-off, then rounds of critics") });
}
// L6.3-10 (lens 2 P4) and L6.3-20 (lens 2): the after-arm's record is its totals, not nothing; "the
// repository" named as the plugin's; "the experiment's" where "its" would now read as the repository's.
// C44 re-pinned; its round-03 run cited ISSUES.md:96-99, which b7a17da moved, so E7 is read as a section.
{
  const old = at("The experiment had no no-document arm. The repository records its six readers before the rewrite one by one and holds no record of its readers after it.");
  const nu = "The experiment had no no-document arm. The plugin's repository\n  records each of the experiment's six readers before the rewrite, and only the totals after\n  it.";
  edit("L6.3-10/20 the records the plugin's repository holds: each reader before, the totals after (C44 re-pinned)", old, nu,
    [{ name: name("C44"), pattern: pin(nu),
       asks: "The 2026-09-10 chain measurement ran no arm that asked its questions with no document; the plugin's repository records, one by one, each of the six readers who answered from the README before the rewrite, and records only the totals for the readers who answered after it." }],
    { level: 2,
      // Trimmed to the lines that answer, so the output stays under round.mjs's 2000-character clip of `saw`;
      // ISSUES.md is read by pattern with its line numbers, since its lines moved under this round.
      run: [
        `${sed("9p", `${REPO}/research/README.md`)} | grep -o '3/6 → 6/6 on six reader questions, one trial each'`,
        `${sed("10p", `${REPO}/research/README.md`)} | grep -o 'no arm ever ran without the document'`,
        `${sed("104p;107p", `${REPO}/plugins/terse/references/prior-art.md`)} | grep -o -E 'We have no control for prior knowledge|Both ran the control\\. We did not\\.'`,
        sed("103,106p", `${CH}/chain-source-prompt.txt`),
        `grep -n -o '^  [1-6]\\. "[^"]*" - ANSWERED [A-Z]*' ${CH}/chain-source-prompt.txt`,
        sed("125,126p", `${SK}/audit/references/measure.md`),
        `grep -n -E '^## E[78]\\.|the \\*before\\* measurement are recorded one by one|record of the \\*after\\* measurement \\(6/6\\) exists anywhere in the repository' ${REPO}/ISSUES.md | cut -c1-120`,
        `${sed("533p", `${CH}/chain/audit.md`)} | grep -o 'No new six-reader experiment was run'`,
        `grep -h live_reader_experiments_run ${CH}/chain/validation.json`,
        `echo "files under research/2026-09-10-chain naming 6/6: $(grep -rl -E '(^|[^0-9])6/6([^0-9]|$)' ${CH} | sed 's#^${CH}/##' | tr '\\n' ' ')"; grep -rh -o -E '.{0,40}(^|[^0-9])6/6([^0-9]|$).{0,30}' ${CH}`,
      ].join("; "),
      expect: E(L("3/6 → 6/6 on six reader questions, one trial each"), "no arm ever ran without the document",
                L("We have no control for prior knowledge"), L("Both ran the control. We did not."),
                L("=== PART 4. WHERE THE SIX READERS ACTUALLY FAILED ==="), "Three of six answered\\s+correctly",
                L('1. "What is this?" - ANSWERED WRONG'), L('2. "What must I install?" - ANSWERED PARTIALLY'), L('3. "How do I run it the first time?" - ANSWERED CORRECTLY'),
                L('4. "What may it touch?" - ANSWERED CORRECTLY'), L('5. "How do I know the work happened?" - ANSWERED WRONG'), L('6. "How do I remove what it left?" - ANSWERED CORRECTLY'),
                L("the four-part chain moved one README from 3/6 to 6/6, took departures from 1 to 0, and broke neither control"),
                "\\n\\d+:## E7\\. ", "\\n\\d+:the \\*before\\* measurement are recorded one by one",
                "\\n\\d+:record of the \\*after\\* measurement \\(6/6\\) exists anywhere in the repository", "\\n\\d+:## E8\\. ",
                L("No new six-reader experiment was run"), L('"live_reader_experiments_run": 0'),
                "files under research/2026-09-10-chain naming 6/6: run-2x5/fYDiYZUN\\.answer\\.md \\n", L("6/6 focused CLI checks")) });
}
// L6.3-08, its second half (lens 1 F1; the plugin's own known limit, CHANGELOG.md:100-103): the pilot says
// nothing of a human reader. The sentence was unpinned (C33 covers the McNemar sentence before it only).
{
  const old = at("The result neither clears a significance threshold nor separates what the text taught from prior knowledge.");
  const nu = "The result neither clears a significance threshold nor separates\n  what the text taught from prior knowledge, nor says whether a human reader improved.";
  const PA = `${REPO}/plugins/terse/references/prior-art.md`;
  edit("L6.3-08 the pilot's third limit: no word on a human reader (R04e new)", old, nu,
    [{ name: "R04e the result neither clears a significance threshold, nor separates what the text taught from prior knowledge, nor says whether a human reader improved", pattern: pin(nu),
       asks: "The chain's result does not clear a significance threshold, does not separate what the text taught its readers from what they already knew, and does not say whether a human reader improved." }],
    { level: 2,
      run: `${sed("92,95p;104p", PA)}; ${sed("40p;125,127p", `${SK}/audit/references/measure.md`)}; ${sed("100,103p", `${REPO}/plugins/terse/CHANGELOG.md`)}; ${sed("128,132p", PA)}`,
      expect: E(L("**The headline number is not distinguishable from noise.**"), "cannot be told from chance at conventional thresholds",
                L("**We have no control for prior knowledge"), L("the 2026-09-10 run used Haiku"),
                "the result does not survive a\\s+significance test", L("### Known limits"),
                "The audit's ruler measures whether a model can answer from the text, not whether a human reader\\s+improved",
                L("## Is a model reader a valid stand-in? The honest answer"),
                "terse currently measures model answerability, and its numbers are not valid evidence of\\s+human improvement yet") });
}
// L6.3-19 (lens 2, noted): "bake-off" is rewrite's step at l41, l100 and l122; the 2 × 5 run is called an
// experiment, as l107 counts it. C42 re-pinned; its check held in round 03 and is kept as it is.
{
  const old = at("A separate bake-off used ten agents in a 2 × 5 design: four writing standards, one an unpublished draft, and one unguided control condition with two agents.");
  const nu = "A separate experiment used ten agents in a 2 × 5 design: four writing standards, one an unpublished\n  draft, and one unguided control condition with two agents.";
  const e = entry("C42");
  edit("L6.3-19 the 2 × 5 run is an experiment, not the bake-off (C42 re-pinned)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "A separate experiment used ten agents in a two-by-five design: four writing standards, one of them an unpublished draft, and one unguided control condition given to two agents." }],
    { level: 2, run: e.run, expect: e.expect });
}

// ---- Apply as round.mjs does, and hold the result to what the brief protects ----------------------
let t = T;
for (const e of edits) {
  if (count(T, e.old) !== 1) throw new Error(`${e.name}: not once in 03`);
  const n = count(t, e.old);
  if (n !== 1) throw new Error(`${e.name}: ${n} occurrence(s) at its turn`);
  const expected = t.split(e.old).join(e.new);
  t = t.replace(e.old, e.new);
  if (t !== expected) throw new Error(`${e.name}: String.replace read a $ pattern in new`);
}
const kept = [
  at("/terse:rethink → skeleton → /terse:rewrite → candidate + diff → /terse:audit /terse:audit → run file → /terse:rewrite → candidate + diff → /terse:audit again what broke what to write did it hold"),
  "```\n/plugin marketplace add Nowely/agent-skills\n/plugin install terse@nowely\n```",
  at("The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`."),
  at("Copying that defect into the repository's `ISSUES.md`, or applying the candidate to your document, requires your word."),
  at("It is not a compressor. Length does not select a candidate, and section budgets are reports rather than gates."),
  at("The intended scope is Markdown in any language, whether or not the document is about software."),   // decision (e), L6.3-28
  at("The writing rules forbid cutting a condition, limit, or warning where a reader decides, and the bake-off vetoes a candidate that cuts or weakens one."),   // R03l, untouched
  at("That guard is not a promise that no regression can occur."),
];
for (const p of kept) if (count(t, p) !== 1) throw new Error(`protected passage not byte-identical once: ${p.slice(0, 60)}`);
for (const f of ["2,725 words to 2,571 — six percent —", "the second pass cut 105 words and the third added 105 back as missing framing.",
                 "a candidate and its diff from the original"])   // Q4's protected content: candidate + diff
  if (!norm(t).includes(f)) throw new Error(`the protected content is not intact: ${f}`);
for (const e of edits) for (const c of e.claims ?? []) if (!new RegExp(c.pattern).test(t.replace(/\s+/g, " "))) throw new Error(`${c.name}: pattern absent from the result`);
const dropped = edits.flatMap((e) => e.drop ?? []);
for (const c of ledger) {   // every entry this round neither re-pins nor drops must still hold on the result
  if (dropped.includes(c.name) || edits.some((e) => (e.claims ?? []).some((k) => k.name === c.name))) continue;
  const hit = new RegExp(c.pattern, c.flags ?? "").test(t.replace(/\s+/g, " "));
  if (hit !== c.want) throw new Error(`${c.name}: ${c.want ? "LOST" : "revived"} on the result`);
}
for (const bad of ["`main`", "At the 2026-09-22 audit", "This page describes", "may reword", "works before prose", "The section below describes"])
  if (t.includes(bad)) throw new Error(`still in the result: ${bad}`);
const provisional = edits.flatMap((e) => (e.check?.level === 2 ? (e.claims ?? []) : []).filter((c) => /lifecycle|stays|removed|continu|resum|reclaim|kept|prun/i.test(c.name + " " + c.pattern)).map((c) => c.name));
if (provisional.length) console.log(`marked provisional by round.mjs: ${provisional.join("; ")}`);
const names = edits.flatMap((e) => (e.claims ?? []).map((c) => c.name));
if (new Set(names).size !== names.length) throw new Error("a claim name is declared twice");
fs.writeFileSync(`${RUN}/edits/04.json`, JSON.stringify(edits, null, 1) + "\n");
console.log(`edits/04.json: ${edits.length} edits, ${names.length} claims (${names.filter((n) => ledger.some((c) => c.name === n)).length} re-pins, ${names.filter((n) => !ledger.some((c) => c.name === n)).length} new), drop ${dropped.join(", ")}; ledger read from ${seedFile.replace(/^.*\//, "")}; protected passages intact; words ${norm(T).split(" ").length} -> ${norm(t).split(" ").length}`);
