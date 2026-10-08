# Implementation notes: where the steps depart from 09

Each departure from [09-proposal-v2.md](09-proposal-v2.md) made while implementing it, and why.

## Step 2

- **`OUTPUT_SCHEMA:` keeps each adapter's default.** 09 made the five-field schema the default everywhere, Codex
  included, in prompt-file mode. A Codex prompt with no schema then fails every plain answer at exit 13: the fake
  app server answers prose unless it is sent a schema, and 62 launcher cases alone run such prompts. The gain was a
  default the shared page makes moot: it tells every coordinator to name the five-field schema. So the defaults
  stay (Codex none, OpenCode and Claude five-field) and the page states the one instruction.
- **No `RIGHTS:` line reads in the current directory everywhere,** in place of 09's "left out only under a plan".
  Codex already read; OpenCode and Claude refused. Reading is the narrowest grant, the directory is the one
  `--new` checked (X4), and a coordinator that writes nothing needs no line. Unified in `resolveRights`.
