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
//
// Second build. The verifier sent the first back (reviews/04/verifier-sol-v3.md: 16 claims, 9 DOES NOT
// ANSWER); the first build is kept as edits/04.sent-back.json and edits/04.sent-back.build.mjs. Five of the
// nine sit under the frame "below is what each page and its references say", and their `asks` now say what
// the page instructs or says, which is what their runs show (R03a C06 C10 C11 R04a); R03i's says what the checkout is
// and R03j is a claim about the record of 2026-09-22 and about what 8c041b7's page instructs, with every
// asking line of that page shown; C44 searches the whole repository; C42 loses "unpublished", the audit's word
// (audit.md:377, C39's verdict) and not the source's. R02e is re-pinned with its sentence unchanged, because
// 1af4160 and b7a17da moved the ISSUES.md lines its run cited. The seven claims that held keep their edits; R04d shares
// R03j's edit and so its check, which now shows more.
//
// Third build, before the verifier's second read: R03j's `asks` and run also name the run of the page's lineage
// that landed in this repository (research/2026-09-11-markup-round-0/), so the verb "wrote" has a record behind
// it and not only an instruction. Text unchanged; every other edit as in the second build.
//
// Fourth build, after the verifier's second read (reviews/04/verifier-sol-v3b.md: 17 claims, 16 HOLD): R03a
// only. Its `asks` says what the frame sentence says, and its run shows, sentence by sentence, where the
// section's statements come from. Text unchanged; every other edit as in the third build.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RUN = path.join(os.tmpdir(), "terse/runs/20260922-233021-terse-readme");
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../../..");
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
  // Sent back twice. V3: the `asks` said the section describes each skill by what its pages and references
  // say, which no run compared. V3b (reviews/04/verifier-sol-v3b.md): the second `asks` weakened that to
  // "draws on", and the run never opened the references. Fourth build: the `asks` says what the sentence says,
  // and the run shows it. A one-liner (kept readable as probe-04/r03a-section.js) replays this round's edits on
  // 03-review.md, takes the section *What each one does*, and for every pinned claim whose pattern matches in
  // it — the ledger as it stands before the round, with this round's claims laid over it — prints the files
  // its run cites; a probe under the run directory is not a source, and the plugin files the probe itself
  // reads are printed after it. It counts the files cited outside plugins/terse/skills (0), and it prints the
  // section's sentences that carry no claim (3), whose page lines the run then quotes. R03a itself is left out
  // of its own count.
  const ONE = fs.readFileSync(`${PROBE}/r03a-section.js`, "utf8").trim();
  if (ONE.includes("'")) throw new Error("the one-liner carries a single quote and cannot sit in the shell's quotes");
  const run = [
    `grep -n -E '^(name|disable-model-invocation):' ${SK}/*/SKILL.md | sed 's#^${SK}/##'`,
    `${sed("13p", `${SK}/audit/SKILL.md`)} | grep -o 'You run seven steps in order'`,
    `${sed("30p", `${SK}/rethink/SKILL.md`)} | grep -o 'Announce the count and the models before spawning'`,
    `${sed("29p", `${SK}/rewrite/SKILL.md`)} | grep -o 'Ask the user for the run directory from .audit.'`,
    `ls ${SK}/*/references | sed 's#^${SK}/##'`,
    `node -e '${ONE}' ${RUN}`,
    `echo 'their pages:'; ${sed("6p", `${SK}/audit/SKILL.md`)} | grep -o 'It never proposes wording'; ${sed("114p", `${SK}/audit/references/ledgers.md`)} | grep -o 'State what a repair must achieve, not how to word it.'`,
    `${sed("94p", `${SK}/audit/SKILL.md`)} | grep -o 'The baseline measurement runs a second arm with no documentation at all'`,
    `${sed("109,110p", `${SK}/audit/SKILL.md`)} | tr '\\n' ' ' | grep -o 'two readers carrying a task: a starting state and an outcome they want, acting from the documentation alone'`,
    `${sed("181,182p", `${SK}/rewrite/SKILL.md`)} | tr '\\n' ' ' | tr -s ' ' | grep -o 'no regression in the round\\*\\*: the ledger passes, and no sentence the round introduced was shown false or overstated by its critics'`,
  ].join("; ");
  edit("L6.3-17 the frame names each page and its references (R03a re-pinned)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "Each of the three skills is a page of instructions for Claude — a SKILL.md whose frontmatter names it and disables model invocation — with reference files under its references/ directory; and the section What each one does says what those pages and references say: its sentences that carry a claim (fourteen: C06 C07 C09 C10 C11 G1 R02f2 R03c R03d R03e R03f R03g R04a R04b) have runs that cite only skill pages and reference files under plugins/terse/skills, or — R04b, through its probe — the shipped scripts under scripts/, none outside that tree; and its three sentences that carry no claim (the baseline and the task readers; audit stating what a repair must achieve without proposing wording; the guard being no promise that no regression can occur) are quoted from audit/SKILL.md:6, 94 and 109-110, audit/references/ledgers.md:114 and rewrite/SKILL.md:181-182." }],
    { level: 2, run,
      expect: E("audit/SKILL\\.md:2:name: audit\\naudit/SKILL\\.md:7:disable-model-invocation: true\\nrethink/SKILL\\.md:2:name: rethink\\nrethink/SKILL\\.md:7:disable-model-invocation: true\\nrewrite/SKILL\\.md:2:name: rewrite\\nrewrite/SKILL\\.md:8:disable-model-invocation: true\\n",
                "You run seven steps in order\\nAnnounce the count and the models before spawning\\nAsk the user for the run directory from `audit`\\n",
                "audit/references:\\nledgers\\.md\\nmeasure\\.md\\nreader-profile\\.md\\ntruth-pass\\.md\\n\\nrethink/references:\\nstages\\.md\\n\\nrewrite/references:\\nbake-off\\.md\\ncritic-briefs\\.md\\ncurse-of-knowledge\\.md\\nloop\\.md\\nmeasurements\\.md\\nwriting-rules\\.md\\n",
                "\\nR04b probe: probe-04/ledger-guard\\.sh -> rewrite/scripts rewrite/SKILL\\.md\\n",
                "section claims: 14; cited outside plugins/terse/skills: 0\\nsection sentences with no claim: 3\\n- A baseline asks the same questions with no documentation,[^\\n]*\\n- Audit states what a repair must achieve without proposing[^\\n]*\\n- That guard is not a promise that no regression can occur\\.\\n",
                "their pages:\\nIt never proposes wording\\nState what a repair must achieve, not how to word it\\.\\nThe baseline measurement runs a second arm with no documentation at all\\ntwo readers carrying a task: a starting state and an outcome they want, acting from the documentation alone\\nno regression in the round\\*\\*: the ledger passes, and no sentence the round introduced was shown false or overstated by its critics") });
}
// L6.3-08 (lens 1 F1): the readers are model agents the audit spawns. C06 re-pinned.
{
  const old = at("**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh reader to each question. Readers start at the entry file and may open only Markdown.");
  const nu = "**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh\nreader, a model agent, to each question. Readers start at the entry file and may open only Markdown.";
  edit("L6.3-08 the readers are model agents (C06 re-pinned)", old, nu,
    // Sent back (V3): the `asks` stated the spawn as a behaviour; it now says what the page instructs.
    [{ name: name("C06"), pattern: pin(nu),
       asks: "The audit page instructs Claude to write a reader profile, a claim ledger and an answer key before it spawns one fresh reader per question, each reader a model agent whose count and model are announced before spawning; and it says each reader starts at the entry file and may open only .md files." }],
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
    // Sent back (V3): the `asks` stated the hand-over and the wait as behaviour; it now says what the page says.
    [{ name: name("C10"), pattern: pin(nu),
       asks: "The rethink page says the skeleton it hands over holds each section's title, purpose, exclusions and word budget, and the rules the writing must pass, and it instructs Claude to stop and wait for the user after handing it over." }],
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
    // Sent back (V3): the `asks` stated the resume as a lifecycle; it now says what the page's table names.
    [{ name: name("C11"), pattern: pin(nu),
       asks: "The rewrite page names these three starts: the skeleton rethink agreed, an audit's run file, and a run directory of its own that already holds rounds, which it takes up at the next round." }],
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
    // Sent back (V3): the `asks` read as a hand-over that happened; it now says what the page instructs.
    [{ name: "R04a a round is handed over as a candidate and its diff from the original", pattern: pin(nu),
       asks: "The rewrite page instructs Claude to hand a round over to the user as the candidate together with its diff against the original." }],
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
    // Sent back (V3): "describes" read as a claim about every sentence; the `asks` now says what the run shows.
    [{ name: e.name, pattern: pin(nu),
       asks: "The plugin tree this README's statements are checked against is the one at commit 2f29a8f: in the checkout the rounds read, HEAD's plugins/terse and .claude-plugin equal 2f29a8f's." }],
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
  // Sent back (V3): the run quoted the record and the page but `asks` stated a resolution and a write as
  // behaviour, which no run here repeats. R03j is now a claim about the record of 2026-09-22 (the adversarial
  // read that ran both commands) and about what 8c041b7's rewrite page instructs. Every line of that page that
  // asks, waits or needs the user's word is printed, so the reader sees that none sits in the run-directory
  // block. R04d, on the same sentence, keeps its `asks` and its evidence, the diff, which this run still prints.
  // The whole output stays under round.mjs's 2000-character clip of `saw`.
  // Third build (the coordinator, for the verb "wrote"): the claim also names runs that landed in this
  // repository under the page's instruction. research/2026-09-11-markup-round-0/ is a rewrite run of this
  // repository's plugins/codex-delegate/README.md, kept with its rounds at the repository's root; its README
  // lists the rounds there (:43, :45); the page first placed runs under research/ at 1e3f5b2 on the branch the
  // plugin was built on (the only commit there that adds the phrase), and that run's rounds 08 and 09 were
  // committed after it; the page shipped at 0.1.0 (b29e921) with 8c041b7's lines 64-67 unchanged. Rounds 00-07
  // came before 1e3f5b2, so the claim says what the order shows. To make room under the clip, brief.md:198
  // (the same record as l3-adversarial-findings.md:11), the HEAD-equals-2f29a8f line and 2f29a8f's line 66 are
  // dropped, and the asking lines print their phrase only; the rest is as in the second build.
  const L3 = `${REPO}/research/2026-09-22-terse-process/rewrite-2026-09-22/l3-adversarial-findings.md`;
  const MR = `${REPO}/research/2026-09-11-markup-round-0`;
  const P8 = `git -C ${REPO} show 8c041b7:plugins/terse/skills/rewrite/SKILL.md`;
  const P0 = `git -C ${REPO} show b29e921:plugins/terse/skills/rewrite/SKILL.md`;
  const ASK = "your word|user's word|their word|(^|[^a-z])ask|wait for|consent|approv|permission";
  const run = [
    `${sed("196p", `${RUN}/brief.md`)} | grep -o 'adversarial whole-document read (Codex Astra L3, 2026-09-22, added under What broke'`,
    `${sed("3p", L3)} | grep -o 'Checks performed on 2026-09-22'; ${sed("23,24p", L3)}`,
    `${sed("11p", L3)} | grep -o 'The exact two shell commands fetched .main. at .8c041b76d7f30196441285d77985b81ae9c9e59f. and installed terse 0.1.1'`,
    `${sed("13p", L3)} | grep -o 'This confirms the fetched payload and its instructions, not that a model performed the unapproved writes'`,
    `${sed("209p", `${RUN}/audit.md`)} | grep -o '.origin/main. (8c041b7) lists terse 0.1.1'`,
    `echo '8c041b7 against 2f29a8f, plugins/terse:'; git -C ${REPO} diff --shortstat 8c041b7 2f29a8f -- plugins/terse; git -C ${REPO} diff --stat=72 8c041b7 2f29a8f -- plugins/terse/skills/audit/SKILL.md plugins/terse/skills/rewrite/SKILL.md | sed '$d'`,
    `echo '8c041b7, rewrite/SKILL.md:64, 66-67:'; ${P8} | sed -n '64p;66,67p'`,
    `echo "8c041b7, rewrite/SKILL.md, every line that asks, waits or needs the user's word, with the phrase:"; ${P8} | grep -n -o -i -E "${ASK}"`,
    `echo "of them in step 4's run-directory block, 64-78: $(${P8} | sed -n '64,78p' | grep -c -i -E "${ASK}")"`,
    `[ "$(${P0} | sed -n '64,67p')" = "$(${P8} | sed -n '64,67p')" ] && echo 'rewrite/SKILL.md:64-67 at b29e921 (0.1.0) = at 8c041b7'`,
    `echo 'a rewrite run in this repository:'; ls -d ${MR} | sed 's#^${REPO}/##'; ${sed("3,4p", `${MR}/README.md`)} | tr '\\n' ' ' | grep -o 'The document: .plugins/codex-delegate/README.md., 2726 words'`,
    `git -C ${REPO} cat-file -e b29e921:plugins/codex-delegate/README.md && echo 'b29e921:plugins/codex-delegate/README.md exists'`,
    `${sed("43p;45p", `${MR}/README.md`)} | grep -o -E '^## What is in this directory|^- .NN-<pass>.md. — every round, never overwritten'`,
    `git -C ${REPO} log --format='committed into the repository: %h %ad' --date=short -1 -- research/2026-09-11-markup-round-0`,
    `echo "first commit putting research/<date>-<slug>/ in the page, on terse-plugin: $(git -C ${REPO} log terse-plugin --format=%h -S 'research/<date>-<slug>/' -- plugins/terse/skills/rewrite/SKILL.md | tail -1)"; git -C ${REPO} show 1e3f5b2:plugins/terse/skills/rewrite/SKILL.md | sed -n '141p' | grep -o '.research/<date>-<slug>/. in the repository'`,
    `echo 'then rounds 08 and 09 of that run:'; for c in 1e3f5b2 a4238a5 0eb7762; do git -C ${REPO} log -1 --format='%h %ad' --date=format:'%Y-%m-%d %H:%M' $c; done; git -C ${REPO} show --name-only --format= a4238a5 -- research/2026-09-11-markup-round-0/08-review.md; git -C ${REPO} show --name-only --format= 0eb7762 -- research/2026-09-11-markup-round-0/09-reduction.md`,
  ].join("; ");
  edit("L6.3-03/15 the 2026-09-22 boundary: no branch, both pages, l75 cut (R03j re-pinned, R04d new, G4 dropped)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "Record, 2026-09-22: the adversarial whole-document read, added under the audit's What broke, ran the two install commands with Nowely/agent-skills, which fetched the marketplace's main at 8c041b7 and installed terse 0.1.1. Instruction, 8c041b7's rewrite page (level 2): step 4 puts the run in research/<date>-<slug>/ at the root of the repository that holds the document, and no line of that block asks the user before the directory is made; the page's lines that ask or wait (7, 29, 61, 104-105, 150) concern its description's promise to write only on your word, the audit's run directory, spawning agents and applying the candidate. Record, this repository: the page shipped at 0.1.0 (b29e921) with the same lines, and a rewrite run was written into this repository under that instruction — research/2026-09-11-markup-round-0/, a rewrite of this repository's plugins/codex-delegate/README.md that holds its rounds at the repository's root, whose rounds 08 and 09 were committed after the page first placed runs under research/ (1e3f5b2)." },
     { name: "R04d at 8c041b7 the audit and rewrite pages differ from the ones this README describes", pattern: pin(differ),
       asks: "At 8c041b7, the revision the install commands resolved to on 2026-09-22, the audit page and the rewrite page differ from the pages at 2f29a8f that this README describes." }],
    { level: 2, run,
      expect: E(L("adversarial whole-document read (Codex Astra L3, 2026-09-22, added under What broke"),
                L("Checks performed on 2026-09-22"), L("claude plugin marketplace add Nowely/agent-skills") + "\\n" + L("claude plugin install terse@nowely"),
                L("The exact two shell commands fetched `main` at `8c041b76d7f30196441285d77985b81ae9c9e59f` and installed terse 0.1.1"),
                L("This confirms the fetched payload and its instructions, not that a model performed the unapproved writes"),
                L("`origin/main` (8c041b7) lists terse 0.1.1"),
                L("8c041b7 against 2f29a8f, plugins/terse:"), L("10 files changed, 487 insertions(+), 50 deletions(-)"),
                "plugins/terse/skills/audit/SKILL\\.md\\s+\\|\\s+27 ", "plugins/terse/skills/rewrite/SKILL\\.md\\s+\\|\\s+92 ",
                L("8c041b7, rewrite/SKILL.md:64, 66-67:"), L("## Step 4. The rounds"),
                L("Work in a run directory of the document's own — `research/<date>-<slug>/` at the root of the") + "\\s+repository that holds the document",
                "with the phrase:\\n7:your word\\n29:Ask\\n61:Wait for\\n61:user's word\\n104:wait for\\n105:user's word\\n150:their word\\nof them in step 4's run-directory block, 64-78: 0\\n",
                L("rewrite/SKILL.md:64-67 at b29e921 (0.1.0) = at 8c041b7"),
                "a rewrite run in this repository:\\nresearch/2026-09-11-markup-round-0\\n" + L("The document: `plugins/codex-delegate/README.md`, 2726 words"),
                L("b29e921:plugins/codex-delegate/README.md exists"),
                L("## What is in this directory") + "\\n" + L("- `NN-<pass>.md` — every round, never overwritten"),
                L("committed into the repository: b29e921 2026-09-12"),
                "first commit putting research/<date>-<slug>/ in the page, on terse-plugin: 1e3f5b2\\n" + L("`research/<date>-<slug>/` in the repository"),
                "then rounds 08 and 09 of that run:\\n1e3f5b2 2026-09-12 19:03\\na4238a5 2026-09-12 20:29\\n0eb7762 2026-09-12 20:45\\nresearch/2026-09-11-markup-round-0/08-review\\.md\\nresearch/2026-09-11-markup-round-0/09-reduction\\.md") },
    [name("G4")]);
}

// ---- Where it writes ------------------------------------------------------------------------------
// Not a finding of the wave: R02e's run (ISSUES.md:183-188) held E13 when it was pinned at f677303; 1af4160
// moved E13 to 187 and b7a17da to 189, so the run has not matched its `expect` since 1af4160 (the coordinator
// re-ran every pin at b7a17da: 40 of 41 match, R02e does not). R02e is
// re-pinned under its name with E13 found by its heading; the sentence is unchanged, so `new` equals `old`,
// which round.mjs accepts (round.mjs:99-104 checks only that `old` occurs once, then replaces it). `asks` unchanged.
{
  const old = at("The `rethink` page does not specify where its skeleton is stored.");
  const e = entry("R02e");
  edit("R02e re-pinned: its run finds ISSUES.md E13 by heading, since E13 moved from line 183 (sentence unchanged)", old, old,
    [{ name: e.name, pattern: pin(old), asks: e.asks }],
    { level: 2,
      run: `grep -c -i -E 'director|\\$RUN|RUN=|CLAUDE_PLUGIN_DATA|TMPDIR|/tmp|mkdir|skeleton\\.md|stored|saved' ${SK}/rethink/SKILL.md; grep -n -A6 '^## E13' ${REPO}/ISSUES.md`,
      expect: "^0\\n" + any + "\\d+:## E13\\. `rethink` hands over \"one file\" and no page says where it is written" + any +
              "with no path, no run directory and no statement of whether\\s+(\\d+-)?the file lands inside or outside the user's repository" });
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
      // Sent back (V3): the negative search covered the chain's directory only. It now covers the whole
      // repository, .md .txt and .json with .git excluded, for a per-reader line in the before-record's own
      // form ("N. "question" - ANSWERED VERDICT", chain-source-prompt.txt:108-132); the one other file with
      // such lines is the seat prompt the record was copied from, byte-identical, and awk counts the lines in
      // that form that are not lines of the before-record: 0.
      run: [
        `${sed("9p", `${REPO}/research/README.md`)} | grep -o '3/6 → 6/6 on six reader questions, one trial each'`,
        `${sed("10p", `${REPO}/research/README.md`)} | grep -o 'no arm ever ran without the document'`,
        `${sed("104p;107p", `${REPO}/plugins/terse/references/prior-art.md`)} | grep -o -E 'We have no control for prior knowledge|Both ran the control\\. We did not\\.'`,
        sed("103,106p", `${CH}/chain-source-prompt.txt`),
        `grep -n -o '^  [1-6]\\. "[^"]*" - ANSWERED [A-Z]*' ${CH}/chain-source-prompt.txt`,
        sed("125,126p", `${SK}/audit/references/measure.md`),
        `echo 'files in the repository (.md .txt .json, .git excluded) holding lines in the before-record form, with counts:'; grep -rc -E '[1-6]\\. "[^"]*" - ANSWERED (WRONG|PARTIALLY|CORRECTLY)' --include='*.md' --include='*.txt' --include='*.json' --exclude-dir=.git ${REPO} | grep -v ':0$' | sed 's#^${REPO}/##' | sort`,
        `cmp -s ${CH}/chain-source-prompt.txt ${CH}/run-2x5/Faf2geGl.prompt.txt && echo 'run-2x5/Faf2geGl.prompt.txt and chain-source-prompt.txt: byte-identical'`,
        `grep -rh -E '[1-6]\\. "[^"]*" - ANSWERED (WRONG|PARTIALLY|CORRECTLY)' --include='*.md' --include='*.txt' --include='*.json' --exclude-dir=.git ${REPO} | awk -v f=${CH}/chain-source-prompt.txt 'BEGIN{while((getline l < f)>0) own[l]=1} !own[$0]{n++} END{print "lines in that form that are not lines of the before-record: " n+0}'`,
        `grep -n -E '^## E[78]\\.|the \\*before\\* measurement are recorded one by one|record of the \\*after\\* measurement \\(6/6\\) exists anywhere in the repository' ${REPO}/ISSUES.md | cut -c1-120`,
        `${sed("533p", `${CH}/chain/audit.md`)} | grep -o 'No new six-reader experiment was run'`,
        `grep -h live_reader_experiments_run ${CH}/chain/validation.json`,
      ].join("; "),
      expect: E(L("3/6 → 6/6 on six reader questions, one trial each"), "no arm ever ran without the document",
                L("We have no control for prior knowledge"), L("Both ran the control. We did not."),
                L("=== PART 4. WHERE THE SIX READERS ACTUALLY FAILED ==="), "Three of six answered\\s+correctly",
                L('1. "What is this?" - ANSWERED WRONG'), L('2. "What must I install?" - ANSWERED PARTIALLY'), L('3. "How do I run it the first time?" - ANSWERED CORRECTLY'),
                L('4. "What may it touch?" - ANSWERED CORRECTLY'), L('5. "How do I know the work happened?" - ANSWERED WRONG'), L('6. "How do I remove what it left?" - ANSWERED CORRECTLY'),
                L("the four-part chain moved one README from 3/6 to 6/6, took departures from 1 to 0, and broke neither control"),
                "holding lines in the before-record form, with counts:\\nresearch/2026-09-10-chain/chain-source-prompt\\.txt:6\\nresearch/2026-09-10-chain/run-2x5/Faf2geGl\\.prompt\\.txt:6\\n",
                L("run-2x5/Faf2geGl.prompt.txt and chain-source-prompt.txt: byte-identical"),
                L("lines in that form that are not lines of the before-record: 0"),
                "\\n\\d+:## E7\\. ", "\\n\\d+:the \\*before\\* measurement are recorded one by one",
                "\\n\\d+:record of the \\*after\\* measurement \\(6/6\\) exists anywhere in the repository", "\\n\\d+:## E8\\. ",
                L("No new six-reader experiment was run"), L('"live_reader_experiments_run": 0')) });
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
// Sent back (V3): the source says "a draft rule block for the owner's CLAUDE.md" (v04PR6HL.prompt.txt:18);
// "unpublished" was the audit's word (audit.md:377, C39's verdict), which no run shows. The text says "draft".
{
  const old = at("A separate bake-off used ten agents in a 2 × 5 design: four writing standards, one an unpublished draft, and one unguided control condition with two agents.");
  const nu = "A separate experiment used ten agents in a 2 × 5 design: four writing standards, one of them a\n  draft, and one unguided control condition with two agents.";
  const e = entry("C42");
  edit("L6.3-19 the 2 × 5 run is an experiment, not the bake-off; the draft as the source names it (C42 re-pinned)", old, nu,
    [{ name: e.name, pattern: pin(nu),
       asks: "A separate experiment used ten agents in a two-by-five design: five conditions of two agents each, four of them writing standards, one of the four a draft rule block for the owner's CLAUDE.md, and the fifth a control condition given no standard at all." }],
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
