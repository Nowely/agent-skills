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
- **`usage` is not in the report core.** 09 had Codex add `usage` beside `tokenUsage`. The three CLIs report
  usage in three shapes (Codex's per-thread totals, Claude's raw `input_tokens`, OpenCode's `{input, output}`), so
  one name over three shapes would invite a coordinator to compare what does not compare. The core is the 14
  shared fields plus `adapter`, `error`, `rights` and `requestedModel`.
- **The budget keeps Claude's wall clock.** 09 named three parts for every adapter; Claude's stream is silent while a
  long command runs, so an idle bound would cut a long build. Claude gets the volume bound (1,000 tool calls) and a
  wall clock that stands still during approval waits; an idle bound waits for a live measurement.
- **The shared page is about 2,300 words, not 900.** It is written for a coordinator that has read no adapter page,
  on any host (the owner's constraint in [10-decisions.md](10-decisions.md)): each step is an action with its
  command, each host term is explained in its host's section, and the tables a model reads at the moment of need
  (the nine lines, the exit codes, the budget) are whole. So a Codex call now reads the Codex page (about 2,000
  words, from 2,900), its approvals page (about 300, from 580) and the shared page: some 4,600 words against 3,500
  before. A Claude or OpenCode call reads the shared page in place of the Codex page and its approvals, which it
  needed for the block and the accept. The cuts that would bring the Codex path back under its old length are on
  the Codex page's own text, which step 3 takes.
- **One launcher path.** Every page names `<orchestrate>/scripts/agent-run.mjs`; the Codex page resolves
  `<orchestrate>` through its own `${CLAUDE_SKILL_DIR}`, since a reference page read as a file substitutes nothing.
  The orchestrate boundary test now admits a host's tool names inside a section headed for that host, and only
  there.

## Step 3

- **The Codex worktree reconciliation stays.** 09 dropped it with the policy reader and the counters (medium
  confidence), on the claim that `/entrust:cleanup` already lists the driver's trees. It lists them and removes
  none: its own text tells the user that "the driver reconciles and removes these itself on its next worktree run".
  Without the reconciler a SIGKILLed driver's clean tree would stay until removed by hand, and E139 asks for the
  other adapters' trees to become visible, not for the Codex ones to lose their cleanup. So it is kept, and the
  gain of that row is about 60 lines smaller.
- **`expectCommand`, `codexHome`, `approvalsAutoDeclined`, `childUsage` and `tools` stay in the reports.** The
  injection case shows through `expectCommand` that a hostile `EXPECT:` value stayed one value, and it names the
  pattern behind an exit 5; `codexHome` is how a reader finds the isolated home; OpenCode's auto-decline count
  routes its exit, `childUsage` is described on its parity page, and `tools` is the only record of the reads its
  evidence rule counts.
- **The Codex page keeps its rules, and the Codex call path stays longer than before step 2.** After step 3 a
  Codex call reads its page (about 2,040 words), its approvals page (about 290) and the shared page (about
  2,360): some 4,700 words against 3,500 before step 2. What is left on the Codex page is its own composition,
  rights, field and prompt rules; cutting further would remove rules, not repetition. The gain of steps 2 and 3
  is the other way round: a Claude or OpenCode call no longer reads the Codex page, and every call reads one
  description of the steps.
- **In numbers.** The Codex driver is 4,015 lines, from 4,922 in `main` after step 2; the OpenCode adapter's
  scripts 1,798, from about 2,200; the Codex `--help` 80 lines, from 170 (370 under `--help-all`); the
  launcher's `--help` 65, from 142, with 23 more under its `--help-all`.

