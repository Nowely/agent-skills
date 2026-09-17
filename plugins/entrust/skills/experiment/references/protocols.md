# Protocols registered first

Five experiments the 2026-09-17 research round left as hypotheses, each with the six protocol fields the page requires and the one thing it cannot show. A run fills what a protocol leaves blank, the material above all, and records the filled protocol as its own `protocol.md`.

## E1 Width: one Sol against thirty-four Luna

**Hypothesis.** Thirty-four Luna agents, one bounded claim each, verify a set of claims at least as correctly as one Sol agent over all of them, at fewer tokens per correct claim; on raising findings beyond the claims, Luna is worse.
**Arms.** A: one `gpt-5.6-sol` read agent over all thirty-four claims, its verdicts in a table it leaves as an artifact, since `result` holds thirty lines. B: thirty-four `gpt-5.6-luna` read agents, one claim each, in the bulk row at `low` effort. C: thirty-four Luna, then one Sol over the claims Luna returned as `unknown`.
**Material.** Thirty-four claims of the bulk unit's shape, one claim, one address, a verbatim quote, a closed-set verdict, over a frozen document set; the ground truth written by the coordinator before the run and shown to no arm.
**Metrics.** Correctness per claim against the ground truth; tokens and paid turns per arm and per correct claim; findings raised beyond the claims, each verified independently; for C, the escalation rate. Thirty-four claims is under fifty: the difference carries an interval.
**Judge.** A cross-family strong reader with the ground truth, or the user; the returns' first lines removed and the arms lettered.
**Budget and stop rule.** One Sol turn; thirty-four Luna turns; a second Sol turn for C. The run stops if an arm's material is found wrong before any verdict, and the experiment is re-registered.
**What it cannot show.** Anything about deep or dependent work: the claims are bounded by design, and the controlled evidence against mixed teams is about deep search.

## E2 Cascade: cheap first with a trust rule

**Hypothesis.** A cascade, the cheap tier first and the strong tier only on the units the cheap tier returns as `unknown`, reaches the strong tier's correctness at fewer tokens per correct unit than the strong tier alone.
**Arms.** A: Sol alone over all units. B: Luna over all units, Sol over those returned `unknown`. C: Terra in place of Luna in B.
**Material.** The same bounded units as E1 or a fresh set of the same shape with ground truth; the closed verdict set includes `unknown`, and the brief says when to return it.
**Metrics.** Correctness per unit; escalation rate and the correctness of the escalated units; tokens per arm and per correct unit.
**Judge.** As E1.
**Budget and stop rule.** One Sol turn for A; the cheap tier at `low` effort plus one Sol turn over the escalated units for B and C.
**What it cannot show.** A trust rule for a unit shape it did not run: the rule is measured for the closed-set unit, not for prose.

## E3 The standing advisor against per-call advice

**Hypothesis.** A standing advisor thread consulted at every decision point of a run changes no decision that per-call advice at the same points would not, and costs more.
**Arms.** A: the run under the advisor command, the advisor consulted at the split, the composition, each verdict and each stall. B: the same run with a fresh top-row agent asked once at each of the same points. C: the same run with no advice.
**Material.** Two matched tasks, a review and a design, frozen with their acceptance checks; the coordinator records every decision point before consulting anyone.
**Metrics.** Decisions changed by the advice, with the outcome of each; unique coordinator incidents by stage with their severity; owner corrections; tokens and paid turns per arm and per accepted outcome.
**Judge.** The user, over the recorded decision points and the outcomes; a cross-family reader for the acceptance checks, the arm named, since a run's synthesis names its agents.
**Budget and stop rule.** The advisor's turns counted against the arm; the run stops when the tasks reach their acceptance checks or the cap.
**What it cannot show.** Whether the advisor pays on a task longer than the two chosen; the record says how long they ran.

## E4 Swarm coordination: none, shared state, free messaging

**Hypothesis.** On a unit set larger than the agent count, a swarm coordinating through a shared queue drains the set with fewer duplicated units and no loss of per-unit correctness against one agent per unit; free messaging between agents adds nothing a queue does not.
**Arms.** A: one agent per unit, sharing nothing, the swarm skill's default. B: half as many agents as units, each claiming a unit by making a directory of its name under a queue in the temporary directory and writing its result beside it. C: as B, with one messages file every agent may append to and reads before each unit.
**Material.** Fifty bounded units of E1's shape over a frozen document set, the ground truth hidden.
**Metrics.** Correctness per unit; units done, duplicated and left; tokens and paid turns per arm and per correct unit; for C, messages written and the units whose verdict changed after a message was read.
**Judge.** As E1; the reducer's tally is checked by one return read whole.
**Budget and stop rule.** Fifty Luna turns for A; twenty-five agents for B and C, each taking units until the queue is empty; the run stops when the queue is empty or the cap is reached.
**What it cannot show.** Anything about units that depend on each other; the units are independent by construction.

## E5 A mixed team on one deep task

**Hypothesis.** One deep task given to a mixed team of one Sol and four Luna at once reaches its acceptance check no more often, and at more tokens, than the same task given to Sol alone.
**Arms.** A: Sol alone. B: one Sol and four Luna at once, split by the coordinator as the task allows.
**Material.** One deep task with an acceptance check written before the run, run twice per arm on two matched instances.
**Metrics.** The acceptance check per instance; tokens and paid turns per arm and per passed check; coordinator incidents by stage with their severity.
**Judge.** The acceptance check, run by an agent that wrote nothing; the arm named, since the check reads the tree.
**Budget and stop rule.** B capped at twice the tokens A spent; the run stops at the cap or the check.
**What it cannot show.** Whether a different split of the same task would have helped the team; the split is the coordinator's and is recorded.
