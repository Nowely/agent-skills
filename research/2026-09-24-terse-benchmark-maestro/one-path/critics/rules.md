# draft.md against rules.md, rule by rule

Draft: /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-D/writer/draft.md
Rules: /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-bench-D/in/rules.md
Also read: in/purpose.md — needed to check rule 23 (it states the owner's requirements) and, since it
carries file:line citations into the real repo, used to ground rules 18 and 20 without fetching the
forbidden source. genre-order.md not read: rules 7, 10 and 13 already carry their own genre figures
inline in rules.md.

## The reader

1. Holds. Every section maps to a purpose.md requirement: fit-check → opening; install/first-use →
   Quick start; command lookup → Commands; mechanism and contributor notes → How it works /
   Contributing.

2. Holds. No explaining of editor, AI tool, command line or slash command found.

3. Breaks — line 37: "**Any MCP client:** add a server that runs `npx -y maestro-workflow-mcp`…" names
   a protocol (MCP) with no gloss, in Quick start — one of the first two sections, where the rule
   requires every protocol name to be questioned. purpose.md's reader profile states plainly: "I don't
   assume they know what an MCP server … is." For that reader the label is a fact they cannot act on —
   they cannot tell whether the route applies to them. Nothing else in sections 1–2 is questionable:
   `sharpdeveye/maestro` (line 15) and `.maestro.md` (line 26) are both needed for the reader to act.

## The opening

4. Holds. Line 3 gives what it is ("24 slash commands for the LLM workflows you build") and what it's
   for ("Your agent can audit a workflow, fix what the audit finds, harden it for production or cut its
   cost") in its first two sentences. The first clause leans toward a count-plus-category list rather
   than mission language, but purpose.md's own purpose paragraph opens the same way, and the mission is
   stated plainly by the second sentence.

5. Holds. Lines 5–8: four bold-led bullets, each a stated edge (chaining, project memory, restraint
   against over-building, tool breadth).

6. Holds. No question, warning, failure-mode talk, or reference to the document itself in lines 1–8.

## Quick start

7. Holds. "## Quick start" (line 10) is install (14–16, a runnable fenced block) then first use (20–32:
   `/teach-maestro` then `/diagnose`, each shown with what it asks or returns).

8. Holds. One default route (12–32). "Other routes" (34–37) gives the VS Code/Cursor/Antigravity and
   MCP-client alternatives one bullet each, with a link for depth.

9. Holds. Line 18: "To update, run the same command again." — one line.

## The body

10. Holds. All four Commands tables use Command | What it does | Use it when (lines 43–83).

11. Holds. Checked all 24 rows across the four tables — no two rows in any one table repeat the same
    "what it does" or "use it when" text.

12. Breaks — line 18: "every command loads the core one first" restates, in Quick start, the mechanism
    that belongs to How it works (line 87: "Every command except `/teach-maestro` loads it and reads
    `.maestro.md` before it starts"). The skill-loading order is technical detail living outside the one
    section the rule reserves for it — and the two statements disagree (see rule 20).

13. Holds. Section order is What it is (1–8) → Quick start (10–37) → Commands (39–83) → How it works
    (85–93), matching the rule's own genre order. Contributing (97–104) follows as a fifth section;
    purpose.md names its content as a requirement ("It tells contributors that `source/skills/` is the
    only place to edit") and names "people who … come … to contribute" as part of the reader, so its
    placement — last, self-contained — doesn't read as an unexplained departure.

14. Holds. Headings for every section, bold-led bullets throughout, every fenced block carries a
    language (bash/text), tables for the inventory, lists for parallel bullets.

## What never appears

15. Holds. No licence line, no Troubleshooting section, no "Your files" section. "What the skills write"
    is the one line under How it works the rule asks for (line 88).

16. Holds. No dated report lines, measured numbers, or run excerpts. The 1–5 and A–F scales (lines 32,
    46) describe the commands' own output format, not a reported result.

17. Holds. No version pin, no "currently" / "coming soon" / roadmap language; present tense throughout.

18. Holds, as far as checkable without fetching the source (forbidden by the brief). Cross-checked
    against purpose.md's own file:line citations into the real repo: `source/skills/` (line 99) matches
    "Source of truth: source/skills/" (`scripts/build.js:4`); `maestroskills.dev` (line 95) matches the
    site's own "Interactive showcase and documentation" line; `npx -y maestro-workflow-mcp` and its
    npmjs.com link (line 37) match the URL quoted from `maestro-extension/README.md:10`; the marketplace
    `itemName=sharpdeveye.maestro-workflow` (line 36) matches the same source's
    `vscode:extension/sharpdeveye.maestro-workflow`. Not independently checkable from the materials
    given: the ten folder names (line 90), `.maestro/sessions/` (line 82), and the `npm run
    build`/`npm run check` script names (102–103) — nothing available contradicts them, but nothing
    confirms them either.

19. Holds. No section or sentence framed as why the text was written or who asked for it.

## Truth and words

20. Breaks —
    - Line 93: "and ten tools: list and run commands, read the project context, step through phased
      runs, read the logs and add to the decision log" enumerates six items at most (five, if "list and
      run commands" counts as one) against a stated count of ten.
    - Line 18: "every command loads the core one first" (no exception stated) is contradicted by line
      87: "Every command except `/teach-maestro` loads it and reads `.maestro.md` before it starts."
      Line 6 ("every command after it reads them first") shows the draft can state this narrowed
      correctly elsewhere, which is why line 18's unnarrowed "every" reads as an oversight rather than a
      different claim.

21. Holds. No hedged or caveated claims found ("can" at line 3 states an available action, not a
    qualifier on a claim).

22. Holds. No internal/project jargon stands in for the reader's own word; "skill" and "slash command"
    match purpose.md's own reader-profile vocabulary.

23. Holds, to the extent checkable. Every requirement purpose.md states the owner asked for is present
    and accurate in the draft: tool/problem fit (opening), install by the route that fits plus
    `/teach-maestro` then `/diagnose` by name (Quick start — matching purpose.md's own example exactly),
    the command table, links to the Marketplace/npm/maestroskills.dev pages "for depth rather than
    repeating them," and the source/skills/ note for contributors. No false claim traced to a specific
    owner requirement. Bounded by the same restriction as rule 18: the actual repository is off-limits
    for this check, so verification runs only as deep as purpose.md's own citations reach.
