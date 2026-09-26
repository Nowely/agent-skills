#!/usr/bin/env node
// Builds edits/03.json — round 03 of the rewrite of plugins/terse/README.md, from 02-grafts.md's own bytes,
// on the routing of the round-02 wave (reviews/02/routing.md, first two rows; reviews/02/lens6-fable-dedup.md).
//   the regression  L6.2-01: line 55's "for the first time" cut; the bare chain (C05 re-pinned).
//   SENTENCE        04+28 rethink's row (C10); 09 line 63 (new); 11 line 61, round 01's FALSE (new);
//                   12 line 62, rethink's reading as the user sizes it (new, `qualifies`); 13 line 64, the guard
//                   (new, level 3, probe-03/guard.sh, `qualifies`); 15 line 71 (new, level 3, recount);
//                   17 the rewrite row's shape condition (C11, `qualifies`); 18+19 line 20's ask and wait (new,
//                   level 3 by record) and one sentence for all three skills' announcement (new);
//                   20 line 27, "when it asks" (R02c); 21 line 33, "a folder of its own" (R02d); 29 line 62, the
//                   rules named by filler too (new); 33 line 70 (C24); 34 line 20's water and "Its report" (R02b).
//   decisions       03: the sign-in clause cut (R02a re-pinned on the Node line alone, its `asks` narrowed);
//                   30: "a README first" cut (C01 re-pinned).
// Departures from the coordinator's wording, each for a rule of the agreed skeleton or a check, and said in
// writer-03.md: the announcement sentence stands at the end of Quick start's run, not under the route list
// (§2.3 excludes agents from Skills, skeleton.md:126; there, "until you say so" would put the consent concept
// in three sections, rule 3); "each from its own angle" for "each with its own lens" ("lens" is on rule 7's
// must-not list, skeleton.md:260; terms row 45); "with as many agents as you allow" for "as many as you allow"
// (the user sizes the agents, rethink/SKILL.md:25–27, 60, not a count of documents); "once you say the shape
// stands" for "once you say its shape stands" ("its" could be audit's).
// Every `old` is 02's own bytes, occurs there once, and the edits do not overlap. Every pattern is the sentence
// as round 03 leaves it, escaped and whitespace-normalised the way ledger.mjs reads it. The edits are applied
// here as round.mjs applies them and the result is held to every claim, every retired phrasing and every pin
// this round leaves alone; the qualifier count is taken as round.mjs takes it. Every run stays under the
// ledger's 2000-character `saw` (checked by a dry run before round.mjs).
//
// Second build, after the verifier's first read (reviews/03/verifier-sol-v5.md: 17 claims, 3 REFUTED,
// 4 DOES NOT ANSWER, one duty-1 sentence). The first build is kept as edits/03.sent-back.json and
// edits/03.sent-back.build.mjs. Three sentences change:
//   R03b  REFUTED — rewrite's adversarial read of an existing document runs before any announcement
//         (rewrite/SKILL.md:64–66), so "each skill … waits" was false for that agent: the sentence now names
//         audit's agents and rewrite's writers, judges and a round's reviewers, and nothing else.
//   R03c  REFUTED — the user may refuse the fan-out (rewrite/SKILL.md:71–72): "By default", with `qualifies`.
//   R03g  REFUTED — the check matches the recorded phrasing (guard case e): "repeats one found false".
// And in `asks` and `check` only: C01 names the practices the plugin ships (prior-art.md, practices-full.md,
// briefs.md's survey, stages.md:50); R02a says which skills run Node and that 22 is the declared floor;
// C11 in the page register at level 2, the record the hand-over's part, the gated audit route not yet run to a
// hand-over; R03e keeps its clause, the user's word on the announced count (rethink/SKILL.md:60) and the
// survey the user sizes smaller (briefs.md:37–38); duty 1: "You decide whether the draft replaces your
// document." gets its own edit and claim, R03i, and R03b's edit no longer carries that sentence in its `new`.
import fs from "node:fs";
const RUN = "$TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2";
const REPO = "~/Git/agent-skills";
const SK = `${REPO}/plugins/terse/skills`;
const CH = `${REPO}/research/2026-09-10-chain`;
const P2 = `${RUN}/probe-02`, P3 = `${RUN}/probe-03`;
const T = fs.readFileSync(`${RUN}/02-grafts.md`, "utf8");
const seedFile = fs.existsSync(`${RUN}/ledger.03.json`) ? `${RUN}/ledger.03.json` : `${RUN}/ledger.json`;
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
const join = (...parts) => ({ run: parts.map((p) => p.run).join("; "), expect: all(...parts.flatMap((p) => p.expect)) });
const name = (id) => {
  const hits = ledger.filter((c) => c.name === id || c.name.startsWith(id + " "));
  if (hits.length !== 1) throw new Error(`${hits.length} ledger entries for ${id}`);
  return hits[0].name;
};
const RD = (pages) => {   // what probe-02/rundir-rewrite.sh prints for these pages (as in 02.build.mjs)
  const tail = { rewrite: "-readme", audit: "", rethink: "-readme-rethink" };
  const one = (s, cmd) => `  ${s}: ${cmd} exit 1, Not logged in, cost 0; D="<data>"; run → <data>/runs/<stamp>${tail[s]}, made, outside <work>`;
  return [
    esc(["installed (marketplace add <copy> exit 0, plugin install terse@nowely exit 0):", ...pages.map((s) => one(s, `/terse:${s}`)),
      "  <data> = <probe>/config-installed/plugins/data/terse-nowely, exists"].join("\n")),
    esc(["plugindir (--plugin-dir <copy>/plugins/terse):", ...pages.map((s) => one(s, `/terse:${s}`)),
      "  <data> = <probe>/config-plugindir/plugins/data/terse-inline, exists"].join("\n")),
    esc(["skills (<work>/.claude/skills/<name>/SKILL.md, no plugin loader):", ...pages.map((s) =>
      `  ${s}: /${s} exit 1, Not logged in, cost 0; D="\${CLAUDE_PLUGIN_DATA}" as written; run → <probe>/tmp-skills/terse/runs/<stamp>${tail[s]}, made, outside <work>; TMPDIR unset → /tmp/terse/runs/<stamp>${tail[s]}`)].join("\n")),
    esc("<work> = each load's working directory, for the repository; entries added to the three: 0"),
    esc("checkout status for plugins/ and .claude-plugin/: []"),
    esc("copy of plugins/terse = checkout's: identical")];
};
const edits = [];
const edit = (nm, old, nu, claims, check, extra = {}) =>
  edits.push({ name: nm, old, new: nu, ...(claims ? { claims } : {}), ...(check ? { check } : {}), ...extra });

// ---- the opening ---------------------------------------------------------------------------------------
{
  const old = "any text, a README first, in rounds";
  const nu = "any text, in rounds";
  const s = "A Claude Code plugin for assessing and improving any text, in rounds of edits by several AI agents working from rules and best practices.";
  edit("C01 re-pinned — decision L6.2-30: \"a README first\" cut (the round-04 verdict \"tied to README\")", old, nu,
    [{ name: name("C01"), pattern: pin(s),
       asks: "The scope \"any text\" is the owner's stated aim, not a page's behaviour: the owner's purpose statement recorded in this run names it — «оценка и улучшение текста (чтобы это ни значило). Документация, комментарии, проза, текст и даже код» (purpose.md:5–6, rendered at 12–13) — and the audit's profile records it as the owner's intent (audit.md:21–22); the pages themselves take a document's Markdown files, with or without code behind them (audit/SKILL.md:25–26). The rest is what the pages say, level 2: terse is a Claude Code plugin (its manifest, plugin.json:2); its audit measures a document (audit/SKILL.md:4); its rewrite works in rounds of edits made by several AI agents — writers and judges, then critics, one agent per lens, the AI reviewers (rewrite/SKILL.md:4, 66, 164–165) — under the writing rules (rewrite/SKILL.md:50) and from best practices: the practices the plugin ships, about forty ranked in prior-art.md and all 271 its survey returned in practices-full.md (prior-art.md:299–304; practices-full.md:3–4), and what documents like the reader's already solved, which rethink's first step surveys, slice by slice (rethink/SKILL.md:55; briefs.md:33–38); the principle every stage serves ends in gathering the best practices (stages.md:48–50)." }],
    // First build: plugin.json:2–4 put the manifest's 600-character description into the output and the
    // ledger's `saw`, clipped at 2000 characters, lost the rethink lines (round 02). Round 03's second build:
    // the verifier found "best practices" missing from the run; the practices the plugin ships are printed now.
    { level: 2, ...join(
        Q(`${RUN}/purpose.md`, "5-6", "Это оценка и улучшение текста (чтобы это ни значило).", "Документация, комментарии, проза, текст и даже код, и тд - не важно."),
        Q(`${RUN}/purpose.md`, "12-13", "assessing and improving text, whatever that means. Documentation, comments, prose, text, even code — it does not matter which."),
        Q(`${RUN}/audit.md`, "21-22", "the owner's own intent, not in any page, is that `terse` works on any text in any language, code or not."),
        { run: `grep -n -o -H '"name": "terse"' ${REPO}/plugins/terse/.claude-plugin/plugin.json | sed 's#^${REPO}/##'`, expect: [L('plugins/terse/.claude-plugin/plugin.json:2:"name": "terse"')] },
        Q(`${SK}/audit/SKILL.md`, "4-4", "Measures a document against two rulers"),
        Q(`${SK}/audit/SKILL.md`, "25-26", "Default to every tracked `.md`.", "Text with no code behind it still gets audited"),
        Q(`${SK}/rewrite/SKILL.md`, "4-4", "Writes the text in rounds: one candidate, then critics with lenses that differ"),
        Q(`${SK}/rewrite/SKILL.md`, "66-66", "three writers, one whole candidate each with a different stance, and two judges"),
        Q(`${SK}/rewrite/SKILL.md`, "164-165", "**then the critics**, one agent per lens"),
        Q(`${SK}/rewrite/SKILL.md`, "50-50", "**The writing rules** — [writing-rules.md](references/writing-rules.md), copied in as written."),
        Q(`${REPO}/plugins/terse/references/prior-art.md`, "299-304", "Ranked within each group by what it buys.", "This is the curated forty. All 271 practices the survey returned are in [practices-full.md](practices-full.md)"),
        Q(`${REPO}/plugins/terse/references/practices-full.md`, "3-4", "Two hundred and seventy-one practices, as returned"),
        Q(`${SK}/rethink/SKILL.md`, "55-55", "## Step 1. What comparable documents already solved"),
        Q(`${SK}/rethink/references/briefs.md`, "33-38", "## 1. The survey", "One surveyor per slice"),
        Q(`${SK}/rethink/references/stages.md`, "48-50", "evaluates them, and gathers the best practices.")) });
}

// ---- Quick start ---------------------------------------------------------------------------------------
{
  const old = "You need: Node 22 or newer, and a signed-in Claude Code.";
  const nu = "You need: Node 22 or newer.";
  edit("R02a re-pinned — decision L6.2-03: the sign-in clause cut over the judges' graft (stages.md rule 4)", old, nu,
    [{ name: name("R02a"), pattern: pin(nu),
       asks: "Narrowed to the Node line. Of the skills Quick start runs, audit (its first command) and rewrite run Node scripts — audit's page one command line (audit/SKILL.md:163), rewrite's seven, both skills shipping a scripts/ directory — and without Node they stop: a skill script with no node on PATH exits 127, and passes with Node 24.11.0 on PATH. rethink needs no Node: its directory has no scripts/ and its page no node command. \"22 or newer\" is the floor the plugin declares (package.json engines), not a tested one: only Node 24.11.0 ran here. The key's sign-in half no longer describes the line: that clause is cut." }],
    // First build: the verifier found rethink left out of the run and the declared floor untested; the run now
    // lists each skill's directory and Node lines; no Node 22 is installed here (v20.10.0, v20.11.0, v20.16.0, v24.11.0).
    { level: 3, run: `sh ${P3}/node.sh; sh ${P3}/node-pages.sh`,
      expect: all(L("node on PATH: no"), L("a skill script with no node on PATH: exit 127"),
        L("the same script with node v24.11.0 on PATH: exit 0; all checks caught their planted violation"),
        L("pages that run node: audit rewrite"), L("rethink: node commands 0, scripts directory absent"), L('"engines":{"node":">=22"}'),
        L("skills/audit/: SKILL.md references scripts"), L("skills/rethink/: SKILL.md references"), L("skills/rewrite/: SKILL.md references scripts"),
        L("audit/SKILL.md lines running node \"$…/scripts…\": 163 (1)"), L("rethink/SKILL.md lines running node \"$…/scripts…\": (0)"),
        L("rewrite/SKILL.md lines running node \"$…/scripts…\": 97 116 138 140 141 142 143 (7)")) });
}
{
  const old = "It asks which files to read and where your readers start, says how many agents it will start and on which model, and waits until you say so.";
  const nu = "It asks which files and where your readers start, and waits for your answer.";
  edit("R03a new — L6.2-18 and 34: what audit asks first, and the wait after it, as the run on record showed", old, nu,
    [{ name: "R03a audit asks which files and where your readers start, then waits for your answer", pattern: pin(nu),
       asks: "Level 3 by record: /terse:audit, run in a signed-in session on the plugin the README's install fetched (0.1.1 from GitHub main, 8c041b7), first proposed which files count and the entry file where readers arrive, then stopped for the user's confirmation, with no count of agents and no model said before that wait (task reader c4-1 of the round-02 wave). That page's step-1 exchange is this checkout's, word for word. Level 2, the checkout's page: step 1 settles the files and where a reader arrives with the user in one exchange (audit/SKILL.md:23–28), and the agents and model are announced only at step 5, before any reader starts (:86–89)." }],
    { level: 3, run: `sh ${P3}/step1.sh`,
      expect: all(qx(`${RUN}/reviews/02/c4-1.md`, "37-37", '"source":"terse@inline","version":"0.1.1"'),
        qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "Scope proposal for the audit:"),
        qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "**Entry file**: README.md."),
        qx(`${RUN}/reviews/02/c4-1.md`, "48-54", "Confirm this, or correct it, before I build the reader profile."),
        qx(`${RUN}/reviews/02/c4-1.md`, "56-58", "It does not yet say how many agents or which model"),
        L("step 1's exchange, 8c041b7 (the 0.1.1 the install fetched) against this checkout: identical"),
        qx(`${SK}/audit/SKILL.md`, "23-28", "Settle three things with the user in one exchange, not six:"),
        qx(`${SK}/audit/SKILL.md`, "23-28", "Which files are the documentation."),
        qx(`${SK}/audit/SKILL.md`, "23-28", "Where a reader arrives. Usually `README.md`."),
        qx(`${SK}/audit/SKILL.md`, "86-89", "Announce the plan before spawning anything: how many readers, which model, roughly what it costs. Wait for the user's word.")) });
}
const EXCERPT = "`missing`: the owner's intent — the method holds for any text\nin any language, code or not — appears in no page";
{
  const old = "From its report on this plugin's README, 2026-09-22:";
  const nu = "Its report on this plugin's README, 2026-09-22:";
  if (T.split(old + "\n\n```text\n" + EXCERPT + "\n```").length !== 2) throw new Error("the excerpt is not where 02 has it");
  edit("R02b re-pinned — L6.2-34: \"From its report\" → \"Its report\"; the excerpt unchanged", old, nu,
    [{ name: name("R02b"), pattern: pin(nu + "\n\n```text\n" + EXCERPT + "\n```"),
       asks: "The excerpt under \"Its report on this plugin's README, 2026-09-22\" is verbatim from that report — the audit of this plugin's README at 1a24018, dated 2026-09-22 — in its What broke section, the Q7 entry's `missing` finding (audit.md:1014–1015), with the report's own line break; its sentence goes on \"… and no question can be answered on it from the documentation\", and the excerpt stops before that clause; 22 whitespace tokens, at most thirty words; no word of the skeleton's must-not list and no reader pair in it." }],
    { level: 3, run: `sh ${P2}/excerpt.sh`,
      expect: all(L("excerpt line 1 found at audit.md:1014"), L("excerpt line 2 found at audit.md:1015"),
        L("joined, in the normalised report: 1 time(s)"),
        L("997:## What broke 1010:### Q7 — reader failure, and one `missing` entry 1020:### Task TB"),
        L("the report's date: 993:2026-09-22, README at 1a24018"),
        L("the sentence ends: appears in no page, and no question can be answered on it from the documentation."),
        L("excerpt size: 22 whitespace tokens, 20 words"), L("must-not words in the excerpt: 0"), L("reader pairs in the excerpt: 0")) });
}
{
  const old = "If it does, run this and give it the folder the report names;";
  const nu = "If it does, run this and, when it asks, give it the folder the report names;";
  edit("R02c re-pinned — L6.2-20: rewrite asks for the folder; it is not an argument on the command", old, nu,
    [{ name: name("R02c"), pattern: pin(nu),
       asks: "What the pages say comes after an audit: when the user says the document's current shape stands, the audit offers rewrite as the next step, and rewrite asks the user for the run directory — whose absolute path the audit's report names — rather than taking it on the command line; when they do not, the audit offers rethink instead, and rewrite writes nothing on a shape the user has not agreed to." }],
    { level: 2, ...join(
        Q(`${SK}/audit/SKILL.md`, "166-171", "the absolute path, and the shape verdict", "quoted, that the document's current shape stands", "Agreed, offer `rewrite` as the next step. Not agreed, offer `/terse:rethink`"),
        Q(`${SK}/rewrite/SKILL.md`, "14-14", "Nothing is written on a shape the user has not agreed to"),
        Q(`${SK}/rewrite/SKILL.md`, "37-37", "Ask the user for the run directory from `audit`"),
        Q(`${SK}/rewrite/SKILL.md`, "84-84", "a resumed run is given it by the user and cannot guess it")) });
}
{
  const old = "in the plugin's own folder outside your repository.";
  const nu = "in a folder of its own outside your repository.";
  const s = "It hands back a new draft of your whole document and its diff, each change against the original, in a folder of its own outside your repository. You decide whether the draft replaces your document.";
  edit("R02d re-pinned — L6.2-21: the draft's folder is rewrite's own, not the one the reader gave", old, nu,
    [{ name: name("R02d"), pattern: pin(s),
       asks: "Level 3, run: rewrite's run line, as Claude Code hands the page to the model, sets D to the plugin's data directory when the plugin is installed (<config>/plugins/data/terse-nowely) or loaded with --plugin-dir (<config>/plugins/data/terse-inline), and stays as written when the page is read as a plain file from a checkout, where the line falls back to ${TMPDIR:-/tmp}/terse; run by the shell from a working directory that stands for the user's repository, each load makes a new run folder named for the document (runs/<stamp>-<slug>), outside that directory, and adds nothing to it. Record: this run's directory has the fallback's form and holds 01-candidate.md, a whole document, and diff-01.patch, its diff from 00-original.md. What the page instructs, level 2: the run directory is the document's own, outside the repository that holds it, and the audit's report is copied into it; the hand-over is the round and diff-NN.patch, the diff against 00-original.md, written into the run directory; applying the draft to the user's files needs their word." }],
    { level: 3, ...join(
        { run: `sh ${P2}/rundir-rewrite.sh rewrite`, expect: RD(["rewrite"]) },
        { run: `sh ${P2}/record-run.sh`, expect: [
          L("this run's directory: $TMPDIR/terse/runs/20260924-002235-terse-readme-rewrite2, the form of the fallback ${TMPDIR:-/tmp}/terse/runs/<stamp>-<slug>"),
          L("its 01-candidate.md, headings: # terse | ## Quick start | ## Skills | ## How it works | ## What was measured"),
          L("its diff-01.patch: --- 00-original.md → +++ 01-candidate.md, both in that directory: 2")] },
        Q(`${SK}/rewrite/SKILL.md`, "76-76", "Work in a run directory of the document's own, outside the repository that holds it"),
        Q(`${SK}/rewrite/SKILL.md`, "87-88", "Where an audit came first, copy `audit.md` in."),
        Q(`${SK}/rewrite/SKILL.md`, "221-223", "Hand over the round and `diff-NN.patch`, the diff against `00-original.md`, written into the run directory. Then stop: applying the candidate to the user's files needs their word")) });
}
// Duty 1 (second build): the hand-over sentence gets an edit and a claim of its own; the first build's R03b
// edit carried it in its `new` as an anchor with no claim on it.
{
  const s = "You decide whether the draft replaces your document.";
  edit("R03i new — duty 1: the apply decision, unchanged, now claimed in its own edit", s, s,
    [{ name: "R03i you decide whether the draft replaces your document", pattern: pin(s),
       asks: "What the rewrite page instructs at the hand-over: it hands over the round and its diff and stops, and applying the candidate to the user's files needs their word — a diff they have read is what earns it (rewrite/SKILL.md:221–223); nothing goes into the repository that holds the document without the user's word, the candidate included (88–89)." }],
    { level: 2, ...join(
        Q(`${SK}/rewrite/SKILL.md`, "221-223", "Then stop: applying the candidate to the user's files needs their word, and a diff they have read is what earns it."),
        Q(`${SK}/rewrite/SKILL.md`, "88-89", "Nothing goes into that repository without the user's word — not the candidate (step 5)")) });
}
// R03b, second build: the first said "Each skill … waits until you say so"; the verifier refuted it — on an
// existing document rewrite's adversarial read runs first, unannounced (rewrite/SKILL.md:64–66). The sentence
// now names only the agents the pages announce. Its edit inserts before "Update:" and carries no other sentence.
{
  const old = "\n\nUpdate:\n";
  const add = "Before starting agents, audit says how many and on which model, and waits until you say so; rewrite does so before its writers and judges, and before a round's reviewers.";
  const nu = `\n\n${add}\n\nUpdate:\n`;
  edit("R03b new — L6.2-18+19, second build: the announcements the pages make, named", old, nu,
    [{ name: "R03b audit announces its agents and model and waits; rewrite does so before its writers, judges and a round's reviewers", pattern: pin(add),
       asks: "What the pages instruct, no more: before spawning anything, audit announces how many readers and which model and waits for the user's word (audit/SKILL.md:88–89); rewrite announces the count and the models before its writers and judges and waits for the user's word (rewrite/SKILL.md:70–72), and announces each round's wave — the verifier and the reviewers, one per lens, their sizes, the models — and waits (150–151). The sentence claims nothing about the adversarial whole-document read rewrite runs first on an existing document, which the page does not announce (64–66), nor about rethink's agents." }],
    { level: 2, ...join(
        Q(`${SK}/audit/SKILL.md`, "88-89", "Announce the plan before spawning anything: how many readers, which model, roughly what it costs. Wait for the user's word."),
        Q(`${SK}/rewrite/SKILL.md`, "64-66", "On a document that already exists, the first thing that runs is the adversarial whole-document read"),
        Q(`${SK}/rewrite/SKILL.md`, "70-72", "Announce before spawning: the count, the models, and that the cost of a writer or a judge has not been measured", "Wait for the user's word."),
        Q(`${SK}/rewrite/SKILL.md`, "150-151", "**Announce the wave** — the verifier, the lenses, their sizes from the table, the models, the cost — and wait for the user's word")) });
}

// ---- Skills --------------------------------------------------------------------------------------------
{
  const old = "each with its purpose and budget, to agree to before anything is written |";
  const nu = "each with its purpose and size, to agree to before the text is written |";
  const row = "| `/terse:rethink` | No document yet, or it says the wrong things in the wrong order | A skeleton: an outline of sections, each with its purpose and size, to agree to before the text is written |";
  edit("C10 re-pinned — L6.2-04+28: \"size\" for the unglossed \"budget\"; \"before the text is written\"", old, nu,
    [{ name: name("C10"), pattern: pin(row),
       asks: "What the rethink page says: it is for a document whose shape is wrong or one not yet written; it returns a skeleton — section titles, what each is for, what each leaves out, a word budget (the section's size), and the rules that gate the writing — and stops for the user's word on it before a sentence of the text is written; rewrite starts only from a skeleton the user said they agree to." }],
    { level: 2, ...join(
        Q(`${SK}/rethink/SKILL.md`, "4-6", "Decides what a document should be before a sentence of it is written", "Use when a document's shape is wrong, or when starting one."),
        Q(`${SK}/rethink/SKILL.md`, "13-15", "The output is a skeleton: section titles, what each is for, what each deliberately leaves out, a word budget, and the rules that will gate the writing."),
        Q(`${SK}/rethink/SKILL.md`, "17-17", "**Then it stops.** Putting a skeleton in front of the person before two thousand words are written"),
        Q(`${SK}/rethink/SKILL.md`, "148-149", "Then stop and wait for the user's word on the file", "`rewrite` starts only from a skeleton the user said they agree to")) });
}
{
  const old = "| After audit, or a skeleton you agreed to |";
  const nu = "| After audit, once you say the shape stands; or from a skeleton you agreed to |";
  const row = "| `/terse:rewrite` | After audit, once you say the shape stands; or from a skeleton you agreed to | A new draft of the whole document, and its diff |";
  edit("C11 re-pinned — L6.2-17: the shape condition where the reader picks the next skill", old, nu,
    [{ name: name("C11"), pattern: pin(row),
       asks: "What the rewrite page says, the row's routes: its ways in are an audit's run file, taken only once the user has said the document's shape stands — their words, quoted, recorded as shape: agreed, the one case in which the audit offers rewrite (rewrite/SKILL.md:14–16; audit/SKILL.md:166–171) — or a skeleton the user agreed to (rewrite/SKILL.md:24–28); and it hands over a new draft of the whole document with its diff against the original (221–223). The hand-over part is also on record, level 3: in this run, from the skeleton route (rounds.md line 1, with the SHA of this run's skeleton.md; 01-candidate.md and diff-01.patch); in the run of 2026-09-22/23, from an audit's run file under the pages at 2f29a8f, before the shape gate (01-candidate.md and diff-01.patch, and round 04 with diff-04.patch handed to the owner). The audit route under the shape gate has not been run to a hand-over." }],
    // First build: level 3 by record; the verifier: the audit-route record predates the shape gate. Second
    // build: the claim in the page register at level 2, the record the hand-over's level-3 part only.
    { level: 2, run: `sh ${P3}/records.sh`,
      expect: all(
        L("skeleton route, this run: R/rounds.md:1 \"shape: agreed — the owner, 2026-09-24, on `skeleton.02.md` (SHA-256 2c27…\"; its SHA is R/skeleton.md's: 1; R/01-candidate.md first \"# terse\"; R/diff-01.patch --- 00-original.md +++ 01-candidate.md"),
        L("audit route, 2026-09-22/23, pages at 2f29a8f (research/2026-09-22-terse-process/rewrite-2026-09-22/run): its run directory holds audit.md yes, = the repository's report yes, score docs 5/7, no-document 0/7; 01-candidate.md first \"# terse\"; diff-01.patch --- 00-original.md +++ 01-candidate.md ; handed over: diff-04.patch --- 00-original.md +++ 04-terms.md ; rounds.md \"round 04 and `diff-04.patch` go to the owner\""),
        qx(`${SK}/rewrite/SKILL.md`, "14-16", "Nothing is written on a shape the user has not agreed to"),
        qx(`${SK}/rewrite/SKILL.md`, "14-16", "their words, quoted, that the document's current shape stands"),
        qx(`${SK}/audit/SKILL.md`, "166-171", "It is `shape: agreed` only on the user's word"),
        qx(`${SK}/audit/SKILL.md`, "166-171", "Agreed, offer `rewrite` as the next step. Not agreed, offer `/terse:rethink`"),
        qx(`${SK}/rewrite/SKILL.md`, "24-28", "| a skeleton the user agreed to | step 2 |"), qx(`${SK}/rewrite/SKILL.md`, "24-28", "| an `audit` run file | step 1 |"),
        qx(`${SK}/rewrite/SKILL.md`, "221-223", "Hand over the round and `diff-NN.patch`, the diff against `00-original.md`, written into the run directory.")) },
    { qualifies: "\"once you say the shape stands\" is the pages' own gate on the audit way in, not a hedge: rewrite writes nothing on a shape the user has not agreed to (rewrite/SKILL.md:14–16) and the audit offers rewrite only on the user's word that the shape stands (audit/SKILL.md:166–171); the row carries it where a reader picks the next skill (L6.2-17), as Quick start's line 27 already does." });
}
{
  const old = "- `/terse:rethink` → `/terse:rewrite` → `/terse:audit` for the first time";
  const nu = "- `/terse:rethink` → `/terse:rewrite` → `/terse:audit`";
  const both = "- `/terse:audit` → `/terse:rewrite` → `/terse:audit` again with the same questions\n" + nu;
  edit("C05 re-pinned — L6.2-01, round 02's regression: the bare chain; line 52 stays", old, nu,
    [{ name: name("C05"), pattern: pin(both),
       asks: "What the pages lay out for the two orders. The audit order: an audit whose shape the user agreed offers rewrite as its next step (audit/SKILL.md:170–171), by rewrite's audit way in (rewrite/SKILL.md:24–28); an audit after a rewrite re-measures with the same questions, key, entry file and model, a new question set being a new measurement with a new baseline (measure.md:106–109), and reuses the first audit's score without the text (audit/SKILL.md:100–102). The rethink order: rethink returns a skeleton and leaves the writing to rewrite (rethink/SKILL.md:5–6), which takes it by its skeleton way in (rewrite/SKILL.md:24–28), and the order ends in an audit; the line says nothing of that audit's questions, which are the same ones where an audit came first and new ones where none did." }],
    { level: 2, ...join(
        { run: sed("106,109p", `${SK}/audit/references/measure.md`), expect: [L("## Re-measuring after a rewrite"),
          L("Same questions, same key, same entry file, same model. Change any of them and the two scores are not comparable; a new question set is a new measurement with a new baseline, not a result.")] },
        Q(`${SK}/audit/SKILL.md`, "100-102", "It doubles the reader agents, so it runs once, at the baseline. A re-measurement after a rewrite reuses the same no-document score and does not pay again."),
        Q(`${SK}/audit/SKILL.md`, "170-171", "Agreed, offer `rewrite` as the next step."),
        Q(`${SK}/rewrite/SKILL.md`, "24-28", "| a skeleton the user agreed to | step 2 |", "| an `audit` run file | step 1 |"),
        Q(`${SK}/rethink/SKILL.md`, "5-6", "Returns a skeleton and stops there — the writing is `rewrite`'s.")) });
}

// ---- How it works --------------------------------------------------------------------------------------
{
  // Second build: the verifier refuted the unconditional "Three writers draft, two judges pick" — the user may
  // refuse the fan-out (rewrite/SKILL.md:71–72). "By default", with `qualifies`.
  const old = "Three writers draft, two judges pick, then rounds of edits, checked by AI reviewers, each checking one thing.";
  const nu = "By default three writers draft and two judges pick, then rounds of edits, checked by AI reviewers, each from its own angle.";
  const s = nu;
  edit("R03c new — L6.2-11, round 01's FALSE, and the second build's default: one agent per lens, the fan-out the user may refuse", old, nu,
    [{ name: "R03c by default three writers draft and two judges pick, then rounds of edits checked by AI reviewers, each from its own angle", pattern: pin(s),
       asks: "What the rewrite page instructs. By default the bake-off has three writers, one whole candidate each, and two judges, a third only when the two split (bake-off.md:19–22; rewrite/SKILL.md:66), and the judges pick the winner (bake-off.md:132); if the user refuses that fan-out, one candidate is written from the same brief and the comparison is skipped (rewrite/SKILL.md:71–72). Then every round after it edits the round before (66–68) and is read by critics, one agent per lens (164–165) — the AI reviewers — whose lenses differ and are not disjoint (197): each reviewer reads from its own lens, and one lens may hold several parts, as lens 2's three do (critic-briefs.md:110)." }],
    { level: 2, ...join(
        Q(`${SK}/rewrite/references/bake-off.md`, "19-22", "| writers | 3 | one whole candidate each, same brief, different angle |", "| judges | 2 | a third only when the two split |"),
        Q(`${SK}/rewrite/SKILL.md`, "70-72", "If the user refuses the fan-out, write one candidate yourself from the same brief and report that the comparison was skipped."),
        Q(`${SK}/rewrite/SKILL.md`, "66-68", "three writers, one whole candidate each with a different stance, and two judges", "every round after it edits the round before"),
        Q(`${SK}/rewrite/references/bake-off.md`, "132-132", "the winner is the surviving candidate with the most sections meeting their purpose"),
        Q(`${SK}/rewrite/SKILL.md`, "164-165", "**then the critics**, one agent per lens"),
        Q(`${SK}/rewrite/SKILL.md`, "197-197", "Lenses differ; they are not disjoint"),
        Q(`${SK}/rewrite/references/critic-briefs.md`, "110-110", "Three lenses, reported separately")) },
    { qualifies: "\"By default\" is the page's own condition, not a hedge: the pool's defaults are three writers and two judges (bake-off.md:19–22), and when the user refuses the fan-out one candidate is written and the comparison skipped (rewrite/SKILL.md:71–72); without it the sentence says every rewrite has three writers and two judges, which the refusal case refutes (reviews/03/verifier-sol-v5.md)." });
}
{
  const old = "The rules forbid cutting or weakening a condition, a limit or a warning where your readers decide;";
  const nu = "The rules forbid filler, and cutting or weakening a condition, a limit or a warning where your readers decide;";
  edit("R03d new — L6.2-29: the rules named by what they forbid, filler included", old, nu,
    [{ name: "R03d the rules forbid filler, and cutting or weakening a condition, a limit or a warning where readers decide", pattern: pin(nu),
       asks: "What the pages say the writing is held to: the writing rules allow no sentence that carries nothing — each earns its place with a contract, a constraint or a reason (writing-rules.md:6–7) — and never cut a condition, a limit or a warning where a reader decides (21); the judging sheet vetoes a draft in which one was cut or weakened at a decision point (bake-off.md:114)." }],
    { level: 2, ...join(
        Q(`${SK}/rewrite/references/writing-rules.md`, "6-7", "Default: no sentence that carries nothing. One earns its place by carrying a contract, a constraint, or a reason the code cannot state."),
        Q(`${SK}/rewrite/references/writing-rules.md`, "21-21", "Never cut a condition, a limit or a warning where a reader decides."),
        Q(`${SK}/rewrite/references/bake-off.md`, "114-114", "was a condition, limit or warning at a decision point cut or weakened?", "| veto |")) });
}
{
  const old = "rethink reads documents like yours first.";
  const nu = "rethink starts by reading documents like yours, with as many agents as you allow.";
  edit("R03e new — L6.2-12: rethink's reading, at the size the user gives", old, nu,
    [{ name: "R03e rethink starts by reading documents like yours, with as many agents as you allow", pattern: pin(nu),
       asks: "What the rethink page instructs: its first step is a fan-out of agents reading documents like the user's, one per slice by default (rethink/SKILL.md:55–61), and it announces their count and models and waits for the user's word before starting them (60) — so the agents that start are the ones the user allows: the announced count on a yes, none on a no; the survey's brief lets the user size it smaller, two slices per agent (briefs.md:37–38); entered from an audit whose shape is not agreed, the step runs at the size the user gives, zero included (25–27). The sentence claims no other control over the count." }],
    { level: 2, ...join(
        Q(`${SK}/rethink/SKILL.md`, "55-58", "## Step 1. What comparable documents already solved", "A fan-out, not one reader."),
        Q(`${SK}/rethink/SKILL.md`, "60-61", "Announce the count and the models before spawning, and wait for the user's word. Default slices, one surveyor each"),
        Q(`${SK}/rethink/SKILL.md`, "25-27", "step 1 at the size the user gives, zero included"),
        Q(`${SK}/rethink/references/briefs.md`, "37-38", "One surveyor per slice, or two slices per surveyor when the user sizes the survey smaller.")) },
    { qualifies: "\"with as many agents as you allow\" is the step's own size by the user's word, not a hedge: the agents start only on the user's word to the announced count (rethink/SKILL.md:60), the survey's brief lets the user size it smaller (briefs.md:37–38), and on the audit way in the user gives its size, zero included (25–27); without it the sentence says rethink always reads documents like yours, which L6.2-12 found overstated." });
}
{
  const old = "Length never picks a draft;";
  const nu = "Word count never selects a draft;";
  const s = "Word count never selects a draft; cuts of twenty words or more carry reasons.";
  edit("R03f new — L6.2-09: the page's words for the length rule", old, nu,
    [{ name: "R03f word count never selects a draft; cuts of twenty words or more carry reasons", pattern: pin(s),
       asks: "What the pages say: in the bake-off, word count is reported and never selects a draft, and a narrow win on length is read as a tie, because model judges are measured to prefer longer answers (bake-off.md:13–15); rewrite hands over the cut ledger — every removed passage of twenty words or more, with its reason (rewrite/SKILL.md:235–236)." }],
    { level: 2, ...join(
        Q(`${SK}/rewrite/references/bake-off.md`, "13-15", "word count is reported and never selects. Read a narrow win on length as a tie."),
        Q(`${SK}/rewrite/SKILL.md`, "235-236", "the cut ledger — every removed passage of twenty words or more, with its reason")) });
}
{
  // Second build: the verifier refuted "brings back one found false" — guard case e brings the same false claim
  // back in other words and passes. "repeats": the recorded phrasing, which is what the check matches.
  const old = "A round that drops a claim checked true, or brings back one found false,";
  const nu = "A round that silently loses a sentence checked true, or repeats one found false,";
  const s = "A round that silently loses a sentence checked true, or repeats one found false, is refused before you see it.";
  edit("R03g new — L6.2-13, and the second build's \"repeats\": the guard, as far as the shipped check reaches", old, nu,
    [{ name: "R03g a round that silently loses a sentence checked true, or repeats one found false, is refused before you see it", pattern: pin(s),
       asks: "Level 3, run: the shipped check (ledger.mjs) judges a round against the phrasings its ledger records. On a round round.mjs made from one holding a pinned sentence and a retired phrasing, it exits 1 when the round loses the pinned sentence without declaring its drop, or repeats the retired phrasing word for word, and exits 0 when it does neither. A drop declared by name in the round's edits passes — named there and in that round's row of rounds.md, the loss \"silently\" excludes; the same false claim in other words is not a repeat and passes, because the check matches the recorded phrasing (ledger.mjs:6–8). Level 2, the page: the check exits 1 on a lost verified claim or a revived retired phrase, a failure the round introduced is fixed before the critics see it, and the user reads a round only once the ledger passes (rewrite/SKILL.md:119–122, 143–144, 202–206)." }],
    { level: 3, ...join(
        { run: `sh ${P3}/guard.sh`, expect: [
          L("a cut, no drop: round.mjs exit 0; ledger.mjs exit 1; T the tool asks before it deletes L? yes LOST;"),
          L("b retired phrasing back, word for word: round.mjs exit 0; ledger.mjs exit 1;") + "[^\\n]*" + L("F it deletes without asking L? - YES ;"),
          L("c neither: round.mjs exit 0; ledger.mjs exit 0;"),
          L("d cut, drop declared: round.mjs exit 0; ledger.mjs exit 0; F it deletes without asking L? - - ;"),
          L("e retired claim back, other words: round.mjs exit 0; ledger.mjs exit 0;"),
          L("d's edit names its drop: \"drop\":[\"T the tool asks before it deletes\"]")] },
        Q(`${SK}/rewrite/scripts/ledger.mjs`, "6-8", "want false : a phrasing found false, which must be absent (YES when present)", "Text is whitespace-normalised."),
        Q(`${SK}/rewrite/SKILL.md`, "119-122", "`drop` the names of ledger entries whose claims the edit removes on purpose, each of them named in that round's row of `rounds.md`"),
        Q(`${SK}/rewrite/SKILL.md`, "143-144", "exit 1 when the new round loses a verified claim or revives a retired phrase.", "A failure the round introduced is fixed before the critics see it"),
        Q(`${SK}/rewrite/SKILL.md`, "202-206", "Before the user reads a round", "**no regression in the round**: the ledger passes")) },
    { qualifies: "\"silently\" is the check's own boundary, not a hedge: a loss the round's edits declare by name as a drop passes and is recorded in rounds.md (rewrite/SKILL.md:119–122; guard.sh case d), and only an undeclared loss fails (case a); without it the sentence says every lost sentence is refused, which case d refutes (L6.2-13)." });
}

// ---- What was measured ---------------------------------------------------------------------------------
{
  const old = "The same run took that README from 2,725 words to 2,571.";
  const nu = "The same run: 2,725 words → 2,571.";
  edit("C24 re-pinned — L6.2-33: the section's own arrow", old, nu,
    [{ name: name("C24"), pattern: pin(nu),
       asks: "The 2026-09-10 run's README went from 2,725 words, as it stood, to 2,571 in the final result — counted now with wc -w on the two files the record keeps, and the record's table gives the same two counts." }],
    { level: 3, run: `wc -w ${CH}/chain/00-original.md ${CH}/chain/README.md; ${sed("16p;20p;24p", `${CH}/README.md`)}`,
      expect: all("2725 [^\\n]*chain/00-original\\.md", "2571 [^\\n]*chain/README\\.md", L("The four-pass rewrite of one README, stage by stage"),
        L("| `00-original.md` | the README as it stood, 2,725 words |"),
        L("| `README.md` | the final result after repairing the measured reader failures, 2,571 words |")) });
}
{
  const old = "this plugin's audit of its own README:";
  const nu = "this plugin's audit of its previous README:";
  const s = "2026-09-22, this plugin's audit of its previous README: 5 of 7 right with the text, 0 of 7 without.";
  edit("R03h new — L6.2-15: the README the 2026-09-22 audit measured is the one this draft replaces", old, nu,
    [{ name: "R03h the 2026-09-22 audit of the previous README: 5 of 7 right with the text, 0 of 7 without", pattern: pin(s),
       asks: "The 2026-09-22 audit measured this plugin's previous README — the README at 1a24018, byte for byte the text this draft replaces — and its reader rows, counted now, give 5 of 7 questions right with the text and 0 of 7 without, the figures of its score line." }],
    { level: 3, run: `sh ${P3}/measured.sh`,
      expect: all(L("reader rows counted under Reader results: docs 5 of 7 right, no-doc 0 of 7 right"),
        L("the report's score line: 993:docs 5/7, no-document 0/7; its target: 2026-09-22, README at 1a24018"),
        L("the README at 1a24018 = R/00-original.md, the text this draft replaces: yes (cmp)")) });
}

// ---- apply, and hold the result to the ledger ----------------------------------------------------------
let t = T;
for (const e of edits) {
  if (T.split(e.old).length !== 2) throw new Error(`${e.name}: occurs ${T.split(e.old).length - 1} times in 02`);
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
fs.writeFileSync(`${RUN}/edits/03.json`, JSON.stringify(edits, null, 1) + "\n");
fs.writeFileSync(`${P3}/03-preview.md`, t);
const claims = edits.flatMap((e) => e.claims ?? []);
console.log(`edits ${edits.length}; claims ${claims.length}: re-pinned ${claims.filter((c) => !/^R03/.test(c.name)).length}, new ${claims.filter((c) => /^R03/.test(c.name)).length}; dropped ${edits.flatMap((e) => e.drop ?? []).length}; with qualifies ${edits.filter((e) => e.qualifies).length}`);
console.log(`ledger entries this round leaves alone: ${ledger.filter((c) => !touched.has(c.name)).map((c) => c.name.split(" ")[0] + (c.want ? "+" : "-")).join(" ")}`);
