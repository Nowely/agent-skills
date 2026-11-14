# Round 11: integrated draft 29 versus control

## Approved question and sample

Does the integrated skill improve supported diagnosis and actionable, behavior-preserving recommendations
over the same model without this skill? Compare content separately from the canonical record/report it produces.

The approved sample is two fresh reviews per arm on each of three tasks: `contact-import-v2/head`,
`locale-options/head`, and the unchanged private source/contracts packet used in round 6. That is 12 reviews,
followed by one independent Carbon assessment of the four reviews for each task. No implementations, new
feature probes or HTML generation are part of this round. A second judge requires a separately agreed
material dispute, rather than automatic duplication.

Pin: `843c2a392d31a7bb2129b61d7d74f226fafbb9c7`. Draft 29's frozen entrypoint/data contract and draft 27's
structural examples match the candidate's shipping files byte for byte. The candidate receives its matching
review package, including the newer weight contract and rendering tools. The control receives no review skill
or output schema. Both receive the same source/task bytes and common request to assess correctness, task
completeness, necessity, architecture, readability and tests. This measures the added skill package against
the shared host background, not a model with literally no instructions.

## Execution controls

- Reviewers: fresh Terra sessions, `gpt-6.1-terra`, requested `xhigh`, no conversation-history fork.
- Alternate arm dispatches and reverse within-repeat arm order; preserve actual launch order and any scheduling
  deviations. Concurrent runs share neither writable files nor observations.
- Each reviewer can read only its assigned packet, not memory, other skills, previous runs, rubric, acceptance
  checks or reference implementations. No delegation, project/dependency/test/build execution, installation or
  network calls. Read-only Git/file operations are allowed; candidate reviewers may run their report checker.
- Source/task/package writes are forbidden. Both arms may save a concise Russian review in their own output
  directory; candidate reviewers also prepare the canonical JSON required by the skill. Final handback is an
  artifact path in both arms. No format-repair hint may reveal a desired substantive finding.
- Freeze source/package/task hashes and evaluator criteria before reading outcomes. Check identities again
  after handback. Retain incomplete attempts, transport failures and all same-session repairs; do not replace
  a poor answer with a selected better run.

## Evaluation

Reuse the frozen round-9 contact-import rubric/criteria and round-8 locale-options rubric/criteria. A separately
frozen addendum changes only the round mechanics: one judge, four neutral review IDs, and equal semantic
treatment of control Markdown and candidate Markdown plus JSON. All substantive content is retained. Source
paths may be relocated equally; labels/history, model reasoning and token/time statistics are withheld.
Output structure can still reveal the arm, so masking is partial, not proven blinding.

Carbon is requested through OpenCode/OpenRouter as `openrouter/google/gemini-4-carbon`, effort `high`.
Its assessment must cite review/source evidence and keep these outcomes separate:

1. Supported findings and completeness against the task, with related symptoms grouped by root cause.
2. Redundant mechanisms, existing capabilities and justified keep/remove decisions.
3. Concrete reading/change burden and a boundary that reduces it; bugs or helper counts are not architecture.
4. An implementable target and preservation of required behavior; a static review is not implemented success.
5. Unsupported, unnecessarily complex or harmful recommendations, retained independently of positive findings.

The coordinator checks material conclusions against source. No overall architecture-success percentage or
fixed pass quota is used. If both arms perform similarly, report no observed advantage on these familiar small
cases, not equivalence, proof of no skill value, or general reliability. A missing/incomplete packet is blocked,
not a negative review result. The private task requires its original task/contracts and compatible review-only
criteria; later owner tradeoffs are not supplied as clues or retroactive obligations.

## Cost, preservation and publication

Record per-run available tokens, cached input, duration, tool activity and artifact size separately from quality.
Output-format work is part of the candidate workflow cost. Missing telemetry remains unknown; byte counts are
not tokens and token totals are not an invoice. Reviewer, judge and orchestration usage are separate.

Preserve raw artifacts and exact packets privately in durable storage. Publish only public synthetic inputs,
sanitized review/judgment copies, manifests, summaries and aggregate private-task results. Internal source,
task text, raw private reviews and identifying paths remain private. Do not alter earlier frozen rounds.
Add a new PR comment for this round, including incomplete work and limitations. No release or skill edits are
authorized by the experiment itself.
