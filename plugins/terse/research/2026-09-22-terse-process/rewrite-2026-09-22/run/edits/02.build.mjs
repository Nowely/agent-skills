#!/usr/bin/env node
// Builds edits/02.json — round 02 of the rewrite of plugins/terse/README.md: the grafts the bake-off
// judges named, and the re-pins of the thirteen seed claims round 01 reworded. Every `old` is taken from
// 01-candidate.md itself, so its bytes are the file's; every pattern is escaped the way ledger-seed.mjs
// escapes a sentence (ledger-seed.mjs:50-51). The edits are then applied here exactly as round.mjs:101-105
// applies them, and the result is checked for the protected passages before anything is written.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RUN = path.join(os.tmpdir(), "terse/runs/20260922-233021-terse-readme");
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../../..");
const SK = `${REPO}/plugins/terse/skills`;
const CH = `${REPO}/research/2026-09-10-chain/chain`;
const B5 = `${REPO}/research/2026-09-10-chain/run-2x5`;
const PROBE = `${RUN}/probe-02`;
const T = fs.readFileSync(`${RUN}/01-candidate.md`, "utf8");
const seedFile = fs.existsSync(`${RUN}/ledger.02.json`) ? `${RUN}/ledger.02.json` : `${RUN}/ledger.json`;
const seed = JSON.parse(fs.readFileSync(seedFile, "utf8"));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const pin = (s) => esc(norm(s));
const count = (t, s) => t.split(s).length - 1;
// The exact bytes of a passage of 01, found by its words; it must occur once.
const at = (words) => {
  const hits = [...T.matchAll(new RegExp(norm(words).split(" ").map(esc).join("\\s+"), "g"))];
  if (hits.length !== 1) throw new Error(`${hits.length} match(es) in 01 for: ${words}`);
  return hits[0][0];
};
const seedName = (id) => {
  const hits = seed.filter((c) => c.name.startsWith(id + " "));
  if (hits.length !== 1) throw new Error(`${hits.length} ledger entries for ${id}`);
  return hits[0].name;
};
const seedLevel = (id) => seed.find((c) => c.name.startsWith(id + " ")).level;
const sed = (range, file) => `sed -n '${range}' ${file}`;
const edits = [];

// G1 — the announce-and-wait sentence round 01 cut (original :38), where a reader deciding whether to
// run a skill meets it: after the three skill descriptions, at the end of the section, as the original,
// A and C placed it. Wording from A:66-67, which names what the skills wait for, as the pages do.
{
  const old = at("a new measurement rather than a comparison.");
  const text = "All three skills announce how many agents they are about to spawn, on which model, and wait for your\nword.";
  edits.push({
    name: "G1 announce-and-wait restored after the three skill descriptions",
    old, new: `${old}\n\n${text}`,
    claims: [{ name: "G1 all three skills announce agents and model, then wait for your word", pattern: pin(text),
      asks: "Each of the three skills, before it spawns agents, says how many it is about to spawn and on which model, and waits for the user's word." }],
    check: { level: 2,
      run: [sed("86,87p", `${SK}/audit/SKILL.md`), sed("40,42p", `${SK}/audit/references/measure.md`),
            sed("30p;56,57p", `${SK}/rethink/SKILL.md`), sed("60,61p;131,132p", `${SK}/rewrite/SKILL.md`)].join("; "),
      expect: [esc("Announce the plan before spawning anything: how many readers, which model"), "[\\s\\S]*Wait\\s+for the user's word\\.",
               "[\\s\\S]*Announce the count\\s+and the model to the user and wait for their word before spawning\\.",
               "[\\s\\S]*", esc("Announce the count and the models before spawning, and wait for the user's word."),
               "[\\s\\S]*", esc("Announce the count and the models, and wait."),
               "[\\s\\S]*", esc("Announce before spawning: the count, the models"), "[\\s\\S]*", esc("Wait for the user's word."),
               "[\\s\\S]*", esc("**Announce the wave**"), "[^\\n]*the models[\\s\\S]*and wait for the user's word"].join("") } });
}

// G4 — the rule-1 violation: "Where it writes" names $TMPDIR before "Install", and G3 adds --keep-data
// beside it. Moving the section below Install clears both; the version boundary's "above" becomes
// "below", the one word the move changes.
const iW = T.indexOf("## Where it writes\n"), iI = T.indexOf("## Install\n");
if (!(iW > 0 && iI > iW && count(T, "## Where it writes\n") === 1 && count(T, "## Install\n") === 1)) throw new Error("section anchors");
const body = T.slice(iW + "## Where it writes\n\n".length, iI).replace(/\n+$/, "");
edits.push({ name: "G4 move 1/2: Where it writes leaves its place before Install", old: T.slice(iW, iI + "## Install".length), new: "## Install" });
{
  const old = at("The outside-repository write boundary above therefore describes this checkout, not that published revision.");
  const moved = old.replace("boundary above", "boundary below");
  if (moved === old) throw new Error("version boundary");
  edits.push({
    name: "G4 move 2/2: Where it writes follows Install; the version boundary points below",
    old, new: `${moved}\n\n## Where it writes\n\n${body}`,
    claims: [{ name: "G4 version boundary: the write boundary below is this checkout's, not 21a225b's", pattern: pin(moved),
      asks: "The outside-repository write boundary stated in the section below is what this checkout does, not what the published revision 21a225b did, whose rewrite page worked in a run directory inside the document's repository." }],
    check: { level: 2,
      run: `git -C ${REPO} show 21a225b:plugins/terse/skills/rewrite/SKILL.md | sed -n '66,67p'; ${sed("66,67p", `${SK}/rewrite/SKILL.md`)}; ${sed("44p", `${SK}/audit/SKILL.md`)}`,
      expect: esc("Work in a run directory of the document's own — `research/<date>-<slug>/` at the root of the") + "\\s+repository that holds the document"
        + "[\\s\\S]*" + esc("Work in a run directory of the document's own, outside the repository that holds it")
        + "[\\s\\S]*" + esc("Write nothing into the audited repository.") } });
}

// G3 — the run lifetime round 01 lacks, beside its "Where it writes" statements, as a paragraph at the
// end of that section (after the move). Two edits because the two halves reached different levels: the
// uninstall half was run (level 3), the purge half is the pages' word (level 2, a lifecycle, provisional).
// Wording from A:74-76, the location it restates dropped because round 01 already states it.
{
  const old = at("its skeleton is stored.");
  const text = "Installed, `claude plugin uninstall` deletes the plugin data directory and the runs in it unless you\npass `--keep-data`.";
  edits.push({
    name: "G3a run lifetime, installed: uninstall deletes the runs unless --keep-data",
    old, new: `${old}\n\n${text}`,
    claims: [{ name: "G3a lifecycle: installed, claude plugin uninstall deletes the data directory and its runs unless --keep-data", pattern: pin(text),
      asks: "For an installed plugin, claude plugin uninstall deletes the plugin data directory together with the runs in it, and passing --keep-data keeps them." }],
    check: { level: 3,
      run: `sh ${PROBE}/uninstall-probe.sh; CLAUDE_CONFIG_DIR=${PROBE}/config-uninstall claude plugin uninstall --help | grep -A1 -- --keep-data; ${sed("36,38p", `${SK}/audit/SKILL.md`)}`,
      expect: esc("state planted: plugins/data/terse-nowely present, its run marker present, decoy present") + "\\n"
        + esc("$ claude plugin uninstall terse@nowely -> exit 0") + "[^\\n]*\\n"
        + esc("state after uninstall without --keep-data: plugins/data/terse-nowely absent, its run marker absent, decoy present")
        + "[\\s\\S]*" + esc("$ claude plugin uninstall terse@nowely --keep-data -> exit 0") + "[^\\n]*\\n"
        + esc("state after uninstall with --keep-data: plugins/data/terse-nowely present, its run marker present, decoy present")
        + "[\\s\\S]*--keep-data\\s+Preserve the plugin's persistent data directory"
        + "[\\s\\S]*installed, Claude Code writes the plugin's data directory into that line" } });
}
{
  const old = "\n\n## What it will and will not do to your text";
  if (count(T, old) !== 1) throw new Error("G3b anchor");
  const text = "From a checkout, the operating system may purge\nthe runs in the temporary directory. Copy a run you want to keep.";
  edits.push({
    name: "G3b run lifetime, from a checkout, and the copy",
    old, new: ` ${text}${old}`,
    claims: [{ name: "G3b lifecycle: from a checkout the operating system may purge the runs; copy a run to keep it", pattern: pin(text),
      asks: "Run from a checkout, the runs sit in the system's temporary directory, which the operating system may purge, and a run the user wants to keep is the user's to copy." }],
    check: { level: 2,
      run: `${sed("33p;39,42p", `${SK}/audit/SKILL.md`)}; ${sed("71p;74,78p", `${SK}/rewrite/SKILL.md`)}`,
      expect: esc('RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date') + "[\\s\\S]*in the temporary directory the\\s+operating system may purge it: say in your report that a run which must outlive either is the user's to\\s+copy somewhere durable"
        + "[\\s\\S]*" + esc('RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date') + "[\\s\\S]*in the temporary directory the operating system may purge it: say in\\s+the hand-over that a run which must outlive either is the user's to copy somewhere durable" } });
}

// G2 — the two numbers of the dated chain measurement round 01 dropped (original :66-67), inside round
// 01's "Its pages report" frame. Level 1, as the audit's C31: the pages state them; no reader record does.
{
  const old = at("Its pages report six questions, one trial per question, with 3/6 answers right before and 6/6 after.");
  const next = old.replace(/after\.$/, "after, one reader leaving the documentation before and none after, and\n  neither control question broken.");
  if (next === old) throw new Error("G2");
  edits.push({
    name: "G2 the chain's departures and controls restored beside 3/6 and 6/6",
    old, new: next,
    claims: [{ name: "G2 chain, as its pages report: departures one to zero, neither control broken", pattern: pin(next),
      asks: "The pages that report the 2026-09-10 chain state six questions with one trial each, 3/6 answers right before and 6/6 after, one reader leaving the documentation before and none after, and neither control question broken." }],
    check: { level: 1,
      run: `${sed("3,5p;125,127p", `${SK}/audit/references/measure.md`)}; ${sed("9p", `${REPO}/research/README.md`)}`,
      expect: "changed from 3/6 to 6/6 when the text was repaired[\\s\\S]*six questions, one trial each[\\s\\S]*"
        + esc("moved one README from 3/6 to 6/6, took") + "\\s+" + esc("departures from 1 to 0, and broke neither control. One trial per question")
        + "[\\s\\S]*" + esc("3/6 → 6/6 on six reader questions, one trial each") } });
}

// The re-pins: each seed claim round 01 reworded, pinned to the candidate's own sentence under its seed
// name, at its seed level. No graft touches these sentences, so each is an edit whose old and new are the
// same text — the least the schema allows for a re-pin (round.mjs:14-17).
const repin = (id, sentence, asks, run, expect) => {
  const old = at(sentence);
  edits.push({ name: `repin ${id}`, old, new: old,
    claims: [{ name: seedName(id), pattern: pin(sentence), asks }],
    check: { level: seedLevel(id), run, expect } });
};
repin("C01", "`terse` is a Claude Code plugin that measures whether readers get the right answer and whether a document's claims agree with the code behind it.",
  "terse is a Claude Code plugin that measures two things about a document: whether readers get the right answer from it, and whether its claims agree with the code behind it.",
  `${sed("2,4p", `${REPO}/plugins/terse/.claude-plugin/plugin.json`)}; ${sed("3,6p", `${SK}/audit/SKILL.md`)}`,
  esc('"name": "terse"') + "[\\s\\S]*" + esc("Three user-invoked skills for documentation. `audit` measures it: fresh readers answer the questions your readers arrive with, and every claim about behaviour is checked against the code that backs it")
    + "[\\s\\S]*Measures a document against two rulers: whether fresh readers get the right answer, and whether every\\s+claim about behaviour is true of the code");
repin("C03", "The plugin ships three user-invoked skills.",
  "The plugin ships three skills, and they are invoked by the user rather than by the model.",
  `sh ${PROBE}/details-probe.sh`,
  "install exit 0[\\s\\S]*" + esc("Skills (3)") + "\\s+audit, rethink, rewrite[\\s\\S]*details exit 0[\\s\\S]*"
    + esc("audit/SKILL.md:7:disable-model-invocation: true") + "[\\s\\S]*" + esc("rethink/SKILL.md:7:disable-model-invocation: true") + "[\\s\\S]*" + esc("rewrite/SKILL.md:8:disable-model-invocation: true"));
repin("C06", "**`/terse:audit`** writes a reader profile, a claim ledger, and an answer key before assigning one fresh reader to each question. Readers start at the entry file and may open only Markdown.",
  "audit writes a reader profile, a claim ledger and an answer key before it assigns one fresh reader to each question; the readers start at the entry file and may open only Markdown.",
  sed("13,16p;46p;54,57p;69p;74p;84p;89,90p", `${SK}/audit/SKILL.md`),
  "both exist before the first reader is spawned[\\s\\S]*## Step 2\\. The reader profile[\\s\\S]*## Step 3\\. The truth pass[\\s\\S]*becomes one ledger entry[\\s\\S]*## Step 4\\. The questions and the answer key[\\s\\S]*Write the correct answer to each from the ledger[\\s\\S]*## Step 5\\. The readers[\\s\\S]*One fresh reader per question[\\s\\S]*Each one starts at the entry\\s+file, may open only `\\.md` files");
repin("C07", "It returns the profile, ledger, score against the no-document baseline, and failures. A wrong answer is classified as refuted, missing, placement, findability, or harmful.",
  "audit returns the reader profile, the claim ledger, a score against the no-document baseline, and the failures; it classifies each wrong answer as refuted, missing, placement, findability or harmful.",
  sed("5,6p;94,96p;120p;123,131p", `${SK}/audit/SKILL.md`),
  "Returns a reader profile, a claim ledger, reader scores and\\s+the list of what broke[\\s\\S]*the number this audit reports is the\\s+difference between the two[\\s\\S]*reported as the difference from the no-document arm[\\s\\S]*Give every wrong answer a cause[\\s\\S]*\\| refuted \\|[\\s\\S]*\\| missing \\|[\\s\\S]*\\| placement \\|[\\s\\S]*\\| findability \\|[\\s\\S]*\\| harmful \\|");
repin("C09", "**`/terse:rethink`** works before prose. It compares documents in the same genre, settles terms, and explores structures.",
  "rethink works before any prose is written: it compares documents in the same genre, settles the terms, and explores structures.",
  sed("4,5p;13,15p;25p;30,32p;43p;45,46p;54,56p", `${SK}/rethink/SKILL.md`),
  "Decides what a document should be before a sentence of it is written[\\s\\S]*No prose\\.[\\s\\S]*## Step 1\\. What comparable documents already solved[\\s\\S]*the exact genre[\\s\\S]*## Step 2\\. The words[\\s\\S]*load-bearing term[\\s\\S]*## Step 3\\. The structure[\\s\\S]*About ten structures");
repin("C10", "Its output is a skeleton: each section's title, purpose, exclusions, and word budget. It then waits for your word.",
  "rethink's output is a skeleton giving each section's title, purpose, exclusions and word budget, and rethink then waits for the user's word.",
  sed("13,15p;76p;82,83p", `${SK}/rethink/SKILL.md`),
  "The output is a\\s+skeleton: section titles, what each is for, what each deliberately leaves out, a word budget[\\s\\S]*each section: title, one sentence of purpose, what it deliberately excludes, a word budget[\\s\\S]*" + esc("Then stop and wait. `rewrite` starts from the skeleton the user agreed to"));
repin("C11", "**`/terse:rewrite`** starts from that skeleton or an audit run.",
  "rewrite starts from the skeleton rethink produced or from an audit's run.",
  sed("16,20p;29p", `${SK}/rewrite/SKILL.md`),
  esc("| a skeleton `rethink` agreed | step 2 |") + "[\\s\\S]*" + esc("| an `audit` run file | step 1 |") + "[\\s\\S]*" + esc("Ask the user for the run directory from `audit` and read `audit.md` there"));
repin("C15", "The `rewrite` instructions create their run there too.",
  "rewrite's instructions create its run where audit's instructions create theirs: under the plugin data directory when installed, under the temporary directory from a checkout.",
  `${sed("33p", `${SK}/audit/SKILL.md`)}; ${sed("66,68p;71p", `${SK}/rewrite/SKILL.md`)}`,
  esc('RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date') + "[\\s\\S]*Work in a run directory of the document's own, outside the repository that holds it: made by the\\s+formula of " + esc("[`audit`'s step 1]")
    + "[\\s\\S]*" + esc('RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/$(date'));
repin("C24", "On one file measured on 2026-09-10, the chain moved 2,725 words to 2,571 — six percent — while the second pass cut 105 words and the third added 105 back as missing framing.",
  "On the one file measured on 2026-09-10, the chain took the text from 2,725 words to 2,571, about six percent fewer, while its second pass cut 105 words and its third added 105 back as missing framing.",
  `wc -w ${CH}/00-original.md ${CH}/01-reader-pass.md ${CH}/02-writing-pass.md ${CH}/03-prerequisite-pass.md ${CH}/README.md | awk '{print} NR<=5{w[NR]=$1} END{printf "pass two %+d, pass three %+d, whole chain %+d = %.2f%%\\n", w[3]-w[2], w[4]-w[3], w[5]-w[1], (w[5]-w[1])/w[1]*100}'; ${sed("1p;32,34p", `${REPO}/research/2026-09-10-chain/README.md`)}; ${sed("25p", `${CH}/audit.md`)}`,
  "2725 [^\\n]*00-original\\.md[\\s\\S]*2482 [^\\n]*01-reader-pass\\.md[\\s\\S]*2377 [^\\n]*02-writing-pass\\.md[\\s\\S]*2482 [^\\n]*03-prerequisite-pass\\.md[\\s\\S]*2571 [^\\n]*README\\.md[\\s\\S]*"
    + esc("pass two -105, pass three +105, whole chain -154 = -5.65%") + "[\\s\\S]*" + esc("# The 2026-09-10 chain and bake-off")
    + "[\\s\\S]*the second pass cut 105 words and the third added 105 back\\s+as missing framing[\\s\\S]*Added 105 words for missing framing");
repin("C33", "From those reported counts, three improvements and no reversals give exact two-sided McNemar *p* = 0.25.",
  "From the reported counts, three improvements and no reversals give an exact two-sided McNemar p of 0.25.",
  `node -e 'const b=3,c=0,n=b+c,C=(n,k)=>{let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return r};let s=0;for(let k=0;k<=Math.min(b,c);k++)s+=C(n,k);console.log("improvements "+b+", reversals "+c+": exact two-sided McNemar p = "+Math.min(1,2*s*Math.pow(0.5,n)))'; ${sed("92,95p", `${REPO}/plugins/terse/references/prior-art.md`)}; ${sed("9p", `${REPO}/research/README.md`)}`,
  esc("improvements 3, reversals 0: exact two-sided McNemar p = 0.25") + "\\n[\\s\\S]*Three improvements and zero reversals over six\\s+paired questions gives an exact two-sided McNemar " + esc("**p = 0.25**")
    + "[\\s\\S]*" + esc("3/6 → 6/6 on six reader questions"));
repin("C42", "A separate bake-off used ten agents in a 2 × 5 design: four writing standards, one an unpublished draft, and one unguided control condition with two agents.",
  "A separate bake-off used ten agents in a two-by-five design: four writing standards, one of them an unpublished draft, and one unguided control condition given to two agents.",
  `${sed("1p", `${REPO}/research/2026-09-10-chain/README.md`)}; ${sed("8p;13,20p;22p", `${B5}/v04PR6HL.prompt.txt`)}`,
  esc("# The 2026-09-10 chain and bake-off") + "[\\s\\S]*Ten agents audited the repository[\\s\\S]*The design is a two-by-five factorial\\. Five standards, each given to two agents of DIFFERENT model\\s+families:"
    + "[\\s\\S]*Diataxis\\s+P1, P2[\\s\\S]*verification against the implementation\\s+P3, P4[\\s\\S]*a draft rule block for the owner's CLAUDE\\.md\\s+P5, P6[\\s\\S]*house style\\s+P7, P8[\\s\\S]*CONTROL, no standard given at all\\s+P9, P10[\\s\\S]*Which entrant ran on which model is deliberately hidden");
repin("C43", "Not measured: which pass produced the reported answer gain, or whether a bake-off beats one careful pass.",
  "Nothing measured which pass of the chain produced the reported gain in right answers, or whether a bake-off beats one careful pass.",
  `${sed("130,132p", `${SK}/audit/references/measure.md`)}; ${sed("8,9p", `${SK}/rewrite/references/bake-off.md`)}`,
  esc("**Not measured:** which part of the chain produced the gain. The experiment that would isolate it") + "[\\s\\S]*was designed and deliberately not run[\\s\\S]*" + esc("**Not measured:** that a") + "\\s+bake-off beats a single careful pass");
repin("C44", "The experiment had no no-document arm, and the repository has no individual reader records for it.",
  "The 2026-09-10 chain experiment had no arm that asked the same questions with no document, and the repository holds no records of its individual readers.",
  `${sed("10p", `${REPO}/research/README.md`)}; ${sed("104,107p", `${REPO}/plugins/terse/references/prior-art.md`)}; ${sed("19,21p", `${CH}/validation.json`)}; ${sed("38,40p", `${REPO}/research/2026-09-10-chain/README.md`)}; ${sed("40p", `${SK}/audit/references/measure.md`)}; echo "files outside the reader brief with its departed: field: $(grep -rlE '^[[:space:]]*departed:' ${REPO}/research ${REPO}/plugins | grep -vc 'skills/audit/references/measure\\.md$')"`,
  "no arm ever ran without the document[\\s\\S]*" + esc("Both ran the control. We did not.") + "[\\s\\S]*" + esc('"live_reader_experiments_run": 0')
    + "[\\s\\S]*Forty Codex seat returns[\\s\\S]*the 2026-09-10 run used Haiku[\\s\\S]*with its departed: field: 0");

// Apply as round.mjs does, and hold the result to what the brief protects.
let t = T;
for (const e of edits) {
  const n = count(t, e.old);
  if (n !== 1) throw new Error(`${e.name}: ${n} occurrence(s) at its turn`);
  const expected = t.split(e.old).join(e.new);
  t = t.replace(e.old, e.new);
  if (t !== expected) throw new Error(`${e.name}: String.replace read a $ pattern in new`);
  if (count(T, e.old) !== 1) throw new Error(`${e.name}: not once in 01`);
}
const protectedPassages = [
  at("/terse:rethink → skeleton → /terse:rewrite → candidate + diff → /terse:audit /terse:audit → run file → /terse:rewrite → candidate + diff → /terse:audit again what broke what to write did it hold"),
  "```\n/plugin marketplace add Nowely/agent-skills\n/plugin install terse@nowely\n```",
  at("The same two steps from a shell: `claude plugin marketplace add Nowely/agent-skills`, then `claude plugin install terse@nowely`."),
  at("The instructions say to hand over a candidate and its diff from the original."),
  at("Copying that defect into the repository's `ISSUES.md`, or applying the candidate to your document, requires your word."),
  at("It is not a compressor. Length does not select a candidate, and section budgets are reports rather than gates. On one file measured on 2026-09-10, the chain moved 2,725 words to 2,571 — six percent — while the second pass cut 105 words and the third added 105 back as missing framing."),
];
for (const p of protectedPassages) if (count(t, p) !== 1) throw new Error(`protected passage not byte-identical once: ${p.slice(0, 60)}`);
for (const e of edits) for (const c of e.claims ?? []) if (!new RegExp(c.pattern).test(t.replace(/\s+/g, " "))) throw new Error(`${c.name}: pattern absent from the result`);
fs.writeFileSync(`${RUN}/edits/02.json`, JSON.stringify(edits, null, 1) + "\n");
console.log(`edits/02.json: ${edits.length} edits, ${edits.reduce((a, e) => a + (e.claims ?? []).length, 0)} claims; seed names from ${seedFile.replace(/^.*\//, "")}; protected passages intact`);
