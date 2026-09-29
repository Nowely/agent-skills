# Composition and rights

Generated from [codex/SKILL.md](../../codex/SKILL.md) by `evals/fragments.mjs`: edit the source, then run `node evals/fragments.mjs --write`.

<!-- fragment codex-composition 1: ../../codex/SKILL.md, ## Composition -->
## Composition

Apply all six rules:

1. Announce the composition **before** starting any Codex run, naming the count and which agents are Codex; a
   read agent's rights need no sentence, since nothing is being approved.
2. Treat refusal as composition: for “no codex” or “just you”, run zero Codex agents and say the resulting
   panel is all-Claude and shares one model bias.
3. Attribute every finding; if a Codex agent failed or returned nothing, say so and never backfill it with
   a Claude answer.
4. Knowing the answer is not a reason to skip a requested second opinion.
5. Never add allow-rules on the user's behalf.
6. Compose from the Codex status the codex page printed as it loaded: a `CODEX=` line and, when it reads
   `ready`, one `MODEL=` line per model the account lists.
   - `ready`: every Codex agent's `MODEL:` is a listed short name. A model the user, a page or a tier names
     that is not listed is taken by the nearest listed one below it in Astra, Sol, Terra, Luna, or above it
     when none is below, and the plan says in one clause who stands in for whom.
   - `signed-out`, `missing`, or `MODEL=none`: zero Codex agents; the plan's first line says Codex is not
     signed in, not installed, or lists no model, and that the panel is all-Claude and shares one model bias.
   - `unchecked`: compose by the other rules, and the plan says Codex was not checked. A launch is no check:
     a signed-out server lists Astra and Sol too (measured 2026-09-29).
   - The command itself in place of those lines was not run: run it with the Bash tool before composing.

   The status lines stay with you: the plan names Codex's state only where it changed the composition.

| What the user says | Composition |
| --- | --- |
| “no codex”, “just you” | zero Codex agents |
| nothing | panels, refutation, competing designs: one dissenting Codex agent; mechanical fan-out or one ordinary task: zero |
| “a codex agent”, “one of them codex” | exactly one |
| “half codex” | half the agents, rounded up |
| “mostly codex” | every agent except the coordinator |
| “only codex”, “all codex” | every agent, including a one-agent task |
| “two of five codex” | exactly as stated |

A dissenting agent pays for decorrelation; mechanical fan-out does not. “Only codex” means Codex does the
task while the coordinator orchestrates and checks it.
<!-- /fragment -->

<!-- fragment codex-composition 2: ../../codex/SKILL.md, ## Rights, through the paragraph after its table -->
## Rights

Choose the smallest `RIGHTS` that can complete and check the work:

| Prompt header | Codex may | Settle first? |
| --- | --- | --- |
| `RIGHTS: read [<dir>]` or no header | read any readable path, reach the network, run commands, write `$TMPDIR`; the sandbox bounds what the agent does itself: a command it cannot run there is offered to you and, approved, runs as you with no sandbox, and a file change not shown to lie inside its writable roots is declined at once, which makes the run exit 6; each is recorded in `escalations` | no |
| `RIGHTS: worktree <repo>` | write in a driver-managed detached tree | say that a worktree will be made |
| `RIGHTS: write <dir>` | write under the live directory | yes; this chooses the blast radius |

`$TMPDIR` is granted at every level and `/tmp` at none; a write agent adds each settled `WRITABLE:` root
to what its row names. Every output path a `TASK:` names lies under the agent's writable roots: a write outside them is refused. The driver refuses a server whose sandbox answers differently.
<!-- /fragment -->
