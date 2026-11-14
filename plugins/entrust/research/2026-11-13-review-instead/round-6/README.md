# Round 6: draft 23 versus draft 25 on the original flawed snapshot

## Purpose and design

The owner wanted evidence of progress on the original complicated solution, not another run on an already
simplified target. This round compares three fresh Terra reviews per instruction version, followed by a fresh
Terra implementer for every review. Carbon and GLM independently judged the resulting reviews and patches.
No no-skill/task-only control, clean target or additional synthetic case was included.

The [protocol](../protocol.md) defines the questions and joint-evidence rule. Baseline is the full released
0.37.0 package (`325394a3`); candidate is the full draft-25 package at `9ee0189c`. Each reviewer received its
own source/task copy and matching instructions, data contract and checker. Prompts differed only in local
paths. All 12 Terra sessions used `gpt-6.1-terra` at requested xhigh; native session records confirm that setting.
The external judge routes are Carbon via `openrouter/google/gemini-4-carbon` and GLM via
`openrouter/~z-ai/glm-flash-latest`, requested high. Provider-effective effort is not established.

The original change's diff stayed byte-identical. Source context was improved: an integrity-verified pinned
SDK artifact, its relevant generated contracts and internal import closure, and previously omitted field
wrappers/lifecycle code were supplied equally. Core dependency versions match the lockfile; reconstructed
material remains labelled as such. This is not a controlled before/after comparison with earlier rounds that
had less complete context.

## Observed reviews and implementations

All six reviews independently diagnosed the same redundant lookup and its failure path, established that
the required fact was already available in the source contract, and recommended removing the lookup and its
dependent machinery. Each produced a structurally valid canonical JSON report. All six fresh implementers
applied that simplification. The two changed core-logic files are byte-identical across all six implementations;
the test files differ. No reviewer proposed additional rule extraction or a new responsibility boundary.

| Observation | Draft 23 | Draft 25 |
| --- | ---: | ---: |
| Reviews completed / structurally valid | 3/3 | 3/3 |
| Direct removal of redundant lookup recommended | 3/3 | 3/3 |
| Corresponding implementations completed | 3/3 | 3/3 |
| Additional rule extraction proposed | 0/3 | 0/3 |
| `instead` fields recorded | 0 | 7 |
| Mean canonical JSON bytes | 23,656 | 24,578 |

The roughly 4% JSON-size difference is not total token use, runtime cost or a measure of reasoning effort.
Filling `instead` is observable compliance, not evidence of better recommendations. A mechanism count is also
sensitive to grouping: reviewers listed two or three mechanisms for the same code.

The task packet contained the original brief, not the full later design conversation or the later implementation. In particular, later owner tradeoffs are not supplied as clues to the desired patch. Retaining a mechanism the owner subsequently declined therefore cannot by itself be scored as a violation of this round's brief. This limits any claim that the round reproduces the complete later human-refined solution.

The shared core result removes an unnecessary data dependency and asynchronous branch. It keeps the existing
ordered validation rules and time-driven mechanism. It does not establish that every remaining mechanism,
guard or responsibility boundary is optimal, or that this is equivalent to the later human-refined solution.

## Integrity and deviations

- Source/package hashes were unchanged at every reviewer handback; all six JSON records were checked with
  their own version's tool. All reviewer final messages were compared against native session records.
- One baseline reviewer temporarily wrote its report inside `repo/out`, then moved it to the authorized
  output directory and removed the temporary directory. The deviation is retained; final source hashes match.
- All implementation changes stayed in three application/test files. Dependency/context bytes and the source
  Git HEAD were preserved. Original reviews remain unchanged; evaluation copies relocate absolute source and
  artifact links without changing substantive content.
- Native visible tool calls were retained for audit: 12 sessions and 151 visible tool calls. No project/application,
  test, build or network execution was observed in those calls; report-data checks and static source edits were used. Structural report checks and static diff inspection are not runtime validation.
- Both external launches were initially rejected before execution by automatic approval review. The owner then
  explicitly re-authorized this exact private source/contracts/reviews/patches package for OpenRouter. These
  rejected attempts are operational events, not additional model judgments.
- Model discovery initially reported Carbon/Kimi absent. A same-server observation proved that an early model
  snapshot was incomplete; the later snapshot included both. Carbon subsequently started without changing the
  adapter or configuration. [E141](../../../ISSUES.md#e141-an-early-opencode-model-snapshot-can-hide-available-models)
  records the defect separately. Kimi remained an unused authorized fallback.

## Independent judgments

Both external sessions completed with verified model receipts and schema-valid answers. Both received the same
frozen packet, which remained unchanged. GLM needed one automatic JSON-format correction in its session;
Carbon needed none. Carbon's relay had to reattach after the host lost its exec-session handle; the external
invocation and session identity stayed the same. No replacement judge or extra independent vote was added.

| Static assessment supported by both judges | Draft 23 | Draft 25 |
| --- | ---: | ---: |
| Primary diagnosis and removal recommendation | 3/3 | 3/3 |
| Simplification | 3/3 | 3/3 |
| Required-behavior preservation | 3/3 | 3/3 |
| Ownership/readability improvement | 3/3 | 3/3 |
| Overall static outcome, strict intersection | 2/3 | 3/3 |
| Overall outcome unresolved | 1/3 | 0/3 |

The last two rows have one narrow cause. A baseline implementation left an unused React import after removing
its test wrapper. GLM identified it but considered it non-material. Carbon supported all three code-quality
dimensions but left the overall result unresolved because the packet lacked shared compiler/lint settings
needed to rule out a CI failure. It did not observe a failed build. Raw ratings are preserved; this is not
converted to a failed run or silently reconciled into a pass. [results.json](results.json) keeps every rating.

After the judgments were frozen, the coordinator inspected the original lint configuration and a locally
available shared compiler configuration matching the lockfile version. They enable unused-variable/local
checks, making cleanup warranted, but no lint/compiler execution was performed. This extra evidence was not
fed back to the judges or used to rescore them; a runtime CI failure is still not claimed.

Both judges found the same meaningful simplification: remove a redundant lookup, asynchronous validation and
its set plumbing, while preserving the required checks. They accepted retaining the ordered rules together.
GLM additionally corrected an overly broad review claim that a domain mapping was unavailable: the supplied
UI labels do contain that mapping. Other backend-policy questions remained unresolved rather than being
implemented speculatively. Minor test differences include an unused import and a deliberate no-lookup spy
that keeps a test coupled to the removed data-source module.

## Coordinator verdict and next step

**The round demonstrates a useful simplification in both arms, not an architecture advantage for mandatory
`instead`.** All six implementers reached byte-identical production logic. Draft 25's extra field made an
existing-alternative answer explicit, but it produced neither an additional finding nor a different target.
The strict 2/3 versus 3/3 overall tally reflects one test import and uncertainty about tooling, not a different
architectural solution or demonstrated causal benefit of the field.

There is real architectural progress from the flawed input: an unnecessary responsibility and data dependency
are removed, the validation becomes synchronous, and the schema's interface no longer needs a set populated by
remote requests. That is simplification by removal. There was no additional decomposition of domain rules,
no new meaningful boundary, and no evidence of convergence on every aspect of the later human-refined design.
Do not present the supported readability dimension as proof that all remaining structure is optimal.

I would retain draft 23 as the released baseline and would not promote mandatory `instead` on this evidence.
The predeclared useful-difference criterion was not met for the core solution. Dropping or revising the mandatory
field is a recommendation for the PR, not a change silently applied during this round. If later work targets
architecture/decomposition, choose a discriminating change-locality problem the baseline does not already solve;
another repetition of this now-saturated lookup case is unlikely to answer that question. No additional round
was launched here.

## Privacy and limits

Private task/source code, dependency material, raw reviews, patches, judge responses, local paths and session
logs remain local. This public account contains newly written anonymized observations. It cannot replay or
independently verify the private-source experiment. Three runs per arm on one task cannot establish general
reliability. The report format can reveal the arm. An implementer adds variance and may independently derive
the change; without a task-only control, the outcome cannot be attributed to the review alone. No runtime tests
were run and no clean target was reviewed, so neither runtime recovery nor resistance to over-editing good code
is measured here.
