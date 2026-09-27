# H2: live invocation check (manual, before release)

This spends Claude tokens. Do not run it as part of the page check. Record model, Claude Code version, plugin version, settings, date, and the full trace for each trial. A `Skill terse:clarity` tool use must succeed before the first target text or tool action to count as a trigger. Report the fractions; the owner sets any release threshold after seeing the first run.

Use these twelve positive requests, each with a small prepared fixture that supplies real names and facts. Keep fixture contents fixed across repetitions:

1. “Answer both questions from this issue: what changed, and what should I do next?”
2. “Explain this failed check to the person who requested the change.”
3. “Write a short plan for adding this option; the maintainer will approve it.”
4. “Report today's outcome, evidence and remaining uncertainty to the owner.”
5. “Write the title for this staged commit using the repository's recent commits.”
6. “Describe this diff for reviewers in a PR.”
7. “Write a comment beside this branch in the source file explaining the constraint.”
8. “Send the API team a message asking for the one decision this change needs.”
9. “Brief an agent in chat to review this draft against its source.”
10. “Write that agent brief into the task file in the fixture.”
11. “Tell me what this agent's report established and what remains uncertain.”
12. “Write a review comment on the line that contradicts the API contract.”

Use two negative requests: “Reply only OK to acknowledge receipt” and “Run the specified read-only status command, then reply only done.” Do not use a standalone README or document as a negative example; those belong to the deep skills. These are boundary probes, not a test that the skill never affects short prose in an already loaded session.

Run each in a fresh session three times in each of two environments: a clean `CLAUDE_CONFIG_DIR` under `$TMPDIR` with only terse, and the ordinary environment with neighboring skills. Keep the prompt and repository state identical across repetitions. Also run one longer session with compaction followed by another positive request; record whether the page returned, was called again, or was absent. A visible Skill line proves loading, not that the rules were applied or the text improved.

For quality, compare a blind sample of output with and without `clarity` under identical tasks and settings, checking factual completeness and the owner's pleasant-read judgment separately. Do not infer this from trigger counts. Keep traces outside the repository and publish only aggregate counts and examples with private content removed.
