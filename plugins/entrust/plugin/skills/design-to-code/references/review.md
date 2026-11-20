# Reading the design

Before the first product edit, write `review.md` in the pack: what the design maps to in the project, how its parts
relate across widths, what it leaves unsaid, the options where the build had to decide, and the acceptance list the
work is checked against before it is called done. A design is a drawing of some states at some widths; the code has
to decide the rest.

## The map

| Design | Project |
|---|---|
| each element | the existing UI-kit composition and its props, using available Code Connect mappings when useful, or "none" |
| each colour, spacing, radius | the token, or "raw" |
| each text style | the project's typographic style, or "raw" |

An element with no component and a value with no token are the places a build drifts from the design and from the
rest of the product: name them.

## How the parts relate

A few lines, from the frames, the existing component and its consumers: which groups move together; which edges line
up across rows (a value under its heading); what wraps, truncates or grows in height when its content or a neighbour
grows; where each conditional action goes and what it may never cover. Say which of these the frames show and which
you inferred. Build the layout from these relationships, not from the frames' coordinates.

## What the design leaves unsaid

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

List a gap only where the build had to decide something. For each, say the default built and two or three options
with what each changes for the user and costs to build. Ask the owner only where the options change behaviour or
scope; keep building the rest. A design error with an evident fix, such as a wrong word form, is built fixed.

The ledger is for differences the page shows against a frame: a fixed word form, the kit's badge, a default that
departs from a drawing. Those go there as `proposed`, with the same options. A gap no frame shows, such as a hover
state, stays in `review.md`. An improvement the request does not need is an idea: list it with its gain and cost,
do not build it.

## The acceptance list

What the owner would check, written before building and run before saying done. Each line says how it is checked
and, at handoff, its result with its evidence:

| Item | Checked by | Result |
|---|---|---|
| every supplied reference, each state and width | its frame in `design.json`, or by eye in the gallery with the reason no frame fits | pass, or what remains and why |
| the dense story | `sweep.stories` and its pictures | no collision, no covered control |
| every popup, menu and sheet | pointer: open it, move into it, leave it, see it closed; touch: tap it open and closed; the keyboard | the result of each |
| every action | it works and the state around it survives a resize | |
| the owner's past returns, when the project keeps them (`.design/returns.md`, or its agent notes) | how each was checked | |

A reference no line covers is how a missed state reaches the owner. A line not run is reported as not checked.
