#!/usr/bin/env node
// Builds edits/02.json — round 02 of the rewrite of plugins/terse/README.md from the agreed skeleton, from
// 01-candidate.md (the bake-off winner A) — and probe-02/excerpt.txt, the excerpt the round writes.
// What the round carries, each item re-checked against the code at f97eb4a (plugins/terse unchanged at b5a082b):
//   grafts  Fable 1 / Astra 1, the sign-in on the "You need" line (Fable's form, the exemplar's place);
//           Fable 2 / Astra 3, the two orders, each ending as the pages say (the audit order again with the
//           same questions, the rethink order in a first audit); Fable 3 with Astra's shared fault, what
//           rewrite hands back and where, "beside" gone from Skills; Fable 4, "only whether a model does";
//           Astra 2, a skeleton you agree to on the not-agreed branch. C:60 is not grafted.
//   excerpt Fable's shared fault: the Score fragment replaced by the Q7 `missing` finding, verbatim.
//   notes   Fable's two observations: the restart after an update; concepts.json's over-broad pattern
//           (concepts.json itself, not this file; concepts.01.json keeps the old one).
//   ledger  the 16 pins round 01 lost by wording: 13 re-pinned under their names, 3 dropped by the
//           skeleton's part 5 (C18, C42, C43); C23 untouched. A re-pin whose sentence round 02 does not
//           reword is an edit whose `old` and `new` are the same bytes, as the 2026-09-22 run recorded.
// Every `old` is 01's own bytes and occurs there once; the edits do not overlap. Every pattern is the
// sentence as round 02 leaves it, escaped and whitespace-normalised the way ledger.mjs reads it. The edits
// are applied here as round.mjs applies them and the result is held to every claim, every retired phrasing
// and every pin this round leaves alone; the qualifier count is taken as round.mjs takes it.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const RUN = path.join(os.tmpdir(), "terse/runs/20260924-002235-terse-readme-rewrite2");
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../../..");
const SK = `${REPO}/plugins/terse/skills`;
const PR = `${REPO}/plugins/terse/references/prior-art.md`;
const CH = `${REPO}/research/2026-09-10-chain`;
const PROBE = `${RUN}/probe-02`;
const T = fs.readFileSync(`${RUN}/01-candidate.md`, "utf8");
const seedFile = fs.existsSync(`${RUN}/ledger.02.json`) ? `${RUN}/ledger.02.json` : `${RUN}/ledger.json`;
const ledger = JSON.parse(fs.readFileSync(seedFile, "utf8"));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const pin = (s) => esc(norm(s));
const L = (s) => esc(s).replace(/ +/g, "\\s+");          // a page literal; a line the page wraps still matches
const all = (...parts) => "^" + parts.map((p) => `(?=[\\s\\S]*${p})`).join("");   // every part, in any order
const sed = (range, file) => `sed -n '${range}' ${file}`;
const name = (id) => {
  const hits = ledger.filter((c) => c.name === id || c.name.startsWith(id + " "));
  if (hits.length !== 1) throw new Error(`${hits.length} ledger entries for ${id}`);
  return hits[0].name;
};
const edits = [];
const edit = (nm, old, nu, claims, check, drop) =>
  edits.push({ name: nm, old, new: nu, ...(claims ? { claims } : {}), ...(check ? { check } : {}), ...(drop ? { drop } : {}) });

// ---- the opening ---------------------------------------------------------------------------------------
{
  const s = "A Claude Code plugin for assessing and improving any text, a README first, in rounds of edits by several AI agents working from rules and best practices.";
  edit("C01 re-pinned: the opening sentence, unchanged from 01", s, s,
    [{ name: name("C01"), pattern: pin(s),
       asks: "terse is a Claude Code plugin whose skills assess a text (audit measures a document) and improve it (rewrite writes it in rounds of edits); the text is a document's Markdown files, with or without code behind them, entered at README.md as a rule; the edits are made by several AI agents — three writers and two judges, then reviewers — working from the writing rules the brief carries and from what comparable documents already solved, which rethink surveys." }],
    { level: 2,
      // First build: plugin.json:2–4 put the manifest's 600-character description into the output and the
      // ledger's `saw`, clipped at 2000 characters, lost the rethink lines. The name line alone says what the
      // manifest is; the description is not what the sentence claims.
      run: [`grep -n -o '"name": "terse"' ${REPO}/plugins/terse/.claude-plugin/plugin.json`, sed("4p;25,28p", `${SK}/audit/SKILL.md`),
            sed("4p;50p;66p", `${SK}/rewrite/SKILL.md`), sed("4,5p;55p", `${SK}/rethink/SKILL.md`)].join("; "),
      expect: all(L('2:"name": "terse"'), L("Measures a document against two rulers"),
        L("Default to every tracked `.md`."), L("Text with no code behind it still gets audited"), L("Usually `README.md`."),
        L("Writes the text in rounds"), L("three writers, one whole candidate each with a different stance, and two judges"),
        L("**The writing rules** — [writing-rules.md](references/writing-rules.md), copied in as written."),
        L("what comparable documents already solved"), L("## Step 1. What comparable documents already solved")) });
}

// ---- Quick start ---------------------------------------------------------------------------------------
{
  const s = "claude plugin marketplace add Nowely/agent-skills\nclaude plugin install terse@nowely";
  edit("C19 re-pinned: the install fence, run as written; C18 dropped (skeleton part 5, :42–45 the /plugin fence)", s, s,
    [{ name: name("C19"), pattern: pin(s),
       asks: "From a shell, `claude plugin marketplace add Nowely/agent-skills` then `claude plugin install terse@nowely` install terse into Claude Code: on a clean configuration, signed out, both exit 0 and the plugin is in Claude Code's plugin cache with its skills." }],
    { level: 3, run: `sh ${PROBE}/install.sh`,
      expect: all(L("auth status: not logged in"),
        L("$ claude plugin marketplace add Nowely/agent-skills -> exit 0; Successfully added marketplace: nowely"),
        L("$ claude plugin install terse@nowely -> exit 0; Successfully installed plugin: terse@nowely"),
        L("installed at <config>/plugins/cache/nowely/terse/") + "[0-9.]+" + L("; skills there: audit rethink rewrite (3)")) },
    [name("C18")]);
}
{
  const old = "You need: Node 22 or newer.";
  const nu = "You need: Node 22 or newer, and a signed-in Claude Code.";
  edit("R02a new — graft Fable 1 / Astra 1: the sign-in on the \"You need\" line (l3 F2; coordinator's note 4)", old, nu,
    [{ name: "R02a you need Node 22 or newer and a signed-in Claude Code: signed out no skill runs, audit and rewrite stop without Node", pattern: pin(nu),
       asks: "Past the two install commands, running the skills needs a Claude Code that is signed in — signed out, /terse:audit, /terse:rethink and /terse:rewrite each stop at \"Not logged in\" — and, for audit and rewrite, whose pages run Node scripts (rethink's runs none), Node at the version the plugin declares, 22 or newer: a skill script with no node exits 127 and passes with Node 24.11.0. The floor of 22 is the declaration; no Node older than 24.11.0 was run." }],
    { level: 3, run: `sh ${PROBE}/install.sh`,
      expect: all(L("auth status: not logged in"), L("node on PATH: no"),
        L("/terse:audit, not signed in: exit 1, Not logged in · Please run /login"),
        L("/terse:rethink, not signed in: exit 1, Not logged in · Please run /login"),
        L("/terse:rewrite, not signed in: exit 1, Not logged in · Please run /login"),
        L("a skill script with no node on PATH: exit 127"),
        L("the same script with node v24.11.0 on PATH: exit 0; all checks caught their planted violation"),
        L("pages that run node: audit rewrite"), L("rethink: node commands 0"), L('"engines":{"node":">=22"}')) });
}
const EXCERPT = "`missing`: the owner's intent — the method holds for any text\nin any language, code or not — appears in no page";
{
  const old = "docs 5/7, no-document 0/7, delta +5/7";
  const lead = "From its report on this plugin's README, 2026-09-22:\n\n```text\n";
  if (T.split(lead + old + "\n```").length !== 2) throw new Error("the excerpt's lead and fence are not where 01 has them");
  edit("R02b new — the excerpt: the Q7 `missing` finding of the 2026-09-22 report, verbatim, in place of the Score fragment", old, EXCERPT,
    [{ name: "R02b the excerpt is verbatim from the 2026-09-22 report's What broke, the Q7 missing finding, with no must-not word",
       pattern: pin(lead + EXCERPT + "\n```"),
       asks: "The excerpt under \"From its report on this plugin's README, 2026-09-22\" is verbatim from that report — the audit of this plugin's README at 1a24018, dated 2026-09-22 — in its What broke section, the Q7 entry's `missing` finding (audit.md:1014–1015), with the report's own line break; its sentence goes on \"… and no question can be answered on it from the documentation\", and the excerpt stops before that clause; 22 whitespace tokens, at most thirty words; no word of the skeleton's must-not list and no reader pair in it." }],
    { level: 3, run: `sh ${PROBE}/excerpt.sh`,
      expect: all(L("excerpt line 1 found at audit.md:1014"), L("excerpt line 2 found at audit.md:1015"),
        L("joined, in the normalised report: 1 time(s)"),
        L("997:## What broke 1010:### Q7 — reader failure, and one `missing` entry 1020:### Task TB"),
        L("the report's date: 993:2026-09-22, README at 1a24018"),
        L("the sentence ends: appears in no page, and no question can be answered on it from the documentation."),
        L("excerpt size: 22 whitespace tokens, 20 words"), L("must-not words in the excerpt: 0"), L("reader pairs in the excerpt: 0")) });
}
{
  const old = "If it does, run this and give it the folder the report names; if not, run `/terse:rethink` first to decide a new one.";
  const nu = "If it does, run this and give it the folder the report names; if not, run `/terse:rethink` first to decide a new one: a skeleton, an outline you agree to.";
  edit("C09 re-pinned, R02c new — graft Astra 2: the skeleton you agree to, on the not-agreed branch", old, nu,
    [{ name: name("C09"), pattern: pin("if not, run `/terse:rethink` first to decide a new one: a skeleton, an outline you agree to."),
       asks: "What the pages say rethink does on this branch: it decides what the document should be — what is said, in what order — and returns it as a skeleton, an outline of the sections (titles, what each is for and leaves out, a word budget), then waits for the user's word on it; rewrite starts only from a skeleton the user said they agree to." },
     { name: "R02c after an audit, a shape that stands takes rewrite with the report's folder, one that does not takes rethink first", pattern: pin("If it does, run this and give it the folder the report names;"),
       asks: "What the pages say comes after an audit: when the user says the document's current shape stands, the audit offers rewrite as the next step, and rewrite is given the run directory whose absolute path the audit's report names; when they do not, the audit offers rethink instead, and rewrite writes nothing on a shape the user has not agreed to." }],
    { level: 2,
      run: [sed("166,171p", `${SK}/audit/SKILL.md`), sed("14,16p;37p", `${SK}/rewrite/SKILL.md`), sed("4,5p;13,15p;148,149p", `${SK}/rethink/SKILL.md`)].join("; "),
      expect: all(L("the absolute path, and the shape verdict"), L("quoted, that the document's current shape stands"),
        L("Agreed, offer `rewrite` as the next step. Not agreed, offer `/terse:rethink`"),
        L("Nothing is written on a shape the user has not agreed to"), L("Ask the user for the run directory from `audit`"),
        L("Decides what a document should be before a sentence of it is written"), L("and what is said in what order. Returns a skeleton and stops there"),
        L("The output is a skeleton: section titles, what each is for, what each deliberately leaves out, a word budget"),
        L("Then stop and wait for the user's word on the file"), L("`rewrite` starts only from a skeleton the user said they agree to")) });
}
{
  const old = "It hands back a draft and its diff, each change against your document, and you decide whether the draft replaces it.";
  const nu = "It hands back a new draft of your whole document and its diff, each change against the original, in the plugin's own folder outside your repository. You decide whether the draft replaces your document.";
  edit("R02d new — graft Fable 3 with Astra's shared fault: what rewrite hands back, and where, at the decision", old, nu,
    [{ name: "R02d rewrite hands back a new draft of the whole document and its diff, in the plugin's own folder outside the repository", pattern: pin(nu),
       asks: "What the rewrite page instructs at the hand-over: the round — the whole document as that round leaves it — and diff-NN.patch, its diff against the original (00-original.md), both written into the run directory, which audit's formula makes outside the repository that holds the document: in the plugin's data directory when installed, under ${TMPDIR:-/tmp}/terse from a checkout; applying the draft to the user's files waits for their word." }],
    { level: 2,
      run: [sed("66p;76,82p;87,92p;221,223p", `${SK}/rewrite/SKILL.md`), sed("33p;36,38p", `${SK}/audit/SKILL.md`)].join("; "),
      expect: all(L("one whole candidate each"), L("Work in a run directory of the document's own, outside the repository that holds it"),
        esc('D="${CLAUDE_PLUGIN_DATA}"; RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/'),
        L("Nothing goes into that repository without the user's word — not the candidate (step 5)"),
        L("Every round is its own file, `NN-<pass>.md`"), L("the original is `00-original.md`"),
        L("Hand over the round and `diff-NN.patch`, the diff against `00-original.md`, written into the run directory. Then stop: applying the candidate to the user's files needs their word"),
        L("installed, Claude Code writes the plugin's data directory into that line before it runs")) });
}
{
  const old = "claude plugin update terse@nowely\n```\n\n## Skills";
  const nu = "claude plugin update terse@nowely\n```\n\nRestart Claude Code to apply it.\n\n## Skills";
  edit("R02e new — Fable's observation: the restart at the update, in the one clause the device allows", old, nu,
    [{ name: "R02e the update commands update the plugin, and the update applies after Claude Code restarts",
       pattern: pin("claude plugin marketplace update nowely\nclaude plugin update terse@nowely\n```\n\nRestart Claude Code to apply it."),
       asks: "The README's two update commands update terse, and the update applies once Claude Code restarts: with a newer version published in the marketplace, `claude plugin marketplace update nowely` then `claude plugin update terse@nowely` exit 0 and the second prints \"updated from 0.1.1 to 0.1.2 … Restart to apply changes\"; its help reads \"restart required to apply\"; against GitHub today both exit 0 and report terse already at the latest version. The restart is the host's own instruction, printed; an open session's behaviour without it was not run." }],
    { level: 3, run: `sh ${PROBE}/update.sh; sh ${PROBE}/install.sh`,
      expect: all(L("the copy's plugin.json now: \"version\": \"0.1.2\""),
        L("$ claude plugin marketplace update nowely") + "[\\s\\S]*?" + L("Successfully updated marketplace: nowely") + "\\s+exit 0",
        L("$ claude plugin update terse@nowely") + "[\\s\\S]*?" + L("Plugin \"terse\" updated from 0.1.1 to 0.1.2 for scope user. Restart to apply changes.") + "\\s+exit 0",
        L("help: Update a plugin to the latest version (restart required to apply)"),
        L("$ claude plugin marketplace update nowely -> exit 0; Successfully updated marketplace: nowely"),
        L("$ claude plugin update terse@nowely -> exit 0; terse is already at the latest version (0.1.1)")) });
}

// ---- Skills --------------------------------------------------------------------------------------------
{
  const s = "| Command | When to run it | What you get back |";
  const rows = "\\| `/terse:audit` \\| [^|]+ \\| [^|]+ \\| \\| `/terse:rethink` \\| [^|]+ \\| [^|]+ \\| \\| `/terse:rewrite` \\| [^|]+ \\| [^|]+ \\|";
  edit("C03 re-pinned: three skills, one table row each (table unchanged here)", s, s,
    [{ name: name("C03"), pattern: rows,
       asks: "The plugin as this checkout ships it, installed into Claude Code, has three skills — audit, rethink and rewrite — and the table gives each one row." }],
    { level: 3, run: `sh ${PROBE}/update.sh`,
      expect: all(L("the copy's plugins/terse against the checkout's: identical"), L("plugin install terse@nowely -> exit 0"),
        L("Skills (3)") + "\\s+" + L("audit, rethink, rewrite"), L("plugin details terse@nowely -> exit 0")) });
}
{
  const s = "| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order | A skeleton: an outline of sections, each with its purpose and budget, to agree to before anything is written |";
  edit("C10 re-pinned: rethink's row, unchanged from 01", s, s,
    [{ name: name("C10"), pattern: pin(s),
       asks: "What the rethink page says: it is for a document whose shape is wrong or one not yet written; it returns a skeleton — section titles, what each is for, what each leaves out, a word budget, and the rules that gate the writing — and stops for the user's word on it before anything is written; rewrite starts only from a skeleton the user said they agree to." }],
    { level: 2, run: sed("4,6p;13,17p;148,149p", `${SK}/rethink/SKILL.md`),
      expect: all(L("Use when a document's shape is wrong, or when starting one."),
        L("The output is a skeleton: section titles, what each is for, what each deliberately leaves out, a word budget, and the rules that will gate the writing."),
        L("**Then it stops.** Putting a skeleton in front of the person before two thousand words are written"),
        L("Then stop and wait for the user's word on the file"), L("`rewrite` starts only from a skeleton the user said they agree to")) });
}
{
  const old = "A new draft of the whole document beside yours, and its diff |";
  const nu = "A new draft of the whole document, and its diff |";
  edit("C11 re-pinned — Astra's shared fault: rewrite's row without \"beside\"", old, nu,
    [{ name: name("C11"), pattern: pin("| `/terse:rewrite` | After audit, or a skeleton you agreed to | A new draft of the whole document, and its diff |"),
       asks: "What the rewrite page says: it starts from an audit's run file or from a skeleton the user agreed to — either way only on a shape the user agreed to — and hands over a new draft of the whole document, the round, with its diff against the original." }],
    { level: 2, run: sed("14,16p;24,28p;221,223p", `${SK}/rewrite/SKILL.md`),
      expect: all(L("Nothing is written on a shape the user has not agreed to"),
        "\\|\\s+a\\s+skeleton\\s+the\\s+user\\s+agreed\\s+to\\s+\\|\\s+step\\s+2\\s+\\|", "\\|\\s+an\\s+`audit`\\s+run\\s+file\\s+\\|\\s+step\\s+1\\s+\\|",
        L("Hand over the round and `diff-NN.patch`, the diff against `00-original.md`")) });
}
{
  const old = "- `/terse:audit` → `/terse:rewrite` → `/terse:audit`\n- `/terse:rethink` → `/terse:rewrite` → `/terse:audit`";
  const nu = "- `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions\n- `/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first time";
  edit("C05 re-pinned — graft Fable 2 / Astra 3, as the pages have it: each order ends as it does", old, nu,
    [{ name: name("C05"), pattern: pin(nu),
       asks: "What the pages lay out for the two orders: an audit's run is one way into rewrite, and an audit after a rewrite re-measures with the same questions, key, entry file and model, reusing the first audit's score without the text; rethink's skeleton is the other way into rewrite, and an order that starts at rethink has no audit before it, so its closing audit is the document's first measurement — a new question set is a new measurement with a new baseline, not a result." }],
    { level: 2,
      run: [sed("106,109p", `${SK}/audit/references/measure.md`), sed("100,102p;170,171p", `${SK}/audit/SKILL.md`),
            sed("24,28p", `${SK}/rewrite/SKILL.md`), sed("4,6p", `${SK}/rethink/SKILL.md`)].join("; "),
      expect: all(L("## Re-measuring after a rewrite"),
        L("Same questions, same key, same entry file, same model. Change any of them and the two scores are not comparable; a new question set is a new measurement with a new baseline, not a result."),
        L("runs once, at the baseline. A re-measurement after a rewrite reuses the same no-document score"),
        L("Agreed, offer `rewrite` as the next step."),
        "\\|\\s+a\\s+skeleton\\s+the\\s+user\\s+agreed\\s+to\\s+\\|\\s+step\\s+2", "\\|\\s+an\\s+`audit`\\s+run\\s+file\\s+\\|\\s+step\\s+1",
        L("Returns a skeleton and stops there — the writing is `rewrite`'s.")) });
}

// ---- How it works --------------------------------------------------------------------------------------
{
  const s = "A fresh AI reader per question answers from the text alone, starting where your readers start, against an answer key written first from the code or a named source; the same questions run without your text.";
  edit("C06 re-pinned: the judgment, unchanged from 01", s, s,
    [{ name: name("C06"), pattern: pin(s),
       asks: "What the audit page instructs: the answer key is written from the claim ledger — the code — before the first reader is started, and where no code backs the text a claim carries a named source the reader can check; one fresh reader, a model agent, per question, each starting at the entry file where the user's readers arrive and opening only the .md files; the same questions run a second time with no files at all." }],
    { level: 2,
      run: [sed("13,16p;28p;76p;88p;91,92p;96,97p", `${SK}/audit/SKILL.md`), sed("14p;40p", `${SK}/audit/references/measure.md`), sed("73,77p", `${SK}/audit/references/truth-pass.md`)].join("; "),
      expect: all(L("both exist before the first reader is spawned"), L("Where a reader arrives. Usually `README.md`. This is the entry file for every reader."),
        L("Write the correct answer to each from the ledger, and write it now."), L("how many readers, which model"),
        L("One fresh reader per question"), L("Each one starts at the entry file, may open only `.md` files, may not read source"),
        L("runs a second arm with no documentation at all**: the same questions, the same model, no files."),
        L("Written from the code, not from the documentation."), L("Use a cheap model"),
        L("a guarantee-shaped claim carries a named source the reader can check")) });
}
{
  const s = "Wrong answers get a cause: false, missing, misplaced, hard to find, misleading steps.";
  edit("C07 re-pinned: the five causes, unchanged from 01", s, s,
    [{ name: name("C07"), pattern: pin(s),
       asks: "What the audit page instructs: every wrong answer gets one of five causes, in its table's order — refuted, missing, placement, findability, harmful — which the README calls false, missing, misplaced, hard to find and misleading steps." }],
    { level: 2, run: sed("125,133p", `${SK}/audit/SKILL.md`),
      expect: all(L("Give every wrong answer a cause"),
        "\\|\\s+refuted\\s+\\|\\s+the\\s+text\\s+states\\s+what\\s+the\\s+code\\s+does\\s+not\\s+do\\s+\\|[\\s\\S]*\\|\\s+missing\\s+\\|\\s+the\\s+documentation\\s+does\\s+not\\s+answer\\s+the\\s+question\\s+anywhere\\s+\\|[\\s\\S]*\\|\\s+placement\\s+\\|\\s+the\\s+sentence\\s+is\\s+true\\s+and\\s+sits\\s+where\\s+it\\s+misleads\\s+\\|[\\s\\S]*\\|\\s+findability\\s+\\|\\s+true,\\s+in\\s+the\\s+right\\s+place,\\s+not\\s+found\\s+\\|[\\s\\S]*\\|\\s+harmful\\s+\\|\\s+every\\s+sentence\\s+true,\\s+the\\s+sequence\\s+leaves\\s+the\\s+reader\\s+worse\\s+off\\s+\\|") });
}
{
  const s = "Each run is written in the plugin's own folder; nothing in your repository changes until you say so.";
  edit("C15 re-pinned: the folder line, unchanged from 01", s, s,
    [{ name: name("C15"), pattern: pin(s),
       asks: "What the three pages instruct: each skill writes its run into a run directory outside the repository that holds the document, made by one formula — the plugin's data directory when installed, ${TMPDIR:-/tmp}/terse from a checkout; audit and rethink write nothing into that repository; rewrite writes nothing there — not the draft, not a bug it found — without the user's word." }],
    { level: 2,
      run: [sed("33p;36,38p;44p", `${SK}/audit/SKILL.md`), sed("31,32p;46p", `${SK}/rethink/SKILL.md`), sed("76,77p;88,89p;172,173p;222,223p", `${SK}/rewrite/SKILL.md`)].join("; "),
      expect: all(esc('RUN="${D:-${TMPDIR:-/tmp}/terse}/runs/'), L("installed, Claude Code writes the plugin's data directory into that line before it runs"),
        L("Write nothing into the audited repository. Not a report, not a note, not a fix."),
        L("Everything this skill writes goes into a run directory of the document's own, outside the repository that holds it"),
        L("Nothing goes into the repository that holds the document."),
        L("Work in a run directory of the document's own, outside the repository that holds it"),
        L("Nothing goes into that repository without the user's word — not the candidate (step 5), not a code defect (item 6)."),
        L("A code defect goes into the repository's `ISSUES.md` only on the user's word"),
        L("applying the candidate to the user's files needs their word")) });
}

// ---- What was measured ---------------------------------------------------------------------------------
{
  const s = "One small trial; the gain could be chance (*p* = 0.25).";
  edit("C33 re-pinned: p = 0.25, unchanged from 01", s, s,
    [{ name: name("C33"), pattern: pin(s),
       asks: "The 2026-09-10 result, 3 of 6 → 6 of 6 with one trial per question, is three improvements and no reversals — the counts the record reports — and an exact two-sided test on those counts gives p = 0.25: the gain could be chance." }],
    { level: 3,
      run: `node -e 'const b=3,c=0,n=b+c,C=(n,k)=>{let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return r};let s=0;for(let k=0;k<=Math.min(b,c);k++)s+=C(n,k);console.log("improvements "+b+", reversals "+c+": exact two-sided McNemar p = "+Math.min(1,2*s*Math.pow(0.5,n)))'; ${sed("92,95p", PR)}; ${sed("9p", `${REPO}/research/README.md`)}`,
      expect: all(L("improvements 3, reversals 0: exact two-sided McNemar p = 0.25"),
        L("Three improvements and zero reversals over six paired questions gives an exact two-sided McNemar **p = 0.25**"),
        L("3/6 → 6/6 on six reader questions, one trial each (p = 0.25, not distinguishable from chance)")) });
}
{
  const s = "The same questions were not run without the text.";
  edit("C44 re-pinned: no run without the text on 2026-09-10, unchanged from 01", s, s,
    [{ name: name("C44"), pattern: pin(s),
       asks: "The 2026-09-10 run asked its questions only with the README: the record says no arm ran the same questions without the document, and the 2026-09-22 audit's limits line says the arm without the document ran there for the first time in this repository." }],
    { level: 2, run: `${sed("10p", `${REPO}/research/README.md`)}; ${sed("104p;107p", PR)}; ${sed("995p", `${RUN}/audit.md`)}`,
      expect: all(L("no arm ever ran without the document"), L("We have no control for prior knowledge"), L("Both ran the control. We did not."),
        L("the no-document arm ran for the first time in this repository")) });
}
{
  const s = "The same run took that README from 2,725 words to 2,571.";
  edit("C24 re-pinned: 2,725 → 2,571, unchanged from 01", s, s,
    [{ name: name("C24"), pattern: pin(s),
       asks: "The 2026-09-10 run's README went from 2,725 words, as it stood, to 2,571 in the final result — counted now with wc -w on the two files the record keeps, and the record's table gives the same two counts." }],
    { level: 3, run: `wc -w ${CH}/chain/00-original.md ${CH}/chain/README.md; ${sed("16p;20p;24p", `${CH}/README.md`)}`,
      expect: all("2725 [^\\n]*chain/00-original\\.md", "2571 [^\\n]*chain/README\\.md", L("The four-pass rewrite of one README, stage by stage"),
        L("| `00-original.md` | the README as it stood, 2,725 words |"),
        L("| `README.md` | the final result after repairing the measured reader failures, 2,571 words |")) });
}
{
  const old = "Never measured: whether a person reads the improved text better.";
  const nu = "Never measured: whether a person reads the improved text better — only whether a model does.";
  edit("R02f new — graft Fable 4: what was measured instead; C42 and C43 dropped (skeleton part 5, :76–79 and :81)", old, nu,
    [{ name: "R02f no run measured whether a person reads the improved text better, only whether a model answers", pattern: pin(nu),
       asks: "The readers of both runs were models — Haiku on 2026-09-10, Codex gpt-5.6-luna on 2026-09-22 — and the record says what they measure is whether a model can answer from the text, not whether a person reads it better; no run measured a person." }],
    { level: 2,
      run: `${sed("993p;995p", `${RUN}/audit.md`)}; ${sed("40p", `${SK}/audit/references/measure.md`)}; ${sed("130,132p", PR)}; ${sed("10p", `${REPO}/research/README.md`)}`,
      expect: all(L("readers Codex gpt-5.6-luna"), L("the 2026-09-10 run used Haiku"),
        L("the readers are a model, and the ruler measures whether a model can answer from the text, not whether a person improved"),
        L("terse currently measures model answerability, and its numbers are not valid evidence of human improvement yet"),
        L("the plugin's own numbers measure model answerability, not human improvement")) },
    [name("C42"), name("C43")]);
}

// ---- apply, and hold the result to the ledger ----------------------------------------------------------
let t = T;
for (const e of edits) {
  if (T.split(e.old).length !== 2) throw new Error(`${e.name}: occurs ${T.split(e.old).length - 1} times in 01`);
  if (t.split(e.old).length !== 2) throw new Error(`${e.name}: occurs ${t.split(e.old).length - 1} times after the edits before it`);
  t = t.replace(e.old, e.new);
}
const flat = t.replace(/\s+/g, " ");
const QUAL = /\b(unless|except (when|where|for|that)|only (if|when|where|after|once)|provided that|as long as|but not|save (for|where)|other than|apart from)\b/gi;
const tally = (s) => [...String(s ?? "").replace(/\s+/g, " ").matchAll(QUAL)].length;
const names = new Set(); const touched = new Set();
for (const e of edits) {
  if (tally(e.new) > tally(e.old)) throw new Error(`${e.name}: adds a qualifying form`);
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
fs.writeFileSync(`${PROBE}/excerpt.txt`, EXCERPT + "\n");
fs.writeFileSync(`${RUN}/edits/02.json`, JSON.stringify(edits, null, 1) + "\n");
const claims = edits.flatMap((e) => e.claims ?? []);
console.log(`edits ${edits.length} (${edits.filter((e) => e.old === e.new).length} with old = new); claims ${claims.length}: re-pinned ${claims.filter((c) => /^C\d\d /.test(c.name)).length}, new ${claims.filter((c) => /^R02/.test(c.name)).length}; dropped ${edits.flatMap((e) => e.drop ?? []).length}`);
console.log(`ledger entries this round leaves alone: ${ledger.filter((c) => !touched.has(c.name)).map((c) => c.name.split(" ")[0] + (c.want ? "+" : "-")).join(" ")}`);
