# Step 5 of the driver audit: the measurements that spend tokens

The owner said go on 2026-10-09: run here what this container can run, and write a prompt for what needs the
owner's machine. The measurements are 09-proposal-v2.md's step 5 (in `../2026-10-08-driver-audit/`), plus the two
that step 4 left open (`11-implementation-notes.md`, "Step 4").

| Measurement | Settles | Where |
| --- | --- | --- |
| A. What `init` reports for each permission mode and tool set | the exact Claude effect check | here, Haiku |
| B. Which edits under `acceptEdits` Claude Code makes unasked (`.git`, `.claude`, out of the root) | the Claude half of c1 8 | here, Haiku |
| C. Stop on a background Bash `--run` | whether a relay-less route can be stopped (E102's signal half) | here, Haiku |
| D. The relay with its steps only in `agents/proxy.md` | decision 7: whether the pasted block can go | here, Haiku, 6 runs |
| E. OpenCode V1: the rules a session reports, and an edit in a read session | step 4's rule read-back, and V1's enforcement | the owner's machine |
| F. OpenCode bash patterns allowing a read-only set, redirects included | X7's exit-7 half | the owner's machine |
| G. A network-denied Codex command: does it raise a request? | decision 1's premise | the owner's machine |
| H. `auto=` on macOS under entrust 0.26 or later | whether the Codex file-change auto-accept still fires | the owner's machine (macOS) |

The container has `claude` 2.1.295, signed in, and no `codex`, `opencode` or `bwrap`, so the Claude Code Bash
sandbox (part of B in 09) cannot run here either. Results: [01-results-here.md](01-results-here.md); the probes
for the owner's machine and the prompt that runs them: `04-opencode-probe.mjs`, `05-codex-probe.mjs`,
[06-prompt-for-the-owner.md](06-prompt-for-the-owner.md).
