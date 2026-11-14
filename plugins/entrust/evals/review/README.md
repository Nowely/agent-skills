# Review skill: the measuring instrument

This instrument prepares comparisons of [the review skill](../../plugin/skills/review/SKILL.md).
The preparation scripts supply a neutral request and a complete skill directory separately; they do not
activate the skill or establish that a host delivered it. Follow the [protocol](protocol.md) and record
the remaining steps manually. `score.mjs`, `judge.md`, `blocks.mjs` and the outcome workflow below are
legacy tools, not a complete assessment under the new protocol. In particular, the scorer cannot represent
unknown rulings. Do not use them to claim a compliant new-protocol analysis.

Past runs retain their original methods and results. To reproduce legacy preparation, use the historical
commit of the instrument used by the study. `node evals/review-eval.test.mjs` checks the instrument and
calls no model.

## Cases

Each directory under `cases/` is a small fictional repository with the task its author was given, `brief.md`, in three states: `base/` before the change, `head/` the change as first written, and `clean/` an alternative change. `accept.mjs` checks observable requirements: all checks pass on `clean/`, and `head/` fails exactly those listed in `rubric.json`. A behavior-correct `head/` can have no failing checks and still be difficult to understand. `round.mjs` always prepares both variants; the protocol does not require both. A single-variant or real case needs different preparation. The historical [draft23/25 round](../../research/2026-11-13-review-instead/protocol.md) used only the original private flawed snapshot. Neither the `clean/` label nor passing checks proves that no finding is possible or that its design is the only good one.

| Case | `head/` | `clean/` |
|---|---|---|
| `contact-import` | one hundred-line function that parses, validates, resolves duplicates, writes and reports, re-implementing a parser and a validator the repository has, with an unused mode, a retry and a silent special case | a plan decided before anything is written, in three short functions over the existing parser and validator |
| `contact-import-v2` | the same import with a clarified input contract and separate criteria for design diagnosis and the proposed target | a planning alternative; retaining or merging it must be judged on its consequences, not the function name |
| `booking-edit` | a behavior-correct preview whose priority is hidden by flag overwrites, with duplicated pricing and a per-call one-entry cache | the same decisions expressed in order, using the existing pricing utility; a single cohesive function is acceptable |
| `overdue-notice` | a notification framework of nine files for one email, whose indirection hides that the email has no content and is sent every night | one step function of twenty lines, called as the job's other step is |
| `currency-contract` | a fallback and a whitelist in two screens for a currency the installed dependency never omits, read off a stale page; the export forgotten | one conversion where the only lower-case source, the archive, is read |
| `profile-phone` | phone rules written into the creation of a profile, with a catch and a stripping of separators that the installed library makes needless and a stale page calls for, a crash on what that library returns for no number, the edit path untouched, one fact in three stored fields | one check that creation and edit both call, written to the contract of the installed version, with the library's lower-case country patched where it is read and marked |
| `slot-edit` | an editor of a delivery slot whose five rules share one variable and win by overwriting it, behind a lookup of what the order already carries, with a cache, a retry and loading state for that lookup, a timer nobody stops, and an author's note that follows a stale page; the rules are skipped when the lookup fails | the rules in the order they win in one function, on the zone the order carries, checked again each minute the way the project's pickup form does it. The timer is needed: the installed form library does not validate on submit |
| `locale-options` | four old labels capture the import-time locale while two added getters use the read-time locale; tests check only the new translated labels | all fresh public label reads use the current locale while saved historical selections retain their creation-time text |

A rubric item is a `find`, with the direction it belongs to (behavior, necessity, design, tests), or a `trap`: a claim a reviewer is tempted to make and the code contradicts. `head` has both; `clean` has only traps, and there the count of unsupported claims is the result.

A case may carry `probes` in its rubric: changes someone will be asked to make after this one, each a local edit in the clean form and not in the first-written one. They are what the outcome's judge rules on.

## A round

1. **Plan and prepare.** Before a confirmatory round, follow the protocol's requirements for the question,
   cases, materials, outcomes, budget and stopping rule. Manually record every assigned attempt before
   preparation, including its arm. From `plugins/entrust`, run
   `node evals/review/round.mjs <directory> [--cases a,b] control name=<skill-directory> ...`.
   Each skill directory must contain `SKILL.md`; the whole directory, including `references/` and `scripts/`,
   is copied. The control gets no skill package. Each case and variant is prepared once per arm in shuffled
   order. The `review-neutral-2` manifest version identifies preparation, not confirmed activation.
   Arm names must be unique. Before writing, the command hashes each package and refuses legacy,
   unknown, empty or mixed manifests, an existing arm whose package digest or control state differs, and
   any existing prompt at a new run's path. Without a manifest, an existing `returns/` must be empty.
   In that case, the command also refuses root entries named `verdicts.json`, `blocks.json`, `implement.json`,
   `outcome.json` or `outcome-verdicts.json`, and directories or symbolic links named `work`, `implement`
   or `patches`. With a manifest, it refuses any file or directory in `returns/` named for a new run ID
   exactly or followed by a dot and suffix. Both checks compare names case-insensitively on every platform,
   conservatively refusing case variants even on a case-sensitive filesystem; they do not delete anything.
   A prewritten `protocol.md` is allowed. Existing verdicts and other assessments are not inspected for
   references to future run IDs: the operator must keep and check assessments against their assignments
   and must not carry them over to new attempts. Prompts are created exclusively, never overwritten.
   Each copy is checked against its preflight digest; a change during preparation stops the command. The
   manifest is written after preparation: if preparation fails or is interrupted, earlier prompts or temporary
   runs may remain without a recorded ID-to-arm mapping. Never dispatch orphan prompts not listed in a
   completed manifest. Record the preparation as a batch failure, retain the manual assignment list and
   remaining files, and prepare any repeat in a new directory under the predeclared retry rule. Do not run
   preparations or add outputs concurrently in the same directory: the instrument has no lock and these
   checks do not provide isolation. Each preparation rereads the case source and brief; the instrument
   neither freezes them nor checks that paired copies match.
   Freeze their identities separately and verify the prepared task and diff for every arm before dispatch.
2. **Deliver.** Each `runs.json` entry records the prepared `cwd`, the copied `skill` path and its `sha256`,
   or `null` for control. Give `prompts/<run>.txt` unchanged to the reviewer with that cwd. The prompt is
   byte-identical across arms; it uses `.`, `../brief.md` and `HEAD~1..HEAD`. The recorded `cwd` is the
   prepared repository root, so ordinary project-context discovery can start there. This does not establish
   what any host actually loads: observe and record the host's project context where possible. The host must
   permit reading `../brief.md` on equal terms for every arm; otherwise the task is not equivalently supplied.
   Configure and activate the assigned skill separately through the host, not by modifying that prompt.
   `cwd` and package paths point to temporary prepared runs and must remain available to the host. The
   copied package is placed in a directory named `skill`; this does not register it or preserve a
   host-specific skill ID. The operator must install or register it under the intended ID using the host's procedure and
   verify the source, ID and package digest in the host before delivery. The registered package path may
   differ from the prepared copy.

   To check either package, set `SKILL_DIR` to its directory and, from `plugins/entrust`, run:

   ```sh
   node --input-type=module -e 'import { packageDigest } from "./evals/review/prepare.mjs"; console.log(packageDigest(process.argv[1]));' "$SKILL_DIR"
   ```

   Compare the output with the same entry's `skill.sha256` in `runs.json`: check the prepared copy and
   repeat the check on the registered package after each manual copy or build and immediately before
   activation. If the digest differs or a check fails, record a deviation and do not activate that package
   as the assigned one. If the host's source or ID mapping cannot be verified, record it as unknown and
   stop to agree on a next step. A digest match is not evidence of activation or delivery and does not
   establish that the package remained unchanged afterward.
3. **Record.** Manually preserve all assignments and attempts, statuses, refusals, interruptions, retries,
   deviations and exclusions with reasons. Record the actual message and order, requested and observed host,
   model, effort, ordinary instructions, tools and permissions, and accessible traces. Separately record
   package availability, activation request, observed activation, delivery and files actually read, with
   evidence or `unknown`. A copied package, digest, activation request or success response alone does not
   prove delivery. Do not claim that control cannot access other skills or that host contexts are identical.
   If required delivery or its observation cannot be established, record the uncertainty and stop to agree
   on a next step as the protocol requires.
4. **Assess manually.** Apply the protocol's same rule for final messages and accessible linked artifacts to
   every arm, record inaccessible links, and preserve original source-grounded judgments and disagreements.
   Keep unknowns separate from success and failure; report incomplete attempts, quality, harm and available
   cost and time separately. Do not use the binary `score.mjs`, legacy `judge.md` or `blocks.mjs` as the
   full new-protocol assessment.

For a single run use `node evals/review/prepare.mjs <case> <head|clean> [skill-directory]`; it prints the
cwd, optional copied package and digest, and the request. The digest is SHA-256 over relative file paths
and file bytes, with byte lengths delimiting each path and content. The traversal is depth-first, sorting
the entries of each directory by JavaScript's default string order. It includes `SKILL.md` metadata as
bytes, but not filesystem metadata or empty directories. In particular, file mode and executable
permissions are not identified by the digest and may affect execution; check and record them separately
when relevant. Symbolic links and non-file entries in the package are rejected rather than followed.
The digest identifies the copied package's paths and bytes, not host delivery.
References outside the supplied directory, such as `../orchestrate`, are not copied or frozen. The operator
must identify and separately provide and record any relevant external dependencies; do not assume they
are available or freeze the neighboring environment automatically.

## The outcome (legacy)

What a review says is not what it is for. The second stage measures the code that is left when someone acts on it.

1. **Implementers.** `node evals/review/implement.mjs <directory>` gives every reviewed run a fresh repository with the change, the task and that review, and a prompt, `implement/<id>.txt`. Every case and variant also gets implementers with no review, the arm `task-only`, and a case with probes gets its two anchors. Hand each prompt, unchanged, to a fresh implementer with the same model, effort and tools in every arm; it works in `work/<id>/repo`.
2. **Judge.** For each case with probes, give one judge [judge-outcome.md](judge-outcome.md), the case's `brief.md`, its probes, and every `work/<id>/repo` of that case's `head` implementations and anchors, named by id only. Collect its objects as `<directory>/outcome-verdicts.json`. The judge does not know that two of the directories are the case's own forms. If it does not rule the clean one more local than the first-written one, the case is disputed: its results count for no arm, and its rulings stay in the record. Read the judge's reasons before deciding whether the probe is weak or the judge missed the difference; do not drop a judge for disagreeing with the case's author.
3. **Measure.** `node evals/review/outcome.mjs <directory>` runs each case's acceptance checks and the repository's own tests on every result, saves what each implementer changed as `patches/<id>.patch`, and prints the table.

The table keeps three things apart: the acceptance checks, the probes, and the repository's own tests.

- **Outcome.** On `head` rows a run is `recovered` only when every acceptance check passes and a judge ruled every probe local: the task is done and the code takes the next change in one place. A run that passes the checks is `not assessed` while nobody has ruled on its probes, `disputed` where the judge's anchors are, and `checks only` in a case that has no probes; none of these counts as recovered. On `clean` rows a run is `kept` or `broken` by the checks. The recovered runs per arm are the result, and the three arms are read together: a review is worth what its implementer recovers beyond `task-only`, and the instructions under test are worth what their reviews recover beyond the control's.
- **Checks passed.** Every acceptance check runs in a process of its own and ends as passed, failed or unfinished: a check whose implementation never returns is `unfinished`, shown beside the count, and the other checks keep their results. `outcome.json` names the failed and the unfinished ones.
- **Own tests.** `passed`, `failed`, `unfinished` or `none`, with the exit status in `outcome.json`. They are not part of the outcome's word: read them beside it, and do not call a recovered run with failing or unfinished tests a finished solution.
- **Lines changed.** Code and tests apart. On a `clean` row they measure how far a review moved an implementer, not harm: a useful test or a true finding also changes lines. Harm is read from the patch: a regression, a mechanism nothing needs, or a rewrite with no shown gain. Use the count to find the patches worth reading, not as a gate.
- **Code against the clean form.** The lines of code the result adds to the code before the change, over the same count for the clean form. It is a size, not a grade: a result may be smaller than the clean form by leaving a requirement out.

## The record's own lines (legacy)

A review written with the skill saves its record, `review.json`, in which every changed line belongs to a block with a verdict. Save it as `returns/<run>.json`, and `node evals/review/blocks.mjs <directory>` holds those verdicts against the lines the case knows: `lines.remove` in a rubric's `head` are lines no solution of the task keeps, `lines.keep` lines every solution needs. The table follows a removal link by link. `already` in the rubric names mechanisms that something existing makes needless, by words a record would use: the table gives in how many the record lists the mechanism among those the change brought, and in how many its `instead` or `basis` names what was already there. Then the lines: the superfluous ones the review marks `remove`, those it leaves in a block marked `fix`, those in no block, the needed lines it marks `remove`, and the other lines of code it marks `remove`, which show a record that removes everything. On a clean form, any line of code marked `remove`.

No judge takes part, so the count repeats exactly and costs nothing. It is narrower than the judge's ruling: it shows which lines the record marks and which words it contains, not whether the reviewer understood the redundancy or gave a sound reason. A review with no record, as a control's, has no measured counters. The two mechanism columns match words. They can overcount (a name in a denial or an irrelevant sentence) and undercount (different terminology or language); they are not a lower bound or evidence that the alternative was understood. Read both matched and unmatched records. Line dispositions describe proposed removals, not architectural quality; judge behavior preservation and the target separately. `slot-edit` and `profile-phone` list their lines.

## Admitting a case

The following selection rule describes the legacy instrument. Do not use control outcomes to exclude or
reclassify cases in the primary analysis of a new comparison; apply the selection rules in the
[new protocol](protocol.md).

A case on which the unaided arms already recover measures nothing: `booking-edit` was found whole by reviewers with no instructions, and an implementer given the task alone wrote the same code as one given the skill's review ([the calibration](../../research/2026-11-11-review-skill/terra-design-calibration/README.md)). Before a case counts, run `control` and `task-only` on it three times. If they recover more than half of those runs, the case is a regression case: it stays in the round to show that nothing is lost, and its rows are reported apart from the result. Three runs decide where further measuring is worth its cost; they are no evidence of what the skill does. For a comparison of arms, run five reviews per arm on each admitted first-written form and three on each clean one: the count of lines costs nothing per review, so the reviews are the whole price, and implementers can follow for three of the five. Give the probes to two judges that do not see each other's rulings. Preserve their original files separately. `outcome.mjs` accepts one judge file at a time: use a working copy at `outcome-verdicts.json`, save each judge's outcome JSON/table before evaluating the next, then intersect successful run IDs. Never concatenate the judgments or overwrite their originals. Missing, disputed and unassessed results stay visible; the coordinator records disagreements with both reasons. The [scoped protocol](../../research/2026-11-13-review-instead/protocol.md#independent-judgments-and-aggregation) defines the private static round's separate evidence assessment. `slot-edit` and `profile-phone` were run once as a pilot, which found their tasks and probes ambiguous ([round 4](https://github.com/Nowely/agent-skills/pull/95#issuecomment-6834922569)); the corrected cases have not been run, and whether a judge rules their clean forms more local than their first-written ones is still to be seen.

## Reading the table (legacy)

On `head` rows, recall is hits plus half the partials over the find items; it measures the listed rubric items, not overall review or solution quality. On `clean` rows, traps and unsupported claims reveal some unnecessary recommendations, but a real new finding must still be judged on evidence. Neither count is folded into recall. `Other valid` counts supported findings the rubric did not list; a case that collects many needs its rubric extended, which starts a new round.

One run per cell shows that the instrument works and little about which arm is better: the same instructions gave different outcomes in consecutive rounds of [the first experiment](../../research/2026-11-11-review-skill/rounds.md). A difference between arms is a result when it holds across cases and repetitions; say how many of each a round ran.

## What it cannot show

The cases are a few hundred lines of JavaScript each and can be read whole, `slot-edit`, the largest, included. They do not show how a review behaves on a change too large to read whole or in another language. The instructions under test and most cases have one author, and the traps are the temptations that author thought of. The probes are rulings of a judge on code, checked only against the two anchors; an implementer is one more model run, with its own variance, between a review and its result.


## Locale-options preparation status

`locale-options` is a newly written fictional case inspired by a partial change to a related value group. Its
brief defines data-read behavior, not UI reactivity. The reference uses getters, but acceptance checks use only
public functions and also pass on an alternative with no getters. Two acceptance failures in `head` represent
one root consistency defect; the rubric does not reward duplicate findings for each entry or consumer.

The case has been checked mechanically and run in the [round-8 diagnostic](../../research/2026-11-13-review-instead/round-8/README.md):
two Terra reviews each for full draft25 and draft28, independently judged by Carbon and GLM. Both variants
found the root consistency issue and test gap in both runs; neither triggered the tested traps. It remains
unadmitted as a discriminating benchmark and showed no incremental detection benefit in that pilot. Its `clean` tree is a deterministic
reference required by this instrument, not a request to schedule clean-target reviews. It is not added to the
frozen current pilot automatically and is formative rather than held-out evidence for draft28, which was
designed alongside it. No architecture probes are supplied: a future passing outcome is `checks only`, not
verified architectural recovery.

## Contact-import-v2 diagnostic status

[Round 9](../../research/2026-11-13-review-instead/round-9/README.md) compared two full draft25 and two full draft28
Terra reviews on head only. Carbon and GLM support D2 in all four, but disagree on D1 (partial vs hit); preserve
that distinction rather than derive an architecture score from the functional findings. No implementation,
clean target or admission/transfer claim is included. The fixture and rubric remain unchanged.

## Scoped contact-import-v2 outcome probe

[Round 10](../../research/2026-11-13-review-instead/round-10/README.md) applies both draft28 reviews from round9
and extends their resulting code with previewImport. Its explicitly scoped runner reuses the original 13
checks and adds 14 frozen preview/compatibility checks, without automatic task-only or clean-target arms.
Both paths pass and one Carbon assessment rates both changes local. This is a formative case-specific outcome,
not admission of the fixture as a general architecture benchmark or an unmodified outcome.mjs recovery score.
