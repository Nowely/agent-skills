# PR description

Start with a recent well-received PR in this project, the diff, and any repository PR convention. Learn what its reviewers need first; do not copy headings just because the example had them. Use the diff and relevant checks as the evidence.

Reviewers use a PR description to decide whether the change is coherent, what to inspect, what it changes for users, and what evidence supports it. Say what changed, from what to what where that distinction matters, and why the change is worth taking. Name consequential checks and their limits. If a reviewer must choose between real alternatives, give the options and your recommendation as described in [where the reader acts](../rules.md#where-the-reader-acts).

Do not require the same sections for every PR or list local and CI counts merely to fill space. Do not hide a real compatibility consequence under “cleanup”; do not call a private script breaking merely because a line changed. Put the consequence and action in proportion to the affected readers. Include a rollback or migration detail when the reviewer needs it to approve or operate the change.

## Example

Before: `This PR improves reliability. Tests pass.` After: `A failed upload now leaves the previous file in place. I exercised the failure branch locally; CI is pending.` This is an illustration, not an observed owner verdict.
