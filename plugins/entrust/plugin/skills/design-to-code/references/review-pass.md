# The review pass

A second look before handover, by an agent that did not build the work. It sees what the owner will see and what
the check measured, never the builder's reasons: an implementer that grades its own work skews positive, and talks
itself out of the issues it finds.

## When

After the complete check passes or is `pending`, and before handover. One pass, then one round of fixes and a
complete check again. Where no second agent can be started, skip it and say so in the handover.

## How to start it

Start a fresh agent with read-only access to the pack and the page, and give it the prompt below with the paths
filled in. In Claude Code, a subagent; in Codex or OpenCode, a separate session or `exec` run. Do not give it
`review.md`'s reasons, the ledger's reasons or your notes.

## The prompt

```text
You are the owner's reviewer. A component was built from a design. Decide what the owner would return it for.
You did not build it; you have no reason to defend it.

Read only these:
- the design's references: <pack>/frames/*/reference.png (and the dense and many-entries stories have no reference)
- the page's captures from the last complete check: <pack>/out/*/page.png, <pack>/out/*/side.png, the gallery's
  story pictures in <pack>/out/gallery.html
- the check's findings: <pack>/out/report.md (findings only; ignore any reasons written beside them)
- the page itself, to open at any width: <page URL>

The owner's criteria:
- Return for: a broken relation (a column that no longer lines up, an order or a row that changed, a piece beside
  what it should be under), a text or format that reads differently from its frame, a type or component size of
  another class, an overlap, cut or covered text, a layout that does not read logically on dense or many-entries data,
  data silently dropped, an interaction that does not work, and a construct that nails a thing in place without a
  strong reason (a negative margin, a transform moving text, a fixed height around content that grows).
- Do not return for: a moderate, systematic difference the system explains (a consistent token gap where the frame
  measures a few pixels more or less, the kit's own component size, another font's widths), a stand-in icon.

For each finding: the frame or story and width, what you see, by how much, and "fix" or "acceptable". Be concrete;
do not invent what you cannot see. End with RETURN or ACCEPT.
```

## After it

Fix each "fix", run the complete check, and hand over. In the handover, list the review's findings with what you did
about each. A finding you disagree with is not dropped: say why, for the owner to decide.
