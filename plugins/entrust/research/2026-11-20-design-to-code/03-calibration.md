# Round 2: real-frame and mixed-list calibration

This is a formative tool check on previously used cases. It is not a model evaluation. Original product data, screenshots and credentials are kept out of this public summary. The design-service check used an existing authorized MCP connection without a personal access token.

## Actual design input

One real medium-width frame returned metadata for a 601 × 145.09 CSS px node and a 601 × 146 PNG. The metadata-to-spec command selected relative coordinates and produced 14 landmarks. Twelve of the fourteen extracted text layer names were generic placeholders, so they did not establish the displayed text. The command now warns when common generic layer names are present. The design-context response contained actual text for some of those nodes. Completing an automatic spec requires joining the available context with metadata and inspecting the result; the metadata layer name is not proof of characters. The image and its geometry were obtainable without a personal token. Mapping all landmarks was not completed, so this is not an end-to-end visual parity verdict for that frame.

## Independent mixed-list checks

An independent worker used the same public mixed-list fixture on three preserved packages at 601 and 624 px. A deliberately defective submission had been observed to put values under a neighboring heading. Two previously accepted packages were negative controls. The worker first compared each package to a snapshot of the defective submission. A snapshot-to-itself gave zero pixel difference but 18 reported findings at each width. Repeated short strings were matched as substrings or in a different order from the snapshot's individual text nodes. These were confirmed false positives, not a verdict about the other packages.

An initial document-order change did not solve those self-comparison errors because a short token in a longer text still preceded a whole text node. The subsequent change matches whole text nodes for page-snapshot specs, falling back to range matching if markup splits a previous node. On the same preserved inputs, the worker reported 0% pixel difference and zero findings for self-comparison at both widths. Browser tests cover both repeated words with longer containing text and text split across markup.

The existing explicit alignment check was then used with the same groups and its unchanged 1 CSS px threshold on all three packages. It marked the known bad submission and accepted one control at both widths. On the other accepted package it passed at 624 but failed at 601: a disk-column spread of 1.015625 px was displayed as 1 px. Without an independently derived geometric design spec, the acceptability of that fractional difference is unknown. The report now preserves two decimal places and names the limit; the threshold was not adjusted to this example. For page snapshots, the test first tried document-order text ranges and still had the same failures, then matched whole text nodes in the snapshot order and retained range matching when markup splits a node. The design screenshot and original manual observation remain useful for human comparison, not an automatically established ground truth.

**Gate result: not passed.** The current check has not distinguished the positive case from both accepted controls under one verified design specification. An independent human review is still needed to classify the output. The agreed next stage, a short paired model experiment, was not run.

### Alignment observations and full-frame coverage

| Saved build | 601 px alignment sweep | 624 px alignment sweep |
|---|---|---|
| Previously observed misalignment | Findings at 3, 6 and 8 px after display rounding | Findings at 2 and 3 px after display rounding |
| Previously accepted build A | Pass | Pass |
| Previously accepted build B | Finding at 1.015625 px, against the 1 px threshold | Pass |

The figures in the first row come from the alignment groups, not from a trusted Figma geometry specification. Every one of the six **full-frame comparisons** returned fail, with 12 frame findings each. Therefore a sweep pass does not mean visual parity. The acceptable tolerance for the borderline finding and the truth of the other frame findings remain unverified.

The checker also reported an unrelated font-availability warning during the corrected self-comparison. Its validity was not independently established. Refer to the [independent assessment](04-recommendations.md) for a separately reproduced bounded-exception problem and a proposal for confirming the real design geometry.

## Other changes

The comparison looks for the actual design text first and measures a recorded alternate only if it is present. A proposed deviation remains pending rather than turning the result green; absent reference imagery is incomplete. The browser regression suite exercises these states and the saved Git diff in a disposable clone with existing edits and a new file. A large unsaved file is reported. Arc's documented diff and status commands were inspected, but a complete staged/unstaged/untracked round-trip was not established. For that reason the skill no longer claims that a non-Git project has a recoverable snapshot. No automatic restore was added.

Both experimental arms receive the same frame images, context, text specifications and non-secret width configuration. Hidden judge checks remain with the judge. This changes the formerly registered protocol; the old record is retained. The scoring script reads the implementer's declared ledger path and records the check's status. The full model experiment has not been rerun.
