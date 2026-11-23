# Reading the design

`review.md`, beside `design.json`, holds the references with their roles, the map, the gaps and the decisions. The
layout model and the acceptance list are aids, not gates: the check reads the list when it is there. It also holds the
answers to the check's [candidates](check.md#generated-conditions), under a heading that names them (`- <candidate as
printed>: <the contract's bound that rules it out>`), and the minimal reproduction of any finding a ledger entry with
`"cause": "checker"` says the check itself causes.

## The map

| Design | Project |
|---|---|
| each element | the kit's component and its props (Code Connect where available), or "none" |
| each colour, spacing, radius | the token, or "raw" |
| each text style | the project's type style, or "raw" |

Start from the nearest working screen. Record what has no match when it needs a decision.

## What the design leaves unsaid

Ask about the gaps that matter to the request:

- **States:** hover, focus, active, disabled, selected, loading, empty, error; open and closed; touch where a pointer
  hovers.
- **Data:** the longest and shortest real values, an absent field, zero and many, plurals, localization, numbers.
- **Widths:** the supported component minimum and its contract or owner source, or unknown; the chosen sweep start is
  a test width, not evidence of that minimum. What does the consumer do when the component has less room? Also inspect
  below the narrowest frame, between the frames and above the widest.
- **Consistency:** a spacing off the scale, a type style or colour the system lacks, rows of one kind aligned
  differently.
- **Accessibility:** contrast of 4.5:1 for text and 3:1 for controls, targets of 24 × 24 px, reflow at 320 px.

List each gap that needs a product decision with the proposed behaviour, the alternatives and their cost, and ask
the owner when it changes behaviour or scope. A difference the page shows against a frame goes in the ledger as
`proposed`; a gap no frame shows stays here. An improvement the request does not need is an idea, not a build.

## The layout model

A short table, when the layout is worth predicting: what shares each line, the longest legal value of each piece and
who says so, the width the line needs and what happens below it. Correct it when the sweep refutes it.

| Line and mode | What shares it: longest value, source | Width it needs | Below that width | Construct |
|---|---|---|---|---|
| top row, wide | title (120 characters, API), price ("12 345 678 € / month", owner) | about 690 px | the specs take their own row | grid, `minmax(0, 1fr)` |
| footer, any | availability (60 characters, contract), help icon | about 380 px | the action wraps under the text | `flex-wrap` with `gap` |

Its switch widths can go in `sweep.switches` and its lines in `sweep.lines`, so the sweep measures them
([design.json](check.md#designjson)).

## The acceptance list

What the owner will check, under a heading containing `Acceptance`, `приёмк` or `приемк`, as table rows or list
items: `- item: pass — evidence`. Each line of the owner's past returns (`.design/returns.md`) is a row, quoted. Name where each expected value
comes from (the task, a reference, the owner, the data contract): a value taken from the code you wrote proves only
that the code agrees with itself.

The check reads a `Result` or `Status` column (`Результат`, `Итог`), or else the last; in a list item, the text after
a colon. Leave it empty until observed.

| Result | How the check reads it |
|---|---|
| `pass — <evidence>` | reported success, with what was observed |
| `fail — <detail>` | the check fails |
| `pending — <decision>` | awaits the owner |
| `not checked`, `incomplete — <reason>` | incomplete |
| `N/A — <reason>` | does not apply |

Markers ignore case. A blank, an unrecognised result, a bare `pass` or `N/A` without a reason leaves the check
incomplete. A `Checked by` column of exactly `sweep` (the frames' page) or `sweep.stories` binds the row to that
measurement: its pass needs the measurement to have run, and a finding, an unmeasured part or a pending proposal
there shows in the assessed outcome. A `sweep.stories` row that names stories in inline code (`` `dense` ``)
answers for those; inline code that names no configured story leaves it incomplete.

| Item | Checked by | Result |
|---|---|---|
| Long title clears the action across widths | sweep.stories | pass — the `long-title` story swept from 320 to 640 px |
| Escape dismisses the menu | keyboard journey | fail — the menu stayed visible after Escape |
