# What broke — the audit's section with the adversarial critic's findings and the protected passages

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

- CONFIRMED, README.md:42-49 (adds to C18/C19): the advertised install commands fetch the marketplace's `main`, which at 8c041b7 ships terse 0.1.1 with the old `rewrite` page that wrote into the repository unasked; the README on this branch describes the branch. A sentence about what the reader gets is true only of what is released; the rewrite states the plugin as it is on this branch and the release makes it true, or says which version it describes.
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
