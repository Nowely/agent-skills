# Decisions for draft 23

## Keep the analysis ready before presentation

Every review builds the connected map and saves the complete canonical JSON, even when the user only wants a short answer. HTML is an optional rendering of those bytes against the recorded source. Data preparation is part of review, not a hidden second analysis triggered by a request for a page. A read-only context that forbids artifacts returns JSON inline.

## Mechanisms, benefit and price

A mechanism is a meaningful behavior or coordination concept, not every function or guard. Its record states what changed relative to the base, why it exists, which existing capability could serve instead, what benefit it produces, what maintenance/lifecycle/runtime costs apply, and what the reviewer recommends. One lifecycle can span multiple units. The existing map retains ownership of locations and requirement definitions. A mechanism count is descriptive and depends on grouping; it is never a quality score or removal quota.

An automatic refresh, for example, buys a no-further-input update at the cost of scheduling, state propagation, cancellation and tests. That can be required or worthwhile, but it is not free merely because it fixes a conceivable stale state. An owner can accept the consequence of omitting an optional convenience. A binding requirement remains binding until that decision changes it. Reviewers identify tradeoffs; they do not silently rewrite the task.

## Decomposition as useful independence

Locating each mechanism tests whether the code makes its owner, inputs, effects and lifetime understandable. Difficulty is a lead: missing context can look like entanglement. A design finding must name the actual connection, what must be understood or changed together, and how a smaller rearrangement reduces that burden. The available outcomes remain keep, simplify in place, merge, split or remove. Ordered cohesive rules may stay together.

## Report consistency and localization

The reviewer reads back saved data, comparing present/target jobs, mechanism dispositions, findings and recommendations. The checker handles structure; a prose contradiction requires source-based judgment. The new `check` command performs validation without unrequested HTML.

`language` is set by the reviewer from the session because a renderer cannot infer it reliably from mixed prose and code. English and Russian catalogs own all UI/export strings; existing reports without the field retain their English defaults and partial overrides. Other languages require a complete supplied dictionary. This removes the demonstrated silent fallback for new non-English reports without requiring a model to translate every control on every run.

## No additional scouting mode

Fresh Astra refined evidence boundaries but did not change the architectural conclusion in the single handoff. There is no comparison supporting a new workflow or cheap-scout promise. Keep the existing single-reviewer and by-direction modes.

## Future measurement, not release scope

Before another real-snapshot comparison, inventory and freeze the exact pinned dependency/generated definitions and relevant UI wrappers. Mark unavailable material explicitly. Preserve completed rounds unchanged. Compare implemented outcomes, change locality, justified removals and harm to clean controls; do not equate rubric recall or helper count with architecture quality. No new experiment or product fix belongs to this release.
