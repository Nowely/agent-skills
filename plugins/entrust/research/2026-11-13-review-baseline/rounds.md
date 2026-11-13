# Completed observations

## Paired snapshot round: drafts 20, 21 and 22

Twelve fresh static reviews by Terra (`gpt-6.1-terra`, requested xhigh): three instruction versions × two source snapshots × two repetitions. Two snapshots represent the earlier complicated solution and its later simpler form. Each version received the same bounded source packet within a snapshot. Reviewers did not run application code, tests, builds or browser scenarios.

Astra, Carbon and GLM independently judged all six reviews of each snapshot: six judge sessions, 36 assessments. The external routes were OpenCode/OpenRouter for Carbon and GLM, with requested high effort; provider-effective effort was not established. Native relay work is excluded from substantive session counts. One GLM response needed a format-completion continuation, not another independent judgment. One empty placeholder object was removed from a Carbon response; substantive ratings remained unchanged.

| Observation | Draft 20 | Draft 21 | Draft 22 |
| --- | ---: | ---: | ---: |
| Principal lookup-failure problem found, earlier snapshot | 2/2 | 2/2 | 2/2 |
| Direct removal of redundant lookup recommended | 1/2 | 2/2 | 1/2 |
| Additional extraction of rules proposed | 0/2 | 0/2 | 0/2 |
| Stale validation after deadline found, later snapshot | 2/2 | 2/2 | 2/2 |
| Saved analysis artifacts, both snapshots | 0/4 | 4/4 prose | 4/4 JSON |
| Fixed-renderer HTML without another model review | not attempted | not attempted | 4/4 |
| JSON byte identity preserved during delayed render | not applicable | not applicable | 4/4 |

These are descriptive counts, not a statistical ranking. Draft 21 had the strongest observed direct simplification rate, but two repetitions cannot establish reliability. Draft 22 demonstrated a useful report lifecycle, not superior architecture advice. All judges accepted that ordered rules can remain cohesive; lack of additional helpers is not itself a failure. No regression rate for implementation is available: reviewers did not modify the code.

### Quality of the saved reports

All four draft-22 records passed the structural checker. Two nevertheless left controls in English because their translation dictionaries were partial. One target simultaneously described a missing event subscription and the refresh that would require it. Another mapped all changed lines but described the wrong test ranges. Mechanical completeness therefore did not establish semantic accuracy. The release adds a selected language with complete built-in catalogs and an explicit read-back of the materialized report; no automatic semantic-validation claim is made.

The mean final chat response was 878.5 words for draft 20, 227.75 for 21, and 129.25 for 22. These counts exclude artifact contents and are not total token or cost savings.

### Disagreements and limits

- One judge defended a lookup using possible stale identifiers; no supplied requirement established that scenario. Speculation is a question, not evidence for preserving machinery.
- One judge treated complete prose as equivalent to renderer-ready data and missed the contradictory target. Only the four JSON artifacts were actually passed through the fixed renderer.
- A contract concern about omitted request scope did not prove that every request fails: the exact full client/gateway path was unavailable. Static evidence must not be promoted to a runtime guarantee.
- The bounded packets omitted some generated dependency definitions and a UI wrapper; related definitions were from a neighboring version. One dependency was reconstructed from a pinned base and patch, not a verified historical installation. These are preparation limitations, not failures to read files the reviewer never received.
- The output format may reveal the instruction family even when names are hidden. One prompt had an extra equivalent introductory phrase.
- No application/browser execution or visual layout check was done. No additional experiment was run to validate draft 23.

All six reviewers of the later snapshot identified stale validation after a deadline, and all three judges confirmed the static path. After the round, the owner explicitly declined automatic refresh because its benefit was not worth the added lifecycle mechanism. This later decision does not erase the observation or imply that timers are always unnecessary. It makes the omitted behavior and its consequence an accepted tradeoff for that product, outside this release's scope.

## One report handed to fresh Astra

A fresh Astra (`gpt-6-astra`, requested xhigh) received one unchanged draft-22 report, the task and the same bounded source. It confirmed the central problem and removal recommendation, corrected a claim that an input-to-domain mapping was unavailable, qualified dependency provenance, and described a timer-test gap more precisely. No new confirmed product defect or additional decomposition proposal emerged. The source and incoming report stayed unchanged.

This was one probe, with no Astra-without-report control. The scout was Terra at xhigh, not a tested inexpensive model. It establishes neither cost savings nor a causal benefit from scouting. The owner chose not to add a separate mode. The reusable lesson is to verify incoming claims and assertions that information is missing.

## Release baseline

Draft 23 is an agreed design baseline, not an experimentally superior arm. New application/model experiments and live checks were explicitly waived. Relevant offline packaging/report tests and exact-head PR CI are the release gates. Earlier cohorts, their inputs and evaluations remain frozen.
