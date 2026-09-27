# Commit title

Start with recent commits in this repository and its stated commit convention. Use them to learn the expected voice and scope, not to import an unrelated template. If recent history is unavailable, use the repository’s written convention and the diff; say when the local voice is unknown.

The reader scans history to decide whether a commit matters and where a behavior changed. Name the actual change at that scale; if the local convention includes a reason, give one that explains its value. Keep a project term if it is the exact thing a reader will search for. A larger change may need a body, but the title should still stand on its own.

Do not claim a broader fix than the diff supports, pack several unrelated themes into a generic title, or use a test count as a substitute for what changed. Follow the repository's release and attribution rules where they exist; this note does not create new ones.

## Example

Before: `Improve validation.` After: `Reject duplicate task IDs before saving a run.` This is an illustration, not an observed owner verdict.
