# Opus K2 — completeness check on wave 4

Read only. Repo untouched. Everything below is reproducible from the commands in each section.

## 1a. Quote sample — 30 rows, 10 per survey, spread over pages

Method: parsed every row of the three surveys into (id, page, quote); stratified round-robin across each
survey's pages; `grep -n -F -- "<first six words>" <saved page>`. Scripts: `parse.py`, `sample.py`.
Result JSON: `sample30.json`.

| survey | pages covered | found | not found |
|---|---|---:|---:|
| S1 | main, build-skills, skills-and-plugins, prompting, agents-md, prompt-engineering, tools-skills (7/7) | 9 | 1 |
| S2 | overview, best-practices, fable-5, fable-5-1, opus-4-8, sonnet-5 (6/7 — develop-tests.md has no rows) | 10 | 0 |
| S3 | SKILL.md, SKILL-MECHANICS.md (2/2) | 10 | 0 |

**29/30 literal, 30/30 substantive.** The single miss is S1-1: the survey table renders `you've` with a
straight apostrophe; `main.txt:719` has U+2019. Every word matches.

## 1b. Five of the mapper's 45 normalised quotes, by eye

Script `norm5.py` re-extracts the ledger quote, sed-opens the cited source range, and diffs word lists.

| id | class | word changed? | note |
|---|---|---|---|
| S1-23 | typographic | no | contiguous in `build-skills.txt:686`; every word present in order |
| S1-45 | typographic | no | byte-identical to `prompt-engineering.txt:820` after quote folding |
| S2-10 | truncation | no | source continues `(documents inside <documents>...)`; quote stops early |
| S2-43 | typographic | no | source is a heading without a final stop; the survey added one |
| S2-15 | **splice** | no | `best-practices.md:328` prose + `:331` inside a fenced block, with ` ```text Sample prompt wrap ` between them, welded into one sentence |

Four of five are typographic or a clean early stop. **S2-15 is not typographic**: it joins a prose
sentence to a code-block line across an intervening fence marker. No word is altered, and the mapper
disclosed it ("S2-15 spans prose and a fenced example"), but the class is structural, not punctuation.

## 2. Recount of the mapper's own tables — `recount.py`

| quantity | mapper's stated figure | my recount | match |
|---|---|---|---|
| rows in | 173 (S1 59, S2 46, S3 68) | 173 (59/46/68) | yes |
| row-to-claim memberships | 182 | 182 | yes |
| unique rows placed | 173, 0 unplaced | 173 | yes |
| claims out | 85 | 85 in merge table, 85 in full mapping, same ID set | yes |
| target verdicts | 255 | 255, 0 unparsable cells | yes |
| A present/partial/conditional/not located/unknown/contradicts | 8/20/3/2/51/1 | 8/20/3/2/51/1 = 85 | yes |
| B | 21/21/32/4/6/1 | 21/21/32/4/6/1 = 85 | yes |
| C | 16/21/27/9/12/0 | 16/21/27/9/12/0 = 85 | yes |
| candidates | 12 (first 10 = shortlist) | 12 | yes |
| do-not-adopt | 17 | 17 | yes |
| gaps | 5 | 5 | yes |
| raw / normalised quote matches | 128 / 45 | 128 / 45 | yes |

Extra check not asked for: **all 102 pinned citation-ledger quotes reproduce byte-for-byte** from
`git show 21a225b:<path> | sed -n 'lo,hip'` (`ledger.py`, 0 mismatches).

The mapper's numbers are exact. The **coordinator's** numbers are where the divergence is — section 4c.

## 3. Fifteen target lines at `21a225b`

| # | claim / line | verdict says | line says it? |
|---|---|---|---|
| C1 | C45 · D:296-300 | not located; TASK leads, no data-first/query-last rule | yes |
| C2 | C63 · O:148 | conditional; evidence needs counts, no per-claim session linkage | yes |
| C3 | C60 · O:143-144 | conditional; brief names whole scope, no change-scope rule | yes |
| C4 | C06 · R:80-90 | partial; setup inline, resumed runs reuse the four files | yes (R:89 "On a resumed run reuse all four") |
| C5 | C07 · T:23 | not located; bare method pointer, no trigger or escalation | yes |
| C6 | C12 · T:45-47 | partial; terminology step has no completion check | yes |
| C7 | C73 · W:15-16 | partial; "defines at first need **and protects decision warnings**", no co-location | **part only** — W:15-16 is the first-need rule; the decision-warning safeguard is W:21-23 (a different anchor, `quote-safeguard`) |
| C8 | C25 · D:296-300 | not located; TASK/CHECK/RETURN asks no intent | yes |
| C9 | C24 · O:119 | partial; checks paths and quotes, no per-source purpose | yes |
| C10 | C02 · R:49-50 | (candidate) fixed-copy instruction to sit an ablation note beside | yes — but the C02/B **verdict** was rendered against A:90, not R:49 |
| D1 | C11 · R:96-103, O:124, I:12 | checks before critics; independent completeness critic; recorded regressions | yes, all three (I:12 gives 1,2,1,0,6,5,10 = 25) |
| D2 | C77 · W:21-23, R:167-170, A:139-143 | repetition at independent decisions is not redundancy | yes, all three |
| D3 | C14 · R:146-150, D:318-324, D:201 | user consent; rights visible in the approval; bounded rights | yes — D:323-324 "Rights are the one thing that must survive the translation … that is what the user is being asked to approve" |
| D4 | C78 · A:85-88, S:277-279, W:21-23 | readers restricted to markdown; version facts came back | yes, all three |
| D5 | C79 · D:296-300, R:115-118 | observable ground truth and a counted regression, not stronger words | yes |

**15 of 15 verdict values hold.** Two citation defects that do not change a verdict:
- **C7 (C73 at W:15)**: half the stated justification is not at the cited line.
- **C10 (C02)**: the candidate table points the owner at `rewrite/SKILL.md:49`; the verdict that graded
  C02 for target B was written against `audit/SKILL.md:90`. Different file, same alias family. The line
  the owner would open was never the line a verdict was rendered against.

## 4a. What the sources say that the 85 claims do not carry

1. **The evaluation guide.** `develop-tests.md`, 3,326 lines, fetched and hashed, is cited by **zero**
   survey rows and therefore by zero of the 85 claims. S2's drift table says "detailed row extraction
   incomplete"; the mapper honours that by declining to call eval material absent. It is the one vendor
   document that bears on gap 1 and gap 5 — the owner's measurement problem — and nobody read it.
2. **`agents.md`.** The only `<a href>` in the OpenAI post's article body. S1 declined it as off-domain;
   no other agent picked it up. 0 rows, 0 claims. Nothing in the wave names it as an outstanding fetch.
3. **Thirteen Anthropic rows that exist as ID gaps and nowhere else.** S2 IDs skip 8, 14, 27, 30, 41, 42,
   44, 47, 52-56. `s2-anthropic-prompting.md` never uses the words "drop" or "unverifiable" — the only
   disclosure is the coordinator's `rounds.md` ("14 draft rows dropped as unverifiable"), and the count
   there is 14 against 13 gaps. What was dropped is named nowhere.
4. **S2's own drift table cites rows its Rows table does not contain** — S2-27 and S2-56 among them. The
   "unchanged since A10" verdict, which the README repeats, rests partly on rows that did not survive.

## 4b. What the targets need that no source addresses and no gap names

1. **The natural language the document is written in.** `grep -i -w language` over all 17 saved sources:
   every hit is wording/style, "programming language", or "large language model". None addresses writing
   for a reader whose language differs from the document's. The targets already carry a *measured* rule
   for it — `codex/SKILL.md:303-304`, "Write `TASK:` in the user's language … (measured 2026-09-17: a task
   written in English about a Russian «хай» came back in English)" — and the owner asks in Russian. Not in
   the 85 claims, not in the 5 gaps.
2. **Writing that must survive a hard clip.** `grep -i "truncat|clipped|cut off"` over all 17 sources:
   **zero hits**. The targets are built around exactly this: `orchestrate/SKILL.md:143` ("`BRIEF:` would
   clip the answer at 20 lines"), `:148` ("result: at most 30 lines"). No source says how to write so that
   the first N lines still carry the contract; no gap names the omission.

## 4c. Coordinator's README and rounds rows — claims the artifacts do not support

| claim | artifact | verdict |
|---|---|---|
| "59 + 46 + 68 = 173 rows, 173 of 173 grep-validated" | surveys | holds |
| "the 3,326-line evaluation guide it links was fetched and not decomposed" | `wc -l` = 3326 | exact |
| "`writing-for-agents` reports no measurement anywhere: 39 argued, 29 asserted" | S3 evidence column | exact, 68 total, 0 measured |
| "the first live run of the 16-step method M1 extracted" | M1:404-475, items 1..16 | holds |
| "four of them now redirect to learn.chatgpt.com" | S1 headers | holds |
| "the 25 recorded regressions" | I:12, 1+2+1+0+6+5+10 | holds |
| "Fetched pages stay out of the repository" | `find` | holds |
| **"the same practices in the same words"** (Anthropic unchanged since A10) | S2 drift row 2: "same words **except** templates/generator/improver not stated as current guide practices" | **overstated** — the survey records an exception the README drops |
| **the three per-target verdict enumerations** | A 51+20+8+1 = 80; B 21+21+32+4+1 = 79; C 16+21+27+9 = 73 | **none sums to 85**; A silently drops 3 conditional + 2 not located, B drops 6 unknown, C drops 12 unknown. An owner adding them up cannot reach 255. |
| **"45 … matched only after typographic normalisation (quotes, dashes, terminal punctuation)"** | mapper names two further classes: quotes that "end just before a source continuation" (S2-10/40/50) and one that "spans prose and a fenced example" (S2-15) | **narrowed** — the README reduces five disclosed classes to three typographic ones |
| **"Candidates … :"** six listed | the shortlist is ten (12 with the two lower-priority) | four of the ten requested candidates (C12, C25, C24, C02) are invisible in the README |
| **"Do not adopt, with counters:"** five listed | the list is 17 | 12 rejections invisible, including the 3-5-example quota, Astra-as-auditor, prose-lint, and the prefill/thinking/image group |
| **"Gaps: … none speaks of the no-document baseline, control questions or a score ceiling"** | `grep` on `develop-tests.md`: "no-document"/"control question"/"ceiling" = 0 hits, "baseline" = 3 (all "baseline model"/"baseline set") | claim survives the grep, but it is **asserted over a 3,326-line page nobody decomposed**; the mapper's gap 5 carries the hedge ("therefore not called absent") and the README drops it |
| rounds row 19: Opus K2 **produced `k2-completeness.md`** | `ls` — no such file; my brief forbids writing in the repo | **forward-declared as a record**; the file does not exist |
| rounds costs (193k tokens/15 min; 14 commands/5.5 min; 94k/7 min; 33 commands/24 min) | no artifact carries a token or wall-clock figure | **unverifiable from the artifacts** — coordinator-side only |
| rounds row 16: "14 draft rows dropped as unverifiable" | S2 never mentions a drop; 13 ID gaps | **unsupported by the artifact**, and off by one against the only trace |

## 5. The owner's question — does this apply to text in general?

The wave has a column for it and the column says no.

- The mapper's **transfer column** (last column of the full mapping table, 85 entries) grades every claim
  `plausible`, `stated` or `unknown`. It is an argument about whether transfer is credible, not a
  measurement of it. The mapper says so in the candidates preamble: "**Human transfer remains unmeasured
  until people are tested.**"
- **Gap 1, "Human transfer evidence"**: "the sources offer model-performance advice and a colleague-
  comprehension heuristic, but no demonstrated improvement in people performing these documentation tasks."
- The record the mapper read first, `plugins/terse/README.md:64,81` and `research/README.md:10`, already
  says the local ruler measures model answerability, not human improvement, at p = 0.25 with no
  no-document arm.
- The README's own closing line concedes it: "what it did not produce is any measurement that a candidate
  improves a document, which is phase 3 and has still never run."

So: **answered in the negative, and located.** The owner can conclude that two vendors' advice about
briefing a model has been mapped onto his texts with a verdict per claim per target, that 51 of 85 claims
have no counterpart in his human-facing writing rules at all, and that **nothing in the wave is evidence
the advice transfers to text in general.** The transfer column is a set of hypotheses; gap 1 is the honest
label on them.

## Scripts and outputs in this directory

`parse.py`, `rows.json`, `sample.py`, `sample30.json`, `norm5.py`, `recount.py`, `ledger.py`,
`ledger.json`, `targets.sh`, `t2.sh`, `show15.py`.
