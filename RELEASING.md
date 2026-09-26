# Releasing

One procedure for every plugin in the marketplace. Releases use annotated `<plugin>@X.Y.Z` tags, one tag
namespace for the whole repository, and matching GitHub release notes; never move or recreate a published tag,
and do not publish from an unclean tree. The entrust series starts at `entrust@0.16.0`; the seventeen
`codex-delegate@*` tags before it are the same plugin under its previous name. Why the order is what it is:
[research/2026-09-26-release-pipeline](research/2026-09-26-release-pipeline/03-proposal.md).

## The order

1. **The candidate is ready.** Product work, measurements and reviews finish before the release starts; work done
   inside a release window is product work the window hides.
2. **Prepare on the PR's branch.** Set the version everywhere the plugin keeps it (its section below), turn the
   CHANGELOG's `## Unreleased` into `## X.Y.Z — YYYY-MM-DD` with any compatibility or breaking-contract notes, and
   commit the bump on its own. Write the notes file from that section:

   ```bash
   awk -v v="X.Y.Z" 'index($0, "## " v " ") == 1 {on=1; next} on && /^## / {exit} on' \
     plugins/<plugin>/CHANGELOG.md > "$TMPDIR/notes-<plugin>-X.Y.Z.md"
   ```

3. **Check what CI does not.**
   - Review the complete release diff; confirm no scratch files or credentials are tracked.
   - Run the plugin's conditional checks (its section below) whose trigger the release hits.
   - When the release changes what a session shows, open a fresh session loaded from the candidate
     (`claude --plugin-dir plugins/<plugin>`), not from the installed copy, confirm its version, and exercise the
     changed behaviour.
   - When the release changes a path, a brief or a procedure the other plugin uses, run one real example through
     the other plugin.
4. **One word for the package.** Show in one message the versions, the diff, the notes, which conditional checks
   ran and why, and that the agent merges. The owner's word covers push, PR, squash merge, tag, release, and the
   local update when the message lists it. Any change to the tree after the word voids it: show the package again.
5. **CI on the PR is the full run.** Push the branch, open the PR, and wait for `gh pr checks <n> --watch`. Suites
   run locally while the work is under way and are not repeated once CI is green on the same tree. A red run
   stops the release.
6. **Merge and compare trees.** `gh pr merge <n> --squash --match-head-commit <head>`, `<head>` being the commit
   the word approved. Then `git fetch origin` and confirm the squash commit's tree is the tree CI tested: with
   `<merge>` from `gh pr view <n> --json mergeCommit`, `git rev-parse <merge>^{tree}` equals
   `git rev-parse <head>^{tree}`. When they differ, main moved under the PR and the release stops; CI on main is
   not waited for otherwise.
7. **Tag, check, publish.** `git switch --detach <merge>`, tag it with
   `git tag -a <plugin>@X.Y.Z -m '<plugin> X.Y.Z' <merge>`, run the plugin's tag check from its section, then
   `git push origin <plugin>@X.Y.Z` and
   `gh release create <plugin>@X.Y.Z --verify-tag --title '<plugin> X.Y.Z' --notes-file <notes>`. Confirm with
   `gh release view <plugin>@X.Y.Z --json isDraft,body,url` that it is published, not a draft, with the notes as
   its body; a tag alone is not a published release. Return with `git switch main && git pull --ff-only`.
8. **Update this machine** when the word covered it: `claude plugin marketplace update nowely`, then
   `claude plugin update <plugin>@nowely`, and confirm the installed version with `claude plugin list`.

## entrust

- **Version**: `.claude-plugin/plugin.json`, the `metadata.version` line of every `skills/*/SKILL.md`, and the
  driver's `VERSION`. `npm test` fails naming the one missed.
- **Tag check**: `node evals/package.test.mjs` from `plugins/entrust` compares the version against an
  `entrust@` tag on `HEAD` and announces itself as skipped before one exists.
- **After a Codex CLI upgrade**, or when `codex --version` differs from the driver's `PINNED_CODEX`: follow
  README.md › After a codex upgrade first, then run the live fidelity gate,
  `ENTRUST_LIVE_TURN=1 node evals/fidelity.test.mjs --require-live`. It spends one real turn; inspect every
  fixture/live difference, keep the fixture emitting what the live server emits, and record its lines in the notes.
- **Live orchestrate gate**, `ENTRUST_LIVE_ORCHESTRATE=1 node evals/orchestrate-live.test.mjs`, when the release
  changes a skill page, the agent file, the launcher or the driver, a model, effort or cap, a path or a right, or
  follows a Codex CLI or Claude Code upgrade. It spends real sessions and a Codex turn. Add
  `ENTRUST_LIVE_ORCHESTRATE_DELEGATE=1` after a Codex CLI upgrade: it spends a second turn on a probe that invites
  the agent to delegate. Keep the artifact directory its last line prints with the release notes. A failed case
  blocks the release, and a skipped case is not a pass: the summary names it. Record the codex-cli and Claude Code
  builds used.
- **Notes**: add the codex-cli and Node versions the release was measured with, and the open `ISSUES.md` entries
  about entrust as known issues.

## terse

- **Version**: `.claude-plugin/plugin.json`.
- **Tag check**: `jq -r .version plugins/terse/.claude-plugin/plugin.json` prints the tag's `X.Y.Z`; terse has no
  package suite.
- **Pages**: after any edit to a page, `node plugins/terse/evals/pages.test.mjs` checks the run-directory line,
  every relative link and the frozen digests; CI runs it with the selftest through `npm test`.
- **Cross-plugin**: terse's briefs launch entrust agents, so an entrust release that changes how an agent is
  launched runs one terse brief through it before its tag.
