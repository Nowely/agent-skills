# The brief — rewrite of plugins/terse/README.md, audit route, 2026-09-22

Assembled once per `rewrite/SKILL.md` step 2 from the audit run file
(`research/2026-09-22-terse-process/audit-2026-09-22/audit.md`, run directory
`$TMPDIR/terse/runs/20260922-195101`). Part 1, the skeleton,
does not exist on this route.

## Part 2. Who reads this

Built by Opus P0 from the plugin's pages, scripts, manifests and the owner's recorded words, per
`reader-profile.md`; confirmed by the owner with three answers: "their words" accepted as constructed
(no issue tracker exists); the target reader documents any document, not only code; and the owner's own
intent, not in any page, is that `terse` works on any text in any language, code or not.

**What it is, in one sentence, without jargon.** Three commands you run by hand inside Claude Code on your
own `.md` files — one measures whether readers get the right answer and whether each sentence is true of
the code, one decides what a document should be before it is written, one rewrites it in reviewed rounds;
nothing reaches your files without your word.

**The reader.** Writes and owns the documentation of a small project; nobody procures this, they install
it alone in about a minute; already suspects the text is bad and cannot prove it; reads Russian and
English. NOT NECESSARILY AN ENGINEER — the audited text need not be about code at all. The only
assumptions allowed: Claude Code is installed; Node 22 only when run from a checkout.

**What brings them here.** Cannot tell whether a document is already fine, and touching it may make it
worse. A draft was abandoned at its third section, and nine of nine objections were about what it
contained, where it sat and how much there was — none about phrasing. Each round of edits heals one thing
and breaks another with nothing to say which. Sentences that are simply false about the code. Their own
sense that it reads well is not evidence. Handing it to an AI means it rewrites everything and they diff in
the dark.

**What they would otherwise use.** Anthropic's own `doc-coauthoring` skill (fresh readers, but the key in
the author's head, the document pasted in, no controls); style linters (Vale, markdownlint); or asking
Claude to "improve my README".

**Why this instead.** The answer key comes from the code before the first reader exists; readers start at
the entry file instead of being handed the text; control questions are mandatory, so a repair cannot
silently break what worked; a ledger and an executed check refuse a round that got worse; nothing is
written to your tree without your word.

**Their words, not ours.** "is my README any good?", "does this even need rewriting?", "нормальный ли
README?", "it rewrote everything and made it worse", "readers never get past the install", "проверь, что в
доке правда", "перепиши README".

**What earns their trust.** A failure that arrives with a file, a line and the code behind it; every number
with its size, including *p* = 0.25 and the admission that no no-document arm ran; checks that ship with a
self-test against a planted violation; a default that writes nothing.

**Voice.** Short sentences, one decision each. No manifesto, no aphorism. Every number with its size. No
caveats — a sentence that needs one says too much. Never narrow the subject: this takes any documentation,
not only documentation of code.

## Part 3. The writing rules (writing-rules.md, copied as written)

# The writing rules

Part two of the four-part chain. The text below is fixed. Apply it as written; do not restate it in
your own words, and do not extend it with rules you like better. It was measured in this form.

Default: no sentence that carries nothing. One earns its place by carrying a
contract, a constraint, or a reason the code cannot state.

Cut first: the argument for an instruction, restated wherever the instruction
appears. Give the instruction; the case for it lives in one place.

Also cut: editing history ("previously", "used to", "moved out of", "per PR #123",
"on this machine"); capitals used for emphasis; a true claim on the wrong line.

Define a term where the reader first needs it, not before. A page does not open
with a glossary.

A document states its purpose once, at the top, in the reader's words. That is not
the argument for an instruction, and it is not cut.

Never cut a condition, a limit or a warning where a reader decides. Repetition at
an independently read decision point is not redundancy. A dated measurement keeps
its date and its numbers, including ones the code has since changed.

Counts - sentence length, repeated phrases - prompt a review. They are not gates.

## Provenance

The twenty lines above are reproduced byte for byte from `PART 2` of the prompt that was measured, kept
at `research/2026-09-10-chain/chain-source-prompt.txt` in this repository. Their SHA-256 is
`7a577b29aff3a255de1f7b2418f8c16cb8246d78e03bb31d1ea64ced772f635d`, computed over the block alone and not
over this file. If an edit ever lands inside them, that digest stops matching and the reproduction claim
above becomes false.

## Where these rules came from

A run on 2026-09-10 put five writing standards against two unguided controls, on one README, across ten
seats with the models hidden from the judges. Both controls beat both entries of both published
standards. On the first 116 words, seven of the ten proposed nothing at all, two produced a longer text,
and the only seat that shortened it (116 to 97 words) was a control. One observation per cell, one
passage, one run — enough to justify not adopting a standard, not enough to state a rate. The lesson is
in the last rule above: standards that read as checklists produce audits, not rewriting.

These rules were themselves written against models as they behaved in September 2026. Anthropic's own
guidance now warns that anti-formatting instructions written for earlier models push newer ones the wrong
way, and the mechanism applies here: a rule aimed at a failure the model no longer has becomes a rule
that causes one. Re-check them against the model in front of you before treating them as fixed.

Already rejected on that evidence, so do not reach for them here: Diataxis or a house style guide as a
mandatory pass; a hard word limit per sentence; a prose linter (Vale, textlint, proselint); a
punctuation gate in CI.

## Part 4. The curse of knowledge (curse-of-knowledge.md, copied as written)

# The curse of knowledge

Part three of the four-part chain. The text below is fixed. Run the three numbered steps in order and
keep the inventory from step one; it is one of the artifacts `rewrite` returns.

Camerer, Loewenstein & Weber (1989) and Newton (1990): once you know something you cannot accurately
simulate the mind of someone who does not. Tappers tapping a song predicted listeners would name it half
the time; the real rate was 2.5%. Your documentation is the tapping. You hear the melody and can no
longer hear the knocking. The procedure:

  1. Inventory the invisible prerequisites: what must a reader already know for this to make sense -
     vocabulary, mental model, context, prior steps. The items you almost did not list are the curse.
  2. Rebuild from the reader's actual state, not yours minus a bit: what do they see first, what will
     they try first.
  3. Write to the failure point: wherever a non-knower stalled, that is where the melody was playing
     silently in your head.

Its own warnings: do not fix by adding more text, because the curse hides missing framing rather than
missing detail, and one sentence of "what this is and when you need it" beats three paragraphs of how.
Every "obviously", "simply" or "just" hides a prerequisite.

## Provenance

The fifteen lines above are reproduced byte for byte from `PART 3` of the prompt that was measured, kept
at `research/2026-09-10-chain/chain-source-prompt.txt` in this repository. Their SHA-256 is
`fac7a93b1e7e8a5cc71beda90ee0c0f6626a2a4499b366eb50ed48c87ebe2409`, computed over the block alone and not
over this file.

## What the inventory looks like when it is honest

From the 2026-09-10 run on one README, three of the twenty-four items it found:

- **Two installations.** The host tool being installed does not establish that the second one is
  installed and authenticated. Name both, and the language runtime, in the first setup paragraph.
- **Configuration versus prerequisites.** A reader treats every item under a heading named
  Prerequisites as mandatory. Say at the install decision that the optional file need not be created.
- **Instructions versus checks.** Prose addressed to a model is not an executable check. A reader who
  cannot tell them apart believes a verification runs that does not.

Note the shape: none of them is a missing detail. Each is a missing frame around details already on the
page. That pass added 105 words to a text the previous pass had cut by 105, and the addition was framing
rather than implementation background.

## Part 5. Where the readers failed

### Q2 — refuted — README.md:35-36

Cause: the text states what the code does not do. "It writes into its own run directory. Applying anything
to your files needs your word." The run directory is `research/<date>-<slug>/` at the root of the repository
that holds the document (`rewrite/SKILL.md:66-67`), and a code defect found in the rounds is written into
that repository's `ISSUES.md` (`rewrite/SKILL.md:136-140`, `loop.md:41`), neither with a word; only applying
the candidate waits for one (`rewrite/SKILL.md:176-177`). Ledger: C16 refuted, C15 Position. The reader
quoted the line and answered "No". The same promise stands in `rewrite/SKILL.md:6-7`, `plugin.json:4`,
`marketplace.json:20` and `CHANGELOG.md:63-64`. What a rewrite must do: correct the claim at its source —
or the owner changes the page so the claim becomes true; that choice is not the audit's.

### Q7 — reader failure, and one `missing` entry

The docs-arm reader answered a confident "Yes" from README.md:18, which says how readers move through the
documentation and nothing about its language; by `measure.md` that is the reader answering from what it
knew, not a failure of the text. Beside it, `missing`: the owner's intent — the method holds for any text
in any language, code or not — appears in no page, and no question can be answered on it from the
documentation. What a rewrite must do: write the answer, and say where it goes. Found in passing by the
truth pass, level 3: `rule1.mjs` flags a path and "exits 2" in an English line and passes the same line in
Russian; a code defect, recorded in the repository's `ISSUES.md`, not the document's failure.

### Task TB — harmful — rewrite/SKILL.md:64-67, 136-140

Every sentence true, and the sequence leaves a reader who wants nothing written into their repository
worse off: the rewrite's run directory is created inside the repository with no consent gate before it, and
the routing rule writes into a tracked file. The reader's own conclusion from the pages: not to invoke
`rewrite` at all. What a rewrite of the pages must do: repair the recipe, and test it by running it.

### Refuted claims of the truth pass that no question caught (each must be corrected at its source)

- C12 README.md:31-34 — the loop's stop rule: the loop stops when the owner reads a round and says whether they would send it; no count of findings stops anything; the lenses are not disjoint (rewrite/SKILL.md, loop.md).
- C13 README.md:34 — "Every round is kept as its own file": a round that fails its checks or the verifier is removed and regenerated (rewrite/SKILL.md step 4; run).
- C20 README.md:48 — "Nothing else is needed": the installed skills run node scripts; without node on PATH the self-test exits 127 (run).
- C21 README.md:49 — "Node 22 or newer if you run the checkout directly": node is needed on the installed route too (run).
- C27 README.md:58 — "It will not touch a condition, a limit or a warning": the rule is never cut or weaken; writers rewrite the whole file and correct what is wrong (writing-rules.md, bake-off.md).
- C30 README.md:64 — "One run … on one README": two experiments; the bake-off corpus was the repository's prose and comments (research/2026-09-10-chain/run-2x5/).
- C39 README.md:76 — "Five published writing standards … two unguided controls": the design was 2×5, four standards (one an unpublished draft) plus one control pair.
- C41 README.md:77-78 — "seven of ten agents proposed nothing": the judge's own count is six at most, and three lengthened the passage.
- C45 README.md:84 — "Two published benchmarks … found it large": one of the two sits at chance (prior-art.md:106-107).
- C46 README.md:84-86 — "prior-art.md collects every finding against these numbers": it leaves out findings of seat A5.
- Two `Position` entries: C15 README.md:35 (true, but does not say where the run directory is — after the owner's decision of 2026-09-22 the rewrite's run directory is outside the repository, like the audit's; write what the page on this branch says); C44 README.md:82-84 (true, but sits after the numbers it qualifies).

### Findings of the adversarial whole-document read (Codex Astra L3, 2026-09-22, added under What broke per rewrite/SKILL.md step 3)

- CONFIRMED, README.md:42-49 (adds to C18/C19): the advertised install commands fetch the marketplace's `main`, which at 21a225b ships terse 0.1.1 with the old `rewrite` page that wrote into the repository unasked; the README on this branch describes the branch. A sentence about what the reader gets is true only of what is released; the rewrite states the plugin as it is on this branch and the release makes it true, or says which version it describes.
- CONFIRMED, README.md:48-49 (adds to C20): "no account anywhere" conceals that the host needs a Claude login — an unauthenticated isolated install succeeded, and `claude --print` then exited 1 "Not logged in · Please run /login".
- CONFIRMED, README.md:4-5 (adds to C02): "checks every claim about behaviour against the code" conceals the truth pass's explicit exclusion of external-tool recipes (`audit/references/truth-pass.md:69-71`).
- PLAUSIBLE, README.md:10-12 and :35-36 (adds to C05/C15): re-auditing a candidate that lives outside the repository has no specified way to keep its relative links resolving; the pages require repository Markdown and the same entry file (`measure.md:49,108`).
- Weakest sections by L3: *Install* (authentication and delivered behaviour differ from the readiness promise) and *What each one does* (the candidate hand-over leaves re-audit staging unspecified).
- What a new reader still cannot answer (L3, lens E): the assumed authentication, the installed revision and its write boundary, what the truth pass excludes, how to validate a temporary candidate with its links intact.

### Passages that worked and must not be damaged

- README.md:42-49, the install commands — Q1 right (control), one file, quoted verbatim by the reader; the two prerequisite sentences at :48-49 are refuted and must change, the commands must not.
- README.md:11, the pipeline line — Q3 right ("run audit first"), and the only place the order is stated.
- README.md:21-22 and :31-36, what audit returns and what rewrite hands over — Q4 right (candidate + diff, applied on your word).
- README.md:53-56, "It is not a compressor" with the 2,725 → 2,571 figure — Q6 right (control), quoted verbatim.
- The eighteen unconfirmed entries of the truth pass (audit.md, Open) are not licence to strengthen them: a sentence at level 2 stays at level 2 or is cut.

## Part 6. The accuracy floor

Every statement about behaviour must be true of the code in this checkout — the three skill pages with their references, the seven scripts, the three manifests, at the commit named in your brief — and the writer records the level of evidence it reached: the three levels are in `plugins/terse/skills/audit/references/truth-pass.md` (1: the line resolves; 2: an independent reader of the code agrees; 3: the behaviour was made to happen). A claim about a lifecycle (what stays, what is removed, what a continued or retried run sees) at level 2 is a guess: run it. The audit's claim ledger (`audit.md`, Claim ledger, 46 entries with verdicts) is the ground truth for every sentence the README carries today; a confirmed entry may be kept or reworded, a refuted one must be corrected, an unconfirmed one must not be strengthened.
