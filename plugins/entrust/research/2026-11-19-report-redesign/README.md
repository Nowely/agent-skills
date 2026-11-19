# Review report redesign: a clickable prototype (2026-11-19)

Research for the `entrust:review` page, not a change to it. The prototype redraws the report from the same
`review.json` and saved diff, with the review skill's own modules. `page.mjs` and the data contract are untouched.

**The owner's goal:** a diff of any size can be inspected conveniently, easily and simply, in one pleasant,
consistent interface. Decisions keep their sub-tabs, and a decision card gives access to its context. A comment
on a decision is the «Other» answer to its choice. The Code tab's filters and file tree get simpler, and the
Overview's graph tiles give way to something you can use.

**What it shows:**
- Four tabs (Summary, Decisions, Code, Details) in one frame: a main column, and a side panel with the context of
  whatever is selected.
- Code as a continuous diff. Kept code folds, and a framed note sits on each block that needs a decision. j / k
  step through open items, and you can comment on any line.
- Variants plus «Other — your own answer» on every decision.
- One units table in place of the graph, which stays as an optional view.

See [02-brief.md](02-brief.md) for the brief and [03-notes.md](03-notes.md) for the details: what changed per
tab, the components, what was dropped, measurements and open questions.

## Open

Open `run38.html` (a real review: 86 blocks, 35 files) or `themed.html` (the review suite's fixture with
decision variants and a conditional child) in a browser. They are offline and standalone. Keys: `j` / `k` next
or previous open item, `/` filter files, `c` comment, `1`–`4` tabs, `?` help.

## Rebuild

From the repository root, with Node 22:

    R=plugins/entrust/research/2026-11-19-report-redesign
    node $R/prototype/build.mjs <run-38 record>/review.json $R/run38.html
    node $R/prototype/build.mjs "$(node $R/prototype/tools/themed.mjs)" $R/themed.html
    node $R/prototype/build.mjs <big record>/review.json big.html

`build.mjs` takes a record and reads its saved diff beside it, as `report.mjs render` does. It finds the review
skill's modules from its own place. `tools/themed.mjs` builds the fixture record under the temp directory and
prints its path.

The two other records are not in the repository. The run-38 record is the trial-run review behind
`run38.html`. The big record is synthetic: 274 blocks of made-up verdicts over the PR #102 diff
(`git diff 012475e 9dfe0ba` without the vendored Shiki bundle). Its page is about 2.6 MB, and the Shiki pass
takes about 13 s.

Self-check: `node $R/prototype/selfcheck.cjs [folder with the pages]`. It needs Playwright with Chromium. It
checks console errors, j/k, decisions shared between Code and Decisions, the side panel, line comments and the
1024 px layout. If `big.html` is in the folder, it also checks timings on the big record. Screenshots and the
result go to a temp folder.

## What it does not do

- Decisions and comments live in page memory only. There is no export, print profile or no-JavaScript fallback.
- Defer asks no reason, and an evidence answer counts as settled. The contract says otherwise for both.
- There is no source popover, and the prototype's own words are English only.
- Code outside the diff cannot be expanded or commented on.
- Below 860 px the layout stacks; it is not designed for phones.

## Files

- [01-audit.md](01-audit.md): the audit of the page before the redesign, and the direction the owner approved.
- [02-brief.md](02-brief.md): the designer's brief.
- [03-notes.md](03-notes.md): prototype v1, what it changes and what it does not do.
- [04-critic.md](04-critic.md): the critic of v1, with six review tasks timed on the current page and on v1.
- [rounds.md](rounds.md): the rounds and their findings.
