# Four-arm review follow-up

## Result

There was no convincing overall winner. One of two A reviews of the previously used real case developed a grounded alternative to automatic revalidation, including its costs and an owner choice. The other A review discussed the alternative only partially; the other six reviews did not provide the full tradeoff. This is a single promising signal on a formative case, not evidence of a repeatable advantage. Keeping the automatic behavior was not itself an error.

C had lower overall median elapsed time and output counter in these runs, but it changed both the review workflow and the report's coverage contract. The sample cannot isolate either change or establish that C is generally better. This was not a comparison of a skill against a plain request.

## Design and interpretation

The comparison comprised **40 reviews = 5 cases × 4 arms × 2 independent reviews**: one previously used, formative real case and four newly prepared synthetic cases. There were two reviews per case and arm, and ten per arm overall. The sample is diagnostic, not a reliability estimate or release gate.

All four arms used a review skill:

| Arm | Change from the frozen control |
| --- | --- |
| Control | Existing skill and complete changed-line map. |
| A | Clarify evidence for a required rule versus its automatic trigger, with a contrasting example. |
| B | Consider provisional alternatives before producing the complete changed-line map. |
| C | Delay report assembly and permit an explicitly focused map while retaining the semantic review. This changes **both workflow and report format/coverage contract**. |

The protocol specified fresh sessions and separate input copies, the same model and effort, task wording, constitution and limits, and randomized dispatch order. All 40 saved first user messages and normalized task texts matched; response metadata recorded the requested Terra model and `xhigh` effort. Complete identity of system instructions and available tools was not independently established. The protocol excluded hidden rubrics and earlier results from reviewer inputs, but filesystem isolation was not enforced. Assessors received neutral report IDs and saw both report forms, but C's distinctive format could reveal its arm. Cases were assessed against the source; additional assessment addressed substantive disagreements. Architectural choices and whether to escalate an issue remain judgments, not mechanically objective scores.

There was **no no-skill arm in these 40 reviews**. An older no-skill control explicitly asked for correctness, task completeness, necessity, architecture, readability and tests; see its [exact prompt](../2026-11-13-review-instead/round-11/prompts/r01.txt). These two studies have different designs and do not establish the effect of a skill versus a plain request.

An earlier pilot did include two no-skill reviews of a real change, one with and one without the separate
ponytail instruction. Their saved prompts also explicitly requested correctness, task completeness, code
necessity, architecture, readability and tests. They therefore do not supply the missing plain-request
baseline either. The earlier public pilot comment remains a record of that experiment, not evidence that
the no-skill reviewers received only "review this change." The common constitution also included a
preference to minimize new concepts and affected interfaces. The original sessions' initial inter-agent
message content was encrypted in the available records, so additional directions there cannot be excluded.

The normalized task given to all four arms is reproduced below. `<RUN>` replaces each run's local path;
the session's first message directed the reviewer to this file. The differing skill contents are the
experimental treatment, not part of a neutral baseline. The [frozen skill packages](artifacts/four-arm/arms/)
and [synthetic cases](artifacts/four-arm/cases/) are provided separately; their READMEs describe test and
reconstruction limits. The [synthetic report export](artifacts/reports/) documents its own coverage and
transformations. Neither package contains the real case or establishes reproducibility of model responses.

```text
# Задание на ревью

Выполните самостоятельное статическое ревью изменений HEAD~1..HEAD в `<RUN>/case/repo` по заданию `<RUN>/case/brief.md`. Прочитайте `<RUN>/skill/SKILL.md` и относящиеся к ревью материалы в `<RUN>/skill/references`; следуйте этому скиллу.

Запишите полный канонический результат в `<RUN>/out/review.json` и краткое ревью на русском в `<RUN>/out/review.md`. Разрешена штатная проверка `report.mjs check` из репозитория. Запись разрешена только в эти два файла результата.

Не запускайте тесты, приложение, сборку или сеть. Не используйте другие skills, не читайте соседние пакеты, эталоны или прошлые результаты и не изменяйте исходные файлы.
Верните координатору только статус, пути к двум файлам и результат проверки отчёта, без перечисления находок.
```

## Case observations and limits

The real-case observations below are anonymized. Raw task materials and reports are not published here.

### Real: optional automatic behavior

All eight reviews identified a fail-open path. One A review fully compared an action-triggered alternative to automatic revalidation, including the need for fresh time, the loss of automatic clearing and an owner choice; its structured report contained more detail than its short report. The other A review identified fresh time and loss of automatic clearing but did not establish a complete integration or suitable action trigger; an important question in its structured report did not reach the short report. The remaining six did not present the full tradeoff. A required time-based rule alone does not establish that automatic clearing without further action is required.

Some reports identified a separate conditional compatibility risk, but whether the relevant response is reachable in the actual backend is unknown; it is not a demonstrated production failure. Several reports incorrectly described available files as unavailable; that does not prove they did not read them or that reconstructed versions match historical ones.

The case had been used before, so it is formative rather than held out. The reconstruction had 9,463 files matching the saved manifest, and its saved patch matched two commits, but the complete historical environment, dependencies and backend were not established. The real application, build and tests were not run.

### Extra-trigger: permissible automation and contract ambiguity

All eight reviews distinguished permitted read-ahead from mandatory behavior and found substantive gaps in the visible repository tests. The timing scenario in their findings is statically plausible, but the brief leaves the relevant operation's result ambiguous. Depending on that interpretation, the scenario may or may not violate the contract. It was not run at runtime; it is a grounded contract question, not eight proven bugs or eight false findings.

The reviews did not identify one recovery behavior that could be lost after a speculative failure when switching to lazy execution. Other costs, including overlap, deduplication and compatibility, must be assessed separately. One control review incorrectly promised unchanged errors under the lazy alternative. These omissions limit the alternative analysis, not establish that read-ahead is mandatory.

### Required-trigger: narrow preservation control

All eight reviews retained the required timer, cleanup and removal-before-callback behavior. Findings concerning invalid IDs in two operations were grounded in the visible brief, but both were pre-existing rather than introduced regressions. The original hidden rubric conflicted with the brief about one operation; a later assessment corrected that classification. The behavior after closure is specified separately.

This case is useful as a narrow control for preserving mandatory automation, but it is not a functionally clean negative control for the entire brief. The treatment of a defensive guard admits more than one defensible design, and late clock delivery presents a contract ambiguity rather than an automatically proven new defect.

### Structural: burden and alternative cost

All eight reviews identified a real coupling of distributed policy and state with an unreachable corrective branch, and offered substantive alternatives. None provided a developed account of the cost of its proposed boundary or migration. The state is local to a call; cross-call leakage was not established. Keeping the design, deleting the dead branch in place, and different proposed boundaries have different costs.

Reviews found useful gaps in the supplied repository test suite, but some scenarios were already fully or partly covered by a private acceptance suite. They are therefore gaps in the supplied suite, not necessarily in all testing. One B review made a specific blocking claim about newline handling that a source-grounded assessment and a separate runtime pattern check found false; a missing regression test remains a distinct question.

### Cohesive: scope judgment

Several reviews recommended removing a small convenience and its dedicated test, but the necessity of removal was not established. One A review and one C review asked the owner; the other A review explicitly treated removal as optional. One C review incorrectly claimed that removing the convenience would eliminate all lookup by ID. One A and one B review identified a grounded replay-result mutation test gap; this is a missing test, not a demonstrated current bug. The reviewer-facing brief said that equivalent cohesive implementations were welcome; its effect on the reviews was not measured.

## Time and API counters

These are descriptive medians of the observed runs, not causal estimates. Elapsed time is `idle − busy` in seconds. Each case cell has **n=2**; the overall row is the median of the ten individual runs per arm, not the median of case medians.

| Case | Control | A | B | C |
| --- | ---: | ---: | ---: | ---: |
| Real, formative | 324.143 | 358.994 | 339.771 | 333.991 |
| Extra-trigger | 243.127 | 243.658 | 293.231 | 215.421 |
| Required-trigger | 190.394 | 146.690 | 269.610 | 148.807 |
| Structural | 323.837 | 257.169 | 201.713 | 176.859 |
| Cohesive | 172.594 | 218.057 | 239.919 | 153.987 |
| **All five, n=10** | **235.102** | **254.154** | **272.732** | **178.024** |

Median **output counter**, reported separately:

| Case | Control | A | B | C |
| --- | ---: | ---: | ---: | ---: |
| Real, formative | 13,392.5 | 14,087 | 12,952 | 13,271.5 |
| Extra-trigger | 9,876.5 | 9,722.5 | 11,984.5 | 8,578.5 |
| Required-trigger | 7,562 | 6,033.5 | 11,016.5 | 5,962 |
| Structural | 14,434.5 | 10,720.5 | 7,885 | 7,250.5 |
| Cohesive | 6,485.5 | 8,732 | 10,292.5 | 6,274.5 |
| **All five, n=10** | **9,552.5** | **10,328** | **11,241.5** | **7,153** |

Overall median **input / reasoning / cache-read counters**, n=10 per arm: Control **38,684 / 1,090.5 / 418,624**; A **38,841 / 914 / 467,840**; B **40,669 / 1,314 / 466,240**; C **34,593 / 1,081.5 / 274,944**. Counters are reported separately, not summed into a token or cost total. Pricing and billing are unknown; a reported zero price does not establish free usage.

## Coverage and verification

C used the focused format in 10/10 runs; 8/10 had no mapped blocks. Seven of those eight nevertheless contained findings, across four of the five cases. An unmapped line is neither a `keep` decision nor proof that it was unread, but the focused report does not provide a line-level guarantee for it. Mapped-line counts from focused and complete maps are not comparable as an overall quality score.

The saved independent structural verification reported **40/40** successful checker results, parseable JSON, clean tracked status and matching identity; **80/80** Markdown and JSON copies matched the saved hashes and source run files. The checker was not rerun for this aggregation. It checks structure and applicable coverage, **not factual or semantic correctness**; the incorrect claims noted above illustrate that distinction.

## Earlier observations, kept separate

The [draft 31 pilot](draft-31-pilot.md) found that neither its draft 30 nor draft 31 real-case review presented the optional automation tradeoff. Its corrected synthetic control was selected after initial results and was not held out. Its implementation comparison also had only two samples per arm and did not establish an effect of the additional instruction.

In a separate subsequent diagnostic follow-up, two reviews each of an earlier and a later candidate revisited three previously used cases. Neither pair of real-case reviews constructed a working automatic-revalidation alternative and surfaced its tradeoff to the owner. On the cohesive control, one later review treated a convenience removal as optional while the other made it obligatory; both earlier reviews made it obligatory. Those cases were formative, the candidates ran in different rounds, and the sample does not establish a causal improvement. No timing or token telemetry was collected for that follow-up. These prior observations are not additional independent samples of the four-arm result.
