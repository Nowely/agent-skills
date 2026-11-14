# Next comparison: draft 23 against draft 25

## Question and scope

Does requiring `instead` help a reviewer turn the original complicated solution into a necessary, understandable one, beyond the released draft 23? The primary target is the original private flawed snapshot used in the earlier research. Neither its later simplified snapshot nor a synthetic clean variant is a target in this round. Existing clean fixtures remain in the instrument for other rounds; their presence does not schedule them here.

Compare two arms, three fresh reviews each: six reviews in total. Use Terra at the same requested xhigh effort and with the same tools and limits in both arms. Follow every completed review with a fresh Terra implementer at the same effort, six implementations if all reviews complete. Two independent judges, Carbon and GLM, assess the reviews and implementations. This plans 14 substantive sessions, excluding external-model transport. Freeze exact model IDs and requested efforts before launch; report effective effort as unknown when the provider does not establish it. No task-only or no-skill control is added in this focused comparison, so it cannot establish benefit over unaided work.

This document prepares the round; editing it does not launch the agents. Corrected synthetic cases are deferred, not declared admitted. Add one later only for a named unresolved question the primary target cannot answer, with its scope and cost agreed first.

## Coordinator preparation

1. Freeze **complete arm packages**, not just numbered Markdown files. Draft 23 comes from `entrust@0.37.0`: its entrypoint, data contract, renderer/checker and transitive references. Draft 25 comes from a fixed PR commit: the `24-instead.md` entrypoint with the `25-cited-data.md` contract and that commit's report scripts. Preserve the installed relative layout. Record resolved commits and every package file's digest in the run manifest. Validate and render each arm only with its own scripts; never upgrade a baseline record to satisfy draft 25's required `instead`.
2. Freeze one task/source packet for all six reviewers: original base/head diff, relevant callers and UI wrappers, exact pinned dependency types/implementation and necessary generated definitions. Record unavailable or reconstructed inputs and their provenance. If context differs from historical rounds, record that difference; historical results become descriptive context, not a controlled before/after estimate. The later solution, historical findings, expected fixes and this evaluation protocol stay outside reviewer packets.
3. Keep private code, raw records, local paths and identifiers out of GitHub. The private manifest links all source packets, arm packages, reviews, patches, model settings and failures. Publish only anonymized aggregate evidence and public synthetic material.
4. Give both arms the same neutral prompt and an artifact directory, allowing only that directory to be written during review. Permit the source packet and matching skill package to be read. Do not blindly forward the generic preparation prompt's ban on every write/outside read: it would contradict the required JSON artifact and package access. Review remains static: no application, dependency or test execution.
5. Alternate/interleave the two arms with anonymized run IDs. Start each reviewer fresh, with no other review, judge answer or suspected finding. Keep all started attempts and errors. A continuation to repair JSON is recorded as a continuation, not an independent repetition; preserve the initial output and do not coach substantive findings.

Preparation is complete when the packets and packages have immutable identities, all authorized input paths are accessible, the neutral prompts express the actual permissions, and both arms have the same source evidence. A missing contract stays a limitation, not a guessed guarantee.

## What is measured

Keep three layers separate:

- **Mechanical observations:** record presence, validation outcome, mechanism/alternative keyword matches and block dispositions. `blocks.mjs` is usable only where the target has a frozen line rubric; it does not acquire a rubric for private code automatically. Report unavailable counters as not measured. Word matching can produce false positives (a name occurs in a denial or irrelevant sentence) and false negatives (another term or language is used). It is neither semantic confirmation nor a guaranteed lower bound. Inspect both matched and unmatched records before claiming a mechanism or an existing alternative was recognized. A `path:line` pattern establishes citation shape, not that the place exists or supports the claim.
- **Review quality:** for each recommendation, judges establish its source support, preserved required behavior, complete removal of machinery that serves only an unnecessary mechanism, and whether the target actually reduces a concrete reading/change burden. Give separate credit for diagnosis and for an actionable target. Unsupported changes, dropped requirements and unnecessary new coordination count against the recommendation. An owner-accepted tradeoff is assessed against its recorded scope and consequence, not reopened as a defect. Keep those owner decisions identical across arms; do not turn a later decision into a hint about the expected fix.
- **Implementation outcome:** a fresh implementer gets only the task, the same original source packet and one review (including its JSON), with write access to an isolated copy. It verifies the review against the source and applies supported recommendations. Preserve every patch and return, including no change or failed completion. Do not select the best three of five reviews or replace failures silently. Without an independently justified executable acceptance suite, describe the result as a static assessment; do not call it verified recovery. No application/test execution is part of this static round.

Line deletion is a diagnostic of proposed removal, not a score for architecture. Moving or rewriting a rule may delete its original lines while preserving the behavior. Judge the rule's ownership and preservation in the target/patch; do not reject a good solution merely for differing from the reference's line layout. Helper counts and exact resemblance to the later solution are not success criteria.

## Independent judgments and aggregation

The coordinator prepares the same anonymized evaluation packet for Carbon and GLM: task, source contracts, review artifacts and resulting patches, plus the same assessment questions above. They see neither the other judge's ruling nor an arm-labelled ranking. The report format may reveal the arm; record that limitation rather than claiming perfect blinding. Preserve each complete original answer separately, with its model, inputs and status.

Each judge assigns `supported`, `unsupported` or `unresolved` to each material recommendation and to the resulting solution's simplification, behavior preservation and ownership/readability assessment. Every ruling cites source/patch evidence and identifies the remaining gap. Align claims by meaning with their original locations; do not merge distinct recommendations just because they touch one function.

The coordinator, not the user, then produces a per-run comparison:

- **Jointly supported:** both judges support the same claim on the supplied evidence.
- **Jointly unsupported:** both reject it.
- **Disagreement:** one supports and the other rejects; keep both reasons.
- **Unresolved:** either cannot decide, a judgment is missing, or the supplied evidence is insufficient. Retain the other judge's ruling too.

A successful static outcome requires both judges to support a substantive simplification, preservation of the task's required behavior and a concrete improvement in reading/change burden, with neither reporting an unresolved material regression. Show those dimensions separately as well as the joint count. Never average away a disagreement or turn an unavailable check into a pass. The coordinator may add a sourced assessment alongside the raw judgments, but cannot silently replace either judge's result.

The existing `outcome.mjs` accepts one judge file at a time; it does not perform this two-judge intersection. For a future synthetic outcome run, preserve `judge-a.json` and `judge-b.json`, evaluate each separately using a working copy at `outcome-verdicts.json`, and save each output/table separately before the next evaluation. Aggregate by stable run ID using the intersection of successful results; preserve disputed and unassessed states. Do not concatenate the judge files or overwrite their originals. For this private static round, retain the evidence table instead of manufacturing acceptance-check results.

## Reporting and decision

Update one English comment in PR #96: preparation, methodology, attempts completed/failed, each arm's mechanical observations, each judge's ratings, disagreements, joint supported outcomes and the coordinator's verdict. Include concrete anonymized examples of what became simpler or remained tangled. The coordinator handles the protocol, counting, source verification and aggregation; judges supply independent assessments. No manual labelling work is assigned to the user.

Report progress on the original flawed snapshot by the supported recommendations and resulting patches, compared directly between 23 and 25. Explain historical similarities/differences without claiming causation across changed packets or models. Three repetitions on one task provide a small comparison, not general reliability. Omitting clean targets also leaves resistance to unnecessary changes on already-good code unmeasured.

Keep `instead` only if the observed benefit justifies its added reporting/checking cost. More filled fields, keyword hits or deleted lines alone are insufficient. If there is no useful difference, recommend dropping or revising the requirement; if evidence is mixed or incomplete, say inconclusive. Schema compatibility with released reports is a separate decision before any release. This round neither merges the PR nor updates the installed baseline.
