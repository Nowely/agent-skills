# The owner's read of skeleton 01 — the stand-in user, 2026-09-24, verbatim, with the decisions it settles

The file read: `skeleton.01.md`, SHA-256 `b062de0cf0d647b96a8a480aa0881932967d0f1e48f5231bde3862e034c4ac31`. The owner is the benchmark's stand-in (plugins/terse/references/benchmark.md). The answer, verbatim from `standin/answers-05.md`. The stand-in's reply also carried a note for the runner, marked not part of the answer; it is not in that file and is kept verbatim in `standin/answers-05-runner-note.md`:

> # Question set 05: my read of skeleton 01
>
> I checked the file's SHA-256 before reading: `b062de0c…c4ac31`, which matches. I read the skeleton's parts 1, 2 and 7. Paths are relative to the snapshot.
>
> ## Sections 1, 3, 4, 5, 6 and 7
>
> **You have my word on these.**
>
> ## Section 2: two places are wrong
>
> 1. **2(d), the MCP block.** Decision 2 is where I don't take the default: I want the alternative.
>    - Put one config block in place of the bare `npx -y maestro-workflow-mcp` fence. Use the `mcpServers` JSON that my MCP README gives for Claude Desktop and Cursor (`mcp-server/README.md:23-32`).
>    - Keep the link to `mcp-server/README.md` for VS Code's `servers` form, the other clients, and HTTP.
>    - Reason: my reader may not know MCP (set 01), and the bare command gives them nothing to do. Typed into a terminal, it starts a server that silently waits for a client. The block is what they paste.
> 2. **2(a), the extension's "Writes into your project" cell.** The cell names the command log. It leaves out the decision log and Zero-Defect's `CLAUDE.md` block.
>    - Name all four writes in short, as the list in 2(c) does.
>    - Reason: readers choose a route by this column, and `CLAUDE.md` is the write that changes their coding agent's own instructions.
>
> ## The decisions
>
> - **1, 3, 4 and 5:** the defaults stand.
> - **2:** I take the alternative (above).
>
> ## Kept against my word
>
> **Both accepted.** The route order stands without the reason I gave for it.
>
> ## Least sure
>
> - **#3 (the MCP hand-off):** the config block settles it.
> - **#5 (the tagline):** the tagline stays whatever the probe shows. It is must-say 1. If readers take it for a development method, fix the paragraph under it, not the tagline.
> - **#2 (the folder-to-tool pairs):** I stand by the ten pairs as I gave them in set 02.
> - **#1 and #4:** I have nothing to add.
>
> ## Departures from the genre's order
>
> **Accepted as listed.**

What it settles:

1. **Not agreed as it stands**: sections 1 and 3–7 have the owner's word; section 2 is changed in two places, so the next skeleton is `skeleton.02.md`.
2. **2(d), the MCP block**: decision 2 goes to its alternative — one `mcpServers` JSON config block as `mcp-server/README.md:23-32` gives it for Claude Desktop and Cursor, in place of the bare `npx -y maestro-workflow-mcp` fence; the link to `mcp-server/README.md` stays for VS Code's `servers` form, the other clients and HTTP.
3. **2(a), the chooser's extension cell**: *Writes into your project* names all four writes in short, as 2(c) lists them — the skills' `SKILL.md` copies, the MCP entry, Zero-Defect's `CLAUDE.md` block, and `.maestro/`'s decision log and command log.
4. **Decisions 1, 3, 4, 5**: the defaults stand. **Kept against the owner's word**: both accepted. **Departures from the genre's order**: accepted as listed.
5. **Least sure**: #3 is settled by the config block; #5 — the tagline stays whatever a probe shows (must-say 1), and a misreading is fixed in the paragraph under it; #2 — the owner stands by the ten folder-to-tool pairs; #1 and #4 — nothing to add.
