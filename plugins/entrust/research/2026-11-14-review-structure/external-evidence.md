# External evidence for structured review and evaluation

This is an exploratory source check, not a new experiment or a reanalysis of the
[four-arm follow-up](four-arm-followup.md). The question is which external observations can inform
review structure and future comparisons without turning a small formative result into a general
claim. Searches used generic research terms only. The six observations below are bounded by their
actual tasks, participants, models and metrics.

## 1. Human checklists are not a demonstrated universal cognitive-load fix

**Source:** Wurzel Gonçalves et al., *Do explicit review strategies improve code review
performance? Towards understanding the role of cognitive load*, Empirical Software Engineering
(2022), [publisher](https://link.springer.com/article/10.1007/s10664-022-10123-8),
[authors' institutional abstract](https://research.uni-hannover.de/en/publications/do-explicit-review-strategies-improve-code-review-performance-tow/),
and the authors' [registered protocol](https://sback.it/publications/msr2020rr.pdf).

**Design and observation.** Professional developers performed three review tasks after assignment
to ad hoc, checklist, or guided-checklist review; most had little or no review experience. The
authors' abstract reports that the guided checklist was more effective on a simple review and the
checklist supported effectiveness and efficiency on a complex one, but did not find a strong
relationship between guidance and overall performance. The abstract says the checklist had
potential to lower cognitive load, while higher load was associated with better performance.
The registered protocol describes the cognitive-load questionnaire and a checklist constructed
with items relevant to seeded defects without explicitly revealing them; the protocol is a plan,
not evidence that every planned analysis succeeded.

**Use / limits.** A checklist can externalize prompts and organize attention; whether it helps is
an empirical question for the specific task and implementation. Do not claim that a complete
changed-line map lowers an LLM's cognitive load, improves detection, or causes a slowdown based on
this human study. The publisher blocked direct full-text retrieval; the result above is checked
against the authors' institutional abstract, not the complete paper. No stronger numerical or
mediation claim is made.

## 2. Relevant context changes which defects an LLM review can find

**Source:** Lu et al., *Towards Practical Defect-Focused Automated Code Review* (2025),
[preprint, sections 3–5.2 and appendix K](https://arxiv.org/html/2505.17928v2).

**Design and observation.** The authors reconstructed defect-introducing merge requests from
historical fault reports in four C++ repositories at one company. They compared diff-only,
parent-function, and two dependency-based slices. In Table 3, for a quantized Llama 3.1 405B
single reviewer, across three runs and before filtering, mean key-bug inclusion was 23.70% for
diff-only versus 37.04% for left-flow context and 39.26% for full-flow context. The authors also
report unique successes for different slices. Their key-bug reference is derived from known
incident/fix histories, not a complete census of every possible review finding.

**Use / limits.** This motivates checking relevant callers, dependencies and contracts rather than
assuming the diff alone suffices; different views can miss different known bugs. It does not show
that a line-by-line map supplies the missing context, that more context always helps, or that
long-context distraction caused the observed differences. Slicing changes content as well as
length; this preprint's selected, loss-causing C++ cases and older model are not representative
of all reviews or this project's agent.

## 3. A review filter can suppress real findings as well as false alarms

**Source:** Lu et al., same [preprint, sections 4.2–5.3 and Table 5](https://arxiv.org/html/2505.17928v2#S5.SS3).

**Design and observation.** In the authors' multi-reviewer pipeline, a validator revisited and
filtered generated comments. With left-flow context and the quantized Llama 3.1 405B setup,
Table 5 reports key-bug inclusion falling from 31.11% to 20.00% and the authors' all-merge-request
false-alarm measure falling from 87.81% to 75.37% when the validator was added. The authors report
that valid bug-detecting comments were sometimes rejected. This is the behavior of a particular
pipeline and its operational metrics, not a universal precision/recall law.

**Use / limits.** Evaluate supported unexpected findings as well as known targets, and distinguish
missed findings from incorrect or irrelevant comments. Keep assessable evidence of filtering or
report compression when available. This does not prove that a focused map, checker, or any
particular existing review stage in this project discarded a finding; nor does it establish that
adding a validator would help.

## 4. Neutral labels do not eliminate judge bias or make a judgment ground truth

**Source:** Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* (2023),
[sections 3.3–3.4](https://arxiv.org/html/2306.05685v4#S3.SS3).

**Design and observation.** For each first-turn MT-bench question the authors generated two similar
GPT-3.5 answers and judged them in both orders. With the default prompt, GPT-4 was consistent in
65% of pairs; 30% favored the first position in both orderings and 5% the second. They propose
swapping order and declaring a winner only if both judgments agree. In a separate small test of
10 math questions, counting two answer orders, GPT-4 accepted an incorrect answer as correct in
14/20 default judgments versus 3/20 with an independently generated reference. The reference
itself was model-generated, not an oracle.

**Use / limits.** For pairwise assessments, neutral IDs, counterbalanced ordering, source-grounded
checks, and explicit disagreement records address different risks. A format can still reveal an
arm, and a consistent or independently generated judgment can still be wrong. These experiments
study chatbot answer preference and math, not code-review finding adjudication; their percentages
must not be applied to the project's assessors. Swapping order can expose instability, not prove
full blinding or accuracy.

## 5. Compare agent changes against the actual baseline and resource budget

**Source:** Kapoor et al., *AI Agents That Matter* (2024),
[sections 2–3 and 5–6](https://arxiv.org/html/2407.01502).

**Design and observation.** The authors compared several coding-agent architectures with
zero-shot, retry, warming, and escalation baselines on a modified HumanEval set of 164 problems
with example tests available; each agent was run five times. Their warming baseline retried failed
examples up to five times with gradually increasing temperature. They reported no significant
accuracy difference between warming and their best agent architecture, while reported inference
costs differed. This setup allows retry feedback from example tests and measures code generation,
not static review.

**Use / limits.** Specify the actual control instructions, model, tools, feedback, stopping rule,
and intended difference; record attempts and report quality separately from elapsed time and
available resource counters. Where an intervention changes both workflow and output contract,
its combined comparison cannot isolate either component. A simple or no-skill baseline answers a
different question from a comparison of modified skills. The HumanEval result does not prove any
particular project arm is redundant, cheap, or better, and unknown billing is not dollar cost.

## 6. Tests, descriptions and prior exposure can each distort evaluation

**Source:** OpenAI, the creator's first-party audit, *Why SWE-bench Verified no longer measures
frontier coding capabilities* (2026),
[audit and disclosed examples](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/).
This is a primary technical report, not a peer-reviewed study.

**Design and observation.** The audit selected 138 of 500 tasks that o3 did not consistently
solve over 64 runs. At least six experienced engineers independently reviewed each, with additional
verification of flagged issues. OpenAI reports material test or description issues in 59.4% of
that selected subset, including tests requiring unspecified implementation details or additional
behavior. Separately, its adaptive 15-turn contamination probes used a model with access to task
IDs, descriptions, gold patches and tests, followed by model judging and manual review of strong
examples; disclosed outputs included task-specific or verbatim details. This is evidence of
exposure risk in those examples, not a clean estimate of contamination prevalence or its effect
on a particular score.

**Use / limits.** Cross-check briefs, source, tests and assessment criteria; preserve ambiguities
and independently examine unexpected findings rather than equating a passing checker or a known
answer with correctness. Separate cases used to develop/select an intervention from genuinely
held-out material; previously unused cases can still have unknown model exposure. The 59.4% figure
is conditional on a hard selected subset and cannot be generalized to all tasks, to code-review
assessments, or to this project's materials. Public availability alone does not establish exposure.

## Overall boundary

These sources motivate testable design choices and cautious assessment, not a revision of the
four-arm findings. In particular, they do not establish the effect of complete versus focused maps,
human cognitive-load mechanisms in LLMs, a winning arm, or a skill-versus-plain-request effect.
No new review-case or evaluation-agent experiments were run for this note.
