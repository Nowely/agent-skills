# Review report v6 — historical verification

Historical results for the v6 renderer at the revision identified below. They do not describe or verify the current HEAD.

Version at the time: **0.41.0**. Canonical renderer:
`plugins/entrust/plugin/skills/review/scripts/page.mjs`.

## Implementation

Implementation paths are relative to `plugins/entrust/plugin/skills/review/scripts/`;
test paths are relative to `plugins/entrust/`.

| Contract | Location | Result |
| --- | --- | --- |
| M6 | `page.mjs:1420` | Neutral editorial overview; verdict, recommendation and grounds together; change context closed; no label column or colored rails. |
| M7 | `page.mjs:1769` | Purpose file units and selection marks, disabled empty purposes, short evidence banner, one counting-method disclosure. |
| M8 | `page.mjs:903–958`, `page.mjs:1994` | Explicit findings-only remainder list, answers before digests, labeled copy text, single copy-status channel. |
| M9 | `page.mjs:977`, `page.mjs:1511`, `page.mjs:1596`, `page.mjs:1819` | Plain settled answers with Edit; deferred still awaiting choice; idea absence warning removed; section-wide screen/weight caveats; saved-comment instruction only in export. |
| M10 | `page.mjs:29`, `page.mjs:103` | 1600px canvas; 90ch choice measure; code uses the full canvas. |
| M11 | `page.mjs:1665–1738` | One header, metadata disclosure, comment and anchor per block; fragments counted on existing `pre` nodes; closed no-JS block details. |
| Counters | `page.mjs:1071`, `decisions.mjs:90`, `labels.mjs:575` | Same `choiceStats` result throughout; fact counts say “without an answer”, status counts say “entries”. |
| Tests | `evals/review-report.test.mjs`, `evals/review-report-v5.browser.mjs` | Existing unit-test names and browser entrypoint retained; v6 expectations, grouping, counters, wide geometry and subtraction added. |

M11 groups runs by their owning block **within each file**, preserving first-occurrence order and
fragment order. Inspection showed B40's two runs are separated by other blocks within the same hunk:
adjacent-run-only grouping would leave duplicated headers and anchors. All 6740 rendered diff lines
are preserved (1100 context, 4043 added, 1597 removed).

## Subtraction

The same enriched copy of a private review, rendered by pre-v6 `062cf5e9` and the final renderer:

| Measurement | Before | After | Delta |
| --- | ---: | ---: | ---: |
| `page.mjs`, bytes | 164570 | 163796 | −774 |
| HTML, bytes | 7710698 | 7628406 | −82292 |
| Static/no-JS DOM elements | 102296 | 101418 | −878 |
| Runtime initial DOM elements | 7625 | 7523 | −102 |
| Runtime full-map DOM elements, related-code disclosures closed | 102105 | 101227 | −878 |
| Map headers | 1517 | 1470 | −47 |
| B anchors | 1470 | 1470 | 0 |
| Rendered diff lines | 6740 | 6740 | 0 |

Final coverage: **1470 blocks / 1517 fragments / 96 files**. B40 has one header and two fragments.
Pointer resizing was measured independently: **238 → 308px**, reload restores **308px**.

## Choices and affordance

An independent fresh-state browser scenario measured:

| State | Mandatory remaining | Q / F / I / fact / deferred / done | Q2 unit |
| --- | ---: | --- | --- |
| Fresh | 11 | 4 / 7 / 4 / 6 / 0 / 0 | active |
| Q2 keep, children pending | 10 | 3 / 7 / 4 / 6 / 0 / 0 | active |
| Q9–Q11 accepted | 10 | 3 / 7 / 4 / 6 / 0 / 1 | done |
| Q2 base | 10 | 3 / 7 / 4 / 6 / 0 / 1 | done, children not applicable |
| Reset Q2 and reload | 11 | 4 / 7 / 4 / 6 / 0 / 0 | active |

Computed choice legend: **14px / 650 / rgb(27, 34, 48)**; consequence text uses that same
foreground. The choice strip is **746.45px**, within the **793.64px** prose column.
Direct `#b40` navigation opens one block containing two fragments and one comment.

## Node suites

Final focused run: **3/3 Node entries pass**:

- `review-report.test.mjs`: **72/72**.
- `review-eval.test.mjs`: **27/27**.
- `package.test.mjs`: **21 pass**, one skipped release-tag check (HEAD is not a release tag);
  version-unity checks pass at 0.41.0.

Full command:
`node --test plugins/entrust/evals/*.test.mjs scripts/skills.test.mjs plugins/terse/evals/pages.test.mjs`.
The broad run reports **42/46 Node entries pass**, four fail:

| Entry | Result |
| --- | --- |
| `agent-run.test.mjs` | D6 fails because the launcher refuses write rights inside `~/.codex`; 72 other cases pass. |
| `conformance.test.mjs` | No usable Codex CLI installed for conformance. |
| `opencode-owner.test.mjs` | One startup-timeout case fails; standalone recheck also returns 16/17. Its implementation is unchanged; root cause not investigated in this task. |
| `scripts/skills.test.mjs` | Existing `review/references/report-data.md` has five sections after line 100 missing navigation links in its first 100 lines. Seven other checks pass. |

All other requested entrypoints pass: adapter-status, advisor, agent-contract, attach-pasted,
capture-check, claude, cleanup, cli, fidelity, fragments, gate-checks, lint-draft, lock, main-proxy,
opencode, orchestrate-live (live opt-in skipped), orchestrate, package, prepare-feedback, protocol,
review-eval, review-report, status, swarm, worktree, and terse/pages.
The Claude live opt-in case is also skipped.

## Browser acceptance

The final renderer is fixed at `198c11c9`; browser checks run with `playwright-core`, separate
persistent profiles and real PDF extraction through `pdfjs-dist`.

| Browser | Checks | Console/page errors | Owner PDF bytes | Auditor PDF bytes |
| --- | ---: | ---: | ---: | ---: |
| Chromium | 211/211 | 0 | 2852274 | 6617683 |
| Yandex | 211/211 | 0 | 2848843 | 6608206 |

- All five tabs at **320, 390, 768, 1024, 1366, 1440, 1600, 1920, 2560px**: **0 overflow**.
  CSS 200% zoom: **0 overflow** on all five tabs.
- At 1920px: outer canvas **1600px**, code layout **1568px**, diff **1300px** after the keyboard
  tree resize to 254px.
- Tree: **96** rows in both modes; file and directory `white-space: nowrap`; list mode uses the same
  rows through `display: contents`; keyboard resize **238 → 254px**, persisted. Config 0 stays disabled
  with no selected checkmark. **576/576** reveals and **96/96** scrollspy samples pass.
- Complete token walk in both themes: **32692 tokens + 20220 gutter values** per theme; minimum token
  contrast **4.584:1**, minimum gutter contrast **4.67:1 light / 4.591:1 dark**, zero below 4.5.
- Map: **1470 headers/comments/anchors**, **1517 fragments**, zero duplicate IDs including after
  lazy materialization and related-code disclosures. No-JS: **101418 DOM elements**, all **1470**
  block-code disclosures and **96** file disclosures closed, every fragment present.
- Owner PDF includes choices, screenshots and coverage limits; auditor PDF text includes all
  **1470 B addresses**, none missing. Grouped owner related-code disclosures: **572/572** open.
- Q2, defer-without-reason, reset/reload, facts versus verification, optional ideas, annotations,
  legacy catalogs, deep links, all-tab export parity and deterministic render pass.

The v5 filenames were retained as the existing acceptance entrypoint; these results tested v6.

## Integrity and limits

The prototype and original record were only read. The measurements describe the enriched copy, not
additional evidence about the underlying change.

Headless browser zoom is tested with CSS `zoom:2`; native browser zoom and an unprompted human
acceptance exercise are not claimed. Existing record warnings about unavailable quoted source
attachments are not repaired by rendering.

The pre-existing `report-data.md` navigation failure is outside these edits: that file is unchanged
from the starting `9d8d5f29`. The broader agent suites also require a usable Codex CLI and reject
write access to the checkout under `~/.codex`.

## Commits

- `ae7a58ea`: finish M6–M9, retaining the valid interrupted edits.
- `42531c0b`: M10 wide canvas and readable prose.
- `a258025f`: M11 block grouping.
- `5f01d8b7`: group nonadjacent runs by owner, preserve anchors, closed no-JS blocks and source subtraction.
- `852050ba`: distinguish unanswered requests and status-entry counts.
- `998aef11`: v6 unit/browser acceptance.
- `ef2f09b1`: unreleased 0.41.0 changelog, M1–M11.
- `1659966a`: count fragments on existing `pre` elements; net-negative DOM guard.
- `d0440ffe`: browser assertions distinguish blocks from fragments and grouped print disclosures.
- `198c11c9`: constrain subtab strip, one-line directories and inactive empty-purpose styling.
