# Results

## Completion and failure

Use the native host's completion signal and read the agent's return. An integration's adapter
defines its report paths, exit codes and liveness checks. A missing return is unknown, not proof
that no side effect occurred: inspect any operations that may have run before retrying.

Continue unfinished work once with its concrete error when the task and rights remain the same.
A rejected prerequisite or a gate verdict needs a decision, not a blind rerun. If the agent asks
for broader scope or rights, follow [approvals.md](approvals.md). Report a worker that stays blocked
or failed and preserve its evidence; do not silently replace its answer with your own.

## A worktree agent's harvest

The coordinator decides when a reviewed result lands, within existing authority; if the plan did not
authorise landing it, it proposes the concrete harvest and waits for that decision. A worker applies the
harvest: it inspects the actual diff, untracked artifacts and any authorised commits, and transfers
them, since a preserved tree alone does not prove the result was transferred. The verifier then checks
the combined tree, including inputs absent from an isolated worktree.

## Writers collided

Stop the writers, restate the shared contract, let each owner repair only its own files and have
an agent that wrote neither verify the combined tree. Avoid checkout-wide operations while
another writer or a command it started still uses the checkout.
