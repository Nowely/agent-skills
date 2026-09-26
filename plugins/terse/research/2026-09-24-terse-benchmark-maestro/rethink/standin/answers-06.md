# Question set 06: my word on skeleton 02

I checked the file's SHA-256 before reading: `c7c9a4f7…4c6a2a46`, which matches. I diffed it against `skeleton.01.md`, whose hash is still `b062de0c…c4ac31`.

In part 2, the only changes are the two I asked for:

- **2.2a:** the extension cell now names the four writes in short.
- **2.2d:** the `mcpServers` block of `mcp-server/README.md:23-32` now sits in a `json` fence, preceded by a line naming `claude_desktop_config.json` and `.cursor/mcp.json` (`:21`, `:34`). The link stays for VS Code's `servers` form (`:47`), the other clients and HTTP.

The budgets add up to 1,432.

## The README's sections

**You have my word: sections 1 to 7 of skeleton 02 are the shape.**

## Two corrections to the record, outside the sections

These don't change the shape.

1. **Part 1.1, the A5 block, says I gave my word on "the skeleton's parts 1, 3, 4, 5, 6 and 7".** My word covered the README's sections 1 and 3–7, meaning 2.1 and 2.3–2.7, as `skeleton-read-01.md` item 1 correctly says.
   - I read parts 1, 2 and 7.
   - Parts 3–6 were not put to me, and I have not approved them.
2. **Part 6, the two-names item, says that an extension user who pastes the block gets two entries.** That is stronger than my note.
   - My note was conditional: a duplicate appears "if an extension user also pastes the README's block into a config the extension wrote to".
   - The block goes to `claude_desktop_config.json` or `.cursor/mcp.json` (2.2d). The extension never writes either file: it writes `.vscode/mcp.json`, `.claude/mcp.json` and `.agents/mcp.json` (`maestro-extension/src/adapters/mcp-config.ts:20-27`).
   - So there are two entries only in two cases:
     - a client reads both an extension-written file and the pasted one. That happens in Cursor if it reads `.vscode/mcp.json`, as the comment at `mcp-config.ts:21` says.
     - the block is pasted into `.claude/mcp.json`.
