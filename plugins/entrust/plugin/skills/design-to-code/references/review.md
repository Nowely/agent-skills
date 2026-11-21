# Reading the design

Before editing the product, identify how to verify the requested change. For a checker pack, keep the acceptance
list in `review.md` beside `design.json`. Record the relevant kit mappings, layout relationships and decisions
where they affect the implementation.

## The map

| Design | Project |
|---|---|
| each element | the existing UI-kit composition and its props, using available Code Connect mappings when useful, or "none" |
| each colour, spacing, radius | the token, or "raw" |
| each text style | the project's typographic style, or "raw" |

Start with the nearest working screen, including its existing interaction and composition. Check the available
component props before adding custom code. Record unmapped elements or raw values when they require a decision.

## How the parts relate

A few lines, from the frames, the existing component and its consumers: which groups move together; which edges line
up across rows (a value under its heading); what wraps, truncates or grows in height when its content or a neighbour
grows; where each conditional action goes and what it may never cover. Say which of these the frames show and which
you inferred. Build the layout from these relationships, not from the frames' coordinates.

## What the design leaves unsaid

Use the following prompts for gaps that matter to the request. Some apply only to interactive, data-driven or
responsive components.

- **States:** hover, focus-visible, active, disabled, selected, loading, empty, error; open and closed for menus,
  popovers and hints; what touch does where a pointer hovers.
- **Data:** the longest and shortest real values, an optional field absent, zero and many, plural forms,
  localization (Russian runs about a quarter longer than English), numbers and currencies.
- **Widths:** below the narrowest frame, between the frames (where each layout starts), above the widest; the
  component's own width against the viewport's.
- **Interaction:** what the first gesture does, what stays selected when an inner control is used, the focus order.
- **Consistency:** a spacing off the system's scale, a type style or a colour the system does not have, rows of
  one kind aligned differently, an icon from outside the set.
- **Accessibility:** text contrast at least 4.5:1, and 3:1 for large text and for controls' boundaries and icons;
  targets at least 24 × 24 px; text that survives 200 % zoom and a reflow at 320 px (WCAG 2.2: 1.4.3, 1.4.11, 2.5.8,
  1.4.4, 1.4.10).

## Options, not silent choices

List gaps that need a product decision. Explain the proposed behaviour, viable alternatives and their concrete
cost. Ask the owner when a decision changes behaviour or scope. Record a proposed correction to a design error
alongside the difference it would introduce.

The ledger is for differences the page shows against a frame: a fixed word form, the kit's badge, a default that
departs from a drawing. Those go there as `proposed`, with the same options. A gap no frame shows, such as a hover
state, stays in `review.md`. An improvement the request does not need is an idea: list it with its gain and cost,
do not build it.

## The layout model

Write it before building, from the design, the code and the data contract; correct it when the sweep refutes it.
Put it under a heading that names it (`Layout model`, `Модель раскладки`): the complete check needs at least one row
unless the page is static. One row per line that holds several pieces, in each layout mode; a component with one line
needs one row:

| Line and mode | What shares it: longest legal value, source | Width it needs | Below that width | What changes in this mode | Construct |
|---|---|---|---|---|---|
| top row, wide | title (120 characters, API limit), six specs ("126.5 m²", fixtures), price ("12 345 678 € / month", owner) | about 690 px | the specs take their own row | — | grid areas, `minmax(0, 1fr)` |
| footer, any | availability (60 characters, data contract), help icon, edit action (owner's listings only) | about 380 px | the action wraps under the text | — | `flex-wrap` with `gap` |
| all, narrow | one column | — | — | body 17 px, badges 26 px tall, the stock icon after its count | a block per group |

A narrower frame is often a different design, not the wide one squeezed: read each frame for the sizes, order and
spacing that change, and write them in the table.

The table goes into `design.json` twice. Its switch widths go in `sweep.switches`, and each line with several pieces
goes in `sweep.lines` (the pieces as selectors in their order, where the line holds as `from`/`to` or the mode's
`when`), so the sweep checks the arrangement on every story, not only collisions. Each risk the table implies (a line
near its limit, a conditional action, an empty value) is a row of the acceptance list, tried at its critical width.

## The acceptance list

Write the applicable criteria before implementation, then record an outcome and evidence for each after checking.
Quote each line of the owner's past returns (`.design/returns.md`) as a row. Name where each expected value comes
from (the task, a reference, the owner's decision, the data contract); a value taken from the code you wrote proves
only that the code agrees with itself. The dense story's row names what it adds: the longest legal values and the
conditional actions it shows together.
A fixed label might need one comparison with the supplied image. An interactive library component may also need
its actual open and close gestures, stable data across widths, and an import from the built package in a consumer
that exercises the shipped styles, images or fonts.

The checker reads table rows and list items under a heading containing `Acceptance`, `приёмк` or `приемк`, including
subheadings. Use a `Result` or `Status` column. It also recognizes `Результат` and `Итог`, and otherwise reads the
last column. In a list item put the result after a colon and a space. Leave the result empty until observed.

| Result in the review | How the checker reads it |
|---|---|
| `pass — <evidence>` or `passed — <evidence>` | Reported success. Name the observation, command output or comparison. The checker cannot authenticate a manual claim. |
| `fail` or `failed — <detail>` | A failed criterion makes the full check fail. |
| `pending — <decision>` | The outcome awaits the owner. |
| `not checked` or `incomplete — <reason>` | The criterion remains incomplete. |
| `N/A — <reason>` or `not applicable — <reason>` | The recorded reason explains why this criterion does not apply. |

Markers ignore case. Separate a detail with a dash, colon or comma. A blank, an unrecognized result, a bare
`pass`, or `N/A` without a reason leaves the criterion incomplete.

In a table the optional `Checked by` column can bind a criterion to a measurement. Use exactly `sweep` for the
frame page's width sweep, or `sweep.stories` for the configured additional stories. These values may be in inline
code. A reported pass for one of these requires the corresponding measurement to run. A measured failure,
unmeasured condition or outstanding proposal remains visible in the assessed outcome. Other methods describe
manual or project checks. Put a separate required width or data check in its own row so omitting that measurement
cannot produce a passing handoff.

A responsive menu's completed acceptance record might look like this.

| Item | Checked by | Result |
|---|---|---|
| Title and action match the supplied image | visual comparison | pass — compared the reference and final menu at 480 px with the same title |
| Long title clears the action across widths | sweep.stories | pass — the long-title story was swept from 320 to 640 px |
| Escape dismisses the menu | keyboard journey | fail — the menu remained visible after Escape |
