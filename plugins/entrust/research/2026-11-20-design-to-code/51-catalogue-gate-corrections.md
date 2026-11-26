# Corrections to the blocked-handoff gate record

An independent verification of the frozen first submission and raw session records corrected the [gate report](50-catalogue-blocked-handoff-gate.md). The [registration](49-catalogue-gate-registration.md), first submission, its archives and the original report commit remain historical records; this note supersedes the affected statements in the report.

## Handoff completeness

The completed component reviewer told Terra before its final answer that the standalone story had no dialog handler and the dialog was checked on `index.html`. The message reached the builder at 13:22:49.128 UTC; its final answer at 13:23:05.111 UTC said the Details journey passed but did not tell the owner that standalone Details was unconnected. Thus the handoff **did not fully convey a known coverage limitation**. Passing Details on the consumer does not establish standalone behavior. The independent post-freeze check found the missing `#sheet` in both the original and submitted story; the gap is pre-existing in this fixture and is not established as a product regression.

## Helper accounting

The first, interrupted review helper made **four calls of its own**: one `exec` reading `review-pass.md` and three `wait_agent` calls. Four earlier parent calls were inherited into its rollout and were incorrectly counted as its own in report 50. The raw record does not show that this helper itself read the task, component or consumer. Its interruption reason remains unknown. Its recorded token figures remain 3,068 uncached input, 173,184 cached input and 154 output, including 21 reasoning tokens; these figures are reported separately and are not a claim about billing or deduplicated context.

The second helper's automatic-review Guardian was `codex-auto-review` at `low`: six observed decisions, all `allow`. Its raw usage was 109,420 input tokens, including 91,136 cached and 18,284 uncached, and 760 output tokens, including 326 reasoning tokens. Report 50 omitted this telemetry. The observed records now total, by arithmetic, 368,975 uncached input, 4,129,792 cached input and 18,015 output tokens across the builder, two helpers and this Guardian; 5,240 reasoning tokens are included in output. These are raw per-thread readings, not billing totals: inherited or overlapping context may be counted more than once, and other overhead may be absent or unknown. They must not be compared as a deduplicated cost measurement.

## Freeze and isolation limits

The first task-complete timestamp precedes the observer snapshot by about 48 ms. The snapshot and 44/44 archive comparison cover regular files observed in the arm, excluding `.skill`, `node_modules` and `.git`; symlinks and other non-regular entries were not compared. They establish neither the complete tree's state at the exact completion instant nor the absence of an escaped process or an unobserved transient write. The arm's registered originals and installed skill were checked separately before launch, as recorded in report 50.

The session had filesystem read access beyond the arm. The inspected calls showed a memory-registry search with no matches, but do not prove that every possible external access or information leak was absent; encrypted messages and unobserved execution are limits on the audit. No judge or reference-implementation read was observed in the inspected calls. The owner decision remains unknown.
