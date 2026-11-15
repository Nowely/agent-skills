# Existing code-review solutions: exploratory source review

**Source access:** 2026-11-15. The question is which working tools and practices could inform a
review skill's context gathering, requirements, role boundaries, false-alarm handling and human
control. The unit is a documented product or a specific open-source implementation, not a
comparative run. This complements [external evidence](external-evidence.md), rather than repeating
its studies.

**Selection and assumptions.** Start with well-known PR reviewers and a diagnostic integration,
then add an explicitly documented multi-agent reviewer. The web-search service returned HTTP 403
for general queries; selection therefore relied on known product names and direct first-party
sources, not a reproducible market-wide search. The sample is not exhaustive or representative.
GitHub reported 16,181 stars for [PR-Agent](https://api.github.com/repos/The-PR-Agent/pr-agent)
and 9,743 for [reviewdog](https://api.github.com/repos/reviewdog/reviewdog) at access; these are
interest signals, not active installations or review quality. No comparable adoption count for
the commercial review services was independently established. “Observed” below means source
content inspected, not behavior demonstrated by running a tool. “Inferred” is a design judgment;
“unknown” includes private implementation and untested runtime behavior.

## 1. PR-Agent — open-source AI PR review

**Sources.** [Project and MIT license](https://github.com/The-PR-Agent/pr-agent);
[review implementation at `5f70487`](https://github.com/The-PR-Agent/pr-agent/blob/5f70487378e635009349e8f5d86b2de5321081cc/pr_agent/commands/pr_reviewer.py);
[review prompt at the same revision](https://github.com/The-PR-Agent/pr-agent/blob/5f70487378e635009349e8f5d86b2de5321081cc/pr_agent/settings/pr_reviewer_prompts.toml);
[compression strategy](https://github.com/The-PR-Agent/pr-agent/blob/5f70487378e635009349e8f5d86b2de5321081cc/docs/docs/core-abilities/compression_strategy.md);
[ticket context](https://github.com/The-PR-Agent/pr-agent/blob/5f70487378e635009349e8f5d86b2de5321081cc/docs/docs/core-abilities/fetching_ticket_context.md).
The repository describes itself as the community-maintained legacy project, distinct from the
current commercial Qodo offering; do not attribute one implementation's behavior to the other.

**Observed.** The reviewer obtains PR metadata and diff files through a provider, builds repo and
skill context, and includes extra instructions and related tickets in prompt variables. Its prompt
can enumerate ticket requirements as compliant, noncompliant or requiring human verification. The
prompt explicitly asks for concrete triggers, no unsupported cross-code speculation, and an
explicit rule and source for standards violations; it also treats PR content as untrusted
instructions. It focuses on newly added diff lines and warns the model that surrounding code may be
missing. The documentation describes adding patch context and, under large-input compression,
prioritizing additions and potentially omitting patches. The implementation also has a chunked
path and records partial files and failed chunks; the documentation's compression description
alone does not establish which path every deployment takes.

The prompt provides an optional confidence field, bounded issue count and prior-finding lifecycle
instructions; the implementation tracks chunk failures and can publish successful partial chunks
when fallback attempts fail. These are attempts at grounding, deduplication and explicit partial
state, not evidence that all genuine issues survive. Review and improvement are separate commands;
the inspected prompt/implementation do not establish independent specialized reviewers or a
human plan-approval gate. Ticket or instruction injection is prompt-scoped protection, not a
proven security boundary.

**Inferred application / limits.** Source-linked requirement statuses and visible omitted context
are useful discussion patterns. Diff-only or compressed review is not equivalent to tracing
unchanged callers and preserving all mandatory behavior, especially deletion-only changes. A
bounded list can discard legitimate findings. Actual ticket fetching depends on configuration,
permissions and budget; the docs explicitly describe missing and truncated context. Provider
data handling depends on deployment and model provider; self-hosting alone does not prove local
inference or confidentiality.

## 2. reviewdog — diagnostic-to-review integration, not an AI reviewer

**Sources.** [README and MIT license](https://github.com/reviewdog/reviewdog/tree/87e520d8cd363fdd84386e440f8fcb919662b0d0);
[filter implementation](https://github.com/reviewdog/reviewdog/blob/87e520d8cd363fdd84386e440f8fcb919662b0d0/filter/filter.go).

**Observed.** reviewdog takes diagnostics from external tools, including SARIF and its own
structured format, plus a local diff command or a host integration's diff, and maps results to
local output, PR comments or checks. The configured analyzer supplies the actual rules and code
context, not reviewdog itself. Its filter marks results with `ShouldReport` and diff-location
metadata rather than removing them at that `FilterCheck` stage. The README says the default
`added` mode drops a diagnostic on an unchanged line even in a changed file; `file` or `nofilter`
are alternatives, subject to reporter support.

**Inferred application / limits.** Separate source diagnostics, inclusion decision and reporting
channel; record scope loss instead of calling filtered-out diagnostics false positives. The
location filter reduces noise from unrelated lines but does not establish whether a diagnostic is
true, new or required. This is a useful integration pattern, not a substitute for behavioral,
design or requirement review. It has no documented multi-agent or plan-approval process in the
inspected sources. Local output and remote reporters have different disclosure paths; actual
analyzer behavior and deployment permissions are unknown.

## 3. GitHub Copilot code review — managed product

**Sources.** GitHub's [code review documentation](https://docs.github.com/en/copilot/concepts/agents/code-review)
and [application card](https://docs.github.com/en/copilot/responsible-use/code-review).
The product is commercial; its review implementation, prompts and license terms for that
implementation were not independently inspected.

**Observed.** GitHub describes review of PR diffs and metadata, relevant repository context and
custom instructions. Its agentic context gathering uses Actions runners; if unavailable or failed,
the review continues with more limited features. Skills and instructions can be read from the PR
head branch; exclusions include some dependency-management files and SVGs. GitHub states that
model output can miss defects or report nonexistent ones and should be checked by humans. Review
effort choices include multiple models at Max, but the documentation does not specify independent
specialist roles or how candidates are validated and reconciled. By default reviews do not count
toward required approvals; an explicitly enabled Copilot approvals feature can satisfy them.

**Inferred application / limits.** Distinguish “review completed” from “full context gathered,” and
make exclusions visible before claiming complete coverage. Reading review criteria from the head
enables testing changes to instructions but also means a PR can change what guides its own
review; the examined documentation alone does not establish all mitigations. Neither user
approval of a plan nor preservation of all requirements is guaranteed by the stated review
workflow. Private prompts, selection/filtering, review accuracy, actual context and data retention
for a particular deployment remain unverified.

## 4. CodeRabbit — managed review and separate custom checks

**Sources.** Vendor's [architecture overview](https://docs.coderabbit.ai/overview),
[path instructions](https://docs.coderabbit.ai/configuration/path-instructions),
[code guidelines](https://docs.coderabbit.ai/knowledge-base/code-guidelines), and
[custom checks](https://docs.coderabbit.ai/pr-reviews/custom-checks). These describe a
commercial service; its core implementation and license terms were not verified.

**Observed.** The vendor describes parallel specialized review and verification agents, plus
separate chat, pre-merge and post-review functions. This is a documented architecture, not an
independently inspected execution trace. Path instructions and detected guideline files supply
criteria; configured path filters and default exclusions define what gets reviewed, and can affect
checkout. Its separate custom-check agent has changed files, PR discussion, search, sandboxed
inspection and potentially linked issues and authorized MCP context; it returns pass, fail or
inconclusive. A missing required linked repository is explicitly an inconclusive case in the
documented check. The check cannot run the test suite or modify the review.

The guideline documentation reports applied and skipped sources but also describes guideline
budgets and circumstances where sources or extracted rules are omitted. Review guidance,
custom checks, and test generation have distinct configuration scopes. Verification is a
vendor-described false-positive mitigation; no independent rate was established. Neither
custom-check success nor loaded instructions proves every binding behavior was preserved.

**Inferred application / limits.** Separate finding discovery from a criterion-oriented check,
retain inconclusive and missing-evidence states, and explicitly track which rules reached each
role. Do not copy default exclusions or treat a skipped guideline as fulfilled. Human
plan-before-action approval is not established by these sources; read-only custom checks and
user-triggered post-review actions are different controls. Runtime context, actual role
independence and suppression errors are private or untested.

## 5. Anthropic Claude Code Review and local `/code-review`

**Sources.** [Managed Code Review](https://code.claude.com/docs/en/code-review),
[review customization](https://code.claude.com/docs/en/code-review-customize),
[local command](https://code.claude.com/docs/en/code-review-local), and
[plan mode workflow](https://code.claude.com/docs/en/common-workflows#plan-before-editing).
The managed service is commercial. The inspected local documentation says the bundled skill is
built in and has no on-disk `SKILL.md`; the products' complete review implementations and license
terms were not inspected.

**Observed.** The managed service describes parallel agents examining the diff and surrounding
code, a verification step, then deduplication, severity ranking and posting. It reads but does not
build or execute the reviewed code, and posts comments and a non-failing check rather than
approving or blocking merge. Its `REVIEW.md` guidance is supplied to both finding and verification
agents and consulted when writing the final review; its source branch and accepted exclusions
depend on branch protection. The docs say review-only instructions come from base or default,
never the PR's own changes, and identify limits and cases where instructions are skipped. These
are documented intended safeguards, not proof each stage follows every rule.

The separate local command reviews a selected branch, range, path or PR, defaults to a report,
and uses `CLAUDE.md`, not the managed service's `REVIEW.md`. `--fix` or `--comment` requests
additional action, with edits governed by the active permission mode. Anthropic separately
documents plan mode as reading and proposing a plan without edits until approval. That is an
interactive coding-agent workflow, **not** evidence that every managed review asks the user to
approve a review plan.

**Inferred application / limits.** Supplying the same binding criteria to discovery, verification
and synthesis is a concrete role-handoff pattern; record missing guidance rather than silently
presuming it applied. Requiring evidence for a finding does not justify suppressing unresolved
requirements or design judgments. Separate review, approval of edits, and posting permissions;
do not equate a PR approval with approval of a plan. Actual agent independence, filtering
decisions, complete context, retention and outcome quality were not observed.

## Cross-cutting questions for discussion

1. **What is binding, and who receives it?** Compare PR-Agent's explicit ticket-status fields
   with Anthropic's documented forwarding of review instructions to discovery and verification.
   For a proposed skill, consider preserving source, status, contradictions and missing evidence
   across every role and final synthesis. This is an inference, not a demonstrated guarantee.
2. **How should context loss be represented?** PR-Agent describes compression and partial chunks;
   reviewdog filters by location; GitHub and CodeRabbit document exclusions or reduced context.
   A complete review claim should be conditional on the requested scope actually being covered.
3. **Where should verification sit?** Anthropic and CodeRabbit describe verification; PR-Agent
   requests concrete triggers and can apply confidence thresholds. A separate role can provide a
   second check but can also suppress valid candidates. Preserve unresolved candidates and their
   evidentiary status where appropriate; do not infer independence or improved quality from a
   diagram.
4. **What needs user authorization?** Report-only review, posting findings, applying fixes and
   approving a PR are distinct actions. Claude's documented plan mode is a relevant opt-in
   precedent for discussing edits, not a universal property of automated reviewers.
5. **What is outside this sample's remit?** The inspected tools tend to prioritize defects, rules
   and PR feedback. They do not establish an equivalent to a complete connected-code design
   assessment, a lossless line map, or proof that removal of a mechanism preserves requirements.
   These are questions for a future design and evaluation, not evidence that any tool lacks them
   in every configuration.

No review agent, benchmark, product trial, or independent accuracy measurement was run. Commercial
claims, private internals and actual production behavior remain unverified; documentation and
moving product features may change after the access date.
