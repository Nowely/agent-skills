# Question set 05: my read of skeleton 01

I checked the file's SHA-256 before reading: `b062de0c…c4ac31`, which matches. I read the skeleton's parts 1, 2 and 7. Paths are relative to the snapshot.

## Sections 1, 3, 4, 5, 6 and 7

**You have my word on these.**

## Section 2: two places are wrong

1. **2(d), the MCP block.** Decision 2 is where I don't take the default: I want the alternative.
   - Put one config block in place of the bare `npx -y maestro-workflow-mcp` fence. Use the `mcpServers` JSON that my MCP README gives for Claude Desktop and Cursor (`mcp-server/README.md:23-32`).
   - Keep the link to `mcp-server/README.md` for VS Code's `servers` form, the other clients, and HTTP.
   - Reason: my reader may not know MCP (set 01), and the bare command gives them nothing to do. Typed into a terminal, it starts a server that silently waits for a client. The block is what they paste.
2. **2(a), the extension's "Writes into your project" cell.** The cell names the command log. It leaves out the decision log and Zero-Defect's `CLAUDE.md` block.
   - Name all four writes in short, as the list in 2(c) does.
   - Reason: readers choose a route by this column, and `CLAUDE.md` is the write that changes their coding agent's own instructions.

## The decisions

- **1, 3, 4 and 5:** the defaults stand.
- **2:** I take the alternative (above).

## Kept against my word

**Both accepted.** The route order stands without the reason I gave for it.

## Least sure

- **#3 (the MCP hand-off):** the config block settles it.
- **#5 (the tagline):** the tagline stays whatever the probe shows. It is must-say 1. If readers take it for a development method, fix the paragraph under it, not the tagline.
- **#2 (the folder-to-tool pairs):** I stand by the ten pairs as I gave them in set 02.
- **#1 and #4:** I have nothing to add.

## Departures from the genre's order

**Accepted as listed.**
