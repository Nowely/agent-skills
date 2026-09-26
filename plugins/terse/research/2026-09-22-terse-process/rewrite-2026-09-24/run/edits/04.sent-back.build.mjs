#!/usr/bin/env node
// Builds edits/04.json — round 04 of the rewrite of plugins/terse/README.md, from 03-routes.md's own bytes,
// against skeleton 03 (agreed on rounds.md's second line; the owner's read of round 03 in the rethink run's
// skeleton-read-02.md). A restructuring round:
//   Quick start  three `###` blocks. Install: the fence and the Node line. Workflow: the scope said outright,
//                /terse:audit, the announcement (moved here from Quick start's end), what the report holds, the
//                stop, the shape, /terse:rewrite with what it hands back, /terse:rethink in its own fence, and
//                the two command lines moved here from Skills. Update: the fence and the restart clause.
//                No excerpt: R02b dropped (skeleton 2.2 excludes any report excerpt; part 7, taken 3).
//   Skills       the table and "You start each one yourself."; the command lines leave.
//   How it works three items, a bold lead-in per skill, steps joined by arrows, each ending in a link to the
//                skill's page; the old seven items move here or to Checks and guarantees.
//   Checks and guarantees  new: the three methods, where each comes from, the field's practices, and the
//                Guaranteed and Not guaranteed lines.
//   What was measured  removed whole: C24, C33, C44, R03h dropped (skeleton part 5, :62–86; part 7, taken 4).
// Where skeleton 03's device words are ones the verifier refuted on round 03 ("each checking one thing",
// "brings back one found false", "three writers and two judges" unconditioned), the verified words stand.
// Every `old` is 03's own bytes, occurs there once, and the edits do not overlap; an edit's claims share one
// level, so a block whose sentences stand at different levels is written by several edits over adjacent
// anchors. Every pattern is the text as round 04 leaves it, escaped and whitespace-normalised the way
// ledger.mjs reads it. The edits are applied here as round.mjs applies them, and the result is held to every
// claim, every retired phrasing and every pin this round leaves alone; every check is dry-run separately and
// stays under the ledger's 2000-character `saw`.
import fs from "node:fs";
const RUN = "$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2";
const REPO = "~/Git/agent-skills";
const SK = `${REPO}/plugins/terse/skills`;
const PR = `${REPO}/plugins/terse/references/prior-art.md`;
const P2 = `${RUN}/probe-02`, P3 = `${RUN}/probe-03`, P4 = `${RUN}/probe-04`;
const T = fs.readFileSync(`${RUN}/03-routes.md`, "utf8");
const seedFile = fs.existsSync(`${RUN}/ledger.04.json`) ? `${RUN}/ledger.04.json` : `${RUN}/ledger.json`;
const ledger = JSON.parse(fs.readFileSync(seedFile, "utf8"));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const pin = (s) => esc(norm(s));
const L = (s) => esc(s).replace(/ +/g, "\\s+");
const all = (...parts) => "^" + parts.map((p) => `(?=[\\s\\S]*${p})`).join("");
const sed = (range, file) => `sed -n '${range}' ${file}`;
const NODE = "~/.nvm/versions/node/v24.11.0/bin/node";
const sq = (s) => "'" + s.replace(/'/g, "'\\''") + "'";
const shortOf = (f) => f.replace(`${SK}/`, "").replace(`${REPO}/`, "").replace(`${RUN}/`, "R/");
const q = (file, range, ...lits) => [NODE, sq(`${P2}/quote.mjs`), sq(file), range, ...lits.map(sq)].join(" ");
const qx = (file, range, lit) => "(?:^|\\n)" + esc(`${shortOf(file)}:${range}: `) + L(norm(lit));
const Q = (file, range, ...lits) => ({ run: q(file, range, ...lits), expect: lits.map((l) => qx(file, range, l)) });
const LINK = (rel) => ({ run: `test -f ${REPO}/plugins/terse/${rel} && echo 'link ${rel}: resolves'`, expect: [L(`link ${rel}: resolves`)] });
const join = (...parts) => ({ run: parts.map((p) => p.run).join("; "), expect: all(...parts.flatMap((p) => p.expect)) });
const name = (id) => {
  const hits = ledger.filter((c) => c.name === id || c.name.startsWith(id + " "));
  if (hits.length !== 1) throw new Error(`${hits.length} ledger entries for ${id}`);
  return hits[0].name;
};
const edits = [];
const edit = (nm, old, nu, claims, check, extra = {}) =>
  edits.push({ name: nm, old, new: nu, ...(claims ? { claims } : {}), ...(check ? { check } : {}), ...extra });

// ---- the new text, piece by piece ---------------------------------------------------------------------
const SCOPE = "It asks for the scope — the Markdown files to check, named one by one or as a folder, every tracked `.md` by default — and where your readers start.";
const ANNOUNCE = "Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers.";
const REPORT = "Its report lists the questions your text answers wrong, each with its cause, file and line.";
const STOP = "If every answer from your text is already right, stop.";
const SHAPE = "Otherwise say whether the document's shape — what it says, in what order — stands.";
const TO_REWRITE = "If it does, run this and, when it asks, give it the folder the report names:";
const RETHINK = "If the shape does not stand, run this first to decide a new one: a skeleton, an outline you agree to and give rewrite when it asks.";
const LINES = "- `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions\n- `/terse:rethink` → `/terse:rewrite` → `/terse:audit`";
const AUDIT_ITEM = "- **audit** — a profile of who reads it → every claim checked against the code or a named source → questions and an answer key → a fresh AI reader per question, with and without your text, starting where your readers start → a cause for each wrong answer: false, missing, misplaced, hard to find, misleading steps. [Its page](skills/audit/SKILL.md)";
const RETHINK_ITEM = "- **rethink** — documents like yours, read by as many agents as you allow → the words chosen → about ten structures, ranked together by AI reviewers → a skeleton you agree to. [Its page](skills/rethink/SKILL.md)";
const REWRITE_ITEM = "- **rewrite** — an adversarial first read of an existing text → by default three writers and two judges, never picking by word count → rounds of edits, each claim with a check that runs, a round refused if it silently loses a checked sentence → AI reviewers, each from its own angle → your read, with a reason for every cut of twenty words or more. [Its page](skills/rewrite/SKILL.md)";
const HEAD = "| Method | What it checks | Where it comes from |\n|---|---|---|";
const ROW_WRITING = "| The writing rules | Filler, an argument restated, editing history; a condition, a limit or a warning cut or weakened where your readers decide | Part two of a four-part rewrite, measured on one README: [the rules](skills/rewrite/references/writing-rules.md) |";
const ROW_CONTENT = "| The content rules | What a document says, and in what order | What one owner changed on his documents: [the rules](skills/rethink/references/stages.md) |";
const ROW_SCRIPTED = "| The scripted checks | Mechanism before the decision, one idea in three sections, words against a budget, a declared check that runs, a sentence checked true lost; each tested against a deliberate violation | [The measurements behind them](skills/rewrite/references/measurements.md) |";
const PRIOR = "[The field's practices, each marked measured, argued or asserted](references/prior-art.md), gathered and ranked.";
const G1 = "**Guaranteed:** Each run is written in the plugin's own folder.";
const G2 = "A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it.";
const G3 = "Nothing in your repository changes until you say so.";
const NOT = "**Not guaranteed:** that a person reads the result better; what is measured is what AI readers get from the text.";

// ---- Quick start: the three blocks --------------------------------------------------------------------
edit("Install block: its heading (skeleton 2.2, rule 2)", "## Quick start\n\n```bash", "## Quick start\n\n### Install\n\n```bash");
edit("R04a new — Workflow block: its heading; where the commands are typed", "In Claude Code, where the Markdown files are:", "### Workflow\n\nIn Claude Code:",
  [{ name: "R04a the workflow's commands are typed in Claude Code", pattern: pin("### Workflow\n\nIn Claude Code:"),
     asks: "Level 3 by record: the commands the block shows are Claude Code slash commands — a Claude Code session with the plugin loaded listed /terse:audit, /terse:rethink and /terse:rewrite among its slash commands and ran /terse:audit (task reader c4-1's recorded session, round 02); the installed plugin lists its three skills (probe-02/update.sh, `claude plugin details`)." }],
  { level: 3, ...join(
      Q(`${RUN}/reviews/02/c4-1.md`, "34-34", "claude -p \"/terse:audit\""),
      Q(`${RUN}/reviews/02/c4-1.md`, "37-37", "`slash_commands` includes `terse:audit`, `terse:rethink`, `terse:rewrite`"),
      { run: `grep -E 'Skills \\(3\\)' ${P2}/update.log`, expect: [L("Skills (3)") + "\\s+" + L("audit, rethink, rewrite")] }) });
edit("R03a re-pinned — the scope said outright (skeleton 2.2; the owner's read, skeleton-read-02.md:12–13)",
  "It asks which files and where your readers start, and waits for your answer.", SCOPE,
  [{ name: name("R03a"), pattern: pin(SCOPE),
     asks: "Level 3 by record: /terse:audit, in a signed-in session on the plugin the README's install fetched (0.1.1 from GitHub main, 8c041b7), first proposed the scope — the tracked .md files, README.md there — and the entry file where readers arrive, and stopped for the user's confirmation, with no count of agents said before that (task reader c4-1, round 02); that page's step-1 exchange is this checkout's, word for word. Level 2, the page: step 1 settles with the user which files are the documentation, every tracked .md by default — which the user can name one by one or give as a folder that holds them — and where a reader arrives, the entry file (audit/SKILL.md:23–28); each reader starts at that entry file and opens only .md files (91–92)." }],
  { level: 3, ...join({ run: `sh ${P3}/step1.sh`, expect: [
      qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "Scope proposal for the audit:"), qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "**Docs**: README.md (only tracked `.md` file)."),
      qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "**Entry file**: README.md."), qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "Confirm this, or correct it, before I build the reader profile."),
      L("step 1's exchange, 8c041b7 (the 0.1.1 the install fetched) against this checkout: identical"),
      qx(`${SK}/audit/SKILL.md`, "23-28", "Which files are the documentation."), qx(`${SK}/audit/SKILL.md`, "23-28", "Where a reader arrives. Usually `README.md`.")] },
      Q(`${SK}/audit/SKILL.md`, "25-25", "Default to every tracked `.md`."),
      Q(`${SK}/audit/SKILL.md`, "91-92", "Each one starts at the entry file, may open only `.md` files")) });
edit("R03b re-pinned, R04b new — the announcement moved to audit's paragraph (L6.3-02), and what the report holds; the excerpt dropped",
  " Its report on this plugin's README, 2026-09-22:\n\n```text\n`missing`: the owner's intent — the method holds for any text\nin any language, code or not — appears in no page\n```",
  ` ${ANNOUNCE} ${REPORT}`,
  [{ name: name("R03b"), pattern: pin(ANNOUNCE),
     asks: "What the pages instruct, no more: before spawning anything, audit announces how many readers and which model and waits for the user's word (audit/SKILL.md:88–89); rewrite announces the count and the models before its writers and judges and waits for the user's word (rewrite/SKILL.md:70–72), and announces each round's wave — the verifier and the reviewers, one per lens, their sizes, the models — and waits (150–151). The sentence claims nothing about the adversarial whole-document read rewrite runs first on an existing document, which the page does not announce (64–66), nor about rethink's agents." },
   { name: "R04b the report lists the questions answered wrong, each with its cause, file and line", pattern: pin(REPORT),
     asks: "What the audit page says its report holds: every wrong answer with one of five causes (audit/SKILL.md:125), reported to the user as the failures with their causes (166); each reader returns the line it based its answer on, with its file and line number — the field that makes a wrong answer diagnosable (measure.md:59, 67–68)." }],
  { level: 2, ...join(
      Q(`${SK}/audit/SKILL.md`, "88-89", "Announce the plan before spawning anything: how many readers, which model, roughly what it costs. Wait for the user's word."),
      Q(`${SK}/rewrite/SKILL.md`, "64-66", "On a document that already exists, the first thing that runs is the adversarial whole-document read"),
      Q(`${SK}/rewrite/SKILL.md`, "70-72", "Announce before spawning: the count, the models, and that the cost of a writer or a judge has not been measured", "Wait for the user's word."),
      Q(`${SK}/rewrite/SKILL.md`, "150-151", "**Announce the wave** — the verifier, the lenses, their sizes from the table, the models, the cost — and wait for the user's word"),
      Q(`${SK}/audit/SKILL.md`, "125-125", "Give every wrong answer a cause"),
      Q(`${SK}/audit/SKILL.md`, "166-166", "Report to the user: the score, the failures with their causes"),
      Q(`${SK}/audit/references/measure.md`, "59-59", "quote: the line you based your answer on, with its file and line number"),
      Q(`${SK}/audit/references/measure.md`, "67-68", "The `quote` field is what makes a wrong answer diagnosable. It names the line that misled the reader")) },
  { drop: [name("R02b")] });
edit("R04c new — the stop, said of the answers from the text (L6.3-13)", "If every answer is already right, stop there.", STOP,
  [{ name: "R04c if every answer from your text is already right, stop", pattern: pin(STOP),
     asks: "What the audit page says: the score is the right answers over the questions, from the text, reported as the difference from the arm without it (audit/SKILL.md:122); if that baseline is a perfect score — every question answered right from the text — the audit says so and stops, since an instrument with no room above cannot register an improvement (151–153)." }],
  { level: 2, ...join(
      Q(`${SK}/audit/SKILL.md`, "122-122", "The score is right answers over questions, reported as the difference from the no-document arm."),
      Q(`${SK}/audit/SKILL.md`, "151-153", "If the baseline is a perfect score, say so and stop: an instrument with no room above cannot register an improvement")) },
  { qualifies: "\"from your text\" is the page's own scope for the stop, not a hedge: the score counts the answers given from the text, the arm without it being the baseline it is measured against (audit/SKILL.md:122, 151–153); without it \"every answer\" takes in the answers given with no text at all, which the page never asks to be right (reviews/03/lens6-fable-dedup.md, L6.3-13)." });
edit("R04d new, R02c re-pinned — the shape question and the audit way into rewrite; the rethink clause moves below its own fence",
  "Otherwise say whether the document's shape — what it says, in what order — stands. If it does, run this and, when it asks, give it the folder the report names; if not, run `/terse:rethink` first to decide a new one: a skeleton, an outline you agree to.",
  `${SHAPE} ${TO_REWRITE}`,
  [{ name: "R04d the user says whether the document's shape stands", pattern: pin(SHAPE),
     asks: "What the pages say comes after the report: the verdict on the document's shape — what it says, in what order — is the user's word: shape: agreed only on their word that a named skeleton or the document's current shape stands, anything short of it shape: not agreed (audit/SKILL.md:166–170); nothing is written on a shape the user has not agreed to (rewrite/SKILL.md:14)." },
   { name: name("R02c"), pattern: pin(TO_REWRITE),
     asks: "What the pages say comes after an audit: when the user says the document's current shape stands, the audit offers rewrite as the next step, and rewrite asks the user for the run directory — whose absolute path the audit's report names — rather than taking it on the command line; when they do not, the audit offers rethink instead, and rewrite writes nothing on a shape the user has not agreed to." }],
  { level: 2, ...join(
      Q(`${SK}/audit/SKILL.md`, "166-171", "the absolute path, and the shape verdict", "quoted, that the document's current shape stands", "anything short of their word is `shape: not agreed`", "Agreed, offer `rewrite` as the next step. Not agreed, offer `/terse:rethink`"),
      Q(`${SK}/rewrite/SKILL.md`, "14-14", "Nothing is written on a shape the user has not agreed to"),
      Q(`${SK}/rewrite/SKILL.md`, "37-37", "Ask the user for the run directory from `audit`"),
      Q(`${SK}/rewrite/SKILL.md`, "84-84", "a resumed run is given it by the user and cannot guess it")) });
edit("C09, C05 re-pinned — the rethink branch in its own fence, the two command lines moved here from Skills; the announcement leaves this place; Update's heading",
  "\n\nBefore starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers.\n\nUpdate:",
  `\n\n${RETHINK}\n\n\`\`\`text\n/terse:rethink\n\`\`\`\n\n${LINES}\n\n### Update`,
  [{ name: name("C09"), pattern: pin(RETHINK),
     asks: "What the pages say rethink does on this branch: it decides what the document should be — what is said, in what order — and returns it as a skeleton, an outline of the sections (titles, what each is for and leaves out, a word budget), then waits for the user's word on it (rethink/SKILL.md:4–6, 13–15, 148–149); rewrite starts only from a skeleton the user said they agree to, and is given its path by the user when it asks (rethink/SKILL.md:48, 149; rewrite/SKILL.md:24–28)." },
   { name: name("C05"), pattern: pin(LINES),
     asks: "What the pages lay out for the two orders. The audit order: an audit whose shape the user agreed offers rewrite as its next step (audit/SKILL.md:170–171), by rewrite's audit way in (rewrite/SKILL.md:24–28); an audit after a rewrite re-measures with the same questions, key, entry file and model, a new question set being a new measurement with a new baseline (measure.md:106–109), and reuses the first audit's score without the text (audit/SKILL.md:100–102). The rethink order: rethink returns a skeleton and leaves the writing to rewrite (rethink/SKILL.md:5–6), which takes it by its skeleton way in (rewrite/SKILL.md:24–28), and the order ends in an audit; the line says nothing of that audit's questions, which are the same ones where an audit came first and new ones where none did." }],
  { level: 2, ...join(
      Q(`${SK}/rethink/SKILL.md`, "4-6", "Decides what a document should be before a sentence of it is written", "and what is said in what order. Returns a skeleton and stops there — the writing is `rewrite`'s."),
      Q(`${SK}/rethink/SKILL.md`, "13-15", "The output is a skeleton: section titles, what each is for, what each deliberately leaves out, a word budget"),
      Q(`${SK}/rethink/SKILL.md`, "48-49", "`rewrite` is given the skeleton's path by the user and cannot guess it"),
      Q(`${SK}/rethink/SKILL.md`, "148-149", "Then stop and wait for the user's word on the file", "`rewrite` starts only from a skeleton the user said they agree to"),
      { run: sed("106,109p", `${SK}/audit/references/measure.md`), expect: [L("## Re-measuring after a rewrite"),
        L("Same questions, same key, same entry file, same model. Change any of them and the two scores are not comparable; a new question set is a new measurement with a new baseline, not a result.")] },
      Q(`${SK}/audit/SKILL.md`, "100-102", "A re-measurement after a rewrite reuses the same no-document score and does not pay again."),
      Q(`${SK}/audit/SKILL.md`, "170-171", "Agreed, offer `rewrite` as the next step."),
      Q(`${SK}/rewrite/SKILL.md`, "24-28", "| a skeleton the user agreed to | step 2 |", "| an `audit` run file | step 1 |")) });

// ---- Skills --------------------------------------------------------------------------------------------
edit("R04e new — Skills keeps one line: each skill is started by the reader; the command lines left for Workflow",
  "You start each one yourself, and both orders end in audit:\n\n" + LINES + "\n\n## How it works",
  "You start each one yourself.\n\n## How it works",
  [{ name: "R04e you start each one yourself", pattern: pin("You start each one yourself."),
     asks: "What the three pages declare: each skill is one the user starts, not the model — disable-model-invocation: true in audit's, rethink's and rewrite's frontmatter (audit/SKILL.md:7, rethink/SKILL.md:7, rewrite/SKILL.md:8) — and audit, when it reports, offers the next skill and runs neither (audit/SKILL.md:174)." }],
  { level: 2, ...join(
      { run: `grep -n -H 'disable-model-invocation: true' ${SK}/audit/SKILL.md ${SK}/rethink/SKILL.md ${SK}/rewrite/SKILL.md | sed 's#^${SK}/##'`,
        expect: [L("audit/SKILL.md:7:disable-model-invocation: true"), L("rethink/SKILL.md:7:disable-model-invocation: true"), L("rewrite/SKILL.md:8:disable-model-invocation: true")] },
      Q(`${SK}/audit/SKILL.md`, "170-174", "Run neither.")) });

// ---- How it works: three items ------------------------------------------------------------------------
edit("C06, C07 re-pinned — audit's steps",
  "- A fresh AI reader per question answers from the text alone, starting where your readers start, against an answer key written first from the code or a named source; the same questions run without your text.\n- Wrong answers get a cause: false, missing, misplaced, hard to find, misleading steps.",
  AUDIT_ITEM,
  [{ name: name("C06"), pattern: pin("- **audit** — a profile of who reads it → every claim checked against the code or a named source → questions and an answer key → a fresh AI reader per question, with and without your text, starting where your readers start →"),
     asks: "What the audit page instructs, step by step: a profile of who reads the document, shown to the user for corrections (audit/SKILL.md:46–51); every sentence that states what the software does checked as a claim against the code — against a named source where no code backs the text (56–58; truth-pass.md:73–77), recipes for tools the repository does not ship being no such claim (truth-pass.md:61–69); the questions and their answer key, written before any reader (71–77); one fresh reader per question, a model agent, starting at the entry file where the user's readers arrive, and the same questions run with no files at all (88–97; measure.md:40)." },
   { name: name("C07"), pattern: pin("→ a cause for each wrong answer: false, missing, misplaced, hard to find, misleading steps. [Its page](skills/audit/SKILL.md)"),
     asks: "What the audit page instructs: every wrong answer gets one of five causes, in its table's order — refuted, missing, placement, findability, harmful — which the README names false, missing, misplaced, hard to find and misleading steps (audit/SKILL.md:125–133). The link resolves to the audit page." }],
  { level: 2, ...join(
      Q(`${SK}/audit/SKILL.md`, "46-51", "## Step 2. The reader profile", "Show the profile and ask for corrections before Step 3."),
      Q(`${SK}/audit/SKILL.md`, "56-58", "Every sentence that states what the software does becomes one ledger entry"),
      Q(`${SK}/audit/references/truth-pass.md`, "61-69", "## What is not a claim about behaviour", "recipes for tools this repository does not ship"),
      Q(`${SK}/audit/references/truth-pass.md`, "73-77", "a guarantee-shaped claim carries a named source the reader can check"),
      Q(`${SK}/audit/SKILL.md`, "71-77", "## Step 4. The questions and the answer key", "Write the correct answer to each from the ledger, and write it now."),
      Q(`${SK}/audit/SKILL.md`, "88-97", "One fresh reader per question", "Each one starts at the entry file", "runs a second arm with no documentation at all**: the same questions, the same model, no files."),
      Q(`${SK}/audit/references/measure.md`, "40-40", "Use a cheap model"),
      Q(`${SK}/audit/SKILL.md`, "125-133", "Give every wrong answer a cause", "| refuted |", "| missing |", "| placement |", "| findability |", "| harmful |"),
      LINK("skills/audit/SKILL.md")) });
edit("R03e re-pinned — rethink's steps",
  "- By default three writers draft and two judges pick, then rounds of edits, checked by AI reviewers, each from its own angle.\n- The rules forbid filler, and cutting or weakening a condition, a limit or a warning where your readers decide; rethink starts by reading documents like yours, with as many agents as you allow.",
  RETHINK_ITEM,
  [{ name: name("R03e"), pattern: pin(RETHINK_ITEM),
     asks: "What the rethink page instructs, step by step: first, a fan-out of agents reading documents like the user's, one per slice by default, announced with their count and models and started only on the user's word — the agents that start are the ones the user allows, the survey sized smaller at the user's word, and run at the size the user gives, zero included, when entered from an audit (rethink/SKILL.md:55–61, 25–27; briefs.md:37–38); then the words, each load-bearing term decided (80–84); then about ten structures, which critics — the AI reviewers — see all at once and rank (93–106); then a skeleton handed over, and a stop for the user's word on it (148–149). The link resolves to the rethink page." }],
  { level: 2, ...join(
      Q(`${SK}/rethink/SKILL.md`, "55-61", "## Step 1. What comparable documents already solved", "Announce the count and the models before spawning, and wait for the user's word. Default slices, one surveyor each"),
      Q(`${SK}/rethink/SKILL.md`, "25-27", "step 1 at the size the user gives, zero included"),
      Q(`${SK}/rethink/references/briefs.md`, "37-38", "One surveyor per slice, or two slices per surveyor when the user sizes the survey smaller."),
      Q(`${SK}/rethink/SKILL.md`, "80-84", "## Step 2. The words", "For each load-bearing term"),
      Q(`${SK}/rethink/SKILL.md`, "93-106", "about ten structures", "Critics see **all of them at once**, because ranking is the judgement being asked for"),
      Q(`${SK}/rethink/SKILL.md`, "148-149", "Then stop and wait for the user's word on the file"),
      LINK("skills/rethink/SKILL.md")) },
  { qualifies: "\"read by as many agents as you allow\" is the step's own size by the user's word, not a hedge: the agents start only on the user's word to the announced count (rethink/SKILL.md:60), the user may size the survey smaller (briefs.md:37–38), and on the audit way in gives its size, zero included (25–27); without it the step says rethink always reads documents like yours, which L6.2-12 found overstated." });
edit("R03c, R03f re-pinned, R04f new — rewrite's steps",
  "- Word count never selects a draft; cuts of twenty words or more carry reasons.\n- A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it.\n- Each run is written in the plugin's own folder; nothing in your repository changes until you say so.",
  REWRITE_ITEM,
  [{ name: name("R03c"), pattern: pin(REWRITE_ITEM),
     asks: "What the rewrite page instructs. By default the bake-off has three writers, one whole candidate each, and two judges, a third only when the two split (bake-off.md:19–22; rewrite/SKILL.md:66), the judges picking the winner (bake-off.md:132); if the user refuses that fan-out, one candidate is written from the same brief and the comparison is skipped (rewrite/SKILL.md:70–72). Each round is then read by critics, one agent per lens (164–165) — the AI reviewers — whose lenses differ and are not disjoint (197): each reviewer reads from its own lens." },
   { name: name("R03f"), pattern: pin(REWRITE_ITEM),
     asks: "What the pages say: in the bake-off word count is reported and never selects a draft, a narrow win on length read as a tie (bake-off.md:13–15); the hand-over carries the cut ledger, every removed passage of twenty words or more with its reason (rewrite/SKILL.md:235–236)." },
   { name: "R04f rewrite's steps: an adversarial first read, rounds of edits with running checks and a refusal, your read", pattern: pin(REWRITE_ITEM),
     asks: "What the rewrite page instructs for the steps the item names beside the bake-off: on a document that already exists, the first thing that runs is the adversarial whole-document read (rewrite/SKILL.md:64–66); every edit that carries claims carries a check that round.mjs runs before it writes anything, refusing the whole round when one expect finds nothing (127–129); the ledger check exits 1 when the round loses a verified claim — a drop declared by name in the edits removes the pin instead — and a failure the round introduced is fixed before the critics see it (119–122, 143–144); the loop stops when the user reads the round and says whether they would send it as it is (212). The link resolves to the rewrite page." }],
  { level: 2, ...join(
      Q(`${SK}/rewrite/SKILL.md`, "64-66", "On a document that already exists, the first thing that runs is the adversarial whole-document read"),
      Q(`${SK}/rewrite/references/bake-off.md`, "19-22", "| writers | 3 |", "| judges | 2 | a third only when the two split |"),
      Q(`${SK}/rewrite/SKILL.md`, "70-72", "If the user refuses the fan-out, write one candidate yourself"),
      Q(`${SK}/rewrite/references/bake-off.md`, "13-15", "word count is reported and never selects."),
      Q(`${SK}/rewrite/SKILL.md`, "119-122", "`drop` the names of ledger entries whose claims the edit removes on purpose"),
      Q(`${SK}/rewrite/SKILL.md`, "127-129", "`round.mjs` runs each `run` from the run directory before it writes anything and refuses the whole round when one `expect` finds nothing"),
      Q(`${SK}/rewrite/SKILL.md`, "143-144", "exit 1 when the new round loses a verified claim", "A failure the round introduced is fixed before the critics see it"),
      Q(`${SK}/rewrite/SKILL.md`, "164-165", "**then the critics**, one agent per lens"),
      Q(`${SK}/rewrite/SKILL.md`, "197-197", "Lenses differ; they are not disjoint"),
      Q(`${SK}/rewrite/SKILL.md`, "212-212", "The loop stops when the user reads the round and says whether they would send it as it is."),
      Q(`${SK}/rewrite/SKILL.md`, "235-236", "every removed passage of twenty words or more, with its reason"),
      LINK("skills/rewrite/SKILL.md")) },
  { qualifies: "\"By default\" is the page's own condition for the bake-off: three writers and two judges by default, one candidate when the user refuses the fan-out (bake-off.md:19–22; rewrite/SKILL.md:70–72); \"silently\" is the check's own boundary: a drop declared by name passes and is recorded (rewrite/SKILL.md:119–122). Both were required by the verifier on round 03 (reviews/03/verifier-sol-v5.md); the qualification is R03c's and R04f's, and rides on R03f's entry only because the three share the item." });

// ---- Checks and guarantees, over What was measured -----------------------------------------------------
edit("Checks and guarantees: its heading, over What was measured (skeleton 2.5; part 5, :62–86)", "## What was measured", "## Checks and guarantees");
edit("R03d re-pinned, R04g new — the table's head and the two rule rows; C33 and C44 dropped (skeleton part 5, :62–86)",
  "- 2026-09-10, one README, the method this plugin was built from: AI readers' right answers 3 of 6 → 6 of 6; the questions it already answered right stayed right. One small trial; the gain could be chance (*p* = 0.25). The same questions were not run without the text.",
  `${HEAD}\n${ROW_WRITING}\n${ROW_CONTENT}`,
  [{ name: name("R03d"), pattern: pin(ROW_WRITING),
     asks: "What the pages say the writing is held to, and where those rules come from: the writing rules — part two of a four-part rewrite measured on one README (writing-rules.md:3, 29–30; research/2026-09-10-chain/README.md:16) — allow no sentence that carries nothing (6–7), no argument for an instruction restated (9–10), no editing history (12–13), and never a condition, a limit or a warning cut where a reader decides (21); the judging sheet vetoes a draft in which one was cut or weakened at a decision point (bake-off.md:114). The link resolves." },
   { name: "R04g the content rules: what a document says, in what order, from what one owner changed on his documents", pattern: pin(ROW_CONTENT),
     asks: "What stages.md says of its rules: derived from what one owner changed on his documents, not from a standard, and about content and order — what a document says, in what order (stages.md:311–316). The link resolves." }],
  { level: 2, ...join(
      Q(`${SK}/rewrite/references/writing-rules.md`, "3-3", "Part two of the four-part chain."),
      Q(`${SK}/rewrite/references/writing-rules.md`, "6-7", "Default: no sentence that carries nothing."),
      Q(`${SK}/rewrite/references/writing-rules.md`, "9-10", "Cut first: the argument for an instruction, restated wherever the instruction appears."),
      Q(`${SK}/rewrite/references/writing-rules.md`, "12-13", "Also cut: editing history"),
      Q(`${SK}/rewrite/references/writing-rules.md`, "21-21", "Never cut a condition, a limit or a warning where a reader decides."),
      Q(`${SK}/rewrite/references/bake-off.md`, "114-114", "was a condition, limit or warning at a decision point cut or weakened?", "| veto |"),
      Q(`${SK}/rewrite/references/writing-rules.md`, "29-30", "reproduced byte for byte from `PART 2` of the prompt that was measured"),
      Q(`${REPO}/research/2026-09-10-chain/README.md`, "16-16", "The four-pass rewrite of one README, stage by stage"),
      Q(`${SK}/rethink/references/stages.md`, "311-316", "Derived from what one owner changed on his documents", "not from a standard", "They are about content and order"),
      LINK("skills/rewrite/references/writing-rules.md"), LINK("skills/rethink/references/stages.md")) },
  { drop: [name("C33"), name("C44")] });
edit("R04h new — the scripted checks row, run; C24 dropped (skeleton part 5, :53–56 and :62–86)",
  "- The same run: 2,725 words → 2,571.", ROW_SCRIPTED,
  [{ name: "R04h the scripted checks, each tested against a deliberate violation", pattern: pin(ROW_SCRIPTED),
     asks: "Level 3, run: the rewrite skill's scripts check what the cell names — rule1.mjs, a flag, header field, exit code, protocol, environment variable or absolute path before the technical section; dup.mjs, one idea in three or more sections; sections.mjs, words against a budget, a report and not a gate; round.mjs, a declared check that runs, one failing expect refusing the round; ledger.mjs, a verified sentence lost (and a phrasing found false present) — and selftest.mjs runs each against a violation planted on purpose: 50 checks passed, 'all checks caught their planted violation'. Level 2: the rules they enforce rest on the dated measurements kept in measurements.md (its opening; M15, one idea, one home; M22, budgets are a report). The link resolves." }],
  { level: 3, run: `sh ${P4}/scripted.sh`,
    expect: all(L("selftest.mjs: exit 0; checks passed: 50"), L("ok: rule1 reports the planted flag"), L("ok: dup flags three sections"),
      L("ok: sections reports a section over its budget and still exits 0"), L("ok: a check whose expect does not match writes nothing"),
      L("ok: ledger reports a lost claim in the last file"), L("ok: ledger reports an unwanted phrase"), L("all checks caught their planted violation"),
      qx(`${SK}/rewrite/scripts/rule1.mjs`, "3-4", "no flag name, header field, exit code, protocol name, environment variable"),
      qx(`${SK}/rewrite/scripts/dup.mjs`, "2-2", "One idea, one home. Counts in how many `## ` sections each concept appears."),
      qx(`${SK}/rewrite/scripts/sections.mjs`, "2-4", "A report, not a gate"),
      qx(`${SK}/rewrite/scripts/round.mjs`, "22-23", "One `expect` that does not match"),
      qx(`${SK}/rewrite/scripts/ledger.mjs`, "6-7", "want true : a verified claim that must be present (LOST when absent)"),
      qx(`${SK}/rewrite/references/measurements.md`, "3-4", "Every rule in `SKILL.md` and [loop.md](loop.md) rests on something that happened, dated."),
      qx(`${SK}/rewrite/references/measurements.md`, "79-79", "**M15. One idea, one home, counted.**"),
      qx(`${SK}/rewrite/references/measurements.md`, "116-116", "**M22. Budgets are a report.**"),
      L("link skills/rewrite/references/measurements.md: resolves")) },
  { drop: [name("C24")] });
edit("R04i new — the field's practices, linked by what they are; R03h dropped (skeleton part 5, :62–86)",
  "- 2026-09-22, this plugin's audit of its previous README: 5 of 7 right with the text, 0 of 7 without.", `\n${PRIOR}`,
  [{ name: "R04i the field's practices, each marked measured, argued or asserted, gathered and ranked", pattern: pin(PRIOR),
     asks: "What prior-art.md holds: the practices the field offers, each marked measured, argued or asserted (prior-art.md:14–15), gathered in a survey of three rounds (7–10) and ranked within each group by what each buys (299–300), with all 271 kept unranked beside it in practices-full.md (302–303). The link resolves." }],
  { level: 2, ...join(
      Q(PR, "14-15", "Practices are marked **measured**, **argued**, or **asserted**"),
      Q(PR, "7-7", "Surveyed 2026-09-11 in three rounds."),
      Q(PR, "299-303", "Ranked within each group by what it buys.", "All 271 practices the survey returned are in [practices-full.md](practices-full.md)"),
      LINK("references/prior-art.md")) },
  { drop: [name("R03h")] });
edit("C15, R03g re-pinned — the Guaranteed line's run-backed halves",
  "- Never measured: whether a person reads the improved text better — only whether a model does.", `\n${G1} ${G2}`,
  [{ name: name("C15"), pattern: pin(G1),
     asks: "Level 3, run: each of the three pages' run lines — rewrite's, audit's, rethink's — as Claude Code hands the page to the model sets D to the plugin's data directory when installed or loaded with --plugin-dir, and stays as written when the page is read as a plain file from a checkout, where the line falls back to ${TMPDIR:-/tmp}/terse; run by the shell from a working directory that stands for the user's repository, all nine make their run folder there, outside that directory, and add nothing to it. The guarantee is that instruction and its line, run; no signed-in session was run." },
   { name: name("R03g"), pattern: pin(G2),
     asks: "Level 3, run: the shipped check (ledger.mjs) judges a round against the phrasings its ledger records. On a round round.mjs made from one holding a pinned sentence and a retired phrasing, it exits 1 when the round loses the pinned sentence without declaring its drop, or repeats the retired phrasing word for word, and exits 0 when it does neither; a drop declared by name in the round's edits passes — named there and in that round's row of rounds.md, the loss \"silently\" excludes; the same false claim in other words is not a repeat and passes, because the check matches the recorded phrasing (ledger.mjs:6–8). Level 2, the page: the check exits 1 on a lost verified claim or a revived retired phrase, and a failure the round introduced is fixed before the critics see it (rewrite/SKILL.md:143–144)." }],
  { level: 3, ...join(
      { run: `sh ${P4}/guaranteed.sh`, expect: [
        L("renders stopped at login, cost 0: 9 of 9"), L("run folders made outside the working directory: 9 of 9"),
        L("<data> = <probe>/config-installed/plugins/data/terse-nowely, exists"), L("<data> = <probe>/config-plugindir/plugins/data/terse-inline, exists"),
        L("the page read as a plain file, D left as written, TMPDIR set: 3 of 3 → $TMPDIR/terse/runs/…"), L("the same, TMPDIR unset: 3 of 3 → /tmp/terse/runs/…"),
        L("entries added to the three: 0"), L("checkout status for plugins/ and .claude-plugin/: []"),
        L("a cut, no drop: round.mjs exit 0; ledger.mjs exit 1; T the tool asks before it deletes L? yes LOST;"),
        L("b retired phrasing back, word for word: round.mjs exit 0; ledger.mjs exit 1;") + "[^\\n]*" + L("F it deletes without asking L? - YES ;"),
        L("c neither: round.mjs exit 0; ledger.mjs exit 0;"),
        L("d cut, drop declared: round.mjs exit 0; ledger.mjs exit 0; F it deletes without asking L? - - ;"),
        L("e retired claim back, other words: round.mjs exit 0; ledger.mjs exit 0;")] },
      Q(`${SK}/rewrite/scripts/ledger.mjs`, "6-8", "want false : a phrasing found false, which must be absent (YES when present)", "Text is whitespace-normalised."),
      Q(`${SK}/rewrite/SKILL.md`, "143-144", "exit 1 when the new round loses a verified claim or revives a retired phrase.", "A failure the round introduced is fixed before the critics see it")) },
  { qualifies: "\"silently\" is the check's own boundary, not a hedge: a loss the round's edits declare by name as a drop passes and is recorded in rounds.md (rewrite/SKILL.md:119–122; guard.sh case d), and only an undeclared loss fails (case a); \"repeats\" is the phrasing the check matches (case e). The qualification is R03g's; it rides on C15's entry only because the two share the line." });
edit("R02g, R02f re-pinned — the Guaranteed line's page-backed half, and Not guaranteed",
  " [What the field has measured, and its findings against the 2026-09-10 numbers](references/prior-art.md).", ` ${G3}\n\n${NOT}`,
  [{ name: name("R02g"), pattern: pin(G3),
     asks: "What the three pages instruct, which is the guarantee the line gives; the guarantee word \"nothing\" stands as that instruction, no signed-in run having exercised it: audit writes nothing into the audited repository, \"not a report, not a note, not a fix\" (audit/SKILL.md:44); everything rethink writes goes into a run directory outside the repository that holds the document, and nothing goes into that repository (rethink/SKILL.md:31–32, 46); from rewrite nothing goes into it without the user's word — not the draft, not a code defect (rewrite/SKILL.md:88–89) — a code defect enters the repository's ISSUES.md only on the user's word (172–173), and applying the draft to the user's files needs their word (222–223)." },
   { name: name("R02f"), pattern: pin(NOT),
     asks: "Not guaranteed, because never measured: the readers of every measurement the plugin records are models — Haiku on 2026-09-10, Codex gpt-5.6-luna on 2026-09-22 — and the record says what they measure is whether a model can answer from the text, not whether a person reads it better; no run measured a person (audit.md:993, 995; measure.md:40; prior-art.md:130–132; research/README.md:10)." }],
  { level: 2, ...join(
      Q(`${SK}/audit/SKILL.md`, "44-44", "Write nothing into the audited repository. Not a report, not a note, not a fix."),
      Q(`${SK}/rethink/SKILL.md`, "31-32", "Everything this skill writes goes into a run directory of the document's own, outside the repository that holds it"),
      Q(`${SK}/rethink/SKILL.md`, "46-46", "Nothing goes into the repository that holds the document."),
      Q(`${SK}/rewrite/SKILL.md`, "88-89", "Nothing goes into that repository without the user's word — not the candidate (step 5), not a code defect (item 6)."),
      Q(`${SK}/rewrite/SKILL.md`, "172-173", "A code defect goes into the repository's `ISSUES.md` only on the user's word"),
      Q(`${SK}/rewrite/SKILL.md`, "222-223", "applying the candidate to the user's files needs their word"),
      Q(`${RUN}/audit.md`, "993-993", "readers Codex gpt-5.6-luna"),
      Q(`${RUN}/audit.md`, "995-995", "the readers are a model, and the ruler measures whether a model can answer from the text, not whether a person improved"),
      Q(`${SK}/audit/references/measure.md`, "40-40", "the 2026-09-10 run used Haiku"),
      Q(PR, "130-132", "terse currently measures model answerability, and its numbers are not valid evidence of human improvement yet"),
      Q(`${REPO}/research/README.md`, "10-10", "the plugin's own numbers measure model answerability, not human improvement")) });

// ---- apply, and hold the result to the ledger ----------------------------------------------------------
let t = T;
for (const e of edits) {
  if (T.split(e.old).length !== 2) throw new Error(`${e.name}: occurs ${T.split(e.old).length - 1} times in 03`);
  if (t.split(e.old).length !== 2) throw new Error(`${e.name}: occurs ${t.split(e.old).length - 1} times after the edits before it`);
  t = t.replace(e.old, e.new);
}
const flat = t.replace(/\s+/g, " ");
const QUAL = /\b(unless|except (when|where|for|that)|only (if|when|where|after|once)|provided that|as long as|but not|save (for|where)|other than|apart from)\b/gi;
const tally = (s) => [...String(s ?? "").replace(/\s+/g, " ").matchAll(QUAL)].length;
const names = new Set(); const touched = new Set();
for (const e of edits) {
  if (tally(e.new) > tally(e.old) && !e.qualifies) throw new Error(`${e.name}: adds a qualifying form without qualifies`);
  for (const c of e.claims ?? []) {
    if (names.has(c.name)) throw new Error(`${c.name} declared twice`); names.add(c.name); touched.add(c.name);
    if (!new RegExp(c.pattern).test(flat)) throw new Error(`${c.name}: pattern does not match the round`);
  }
  for (const d of e.drop ?? []) touched.add(d);
}
for (const c of ledger) {
  if (touched.has(c.name)) continue;
  const hit = new RegExp(c.pattern, c.flags ?? "").test(flat);
  if (c.want && !hit) throw new Error(`${c.name}: a pin this round leaves alone is LOST`);
  if (!c.want && hit) throw new Error(`${c.name}: a retired phrasing is back`);
}
fs.writeFileSync(`${RUN}/edits/04.json`, JSON.stringify(edits, null, 1) + "\n");
fs.writeFileSync(`${P4}/04-preview.md`, t);
const claims = edits.flatMap((e) => e.claims ?? []);
console.log(`edits ${edits.length}; claims ${claims.length}: re-pinned ${claims.filter((c) => !/^R04/.test(c.name)).length}, new ${claims.filter((c) => /^R04/.test(c.name)).length}; dropped ${edits.flatMap((e) => e.drop ?? []).length} (${edits.flatMap((e) => e.drop ?? []).map((n) => n.split(" ")[0]).join(", ")}); with qualifies ${edits.filter((e) => e.qualifies).length}`);
console.log(`ledger entries this round leaves alone: ${ledger.filter((c) => !touched.has(c.name)).map((c) => c.name.split(" ")[0] + (c.want ? "+" : "-")).join(" ")}`);
