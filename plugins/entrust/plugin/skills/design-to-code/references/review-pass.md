# The review pass

A second look before handover, by an agent that did not build the work, so that the work is accepted as seen and as
read. It sees what the owner will see, what the check measured and the code, never the builder's reasons: an
implementer that grades its own work skews positive, and talks itself out of the issues it finds.

## When

After the complete check passes or is `pending`, and before handover. One pass, then one round of fixes and a
complete check again. Where no second agent can be started, skip it and say so in the handover.

## How to start it

Start a fresh agent with read-only access to the pack, the page and the diff of the work, and give it the prompt below
with the paths filled in. In Claude Code, a subagent; in Codex or OpenCode, a separate session or `exec` run. Do not
give it `review.md`'s reasons, the ledger's reasons or your notes.

## The prompt

```text
You are the owner's reviewer. A component was built from a design. Decide what the owner would return it for.
You did not build it; you have no reason to defend it.

Read only these:
- the design's references: <pack>/frames/*/reference.png (and the dense and many-entries stories have no reference)
- the page's captures from the last complete check: <pack>/out/*/page.png, <pack>/out/*/side.png, the gallery's
  story pictures in <pack>/out/gallery.html
- the check's findings and notes: <pack>/out/report.md (ignore any reasons written beside them)
- the page itself, to open at any width: <page URL>
- the diff of the work: <diff command or file>

The owner's criteria:
- Return for these classes (one example each; find the class, not only the example):
  - a broken relation: a column that no longer lines up, an order or a row that changed;
  - a text or format that reads differently from its frame: "4 × 5587" where the frame draws "5587 × 4";
  - a type of another size: the page's type 10 % or more off the frame's (the check's `type` finding), a price set
    larger than drawn;
  - a short text that wraps while the card has room for it on one line ("wraps with room"): a price on one line and
    its period on the next ("₽ /" | "месяц" always; "₽" | "/ месяц" unless the whole price is wider than the card), a
    value and its unit, a label;
  - an overlap, cut or covered text, a text cut with an ellipsis that nothing lets a person read in full (no title,
    accessible name or tooltip), data silently dropped;
  - an overlay cut by the window: a popover that opens above a card near the page's top and does not flip;
  - an interaction that does not work.
- A construct (a negative margin, a transform moving text, a fixed height around content that grows) is a note that
  needs its reason: fix it, or give the reason in the handoff. Name each you see as "reason needed", not a return by
  itself, unless it breaks one of the classes above.
- Look where returns hide: open the dense and many-entries stories at the narrowest width the product supports (the
  sweep's `from` in design.json), and each overlay with its opener near the window's top and bottom edges.
- Do not return for: a moderate, systematic difference the system explains: an offset of 12 px or less, or a drift
  up to 24 px carried from the pieces before (a token gap where the frame measures a few pixels more or less, the
  kit's own component size, another font's widths); a stand-in icon; a collision the check found only under its own
  generated conditions (texts longer than the product's, rows doubled), unless legal data shows it too.

Read the diff and answer six questions, yes or no, each with a file and line:
1. One rendering path for each thing shown, no duplicated view (such as two price views)?
2. Do observers and listeners follow the mounted element, and are they cleaned up on unmount?
3. Is the kit's public surface used, not its internals?
4. Does no later rule override an earlier one for the same mode, and no selector reach outside the component?
5. Is what the layout hides still available to a screen reader?
6. Which lifecycles can the consumer cause (mount and unmount, data emptied and refilled, a parent's width changing),
   and does a journey in design.json take each, or its `"lifecycle"` reason hold?
A "no" is a note for the owner with its place, not a return by itself.

For each finding: the frame or story and width, what you see, by how much, and "fix" or "acceptable". Be concrete;
do not invent what you cannot see. End with RETURN or ACCEPT.
```

## After it

Fix each "fix", run the complete check, and hand over. In the handover, list the review's findings with what you did
about each, and each "no" of the six questions with its place. A finding you disagree with is not dropped: say why,
for the owner to decide.
