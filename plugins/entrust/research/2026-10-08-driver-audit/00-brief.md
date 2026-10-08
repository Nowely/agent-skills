# Brief: an audit of the external-agent drivers

**Question.** Are entrust's three external-agent drivers (Codex, OpenCode, Claude), the shared launcher and the
proxy as simple as their job allows? Where is there text that does no work, machinery heavier than its use, and
behaviour that differs between adapters for no reason a coordinator should have to know?

**The owner's asks (2026-10-08).**

1. Water: comments, page text and report fields that carry nothing a reader or a coordinator acts on.
2. Unification: one way to call any external agent, so the coordinating agent does not have to think about which
   adapter it is calling.
3. Overcomplication: mechanisms whose cost exceeds what they protect against.
4. The proxy: whether it needs changing, and whether the proxy, rather than the coordinator, should read the
   driver's skill.
5. Rights: the suspicion that a disproportionate share of code, text and attention goes to rights and their
   checks.
6. A critical verdict: strengths and weaknesses, with simplifications and unifications proposed only where they
   pay.

**Scope.** `plugin/skills/{codex,opencode,claude}/scripts/*.mjs`, `plugin/skills/orchestrate/scripts/{agent-run,
drivers,temp-dir,adapters,adapter-status,json-schema}.mjs`, `plugin/agents/proxy.md`, and the pages a coordinator
or proxy reads to call an external agent: each adapter's `SKILL.md` and references, and orchestrate's
`SKILL.md`, `proxy.md`, `main-proxy.md`, `approvals.md`, `plan.md`. At `8b518fc` (entrust 0.27.0).

**Constraints.** Read-only until the owner decides on the proposal. A proposal keeps the launcher's driver
contract unless it shows why changing it pays: `--check-prompt-file`, `--prompt-file … --report-file …
[--approval-dir …]`, the pid line, the mailbox files, the status lines. A defence is not removed for being
large; it is removed when what it defends against cannot happen or costs less than the defence. Evidence is
file:line and, where a claim is about behaviour, a run.

**Method.**

1. Inventory (01): the three drivers side by side, and measured shares of code, comment and rights.
2. Four read-only auditors on Opus, in parallel (02–05): A the Codex driver; B the OpenCode driver; C the call
   path (launcher, proxy, Claude driver, pages) and unification; D rights across the three drivers, against
   analogues.
3. Findings and a proposal (06, 07), each change with its gain and risk.
4. One critic on Opus against the proposal (08); `rounds.md` records the round.
