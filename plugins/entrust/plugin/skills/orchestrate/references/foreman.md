# Coordinator role

A foreman is one subagent that executes the agreed plan: it briefs and launches workers, arranges
independent verification, handles failures and returns one consolidated report. The parent owns
the user conversation, changes to the plan, new authority and the final synthesis. This is a role,
not another skill.

## Assigning the role

Use it when grouping several workers reduces coordination work and the host allows nested agents.
Reserve slots for the coordinator and its workers; if nested delegation is unavailable, keep the
role in the parent and run the same plan there. Name that allocation in the approved plan.

Give the coordinator the approved plan, relevant user authorisation, corrected split, task-specific
skills or references, artifact locations, writable roots and the runtime's constraints. Its return
goes to the parent; it has no authority to publish or address the user on the parent's behalf.

## Running the plan

Write each brief from the corrected split, with concrete inputs, ownership and what done looks
like. Use the host's delegation, continuation and completion facilities; use an integration's
adapter only for workers that actually require it. Group independent workers within the agreed
capacity; keep a shared prerequisite with one owner.

Continue a worker to correct its own work; launch a fresh agent to verify it or retry a different
approach. A failed worker gets one continuation with the error before the coordinator reports
the unresolved failure. A worker's requested change of task, scope or rights goes back to the
parent as blocked. The parent supplies a decision within existing authority or asks the user;
the coordinator never expands the plan on its own.

## The return

Return the page's five fields. `result` starts with the coordinator's id, actual model and status,
then one line per worker and its status. `evidence` preserves the verifiers' checks, exit statuses
and counts. `artifacts` lists worker outputs and `open` records deviations, missing checks and
findings outside the task. Attribute each finding to its worker, not to the coordinator that
collected it. The parent checks this report and the final synthesis for completeness.
