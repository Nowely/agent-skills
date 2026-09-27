**Replication of this study: 29 principles from 323 feedback episodes across 144 sessions.**

## Summary

This is a second, larger run of the study in this issue: how one user reacts to the texts the assistant writes, turned into guidance for a writing skill. Same user, a bigger corpus, a stricter pipeline, and a direct comparison with the 23 principles above.

- **Source:** 144 Claude Code sessions in five projects (oldest session started 2026-08-17), 125 independent dialogues, 1,745 user messages — including 278 messages sent while the assistant was still working, which the first run's method does not mention.
- **Evidence:** 323 episodes in which the user reacted to the form or quality of a text, from 51 dialogues; 40 of them carry a quote that could not be verified and were not used as support.
- **Result:** 29 principles (20 strong, 9 moderate) and 1 candidate. A judge kept 14, revised 15 and marked 1 unknown; 15 of the 30 were flagged as high risk: 14 were revised, and P30 remains a candidate.
- **Against the first run:** 9 of its 23 principles confirmed, 12 partly confirmed, 0 contradicted, 2 not found; 15 principles are new here.
- **Main conclusion:** the same as the first run, with more weight behind it. The guidance is a small set of reader-side mechanisms plus genre notes that apply them — not a rulebook. The judge's most frequent revision was, again, undoing a template: a fixed README section list, "always a Markdown block", "always three options", a mandatory "why" opening for every code comment, a stored "reply in Russian" preference the user had refused.

## Recommendations for the skill

### Name

Unchanged from the first run: a section **"Writing for the reader"** in an existing skill, or a standalone **`writing-for-the-reader`** skill. This run found nothing that argues for a different name; it found more evidence for the mechanism the name points to — every decision about content, order, depth and form is made for a specific reader in a specific place.

### Trigger (description)

> Use when writing any text a person or another agent will read: chat answers, plans, reports, PR descriptions and review comments, commit messages, changelogs, READMEs, tickets and issues, messages to other teams, UI strings, code comments, briefs for other agents, and the results of tools or agents shown to a person. Helps decide what to include, in what order and depth, in which words and format, for this reader and this place. Not a style rulebook.

Two additions to the first run's trigger come from this corpus: READMEs and changelogs (the dialogues in which writing itself was the topic were about them), and results of tools or agents relayed to a person (the user repeatedly objected to status lines, ids and exit codes appearing under the assistant's name).

### How it should work

1. **Before writing, answer three questions** (as in the first run): who reads this; what is their task at this stage — understand, decide, approve, act, or carry the text somewhere else; where will the text live and how will it be rendered, copied or pasted there.
2. **While writing, apply the six mechanisms** (next section). They are the "because" of every principle; the principles are their applications.
3. **After writing, run six checks:**
   - Does the reply account for every point the reader raised, and can they find the conclusion without assembling it from the numbers?
   - Does every item and every word do something for this reader — and is nothing they asked for missing?
   - Is every claim exactly as strong as what was checked, and is every verdict ("breaking", "risk", "problem") sized to who is actually affected?
   - Are the names, labels and language the reader's own — no internal coinage, no bare label from an earlier message, no protocol text in the assistant's voice?
   - If the text leaves this conversation, does it carry its context, and do its commands and links work at the destination?
   - Does it start from the project's precedent for the genre, and will it still be true for the next reader (no pinned version, count or machine detail without a reason)?
4. **When the user pushes back:** re-verify the disputed point, then account for each point of the pushback — applied, answered, or declined with a reason. Never report a decision the user did not take, and never call a draft final before their word. Do not turn a one-off wish into a stored rule.

### Structure

- **Main file (short):** purpose, trigger, the three questions, the six mechanisms, the six checks, the pushback scenario.
- **Genre notes (reference file):** README opening, changelog, commit title, PR description, message to another team, code comment, result of a tool or agent relayed to a person, brief for an agent. Each note applies the core with a before/after pair; each note names the project precedent it starts from.
- **Examples (reference file):** before/after pairs, each labelled with how it was confirmed: explicit request, chosen option, applied revision, or merely no further objection. This run's examples are below.
- **Local settings (separate file):** conventions of one user or project — the commit format, which language a given project's artifacts use, the parity rule of one plugin. Keep them out of the general guidance; the judge's revisions moved several of them out of the principles.

### What the skill must not do

The judge marked 15 of the 30 draft principles as high risk of turning one successful solution into a mandatory template. Concretely, the skill must not:

- Prescribe README sections ("Quick start with Install / Workflow / Update", a "Goal" block, badges, a "How it works" section). The user rejected required sections in so many words when a rules file was written as laws; conventions are a starting point.
- Prescribe "always a Markdown block" or "one block per addressee". The block is for text that leaves the conversation; the split follows how the reader will move the parts.
- Prescribe "always three options with a recommendation". Options are for a real choice the reader owns; the user picked a non-recommended option for a stated reason.
- Prescribe a "why" opening for every code comment, or ban comments. A comment with a reason was still deleted when the reason was not needed; comments the user called "to the point" were kept.
- Store the user's language as a standing preference. The user refused exactly that, in the same turn in which they asked for Russian.
- Hide every id and exit code. In debugging they are the content; the rule is synthesis for the addressee, not suppression.
- Fix a PR report shape with named sections, or a fixed set of measurements per change. Detail scales with the change and the review.
- Duplicate process policy (when to wait for approval, when to commit) — that belongs to the global instructions.
- Claim the guidance works before it has been measured.

### How to measure it

Baseline from this corpus: 323 episodes from 51 dialogues in 144 sessions. Outcomes are mostly silent: the user moved on without an explicit verdict in 163 episodes and accepted explicitly in 35. So the measurable signal after adoption is not "acceptances" but the count of objections, repeat requests and re-corrections per genre and per aspect, with the same labels as this run (see *Method*). Two further signals this run makes visible: how often the same defect recurs after a rule for it was written, and how often a text is corrected twice in a row.

## Core families

The 29 principles hang on six reader-side mechanisms. They are what the main file should teach; each principle is one application.

1. **Load.** Every item and every word is something the reader carries and sorts before reaching what they came for. → P01, P08, P11, P12, P19.
2. **Trust and action.** The reader acts on sentences and checks their basis; an overreach costs a round trip and, later, "you said it was fine". → P02, P05, P06, P07.
3. **Judgement inputs.** The reader judges need, scope and options and needs the inputs: the reason, the concrete change, the before/after, the options and a recommendation. → P03, P04, P15, P16, P17.
4. **The context gap.** The reader does not hold the writer's labels, coinages, session or files. → P10, P13, P14, P20, P25, P27.
5. **Convention and durability.** Readers look where the genre and the project put things; a good example of the same genre is the yardstick, and what will be read later must still be true then. → P21, P22, P23, P24, P28, P29.
6. **Register.** Machine-like phrasing can make working text harder to read. → P09, P26.

## Principles

**Strength** counts independent dialogues supporting the principle after the stress test removed out-of-scope and thinly supported citations: strong — 4 or more with no counter-evidence, moderate — 2 to 3 (or more with counter-evidence), weak — 1. Forked sessions of one dialogue count once. **Judge** is the verdict on the draft wording (revised statements are the ones shown).

| # | Principle | Judge | Strength | Dialogues |
|---|---|---|---|---|
| P01 | Include what this reader will use; cut internals, side findings and "just in case" | keep | strong | 11 |
| P02 | Account for every point the reader raised before proposing next steps | keep | strong | 5 |
| P03 | Say why a thing exists or what it is for when the reader must accept it | keep | strong | 6 |
| P04 | Show a small concrete case for an abstract claim or feature | keep | moderate | 3 |
| P05 | Assert only as far as it was checked, and say against what | keep | strong | 9 |
| P06 | Size an evaluation ("breaking", "risk", "problem") to who is actually affected | keep | strong | 7 |
| P07 | Report the user's position only in their words; nothing is final before their word | keep | moderate | 3 |
| P08 | Fewer words per point, not fewer points | keep | strong | 9 |
| P09 | Natural phrasing for the language and genre; check that it reads easily | revise | strong | 10 |
| P10 | Prefer the term the reader already knows; introduce a new name only to tell things apart | revise | strong | 5 |
| P11 | Say what a label stands for when referring back | keep | strong | 5 |
| P12 | Say it once, unless a separately read place justifies the repeat | keep | moderate | 3 |
| P13 | Language follows the reader's current request and the project; no stored preference | revise | strong | 8 |
| P14 | A README opens with what the tool is and why the reader might need it | revise | moderate | 3 |
| P15 | A report states a visible conclusion and key results before further action | revise | moderate | 2 |
| P16 | For a real choice: workable options, consequences, a visible recommendation | revise | strong | 5 |
| P17 | For a change: what concretely changes and what it does for the reader | keep | strong | 8 |
| P18 | A table when rows and columns ease a comparison; for dense data, detail and grouping that show the conclusion | revise | moderate | 3 |
| P19 | Organise hard-to-scan text the way the genre does; structure by material, not by line count | revise | strong | 7 |
| P20 | Text that leaves the conversation is a self-contained unit in the destination's format | revise | strong | 8 |
| P21 | A code comment stays if it gives what the code cannot: purpose, constraint, reason | revise | strong | 6 |
| P22 | Start from the project's precedent and good analogues of the genre, as a default | keep | strong | 9 |
| P23 | A commit or PR title reflects the main change and its actual scope | revise | moderate | 2 |
| P24 | A PR description shows what changed, why, and the checks that matter for the conclusion | revise | moderate | 3 |
| P25 | To another team: what is observed, under which conditions, and what it prevents | revise | strong | 5 |
| P26 | A tool's or agent's result reaches a person as a synthesis, with internals as needed | revise | strong | 9 |
| P27 | Write a conclusion where its next reader will open it | keep | strong | 6 |
| P28 | Rules for future texts are direction with a reason and a scope, not required content | keep | moderate | 2 |
| P29 | Durable text pins a version, count or machine detail only where that helps the reader | revise | strong | 5 |

P30 ("cut or replace an overstatement rather than add a caveat") is a candidate, not a principle: the judge found no episode in which the user accepted such a replacement of a concrete overstatement, and named the check that would settle it. The numbering keeps the gap on purpose.

<details>
<summary>Full statements with boundaries</summary>

**P01 — Include what this reader will use (strong, 11).** Keep what this reader will use to understand, decide or act — the evidence of the work included — and cut internals, side findings and anything kept just in case, because every extra item is load the reader carries and sorts before reaching what they came for. *Boundary:* the criterion is use, not length. The same user asked for a very detailed PR for a large branch, for local measurements that showed the work done, for the full list before a deletion decision, and for a research collection to keep every item at the collecting stage.

**P02 — Account for every point (strong, 5).** When a reply or a revision follows a message with several points, account for each — answer it, apply it, or say why not — before proposing next steps, because a dropped point comes back as a repeat request and reads as disregard. *Boundary:* answering a neighbouring question is a miss of the same kind; a one-word dismissal of an item counts as accounting for it.

**P03 — Say why (strong, 6).** When a text asks the reader to accept something — a list in code, a rule, a removal, a problem statement, a step — say why it exists or what it is for, because the reader judges whether it is needed and the reason is the input to that judgement. *Boundary:* "why it exists" is not "why it broke"; for a list of found defects sent to another team the user asked for statements only. No mandatory "Why" section.

**P04 — Concrete case (moderate, 3).** When a claim or feature is abstract, show a small concrete case — a before/after snippet, a demo, a real failure — because the reader then sees what they will meet. *Boundary:* not a rule that every README needs a demo.

**P05 — Claim strength (strong, 9).** When a sentence asserts something the reader may act on — a cause, a risk, a number, a comparison, "there is no X", "this cannot be done" — assert it only as far as it was checked and say against what; otherwise mark it as a guess or give an honest range, because the reader acts on such sentences and comes back when they overreach. *Boundary:* an honest range beat a precise but unguaranteed number; plain fact corrections show the cost but carry no wording lesson beyond "say what you checked".

**P06 — Size the verdict (strong, 7).** When a text evaluates something — calls it a breaking change, a risk, a threat, a failure, an excuse — size the verdict to who is actually affected and to this reader's goal. *Boundary:* the same label was noise for a script with one consumer and required for a library with external integrators; the check is "who is affected", not "avoid strong words".

**P07 — The user's position in their words (moderate, 3).** When reporting what the user decided, wants or approved, use only what they said, and do not call a draft final before they have said so.

**P08 — Fewer words per point (strong, 9).** Use as few words as carry the point and drop filler; cut words per point, not the points the reader asked for. *Boundary:* the same user asked for more where substance was missing; a short draft that dropped the one useful fact was rejected as sharply as a long one. Not a word budget — the user rejected budgets as a mechanism.

**P09 — Natural phrasing (strong, 10; revised).** When a technical or working text is meant for a person, choose phrasing natural for their language and the genre and check that it reads easily, because a machine register and heavy constructions get in the way of even the content the reader needs. *Boundary:* observed in working correspondence, documentation, PR texts and comments; transfer to literary genres, and a causal priority of pleasantness over content, are unknown. No bans on dashes, emphasis or particular words follow. What the user called machine-like was an accumulation — weight, incidental detail, unsupported claims, empty sentences — not one feature.

**P10 — The reader's terms (strong, 5; revised).** Prefer the term the reader already knows that is exact in this context; introduce a new or internal name only where it helps tell apart things the reader needs to tell apart. *Boundary:* account for established terminology, continuity of public names, and the difference between a product's name and a part's name; a needed term can be explained; a planned thing can be named with its status. Three of the five dialogues concern one coinage in one product.

**P11 — Labels (strong, 5).** When referring back to an option, experiment, agent or step, say what it is and not only its label, because the reader does not hold the writer's labels in memory. *Boundary:* a short label is fine when it carries meaning; a model name works as a label, the role still has to be visible.

**P12 — Say it once (moderate, 3).** When the same thought would appear twice — two README sections, a rules file and a skill page — say it once where the reader needs it, unless a separately read place justifies the repeat. *Boundary:* the exception is the user's.

**P13 — Language (strong, 8; revised).** Follow the reader's current request and the language of the specific project or addressee, because the language must help this text be used; do not turn a one-off request into a standing preference without grounds. *Boundary:* Russian for a report, English for a commit title, and the user's language for example phrases in a skill were observed decisions for different tasks, not defaults. Every instance was a reaction to a concrete text; none came from the sessions about writing.

**P14 — README opening (moderate, 3; revised).** When a README introduces a tool to a new reader, make clear at the start what it is and why they might need it, before optional mechanics. *Boundary:* checked on README openings of technical tools; one sentence, a capability list or a demo all qualify; no separate goal section, fixed order or marketing tone. A bare mission line was not the target either — the user asked for something between a mission line and a walkthrough.

**P15 — Visible conclusion (moderate, 2; revised).** When a report must help judge a result or choose the next step, state a visible short conclusion and the key results before discussing further action — usually near the start — because scattered numbers leave the synthesis to the reader. *Boundary:* the order of detailed results, conditions and evidence depends on the task; one production audit does not give every report four sections; a summary paragraph after a large table is not found. Strength fell from strong to moderate when two citations left in the stress test.

**P16 — Options (strong, 5; revised).** When the reader genuinely has a choice, show the substantive workable options, their consequences and a visibly marked recommendation with its reason; use numbering and wording variants where they make the specific choice easier. *Boundary:* no forks for the sake of form; variants of a title or comment are for a wording search or on request; the number of options is not fixed; the recommendation informs the decision without making it.

**P17 — Concrete change and its effect (strong, 8).** When proposing or reporting a change, show what concretely changes — before/after, the edited text, numbers per change — and what it means for the reader, including whether they must act. *Boundary:* an effect summary does not replace the concrete change: a draft that already had an effect table was answered with "I mean the changes". The praised "here is what changes for you" shape fits "what will this do to me", not "show me the edit".

**P18 — Tables (moderate, 3; revised).** When the reader needs to compare items on the same attributes, consider a table if rows and columns ease the comparison; for dense data, choose the detail, grouping or list that fits and state the conclusion, because the table form by itself does not make material surveyable. *Boundary:* never many independent items in one cell; no mandatory table, no fixed number of rows.

**P19 — Visible structure (strong, 7; revised).** When the reader has trouble finding or comparing parts of a text, organise them in a visible way customary for the genre — paragraphs, a list, a table, highlighting — because layout helps the reader see connections and what matters. *Boundary:* the threshold "more than a few lines" is not confirmed; one combined list can beat many sections; the yardstick is a good example of the same genre (colleagues' READMEs, the previous PR), not a house style.

**P20 — Transferable text (strong, 8; revised).** When a text will be carried into another context, prepare a self-contained unit that pastes in the destination's format, because the conversation's history will not be there; split it the way the reader will move the parts; use a Markdown block when the markup must be copied. *Boundary:* the unit can be a document, one field of an RFC or a message; the number of blocks follows the transfer, not the number of addressees; commands are formatted for copying and links for opening; no fence around every answer.

**P21 — Code comments (strong, 6; revised).** Keep a comment if it gives an understanding the reader needs at this point and cannot get from the code and its surroundings — purpose, constraint, the reason for a decision — otherwise remove or rewrite it. *Boundary:* a reason is not needed next to every line and by itself does not justify a comment; no mandatory "why" opening, no ban on comments, no list of phrasings that worked once. The one-line rule "comments only for what the code can't say" was called insufficient by the user; the form that was accepted states the purpose of the construct. Support is concentrated: 16 of the 24 supporting episodes come from one comment-editing session.

**P22 — Genre convention (strong, 9).** In an established genre — conventional commit, changelog, README, license, UI label, a team's PR — start from the project's precedent and from well-regarded analogues, then fit it to this text, because readers look where the convention puts things. *Boundary:* a default, not required sections; the project's practice overrode the generic changelog grouping; badges only where they carry information.

**P23 — Titles (moderate, 2; revised).** A commit or PR title reflects the main change and its actual scope; generalise to the level that accurately covers the changes and keep essential specifics when they are the point. *Boundary:* not "every title general"; two dialogues only.

**P24 — PR description (moderate, 3; revised).** Show what changed, why, and which checks or measurements matter for the conclusion; choose the level of detail and the placement of the report by the review's task. *Boundary:* for an optimisation, comparable before/after numbers local and in CI; for other changes other evidence; a full experiment log can live in the PR comments; section names from one PR are not required; do not overwrite generated parts of the description.

**P25 — To another team (strong, 5; revised).** Select the information for their action — what is observed, under which material conditions, and what it prevents — because the recipient must understand the problem without your conversation; add causes and workarounds if they are verified and help. *Boundary:* for a short defect list, statements may suffice; for joint diagnosis, causes are appropriate; version, estimate and format depend on the addressee; a mandatory one-line context is not proven; all cases are inside one organisation.

**P26 — Results relayed to a person (strong, 9; revised).** Synthesise the conclusions and grounds the person needs in plain language, because a service protocol under the assistant's voice makes the result harder to understand; show internal details to the extent they are needed for checking or the next action. *Boundary:* in debugging an id or exit code can be the content; parity with native agents is one plugin's interface requirement; synthesis must not lose material uncertainty or evidence.

**P27 — Where the next reader looks (strong, 6).** When a conclusion, rule or decision will be needed later — by a future session, an agent, a teammate — write it into the artifact that reader opens at the moment of use: an ADR, a skill page, a repository rules file, a ticket, a PR, a numbered iteration file — not into assistant memory or the chat. *Boundary:* not every wish is meant to persist.

**P28 — Rules as direction (moderate, 2).** When turning feedback into rules for future texts, write each as direction with its reason and its scope — truth judged within the text's own world included — not as required sections or content, and do not persist a one-off wish. *Boundary:* the user named one exception, readability; direction still has to be enough to act on — a one-line rule was judged insufficient.

**P29 — Durable text (strong, 5; revised).** When a text is meant for reuse, check which details depend on the machine, a version or the current state, and pin them only where that helps the reader, because needless duplication of changeable facts goes stale and needs separate maintenance. *Boundary:* an exact version or number may be needed for compatibility or reproduction — then mark its scope or the source of the current value; do not replace everything with "latest" and do not delete working examples for being specific.

</details>

## Before/after examples

Paraphrased and anonymised. The last column records what happened after the revision; moving on is not approval.

| Principle | Before | After | Confirmed by |
|---|---|---|---|
| P01 | A status report listed, in full detail, items that needed no action from the user | Only the items that need a decision; the user had asked why they were being loaded with the rest | moved on |
| P05 | A code comment gave a precise slowdown factor; a later one pinned the CI host at a fixed CPU count | A non-precise "much slower"; a range of CPU counts — the user said the exact figure was not guaranteed | chosen option |
| P06 | A commit body called a change "breaking", minutes after the script was published to a team that was its only consumer | The label removed; the same user asked for breaking changes to be documented where external integrators existed | moved on |
| P11 | A plan referred to unexplained experiment and option labels from earlier messages | A legend added after the user said they did not remember what the labels meant | moved on |
| P14 | A plugin README opened with definitions of internal terms and a temp-directory path | An opening that says what the plugin does beside the native agents; approved with a qualified yes | approved |
| P16 | A long verdict table with the recommendation buried in a paragraph below it | Per item: the options, a marked recommendation and its reason; the user then chose the other option because they were the only consumer | explicit request, then chosen option |
| P17 | A proposal listed a series of page edits by mechanism | "Here is what changes for you", grouped by where the user would notice each change | praised |
| P21 | A comment explained why one package was left out of a list | The comment states why the list exists and what problem it solves, after the user asked what the excluded package had to do with anything | chosen option |
| P26 | A result message showed a thread id, an exit code and a receipt flag under the assistant's name | A short summary in the assistant's own words, matching how a native agent's return looks | moved on |
| P20 | A handoff depended on the current chat context | A self-contained brief for a new conversation | explicit request |

## Findings about the existing rules

The stored guidance — the always-loaded global instructions, per-project agent files and the assistant's memory notes — was audited against the episodes: 66 rules from 21 files, 58 of them about writing. By origin, 12 quote the user's words, 40 are the assistant's interpretation and 14 are of unknown origin; only 15 have a visible moment of writing in the corpus.

- **A rule in a file did not stop the reaction.** For the rules with a visible write date, later episodes show the same defect: the always-loaded "lead with the result" rule and the "comments only for what the code can't say" rule both precede later objections of exactly their kind. Whether the assistant read the file at those moments cannot be told from the corpus. Shown the comment rule, the user said it was not enough — the positive form (say what the construct is for) is what was accepted later.
- **Memory stores what the user refused to store.** Three memory notes record "reply in Russian by default"; the corpus has the user refusing to have that saved as a preference, in the same turn as the request.
- **One dialogue becomes a rule.** Several README-shape notes (a fixed Quick start layout, "no MCP in Quick start", the shape of one PR description) rest on one dialogue each, and one note records that the assistant itself added a section the user later called an extra.
- **Some rules have no episode at all** — an em-dash ban, an evidence-level scheme, a "language tips" section. They may still be right; the corpus does not support them.

<details>
<summary>Method</summary>

1. **Corpus.** 144 sessions in five projects with at least one human message, after excluding scripted test runs and the current session; 125 independent dialogues; 1,745 unique user messages (278 of them recovered from the queue of messages sent mid-turn), the assistant's visible replies and the text it wrote through tools. Split into 187 parts and 792 pages. A separate script recounted human messages per session file: 0 mismatches over 144 sessions.
2. **Split review.** A judge model reviewed the decomposition before the run: 24 findings, dispositions recorded.
3. **Pilot against a reference.** On the hold-out parts (reference: 21 high-confidence episodes), the extraction model at medium effort found 21 of 21 with 4 extras out of 34; at high effort 21 of 21 with 1 extra out of 31. High effort was used.
4. **Extraction.** Two passes per part — explicit objections, and other signals (rewrites, form instructions, repeat requests, approvals, praise): 374 agent runs; 1,584 of 1,584 page reads verified whole from the agents' own logs. 499 raw episodes.
5. **Merge and quote verification.** 323 episodes from 51 dialogues; 74 found by both passes and counted once; 40 carry a quote that could not be verified and are excluded from support. Outcomes: the user moved on in 163, accepted explicitly in 35.
6. **Two independent analyses.** Bottom-up from the episodes only: 31 candidates. Top-down: five readers read all 1,745 user messages whole (94 of 94 pages verified) and found 16 reactions the extraction had missed, plus 12 from a keyword search (20 distinct messages); and the stored rules were audited (66 rules, 58 about writing). One earlier top-down agent claimed a full read; its log showed 419 of 1,745 messages, so its result was kept only as a keyword search.
7. **Draft.** 30 principles (21 strong, 9 moderate) on 215 supporting episodes, with the reflective sessions — the three in which writing itself was the topic — reported separately for every principle.
8. **Stress test.** 313 principle × episode pairs: 280 support, 5 contradict, 17 out of scope, 11 insufficient (307 of 313 quotes exact). A counterexample search over all 187 parts: 172 findings — 151 new supports (91 of them repeating messages already counted), 18 narrowing the scope, 3 contradictions (162 of 172 quotes exact). Out-of-scope and insufficient citations were removed from the support lists and strengths recounted.
9. **Judge.** Keep 14, revise 15, merge 0, drop 0, unknown 1; high template risk on 15; 29 of 29 decisive quotes verified verbatim. Of the 5 pair contradictions the judge ruled 4 false and 1 a scope boundary; of the 3 from the counterexample search, 2 false and 1 a scope boundary.
10. **Comparison with the first run** by an independent agent, principle by principle, with the strength on both corpora combined.

</details>

## Replication vs the first run (#20)

Statuses and combined strengths are from the independent comparison. "Here" is the number of independent dialogues in this corpus that support the matched principle(s).

| First run | Principle (short) | First-run strength | Status here | Here (dialogues) | Combined |
|---|---|---|---|---|---|
| P1 | Language by addressee and place | strong | confirmed | 6 | strong |
| P2 | Self-contained current version for a decision | strong | partly | 3 | moderate |
| P3 | Visible answer to a direct question | weak | partly | 3 | weak |
| P4 | Pushback: re-verify, say what changed | strong | partly | 3 | moderate |
| P5 | Claim strength equals verification | strong | confirmed | 7 | strong |
| P6 | Provenance | moderate | partly | 3 | moderate |
| P7 | Start with what is missing | strong | partly | 4 | moderate |
| P8 | Concrete explanation | strong | confirmed | 3 | strong |
| P9 | Depth by the reader's task | strong | partly | 5 | moderate |
| P10 | Every mention serves the question | strong | confirmed | 8 | strong |
| P11 | Requested form, literally | strong | partly | 4 | moderate |
| P12 | Options with a recommendation | strong | confirmed | 4 | strong |
| P13 | Titles at the reader's level | strong | partly | 3 | moderate |
| P14 | Reader's numbering, names and links | strong | partly | 4 | moderate |
| P15 | Transferable text | strong | confirmed | 4 | strong |
| P16 | Container level | moderate | confirmed | 3 | moderate |
| P18 | Commit message | strong | confirmed | 5 | strong |
| P19 | PR description | strong | confirmed | 4 | strong |
| P20 | Before/after comparison | moderate | partly | 4 | moderate |
| P22 | AI-prepared review remarks | moderate | not found | 0 | weak |
| P24 | State-dependent UI messages | weak | not found | 0 | weak |
| P25 | UI text | moderate | partly | 4 | weak |
| P26 | Briefs for agents | moderate | partly | 3 | moderate |

**What "partly" means.** The same advice with a different reason, genre or boundary: for example, the first run's "self-contained version sized to the decision" is confirmed here for text carried to a clean context and for a summary before the next decision, but its three-level sizing was not observed; the first run's "depth by the reader's task" is confirmed as selection, a visible conclusion and readable structure, but not the "next layer in a collapsed block" device. No principle of the first run was contradicted; the two not found (a disclaimer on AI-prepared review remarks; UI messages true in every state) have no episode here, which does not refute them.

**New here (15).** Dialogues after the stress test: account for every point raised (P02, 5); say why the thing exists (P03, 6); size the verdict to who is affected (P06, 7); fewer words per point (P08, 9); natural phrasing (P09, 10); the README opening (P14, 3); tables vs dense data (P18, 3); visible structure (P19, 7); code comments (P21, 6); genre convention as a default (P22, 9); measured effect in a PR (P24, 3); messages to another team (P25, 5); tool and agent results relayed to a person (P26, 9); the conclusion where its next reader looks (P27, 6); durable text and drifting facts (P29, 5). Several new principles concern genres or handoffs treated less directly in the first run: READMEs and changelogs, code comments, and the relaying of agent results.

**How the runs differed in method.** First run: 61 sessions and 616 user messages over 30 days, 115 episodes, 23 principles. This run: 144 sessions in five projects, 1,745 user messages including the 278 sent mid-turn (the first run's method does not mention them), 323 episodes; every page read was verified from the agents' own logs rather than assumed; a pilot against a reference fixed the effort level before extraction; two independent analyses instead of one; a stress test with a per-citation check and a full counterexample search; a judge with a template-risk verdict per principle; and an independent comparison with the first run. The first run's five-check list survives as the six checks above; its four families became six mechanisms because two of them (judgement inputs; register) carried enough evidence here to stand on their own.

## Limitations

- One user across five projects. The principles describe this user's reactions; whether the skill helps is unknown until measured.
- **Five dialogues hold 148 of the 323 episodes,** and three of those five dialogues concern writing itself. Every principle reports how many of its dialogues contain a reaction to a concrete text; two principles (P14, P28) rest mostly on the writing-topic sessions, and the candidate P30 entirely.
- **Outcomes are mostly without an explicit verdict:** the user moved on in 163 episodes and accepted explicitly in 35. "Moved on" is reported, not read as approval.
- The Claude agents in this pipeline (reference marker, bottom-up analyst, drafter) started with the user's global instructions and memory index loaded by the harness; the Codex agents (readers, stress test, judge, comparison) did not. The bottom-up analyst and drafter report not opening those files and trace every principle to episode ids; the exposure is still a bias the Codex-side checks were meant to catch.
- 40 episodes with an unverified quote were excluded; in the ones checked by hand it was the draft's quote, not the user's, that failed. The final principles note that admitting two excluded P14 episodes would make P14 strong; its reported strength remains moderate.
- For P21, 16 of 24 supporting episodes come from one session; P25 (messages to another team) is one organisation; P26 (results relayed to a person) is mostly one plugin.
- P30 is a candidate: the judge named the missing check — a concrete text where an overstatement was fixed once by a caveat and once by a cut or a link, with the user's reaction to each.
