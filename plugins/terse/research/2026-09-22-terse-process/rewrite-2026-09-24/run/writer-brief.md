# Writer brief — skeleton route, with an audit

Quoted from `plugins/terse/skills/rewrite/references/bake-off.md` at `78c17ef`: what is sent first, lines 78–80; the block, lines 83–98; the angles, lines 35–40. One placeholder is filled in the block: `<FILE>` is `00-original.md` of the run directory, the README as it stands (byte-identical to `plugins/terse/README.md` at `78c17ef`). In the block, "the skeleton above" is part 1 of `brief.md`, copied there from `skeleton.md`. `<ANGLE>` is filled per writer from the three angles below.

## Sent to each writer, in order

1. `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2/brief.md`, whole — the page: "send the parts assembled in Step 2 of the skill — the whole skeleton first, every section's purpose, what it excludes, its word budget — then this:"
2. This block:

```
Write the whole of /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T//terse/runs/20260924-002235-terse-readme-rewrite2/00-original.md against the skeleton above, section by section: each section's purpose is
what it buys the reader, its exclusions are not yours to restore, and its budget is a design decision,
not a limit to fill. Your angle is <ANGLE>.

Do not modify the repository. Write your draft into your own temporary directory and name the path.

THE ACCURACY FLOOR: every statement about behaviour must be true of the code in this checkout, and
you must record which level of evidence it reached — the line resolves, the code says this, or you
made it happen. A claim about a lifecycle at level 2 is a guess; run it.

CHECK:
a) For each sentence about behaviour, the level and the command or line.
b) What the skeleton's purpose asked for that you could not write, and why.
c) List what you were tempted to cut and kept, because it is a condition, a limit or a warning at a
   point where a reader decides.
d) Report the word count against the budget.
```

## `<ANGLE>` — the three angles

The brief is identical for every writer; only the angle differs. Which angle wins is worth recording
across runs, because nothing here has been measured yet.

- **Repair-first.** Start at the failures. Change as little else as possible.
- **Path-first.** Rebuild the route a reader walks through the document, then repair the failures on it.
- **Frame-first.** Rebuild the opening — what this is, when you need it — then repair the rest.

## Coordinator's choices

1. **Angle and model per writer.** The page sets three writers, one angle each, and leaves the pairing open. On models: "Claude agents by default. When the `entrust` plugin is installed, give one writer and one judge to Codex" (bake-off.md:26–27).
2. **The draft's path.** The block says "Write your draft into your own temporary directory and name the path" and has no slot for a path you name per writer. Naming one means putting it in place of "your own temporary directory", which changes the page's words; the block above keeps them.
3. **How "the skeleton above" resolves.** It resolves when `brief.md` is sent inline, before the block. Sent as a path to read, "above" points at nothing.
4. **Part five on this route.** The skeleton-route block does not mention part five. The audit-route block's lines on it — "Fresh readers have been measured against the current file and their failures are in part five. They are the point of this exercise. A rewrite that improves prose without repairing those failures has done nothing." (bake-off.md:53–55) — and its CHECK a), "For each measured failure, name what you changed and where." (bake-off.md:66), are not in the skeleton-route block. The page does not say whether a writer on this route, with an audit, gets them.
5. **Intermediate drafts.** The skeleton-route block does not ask for them. The audit-route block does — "Keep each intermediate draft as a separate file; name them 01-reader-pass, 02-writing-pass, 03-prerequisite-pass, and the final result last." (bake-off.md:47–49) — and the page's reason for them stands after the skeleton-route block (bake-off.md:101–104). Part 4 of the brief asks for the prerequisite inventory to be kept either way; where the writer writes it is not said.

## The coordinator's choices, 2026-09-24

1. Angles and models: repair-first — Claude Opus; frame-first — Codex Sol (the `entrust` plugin is installed); path-first — Claude Sonnet.
2. The draft's path: `candidates/<writer>.md` in the run directory, named per writer in the message, in place of "your own temporary directory"; the block's words are otherwise kept.
3. "The skeleton above": `brief.md` is sent as a path to read whole before the block; the words become "against the skeleton in brief.md".
4. Part five is sent (it is in brief.md); the audit-route sentence on it is not added to the block.
5. Intermediate drafts are not asked for.
