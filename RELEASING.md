# Releasing

One procedure for every plugin in the marketplace. Releases use annotated `<plugin>@X.Y.Z` tags, one tag
namespace for the whole repository, and matching GitHub release notes; never move or recreate a published tag,
and do not publish from an unclean tree. The entrust series starts at `entrust@0.16.0`; the seventeen
`codex-delegate@*` tags before it are the same plugin under its previous name. Why the order is what it is:
[the release-pipeline research at `5f2f3ef`](https://github.com/Nowely/agent-skills/blob/5f2f3ef/research/2026-09-26-release-pipeline/03-proposal.md).

## The order

A release is made on the PR's branch: the work, its measurements and reviews, the plugin's conditional checks, the
version and the notes all land there before the merge. Once the PR is merged, only publishing is left: the tag and
the GitHub release.

1. **The candidate is ready on the branch.** Product work, measurements, reviews and the conditional checks finish on
   the PR's branch before the version is set; work done inside a release window is product work the window hides.
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
   - A check that spends tokens — a live session, a live gate, a trigger run — is proposed to the owner with what
     it would show and what it costs, and runs only on their word; one not run is named in the package.
   - When the release changes what a session shows, propose a fresh session loaded from the candidate
     (`claude --plugin-dir plugins/<plugin>/plugin`), not from the installed copy, confirm its version, and exercise the
     changed behaviour.
   - When the release changes a path, a brief or a procedure the other plugin uses, run one real example through
     the other plugin.
4. **One word for the package.** Show in one message the versions, the diff, the notes, which conditional checks
   ran and why, and that the agent merges. The owner's word covers push, PR, squash merge, tag, release, and the
   local update when the message lists it. Any change to the tree after the word voids it: show the package again.
5. **CI on the PR is the full run.** Push the branch, open the PR, and wait for `gh pr checks <n> --watch`. Suites
   run locally while the work is under way and are not repeated once CI is green on the same tree. A red run
   stops the release.
6. **Merge and compare the plugin's tree.** `gh pr merge <n> --squash --match-head-commit <head>`, `<head>` being
   the commit the word approved. Then `git fetch origin` and, with `<merge>` from `gh pr view <n> --json mergeCommit`,
   confirm that `git diff --stat <head> <merge> -- plugins/<plugin> CLAUDE.md RELEASING.md .claude-plugin` prints
   nothing: a squash merge folds in whatever landed on main under the PR, and another plugin's commit there changes
   the whole tree without touching the release (entrust 0.21.0: a terse commit under #28). A difference inside
   those paths means main moved under the plugin, and the release stops. CI on main after the merge is not waited
   for: it repeats the run the PR already had.
7. **Tag, check, publish.** `git switch --detach <merge>`, tag it with
   `git tag -a <plugin>@X.Y.Z -m '<plugin> X.Y.Z' <merge>`, run the plugin's tag check from its section, then
   `git push origin <plugin>@X.Y.Z` and
   `gh release create <plugin>@X.Y.Z --verify-tag --title '<plugin> X.Y.Z' --notes-file <notes>`. Confirm with
   `gh release view <plugin>@X.Y.Z --json isDraft,body,url` that it is published, not a draft, with the notes as
   its body; a tag alone is not a published release. Return with `git switch main && git pull --ff-only`.
8. **Update this machine** when the word covered it: `claude plugin update <plugin>@nowely`, which refreshes the
   marketplace itself, and confirm the installed version with `claude plugin list`.

## entrust

- **Version**: `plugin/.claude-plugin/plugin.json`, the `metadata.version` line of every `plugin/skills/*/SKILL.md`,
  and the driver's `VERSION`. `node evals/package.test.mjs` from `plugins/entrust` fails naming the one missed.
- **Tag check**: `node evals/package.test.mjs` from `plugins/entrust` compares the version against an
  `entrust@` tag on `HEAD` and announces itself as skipped before one exists.
- **After a Codex CLI upgrade**, or when `codex --version` differs from the driver's `PINNED_CODEX`: follow
  plugin/README.md › After a codex upgrade first, then run the live fidelity gate,
  `ENTRUST_LIVE_TURN=1 node evals/fidelity.test.mjs --require-live`. It spends one real turn; inspect every
  fixture/live difference, keep the fixture emitting what the live server emits, and record its lines in the notes.
- **Live orchestrate gate**, `ENTRUST_LIVE_ORCHESTRATE=1 node evals/orchestrate-live.test.mjs`, when the release
  changes a skill page, the agent file, the launcher or the driver, a model, effort or cap, a path or a right, or
  follows a Codex CLI or Claude Code upgrade. It spends real sessions and a Codex turn. Add
  `ENTRUST_LIVE_ORCHESTRATE_DELEGATE=1` after a Codex CLI upgrade: it spends a second turn on a probe that invites
  the agent to delegate. Keep the artifact directory its last line prints with the release notes. A failed case
  blocks the release, and a skipped case is not a pass: the summary names it. Record the codex-cli and Claude Code
  builds used.
- **Notes**: add the codex-cli and Node versions the release was measured with, and the open entries of
  `plugins/entrust/ISSUES.md` as known issues.

## terse

- **Version**: `plugin/.claude-plugin/plugin.json` and `metadata.version` in all four `plugin/skills/*/SKILL.md`
  files; keep them equal.
- **Tag check**: `jq -r .version plugins/terse/plugin/.claude-plugin/plugin.json` prints the tag's `X.Y.Z`; terse has no
  package suite.
- **Pages**: after any edit to a page, `node plugins/terse/evals/pages.test.mjs` checks relative links and anchors,
  the shared run-directory line, frozen digests, skill frontmatter and versions, README Skills rows, and skill-page
  links to genre notes; CI also runs the rewrite scripts' selftest by path.
- **Clarity trigger**: when `plugins/terse/plugin/skills/clarity/SKILL.md` or its discovery metadata changes, on the
  PR's branch before the version is set, follow `plugins/terse/evals/clarity-trigger.count.mjs` with 20
  hand-labelled sessions, `plugins/terse/evals/clarity-trigger.live.md`, and
  `node plugins/terse/evals/clarity-trigger.official.mjs --run`. The live and official runs spend Claude tokens and
  stay out of CI. Record model, Claude Code version, settings and trigger fractions; the owner sets the release
  threshold after the first run.
- **Cross-plugin**: terse's briefs launch entrust agents, so an entrust release that changes how an agent is
  launched runs one terse brief through it before its tag.
