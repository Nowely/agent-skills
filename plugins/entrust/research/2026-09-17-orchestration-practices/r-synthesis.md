# R — merge, audit, mapping and ranking of the four survey returns (Fable R, 2026-09-17)

Subject: `plugins/entrust/skills/orchestrate/SKILL.md` (152 lines) and `plugins/entrust/skills/codex/SKILL.md` (315 lines) at `dff2f0b`, both read whole. Six references under `plugins/entrust/skills/codex/references/` were listed and their headings read, not their bodies: `adversarial-review.md` (37 lines: "Adversarial review prompt"), `environment-and-internals.md` (336: Environment, Observability, The answer log, What is protected, The isolated home, Prompt files and wrappers, The injection limit, Bounding or stopping an agent, Receipt validation, Worktree ledger, Lock design, Git-directory grant, Configuration key oracle), `incidents.md` (223: 28 named incidents), `parity.md` (202: Capability table, Qualifications, Fan-out and reporting, Browser-mode sandbox, Pasted-media handling), `result-gates.md` (86: Bypasses of --expect-command, A failed command is not a verdict, Unknown command verdicts, What --verify can and cannot measure), `why-not-the-plugin.md` (131). Every absence claim below is scoped "not located in the two pages"; where a reference heading suggests coverage, the row says "reference not read".

Inputs read in full: S1 (57,147 B, 60 rows), S2 (30,473 B, 32 + 16 rows), S3 (61,169 B, 80 rows), T1 (56,146 B, 54 incidents + 4 unknowns), C0 `answerJson.result` (27,124 B report). Line references: `O Lnn` = orchestrate page, `C Lnn` = codex page.

**What this document is.** A catalogue, a mapping and hypotheses. Nothing in it establishes that any practice improves the orchestrator's management; a row records what a source measured or said, what the pages say, and what the local record shows. "Would have prevented" never appears as a rank; where a mechanism plausibly bears on a T1 incident it is a hypothesis with a confidence and a phase-3 measurement. Adverse and no-benefit findings are kept. Reducing the orchestrator's context is not a goal here (M1 side finding: the two pages are 2.1 % of the orchestrator's context and agent returns 0.6 %; its own output is 46 %), so page size is not a lever and is not scored.

**Mapping values** (C0's set): `present` = the pages instruct the practice; `partial` = part of it, or a different mechanism aimed at the same failure; `conditional` = the pages have it or avoid it only under a condition the claim does not share (width, mode, rights level); `not located` = not in the two pages as read; `unknown` = no page counterpart is expected (measurement-method claims); `contradicts` = incompatible instructions under the same conditions. For a claim whose direction is harm or no-benefit, `present` means the pages already avoid the practice the source warns against. **Strength** (C0: study design, separate from source type): `CC` controlled comparison (S2-A rows with a comparator; S2-B validity studies tagged `CC-v`); `VE` vendor experience report (`VE-n` when the vendor reports a number of its own); `RA` rationale; `ME` mechanism only (exists; no effectiveness claim).

---

## 1. Audit and dedup

### 1.1 Spot-checks (sources re-fetched 2026-09-17 with curl into the scratch dir; tags stripped, whitespace and quote glyphs normalised, case-insensitive substring match)

| lens row | URL fetched (HTTP 200) | quote checked | result |
|---|---|---|---|
| S2-02 | https://arxiv.org/html/2512.08296v3 (663,762 B) | "all multi-agent variants universally degrade performance on tasks requiring sequential constraint satisfaction (planning: -39% to -70%)" | **matched**, modulo arXiv's MathML rendering each percentage twice (`- 39 % {-}39\%`); the words are verbatim and in order |
| S2-09 | https://arxiv.org/html/2411.04468v1 (267,989 B) | "without the full ledgers, performance drops by 31%" | **matched** verbatim |
| S2-12 | https://arxiv.org/html/2609.04217v1 (456,187 B) | "the full team attains the highest mean but is not statistically separable from the single agent" | **matched** verbatim |
| S3-04 | https://raw.githubusercontent.com/microsoft/autogen/027ecf0a379b/…/_magentic_one_orchestrator.py (22,888 B) | `if self._n_stalls >= self._max_stalls`, `_update_task_ledger`, `_reenter_outer_loop` | **matched**, all three identifiers |
| S3-37 | https://raw.githubusercontent.com/openai/codex/7abf2a3b5cbe/codex-rs/core/src/agent/role.rs (17,881 B) | `built_in`, `DEFAULT_ROLE_NAME`, `"explorer"`, `"worker"` | **matched**, all four |
| S3-71 | https://raw.githubusercontent.com/obra/superpowers/b36e0829c6d0/skills/subagent-driven-development/SKILL.md (32,339 B) | "Five rounds maximum", "four things stop you" | **matched**, both |
| S1-01 | https://www.anthropic.com/engineering/multi-agent-research-system (51,246 B gzip → 205,052 B) | "Teach the orchestrator how to delegate. In our system, the lead agent decomposes queries into subtasks … and clear task boundaries." | **matched** verbatim (after gunzip; the raw response was compressed) |

Extra checks run on the same fetched pages, all **matched**: S2-01 (modulo the same MathML doubling), S2-04, S2-05, S2-06 (2512.08296); S2-10 (2411.04468); S2-11 (2609.04217); S3-05 (`Max rounds reached.`); S3-69 (`fresh implementer`); S1-14, S1-15, S1-16 (Anthropic page). 22 checks, 0 misses. Fetched copies: `/var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/r-merge-YhK7u7/fetch/`.

### 1.2 Merge and dedup

188 lens rows (60 + 48 + 80). Three pairs describe one claim from the same system in two lenses and are **collapsed** into one merged claim each (paper rationale + pinned code): **M1** = S1-32 + S3-03 (Magentic-One progress ledger: five questions before each dispatch); **M2** = S1-33 + S3-04 (stall counter with a small threshold, re-plan when exceeded; S1-51 is the escalation half of the same mechanism and stays a separate stage-7 row, cross-referenced); **M3** = S1-21 + S3-01 (Magentic-One tool-based role catalogue). **185 merged claims.** Duplicate *sources* across lenses (same URL family, different claims) are cross-referenced in the table, not collapsed: Anthropic research system (S1 ×10), Anthropic decision page (S1 ×7), Magentic-One paper (S1 ×4, S2 ×3) and code (S3 ×6), OpenAI Codex docs (S1 ×4) and source (S3 ×7), Claude Code docs (S1 ×1, S3 ×11), LangChain blog (S1 ×1) and LangGraph docs (S3 ×6), Google blog (S1 ×1) and ADK source (S3 ×6).

Measurements reported by one lens that another lens was expected to audit, and did not: **S1-16** (Anthropic +90.2 %; S1 says "comparison design and eval validity belong to lens S2"; S2 has no Anthropic row) and **S1-52** (Magentic-UI asks in 10 % of tasks; S1 says "the accuracy comparison belongs to lens S2"; S2 has no Magentic-UI row). Both stay `VE-n`, un-audited. Numbers in S3 with no stated design (S3-26 LangChain call/token scenarios, S3-36 MetaGPT $0.2/$2.0, S3-66 RuFlo "89 % accuracy", S3-77 OMC "30–50 % tokens") are `VE-n` with "design not stated". Two S1 theme-text claims have no row and were not verified here: "Claude Code states a bulk width band of 5 to 30" and "after two corrections on the same issue, clear and restart" (S1 §(b),(d)).

### 1.3 Disagreements between lenses (same question, different answers; conditions named)

| # | lens rows | disagreement | conditions that separate them |
|---|---|---|---|
| D1 | S1-03, S1-04 (VE) vs S2-14 (CC) | splitting by kind of work (write / test / review) is "often counterproductive" and cost more coordination than work; vs programmer + test-designer split raised pass@1 by 8.6 and 10.5 pp | S2-14: GPT-3.5-turbo, function-level HumanEval/MBPP, two roles; S1-04: four-role pipeline, task and scale unstated |
| D2 | S1-36 (RA) vs S3-40, S3-42 (ME) | Codex subagents cannot be stopped or steered individually; vs `send_message`, `interrupt_agent`, `close_agent` exist | S1-36 is the web sidebar; S3 is the CLI collaboration runtime (S1 itself notes the CLI `/agent`) |
| D3 | S1-16 (VE-n) vs S2-06 (CC) | strong lead + cheaper workers +90.2 %; vs centralized heterogeneous teams −12.6 pp against strong-homogeneous | S1-16: Anthropic internal research eval, breadth-first; S2-06: BrowseComp, 13 mixtures, one benchmark |
| D4 | M3/S1-21 (RA) vs S2-10 (CC) | tool-based agents are cleaner than role-based (untested by the authors); vs removing any one agent costs 21–39 % | same paper; the ablation removes the tool with the role, so it cannot separate the two (S2's own limitation column) |
| D5 | S1-59 (RA) vs S1-29 (VE), S2-29 (CC) | keep one chat per unit of work, it preserves the reasoning trail; vs compaction breeds meandering threads, and every model degrades ~39 % over turns | S1-59 human-driven Codex chats; S1-29 Amp coding threads; S2-29 simulated users, a proxy for agent threads |
| D6 | S2-28 (CC) vs S2-21, S2-24 (CC) | two-round peer critique boosts reasoning; vs debate does not reliably beat other ensembles and depth is insignificant | S2-28 has no equal-cost comparator; S2-21/24 compare at tuned or equal settings |
| D7 | S1-38 (VE) vs S1-39 (RA) | the verification subagent "consistently works well"; vs a strong orchestrator can evaluate directly | same Anthropic page; S1-39 names three exceptions (weak lead, tools, forced checkpoints); S2-37/38 (CC-v) weigh against S1-39 |
| D8 | S1-05, S1-57 (RA) vs S1-38, S1-43 (VE) | share full traces, gate architectures on it; vs a verifier needs minimal context and works because of that | Cognition's cases are co-writers of one artifact; Anthropic/Replit's are black-box verifiers |
| D9 | S1-47 (VE) vs S2-07 (CC) | a single integrator gate was deleted as a bottleneck; vs giving the integrator final say raised success +9.4 % | hundreds of workers vs a ChatDev crew of a handful |
| D10 | S1-14, S3-59, S3-53, S2-05 | width bands differ: 1 / 2–4 / 10+ (Anthropic), 1–2 … 4–5 (wshobson), cap 16 (Claude workflows), optimum 5–7 (S2-05) | different systems and tasks; S2-05 says optima are model- and task-specific, not a capacity rule |

### 1.4 Merged claim list (stable ids; strength; dedup and cross-references)

| id | source (short) | stage | claim (as the lens bounded it) | dir. | strength | dup / xref |
|---|---|---|---|---|---|---|
| S1-01 | Anthropic research system | 1 | brief = objective, output format, tool/source guidance, boundaries | + | RA | xref S1-10, S3-28, S3-68 |
| S1-02 | Anthropic research system | 1 | short topic briefs made subagents duplicate or misread | − | VE | xref S1-07 |
| S1-03 | Anthropic decision page | 1 | split by context boundary, not by kind of work | − | RA | D1 |
| S1-04 | Anthropic decision page | 1 | role-by-phase agents spent more tokens coordinating than working | − | VE | D1; xref S2-11 |
| S1-05 | Cognition | 1 | share full agent traces, not distilled briefs | + | RA | D8; xref S1-57, S3-38 |
| S1-06 | Cognition | 1 | actions carry implicit decisions; conflicting ones give bad results | − | RA | xref S1-25 |
| S1-07 | Cognition Devin | 1 | success scales with specificity of scope and criteria | + | VE | xref S1-02 |
| S1-08 | Cursor | 1 | more agents under an instruction amplify its defects | − | VE | xref S1-09, S3-09 |
| S1-09 | Cursor | 1 | a number range in the brief changes quantity behaviour | + | VE | xref S1-08 |
| S1-10 | OpenAI Codex docs | 1 | Goal / Context / Constraints / Done-when brief | + | RA | xref S1-01 |
| S1-11 | Amp | 2 | cheap search subagent 3× faster at same quality (~8 vs ~2.5 parallel calls) | + | VE-n | xref S3-45; D3 |
| S1-12 | Amp | 2 | advisor of a different lineage; unfit for the main seat | + | VE | xref S1-24, S1-49, S3-75 |
| S1-13 | Amp | 2 | model choice does not visibly change one task; difficulty, context, review do | 0 | VE | xref S2-06 |
| S1-14 | Anthropic research system | 2 | width and tool-call budgets keyed to query class | + | VE | D10; xref S1-15, S2-05 |
| S1-15 | Anthropic research system | 2 | ~4× / ~15× tokens: delegate only above a value threshold | ± | VE-n | xref S3-35 |
| S1-16 | Anthropic research system | 2 | Opus lead + Sonnet workers +90.2 % over single Opus | + | VE-n | D3; un-audited by S2 |
| S1-17 | Anthropic decision page | 2 | specialise on tool-surface signals (20+ tools, domain confusion) | + | VE | xref S1-60 |
| S1-18 | Cursor | 2 | an orchestrator with nine objectives slept, stopped agents, claimed completion | − | VE | xref S1-19 |
| S1-19 | Cursor | 2 | recursive planners owning a slice, not a wider planner | + | VE | xref S3-21 |
| S1-20 | Google blog | 2 | narrow specialists in a pipeline beat one long prompt | + | VE | xref S3-15 |
| M3 (S1-21 + S3-01) | Magentic-One paper + code | 2 | tool-based agent catalogue, not job titles (untested comparison) | + | RA + ME | D4; xref S2-10 |
| S1-22 | Manus | 2 | identical general-purpose instances instead of a cast | + | RA | xref S3-16, S2-19 |
| S1-23 | OpenAI guide | 2 | start every seat strong, demote seat by seat against evals | + | RA | xref S3-70, S2-18 |
| S1-24 | Amp | 3 | the advisor seat is read-only by construction | + | RA | xref S3-56 |
| S1-25 | Cursor | 3 | per-worker repo copy; the handoff is the only channel out | + | VE | xref S3-47, S1-06 |
| S1-26 | Microsoft Research | 3 | least privilege and sandboxing as the default posture | + | VE | xref S1-50, S2-30 |
| S1-27 | Magentic-UI | 3 | gate on reversibility; the principal sets the gate | + | VE | xref S1-53 |
| S1-28 | OpenAI Codex docs | 3 | loosen rights per repo after the need shows | + | RA | xref S3-39 |
| S1-29 | Amp | 4 | compaction breeds meandering threads; prefer focused threads | − | VE | D5 |
| S1-30 | Anthropic research system | 4 | synchronous wait: the lead cannot steer subagents | − | VE | xref S1-36 |
| S1-31 | Anthropic research system | 4 | resume, do not restart; tell the agent its tool failed | + | VE | xref S3-23, S3-51 |
| M1 (S1-32 + S3-03) | Magentic-One paper + code | 4 | five-question progress ledger before each dispatch | + | RA + ME | xref S2-09 |
| M2 (S1-33 + S3-04) | Magentic-One paper + code | 4 | stall counter, threshold 2, then re-plan | + | RA + ME | xref S1-51, S3-71 |
| S1-34 | Manus | 4 | rewrite the plan into the tail of the context each step | + | VE | xref S3-02 |
| S1-35 | Manus | 4 | leave failed steps in the context | + | VE | xref S3-22 |
| S1-36 | OpenAI Codex docs | 4 | the web surface reports activity, cannot stop or steer one agent | − | RA | D2 |
| S1-37 | Claude Code best practices | 5 | bound what counts as a finding or the reviewer manufactures work | − | VE | xref S1-40 |
| S1-38 | Anthropic decision page | 5 | one independent verifier per unit, briefed with artifact + criteria | + | VE | D7, D8; xref S2-04, S3-13, S3-67 |
| S1-39 | Anthropic decision page | 5 | a strong orchestrator may evaluate subagent work directly | 0 | RA | D7; xref S2-37 |
| S1-40 | Anthropic decision page | 5 | verifiers declare early victory without a mandatory scope clause | − | VE | xref S2-08 |
| S1-41 | Cursor | 5 | a 100 %-green gate on every unit serialises a wide team | − | VE | xref S3-67 |
| S1-42 | Replit | 5 | verification must rise with autonomy | + | VE | xref S1-38 |
| S1-43 | Replit | 5 | verifier as its own seat, short plan in, works/broken out, $0.20 median | + | VE-n | xref S1-38 |
| S1-44 | Anthropic research system | 6 | attribution as its own pass after synthesis | + | RA | xref S3-78 |
| S1-45 | Anthropic research system | 6 | return a reference to an artifact, not the artifact | + | RA | xref S3-22 |
| S1-46 | Cursor | 6 | a handoff carries dissent and deviation; can reopen a planner | + | VE | xref S3-68 |
| S1-47 | Cursor | 6 | a single synthesising gate does not survive a wide team | − | VE | D9 |
| S1-48 | LangChain blog | 6 | fan out the reading; one agent writes in one call | + | RA | xref S3-25 |
| S1-49 | Amp | 7 | escalation to the expensive tier left to the human's word | + | RA | xref S3-75 |
| S1-50 | Microsoft Research | 7 | escalate to a human on irreversibility, three-way scale | + | RA | xref S1-27, S1-53 |
| S1-51 | Magentic-One paper | 7 | on a stall, break to a re-plan with a post-mortem, not a retry | + | RA | half of M2; xref S3-65 |
| S1-52 | Magentic-UI | 7 | the agent decides when to ask, carrying the context; asked in 10 % of tasks | + | VE-n | xref S3-24; un-audited by S2 |
| S1-53 | OpenAI guide | 7 | pre-rate tools by risk; the rating triggers the pause | + | RA | xref S3-11 |
| S1-54 | Anthropic building agents | 8 | the floor case is no agent at all | 0 | VE | xref S1-56, S3-25, S3-61 |
| S1-55 | Anthropic research system | 8 | coding is a weaker fit for delegation than research | 0 | VE | xref S2-03, S3-54 |
| S1-56 | Anthropic decision page | 8 | better prompting on one agent matched months of multi-agent work | 0 | VE | xref S2-12 |
| S1-57 | Cognition | 8 | context-sharing as a gate on the architecture | 0 | RA | D8 |
| S1-58 | Cognition | 8 | peer collaboration between agents ruled out (2025) | − | RA | xref S3-49, S2-21 |
| S1-59 | OpenAI Codex docs | 8 | continue the same thread while the problem is the same | + | RA | D5; xref S3-10, S3-48, S3-69 |
| S1-60 | OpenAI guide | 8 | exhaust one agent's tool surface before splitting | 0 | RA | xref S1-17 |
| S2-01 | 2512.08296 | 1 | parallel decomposable work: up to +80.8 % over single agent | + | CC | same study as S2-02..06, S2-42 |
| S2-02 | 2512.08296 | 8 | sequential constraint work: every MAS variant −39 % to −70 % | − | CC | xref S1-55 |
| S2-03 | 2512.08296 | 8 | tool intensity predicts less MAS benefit (β = −0.096) | − | CC | xref S1-55 |
| S2-04 | 2512.08296 | 5 | centralized / iterative verification: 22.7 % mean error reduction | + | CC | xref S1-38 |
| S2-05 | 2512.08296 | 2 | width optimum (Flash 7, Pro ≤ 5); marginal agents not monotonic | 0 | CC | D10 |
| S2-06 | 2512.08296 | 2 | heterogeneous teams −12.6 pp vs strong-homogeneous (BrowseComp) | − | CC | D3 |
| S2-07 | 2503.13657 MAST | 1 | integrator final authority: +9.4 % | + | CC (case study) | D9 |
| S2-08 | 2503.13657 MAST | 5 | structure + verification section in the prompt: +5.0 pp | + | CC | xref S1-40 |
| S2-09 | 2411.04468 | 4 | without the full ledgers −31 % | + | CC (ablation) | xref M1, M2 |
| S2-10 | 2411.04468 | 2 | removing any one agent −21 % to −39 % | + | CC (ablation) | D4 |
| S2-11 | 2609.04217 | 2 | planner and critic prompts evolve to empty; executor carries the value | 0 | CC | xref S1-04 |
| S2-12 | 2609.04217 | 8 | team not separable from single agent at iso-call (Δ .015, p .80, 1.8× calls) | 0 | CC | xref S1-56 |
| S2-13 | 2609.04217 | 8 | dense WebShop: team trends worse at higher cost | − | CC | xref S2-12 |
| S2-14 | 2312.13010 | 2 | programmer + test-designer roles: +8.6 / +10.5 pp pass@1 | + | CC | D1 |
| S2-15 | 2305.05176 FrugalGPT | 7 | learned cascade matches best API at up to 98 % less cost | + | CC | xref S3-70 |
| S2-16 | 2305.05176 | 7 | +4 pp over GPT-4 at equal cost via cascade | + | CC | xref S2-15 |
| S2-17 | 2406.18665 RouteLLM | 7 | routing: 95 % of GPT-4 MT-Bench at 50 % strong calls | + | CC | xref S3-76 |
| S2-18 | 2406.18665 | 7 | off-domain routers are random; ~1,500 in-domain pairs fix it | 0 | CC | xref S1-23 |
| S2-19 | 2402.05120 | 2 | sampling + voting: +4 to +24 pp; cost linear; not orchestration | + | CC | xref S1-22 |
| S2-20 | 2402.05120 | 6 | debate on code degraded results (two model cases) | − | CC | D6 |
| S2-21 | 2311.17371 | 8 | debate does not reliably beat other prompting ensembles | 0 | CC | D6 |
| S2-22 | 2311.17371 | 6 | multi-persona synthesis ~7 pp worse than Medprompt, costlier | − | CC | D6 |
| S2-23 | 2311.17371 | 4 | instructed agreement intensity: +15 % / +5 % | + | CC | xref O L116 |
| S2-24 | 2511.07784 | 4 | debate depth, order, confidence visibility insignificant | 0 | CC | D6 |
| S2-25 | 2511.07784 | 6 | a correct minority corrects the majority in 3.6–34 % of cases | − | CC | xref T1-16 |
| S2-26 | 2407.04622 | 5 | debate as verifier helps under information asymmetry | + | CC | xref S2-27 |
| S2-27 | 2407.04622 | 5 | on closed tasks debate ≈ direct QA | 0 | CC | xref S2-26 |
| S2-28 | 2305.14325 | 4 | two-round peer critique boosts reasoning (no equal-cost arm) | + | CC | D6 |
| S2-29 | 2505.06120 | 4 | every model degrades ~39 % over multi-turn (simulated users) | − | CC | D5 |
| S2-30 | 2605.14859 AuthBench | 3 | separate policy generation from permission audit: +15.8 % | + | CC | xref S1-26 |
| S2-31 | 2605.14859 | 3 | more reasoning does not fix rights mismatch | 0 | CC | xref S2-30 |
| S2-32 | 2405.03862 | 6 | debate instructions raise persona inconstancy | − | CC | D6 |
| S2-33 | 2306.05685 MT-Bench | 5 | GPT-4 judge >80 % human agreement | + | CC-v | xref S2-34..36 |
| S2-34 | 2306.05685 | 5 | position bias: only GPT-4 consistent >60 % on swaps | − | CC-v | xref S2-38 |
| S2-35 | 2306.05685 | 5 | verbosity bias in all judges | − | CC-v | xref S2-39 |
| S2-36 | 2306.05685 | 5 | self-enhancement bias suspected, not established | ? | CC-v | xref S2-37 |
| S2-37 | 2404.13076 | 5 | frontier LLMs favour their own output | − | CC-v | D7 |
| S2-38 | 2404.13076 | 5 | order reversal flips preferences 25 / 58 / 89 % | − | CC-v | xref S2-34 |
| S2-39 | 2310.10076 | 5 | judges over-favour longer answers | − | CC-v | xref S2-35 |
| S2-40 | 2503.13657 | 5 | human failure labelling reaches κ .88 after iteration (15 traces) | + | CC-v | phase-3 method |
| S2-41 | 2503.13657 | 5 | LLM annotator 94 % / κ .77 against experts | + | CC-v | phase-3 method |
| S2-42 | 2512.08296 | 5 | n = 20 cells give ±20 pp intervals | ? | CC-v | phase-3 method |
| S2-43 | 2407.04622 | 5 | counterbalancing order only reduces variance, doubles cost | 0 | CC-v | xref S2-34 |
| S2-44 | 2411.04468 | 5 | unpaired z-tests on leaderboards are weak | ? | CC-v | phase-3 method |
| S2-45 | 2505.06120 | 4 | simulated users are not representative | ? | CC-v | xref T1-40 |
| S2-46 | 2605.14859 | 3 | execution-based checks are the definitive measure | ? | CC-v | xref T1-28 |
| S2-47 | 2511.07784 | 5 | one synthetic puzzle; transfer unknown | ? | CC-v | phase-3 method |
| S2-48 | 2609.04217 | 2 | equal-rollout accounting misattributes extra calls to architecture | − | CC-v | xref T1 §3 |
| S3-02 | AutoGen 0.7.5 | 1 | task ledger: given / lookup / derived / guessed facts, then a plan | · | ME | xref S1-34 |
| S3-05 | AutoGen 0.7.5 | 7 | max rounds forces a final answer | · | ME | xref S3-14, S3-17 |
| S3-06 | AutoGen 0.7.5 | 8 | one-participant path routes deterministically | · | ME | xref S1-54 |
| S3-07 | OpenAI Agents SDK | 2 | manager pattern: specialists as tools; control returns to the manager | · | ME | xref S3-21 |
| S3-08 | OpenAI Agents SDK | 2 | handoffs transfer the conversation, with input filters | · | ME | xref S3-79 |
| S3-09 | OpenAI Agents SDK | 1 | schema-bounded delegation input | · | ME | xref S1-08, S3-19 |
| S3-10 | OpenAI Agents SDK | 4 | persistent specialist thread by session / response id | · | ME | xref S1-59 |
| S3-11 | OpenAI Agents SDK | 5 | tripwire guardrails halt execution | · | ME | xref S1-53 |
| S3-12 | OpenAI Agents SDK | 4 | built-in tracing of agents, handoffs, guardrails | · | ME | xref S3-51 |
| S3-13 | OpenAI Agents SDK | 5 | evaluator loop with an explicit pass condition | · | ME | xref S1-38 |
| S3-14 | OpenAI Agents SDK | 7 | `MaxTurnsExceeded` hard turn limit | · | ME | xref S3-05 |
| S3-15 | Google ADK | 1 | sequential agent with resumable position (deprecated) | · | ME | xref S1-20 |
| S3-16 | Google ADK | 2 | parallel branches; shared state, last writer wins | · | ME | xref S1-22 |
| S3-17 | Google ADK | 7 | loop agent with max iterations or escalate | · | ME | xref S3-05 |
| S3-18 | Google ADK | 4 | chat / task / single-turn delegation modes | · | ME | xref S1-59 |
| S3-19 | Google ADK | 1 | input / output schema and output key | · | ME | xref S3-09 |
| S3-20 | Google ADK | 2 | per-agent model choice or inheritance | · | ME | xref S3-45 |
| S3-21 | LangGraph supervisor | 2 | supervisor via handoff tools; multi-level hierarchies | · | ME | xref S1-19 |
| S3-22 | LangGraph supervisor | 6 | full history vs last message into shared state | · | ME | xref S1-45 |
| S3-23 | LangGraph | 4 | checkpointer + thread id for continuation and recovery | · | ME | xref S1-31 |
| S3-24 | LangGraph | 7 | dynamic interrupt: pause, surface payload, resume | · | ME | xref S1-52 |
| S3-25 | LangChain docs | 8 | a single agent with the right tools often achieves similar results | · | ME (guidance) | xref S1-48, S1-54 |
| S3-26 | LangChain docs | 2 | scenario call/token comparisons among four patterns | · | VE-n (design not stated) | — |
| S3-27 | CrewAI | 2 | role / goal / backstory / llm / tools / allow_delegation | · | ME | xref S3-33 |
| S3-28 | CrewAI | 1 | task contract: description, expected_output, context | · | ME | xref S1-01 |
| S3-29 | CrewAI | 2 | hierarchical process with a manager | · | ME | xref S3-07 |
| S3-30 | CrewAI | 4 | per-agent max_iter / time / retry / rpm | · | ME | xref M2 |
| S3-31 | CrewAI | 5 | task guardrails with finite retries | · | ME | xref S3-11 |
| S3-32 | MetaGPT | 2 | software-company role catalogue as an SOP | · | ME | xref S1-04 |
| S3-33 | MetaGPT | 1 | role contract: name, profile, goal, constraints, actions, watch | · | ME | xref S3-27 |
| S3-34 | MetaGPT | 4 | persistent role memory and state | · | ME | xref S3-10 |
| S3-35 | MetaGPT | 7 | monetary budget + max rounds stop the team | · | ME | xref S1-15 |
| S3-36 | MetaGPT docs | 2 | ~$0.2 / ~$2.0 example costs | · | VE-n (design not stated) | — |
| S3-37 | Codex CLI 0.154.0 | 2 | built-in roles: default, explorer, worker (file ownership) | · | ME | xref S3-44 |
| S3-38 | Codex CLI | 1 | `spawn_agent(task_name, message, fork_turns)` — brief plus forked history | · | ME | xref S1-05 |
| S3-39 | Codex CLI | 3 | a child inherits the parent's tool surface | · | ME | xref S1-28 |
| S3-40 | Codex CLI | 4 | `send_message`, `followup_task` to a live or idle child | · | ME | D2 |
| S3-41 | Codex CLI | 4 | `wait_agent`, `list_agents` | · | ME | xref S3-51 |
| S3-42 | Codex CLI | 7 | `interrupt_agent`, `close_agent`; open agents count toward concurrency | · | ME | D2 |
| S3-43 | Codex CLI | 2 | `max_concurrent_threads_per_session`; per-spawn model overrides | · | ME | xref S3-53 |
| S3-44 | Claude Code 2.1.274 | 2 | built-in subagent catalogue with purpose, model, tools, trigger | · | ME | xref S3-37 |
| S3-45 | Claude Code | 2 | route tasks to cheaper models; `model:` per subagent | · | ME | xref S1-11 |
| S3-46 | Claude Code | 1 | subagent definition + delegation message = the brief; fresh start | · | ME | xref S1-01 |
| S3-47 | Claude Code | 3 | permissionMode, tool denial, `isolation: worktree` | · | ME | xref S1-25 |
| S3-48 | Claude Code | 4 | `SendMessage` resumes a completed subagent with its history | · | ME | xref S1-59 |
| S3-49 | Claude Code | 4 | agent teams: shared task list, dependencies, peer mailbox (experimental) | · | ME | xref S1-58 |
| S3-50 | Claude Code | 5 | hooks can reject task creation / completion | · | ME | xref S3-11 |
| S3-51 | Claude Code | 4 | agent view: states, reply / attach / stop / respawn | · | ME | xref S3-12 |
| S3-52 | Claude Code | 5 | workflows: schema validation with retries | · | ME | xref T1-02 |
| S3-53 | Claude Code | 2 | workflow cap 16 concurrent; progress counters | · | ME | D10 |
| S3-54 | Claude Code | 8 | avoid teams for sequential, same-file, dependency-heavy work | · | ME (guidance) | xref S2-02 |
| S3-55 | wshobson | 2 | lead / reviewer / debugger / implementer | · | ME | xref S3-37 |
| S3-56 | wshobson | 3 | agent type → tool rights table, read-only vs writing | · | ME | xref S1-24 |
| S3-57 | wshobson | 1 | task dependency edges; warns against vague tasks | · | ME | xref S1-06 |
| S3-58 | wshobson | 4 | lead holds multi-turn dialogue with named teammates | · | ME | xref S3-48 |
| S3-59 | wshobson | 2 | sizing 1–2 / 2–3 / 3–4 / 4–5 | · | ME (guidance) | D10 |
| S3-60 | wshobson | 6 | dimension-specific reviewers → consolidated prioritised report | · | ME | xref O L117 |
| S3-61 | RuFlo | 8 | skip the swarm for single-file edits, simple fixes, docs | · | ME (guidance) | xref S1-54 |
| S3-62 | RuFlo | 2 | four worker types under a queen | · | ME | xref S3-55 |
| S3-63 | RuFlo | 2 | `--max-agents 8` | · | ME | xref S3-53 |
| S3-64 | RuFlo | 4 | shared status / progress records | · | ME | xref S3-41 |
| S3-65 | RuFlo | 4 | GOAP planner replans on state change | · | ME | xref S1-51 |
| S3-66 | RuFlo README | 2 | "89 % routing accuracy" | · | VE-n (design not stated) | — |
| S3-67 | superpowers 6.3.0 | 5 | fresh implementer per task; reviewer per task; final branch review | · | ME | xref S1-38, S1-41 |
| S3-68 | superpowers | 1 | return: DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT + test evidence | · | ME | xref S1-46 |
| S3-69 | superpowers | 4 | resume the same implementer for rounds 1–3; fresh at 4–5 | · | ME | xref S1-59 |
| S3-70 | superpowers | 2 | least powerful model per role; escalate one tier when stuck | · | ME (guidance) | xref S1-23 |
| S3-71 | superpowers | 7 | five-round breaker; named stop conditions | · | ME (guidance) | xref M2 |
| S3-72 | OMC 5.4.0 | 1 | plan → prd → exec → verify → fix pipeline | · | ME | xref S1-04 |
| S3-73 | OMC | 2 | 19-role catalogue with tier variants | · | ME | xref S3-44 |
| S3-74 | OMC | 2 | user-set width N and backend | · | ME | xref O L41 |
| S3-75 | OMC | 6 | two advisors, Claude synthesises | · | ME | xref S1-12 |
| S3-76 | OMC | 2 | Haiku for simple, Opus for complex | · | ME | xref S3-45 |
| S3-77 | OMC README | 2 | "30–50 % token savings" | · | VE-n (design not stated) | — |
| S3-78 | Semantic Kernel | 6 | concurrent broadcast; name-attributed results | · | ME | xref S1-44 |
| S3-79 | Semantic Kernel | 2 | handoff graph with allowed edges | · | ME | xref S3-08 |
| S3-80 | Semantic Kernel | 4 | multi-turn with human callbacks | · | ME | xref S3-58 |

Strength totals over the 185 merged claims (counted by script over the table above): CC 32 + CC-v 16 = 48; VE 30 + VE-n 9 = 39; RA 22 + RA+ME 3 = 25; ME 73. Direction over the 108 S1 and S2 rows (S3 mechanism rows carry none): benefit 56, harm 29, no benefit 16, unknown 6, conditional 1 — the adverse and null rows are all retained above.

---

## 2. Mapping to the pages (both pages read whole at `dff2f0b`; every row cites a line read)

Scope: `O` = orchestrate override (O L14 "this page re-cuts only what the mode changes"), `C` = codex inherited (O L13 "rights, header fields, worktree lifecycle, the report and the exit ladder live there and stay authoritative"), `R` = reference not read (heading only). Quotes are from the cited lines; inside a quote, ` / ` or ` — ` stands for a table pipe or a line break on the page (a pipe would break this table), and `**` bold markers are dropped. A quote in a `not located` note that is the *source's* wording (S1-31, S1-37, S1-39, S1-40, S1-56) is labelled as such by its context. Where the value is `not located` or `unknown`, the line cited is the nearest place on the pages where the practice would sit, marked (nearest).

| id | st. | str. | file : lines | scope | value | page quote (present / partial / contradicts) or note |
|---|---|---|---|---|---|---|
| S1-01 | 1 | RA | C L267-269; O L142-146; C L177, L178, L185 | C + O | present | C L267-269 "TASK: what to do / CHECK: the ground truth, preferably something the agent cannot guess / RETURN: exactly what to hand back"; output format = the five fields (O L142-146); boundaries = `RIGHTS:` (C L177); tool guidance = `NETWORK:`, `WEB_SEARCH:` (C L178, L185) |
| S1-02 | 1 | VE | C L265; O L70 | C + O | present | C L265 "Write a concrete, checkable body"; O L70 "The unit of a bulk fan-out is one claim, one address, a verbatim quote" |
| S1-03 | 1 | RA | O L87, L100 | O | present | O L87 "Implementers are not duplicated: one per task, split by ownership"; O L100 "split by file ownership". The reviewer/judge split by function remains (L84), which S1-38 endorses |
| S1-04 | 1 | VE | O L84-87 | O | present (avoided) | no phase pipeline: O L84 judgement roles "plan critique, review, skeptics and refuters, judges" around L87 "one per task" implementers |
| S1-05 | 1 | RA | C L122-127, L133; O L14 | C + O | not located | the brief is TASK/CHECK/RETURN (C L124-126); nothing instructs passing the coordinator's trace and nothing forbids it inside `TASK:`; Codex agents start from a prompt file (C L59), Claude agents fresh (S3-46) |
| S1-06 | 1 | RA | O L100 | O | present | O L100 "Disjoint filenames do not make work independent, so settle the contract between the owners before they start; when their work collides anyway, stop the writers, restate the contract" |
| S1-07 | 1 | VE | C L265-268 | C | present | C L265 "Write a concrete, checkable body"; L268 "CHECK: the ground truth, preferably something the agent cannot guess" |
| S1-08 | 1 | VE | O L115, L118 | O | partial | O L115 "Critique the split before the fan-out: a top-row agent reads the decomposition, not the subject" — the split's content, not the assembled prompts (T1-05, T1-09, T1-39) |
| S1-09 | 1 | VE | O L143 | O | not located | no rule on quantity ranges in a brief; O L143 "result: at most 30 lines" bounds the return, not the ask |
| S1-10 | 1 | RA | C L267-269, L177 | C | present | Done-when = C L268 `CHECK:`; Constraints = C L177 `RIGHTS:`; Goal = `TASK:`; Context = the body |
| S1-11 | 2 | VE-n | O L62-63, L68 | O | partial | O L63 "Fast, cheap and not clever — work that is wide rather than deep"; O L68 "Prefer Luna to Haiku in the bulk row: measured better and smarter, and four times cheaper"; choosing on tool-call behaviour not located |
| S1-12 | 2 | VE | C L6, L47; O L60 | C + O | present | C L47 "A dissenting agent pays for decorrelation"; O L60 top row "design, mentoring, final review and verdict … Never implementation" |
| S1-13 | 2 | VE | O L60-63, L100, L68 | O | partial | tiers keyed to work (O L60-63), "Allocate inside those bounds by judgement" (L100); L68 nevertheless carries a model-level claim ("measured better and smarter") |
| S1-14 | 2 | VE | O L91-98, L78 | O | partial | O L93-95 "simple task 1 agent / comparison or design 2 to 4 agents / complex 5 agents or more"; no per-agent tool-call budget; O L78 "Send no EFFORT: line" |
| S1-15 | 2 | VE-n | C L10-11 | C | not located | no admission price or value threshold; nearest C L11 "Skip trivia and mechanical fact-gathering" |
| S1-16 | 2 | VE-n | O L61-63, L65-66 | O | partial | workers are tiered (L61-63); the lead's tier is not the page's to set: O L65 "Your own model is in your system prompt … You are outside the pool" |
| S1-17 | 2 | VE | C L140; O L87 | C + O | not located | split signals are rights (C L140) and ownership (O L87), not tool count |
| S1-18 | 2 | VE | O L16, L20-25 | O | present | O L16 "the work-list, the plan, the composition and the synthesis are yours, the rest is an agent's" |
| S1-19 | 2 | VE | O L76 | O | partial | O L76 "Subagents may spawn subagents, but a Fable agent never spawns Fable"; no slice-ownership design |
| S1-20 | 2 | VE | C L271; O L108 | C + O | present | C L271 "Give one deliverable per agent. Split a return that asks for unrelated artifacts or decisions"; O L108 `pipeline(items, ...stages)` |
| M3 | 2 | RA+ME | C L142-146; O L58-63, L84 | C + O | partial | agents are cut by rights (C L144-146 read / worktree / write) and tier (O L58-63); judgement roles by function (O L84); no tool-named catalogue |
| S1-22 | 2 | RA | O L63, L70 | O | present | O L63 "up to 50 alive at once"; O L70 "one claim, one address, a verbatim quote, and a verdict from a closed set" |
| S1-23 | 2 | RA | O L56-63, L68 | O | not located | tiers assigned a priori; the page's one demotion (L68 Luna over Haiku, "measured") names no eval; Terra never used (T1-U4) |
| S1-24 | 3 | RA | O L60; C L144 | O + C | present | O L60 "Never implementation"; C L144 read level "write only `$TMPDIR`" |
| S1-25 | 3 | VE | O L51; C L202 | O + C | present | O L51 "its sandbox ends at the tree, so its work comes back as a diff"; C L202 "A completed turn harvests tracked work to `worktreeDiffPath`" |
| S1-26 | 3 | VE | C L140, L144 | C | present | C L140 "Choose the smallest `RIGHTS` that can complete and check the work"; C L144 "the sandbox refuses a write anywhere else" |
| S1-27 | 3 | VE | C L146, L154; O L44-45 | C + O | partial | C L146 write: "yes; this chooses the blast radius"; C L154 "settle each with the user before adding it"; the gate is on write scope and commits, not per-action reversibility |
| S1-28 | 3 | RA | C L134-136, L155, L254 | C | present | C L155 "never translate a refusal into broader rights"; C L254 "an entry is neither evidence that work was lost nor a reason to widen the rights" |
| S1-29 | 4 | VE | C L110-111 | C | not located | no thread-length or compaction policy for agents; continuation is only a mechanism |
| S1-30 | 4 | VE | O L105-106; C L110 | O + C | partial | O L105 "Wait on every agent you launch"; steering only after a return: O L106 "the Agent tool for continuing an agent"; C L110 "To continue an agent, write a second prompt file with `RESUME:`" |
| S1-31 | 4 | VE | O L130; C L236, L278 | O + C | partial | O L130 "read the partial; if the work is unfinished, continue that thread once with `RESUME:`"; "tell the agent its tool failed" not located (the agent records its own failed step, C L278) |
| M1 | 4 | RA+ME | O L37-38, L54 | O | not located | the plan is written once (O L37-38) and a paragraph follows each return (L54); no per-dispatch progress questions |
| M2 | 4 | RA+ME | O L60, L123-124; C L7 | O + C | partial | O L60 "a case stuck after two failed attempts"; O L123 "Fix, then cross-review, at most two rounds; then escalate"; C L7 "after two hypotheses fail" — a threshold of two, no counter or loop detector |
| S1-34 | 4 | VE | O L54 | O | not located | no plan recitation; O L54's paragraph is user-facing |
| S1-35 | 4 | VE | C L278, L295 | C | partial | C L278 "a one-line record for a step that cannot run (the command, whether it started, its exit status if any, the exact diagnostic)"; C L295 "Read a non-zero result's answer" |
| S1-36 | 4 | RA | O L104; C L57, L260 | O + C | present (same limitation) | O L104 "Stop one by stopping its wrapper"; C L57 "Stop on the card, one completion notification, and a message to continue it" — watch, stop, continue; no mid-turn steer |
| S1-37 | 5 | VE | O L116; C L313 | O + R | not located (adversarial-review.md not read) | O L116 "a refuter defaults to `refuted` when it is uncertain" pushes the other way; the review prompt lives in `adversarial-review.md` ("Adversarial review prompt") |
| S1-38 | 5 | VE | O L25, L89, L100 | O | present | O L25 "verify: you never grade your own work, a fresh agent does"; O L100 "the evidence that decides comes from an agent that did not write the code"; O L89 "a cross-review agent is a prompt agent with the diff's path in `TASK:`" |
| S1-39 | 5 | RA | O L25 | O | **contradicts** | O L25 "you never grade your own work, a fresh agent does" is unconditional; S1-39: a strong orchestrator can "evaluate subagent work directly without a separate verification step". Same conditions; S2-37/38 side with the page |
| S1-40 | 5 | VE | O L144; C L181, L278 | O + C | partial | O L144 "evidence: what ran, with counts; a test without its count is not evidence"; C L181 "the answer is only evidence if a command matching it ran AND succeeded"; no "run the complete suite" clause |
| S1-41 | 5 | VE | O L96, L100, L44-45 | O | conditional | the page never reaches the width S1-41 describes (O L96 "alive at once 6"); per-unit verification (L100) and gated commits (L44-45) stand |
| S1-42 | 5 | VE | O L114-121 | O | not located | the verification list is fixed, not scaled to autonomy |
| S1-43 | 5 | VE-n | O L25, L142-146 | O | present | separate verifier (O L25 "a fresh agent does") returning the five fields, O L142 "status:    done / partial / blocked", L144 "evidence:  what ran, with counts" |
| S1-44 | 6 | RA | O L25; C L32 | O + C | partial | O L25 "synthesise, attributing every finding to the agent that produced it" — a duty of the synthesising coordinator, not a separate pass |
| S1-45 | 6 | RA | O L31-32 | O | present | O L31 "a file it must leave goes under `$TMPDIR` with the path in that text; Codex artifacts are the paths the agent's own report names" |
| S1-46 | 6 | VE | O L146, L121 | O | partial | O L146 "open: questions and risks"; O L121 "name every agent, check or item you dropped"; nothing reopens a finished plan on a return |
| S1-47 | 6 | VE | O L16, L96 | O | conditional | the coordinator is the single gate (O L16 "the synthesis [is] yours") at width six (L96); S1-47's regime is hundreds |
| S1-48 | 6 | RA | O L16, L87 | O | present | O L16; O L87 "Implementers are not duplicated: one per task" |
| S1-49 | 7 | RA | O L123-124, L41 | O | partial | escalation by rule: O L123 "then escalate to the Fable agent or the `gpt-6-astra` agent"; the user's word sets caps (L41), not the moment |
| S1-50 | 7 | RA | O L45, L53; C L146 | O + C | partial | O L45 "no commit to the live tree without a separate word from the user"; O L53 "show it, then wait"; binary, no three-way scale |
| S1-51 | 7 | RA | O L60, L123-124 | O | partial | escalates to a stronger agent, not to a re-plan with a post-mortem |
| S1-52 | 7 | VE-n | O L135, L142, L146; C L144 | O + C | partial | O L142 "status: done / partial / blocked"; O L135 "a Claude agent that returns `blocked`: do not retry, report it"; a Codex agent cannot ask mid-turn: C L144 "an approval request in its place is declined and recorded in `escalations`" |
| S1-53 | 7 | RA | C L142-146 | C | present | the rights table's "Settle first?" column: "no" / "say that a worktree will be made" / "yes; this chooses the blast radius" |
| S1-54 | 8 | VE | O L4, L22-23, L93; C L11 | O + C | conditional | the mode is "User-invoked" (O L4), delegation presupposed; inside it O L22-23 keep scouting and "a quick targeted edit that needs no exploration"; C L11 "Skip trivia" |
| S1-55 | 8 | VE | O L4 (nearest) | O | not located | no domain-fit rule; the mode is described only as "User-invoked" (O L4) |
| S1-56 | 8 | VE | O L93 | O | partial | O L93 "simple task: 1 agent"; no "one agent first" for larger tasks |
| S1-57 | 8 | RA | O L14; C L122-127 | O + C | not located | agents are context-isolated by design; no sharing gate |
| S1-58 | 8 | RA | O L16; C L19-20 | O + C | present (avoided) | no peer channel: C L19-20 "one Codex agent performs one deliverable"; every return goes to the coordinator |
| S1-59 | 8 | RA | C L110-111, L278; O L106, L130 | C + O | partial | C L278 "A follow-up continues a thread with `RESUME: <threadId>`"; when to continue is decided only for a cut (O L130 "once") and review rounds (L123) |
| S1-60 | 8 | RA | O L93, L22-23 | O | partial | as S1-56 |
| S2-01 | 1 | CC | O L100, L91-95 | O | present | O L100 "Several writers at once is how a task goes faster: split by file ownership" |
| S2-02 | 8 | CC | O L100, L93 | O | partial | O L100 "Disjoint filenames do not make work independent" names the risk; no rule keeps sequential-constraint work out of a fan-out |
| S2-03 | 8 | CC | O L93, L100 (nearest) | O | not located | no rule on tool-dominated steps; the nearest bounds are "simple task 1 agent" (L93) and the ownership contract (L100) |
| S2-04 | 5 | CC | O L25, L123 | O | present | O L123 "Fix, then cross-review, at most two rounds" |
| S2-05 | 2 | CC | O L100, L91-96 | O | present | O L100 "Allocate inside those bounds by judgement, not to fill a band" |
| S2-06 | 2 | CC | O L61-63, L68 | O | present (the page instructs the mix the study measured as worse) | O L61-63 strong / cheap / bulk rows; L68 "Prefer Luna" — adverse evidence, §6(i) |
| S2-07 | 1 | CC | O L16, L25 | O | present | O L16 "the synthesis [is] yours" |
| S2-08 | 5 | CC | C L268 | C | present | C L268 "CHECK: the ground truth, preferably something the agent cannot guess" |
| S2-09 | 4 | CC | O L37-38 | O | partial | a plan, no facts or progress ledger |
| S2-10 | 2 | CC | O L58-63, L84 | O | partial | roles by tier and function; no removal test locally |
| S2-11 | 2 | CC | O L115, L119 | O | present (the page uses the roles the study found empty on a 7B backbone) | O L115 critic of the split; L119 "Judge panel"; locally T1-13 paid |
| S2-12 | 8 | CC | O L93 | O | partial | no iso-cost test of a panel against one agent |
| S2-13 | 8 | CC | O L93 | O | partial | as S2-12 |
| S2-14 | 2 | CC | O L87, L100 | O | partial | writer and verifier separate (O L100); tests not assigned to a second designer |
| S2-15 | 7 | CC | O L60, L123-124 | O | partial | manual cascade upward on failure (O L60 "stuck after two failed attempts"); no learned trust decision |
| S2-16 | 7 | CC | O L56-63 | O | partial | as S2-15 |
| S2-17 | 7 | CC | O L60-63 | O | partial | routing by the coordinator's judgement of work type, not a router |
| S2-18 | 7 | CC | O L60-63, L68 (nearest) | O | not located | no in-domain calibration of tier choice; tiers are assigned by work type (L60-63) and one "measured" preference (L68) |
| S2-19 | 2 | CC | O L117 | O | present (opposite: varied verifiers preferred) | O L117 "vary the angle across verifiers instead of N identical refuters" |
| S2-20 | 6 | CC | O L16 | O | present (avoided) | no agent-to-agent debate; synthesis is the coordinator's |
| S2-21 | 8 | CC | O L16, L119 | O | present (avoided) | panels return to the coordinator; no debate protocol |
| S2-22 | 6 | CC | O L16 | O | present (avoided) | no persona synthesis |
| S2-23 | 4 | CC | O L116 | O | partial | O L116 "a refuter defaults to `refuted` when it is uncertain" — an instructed bias, the analogue of agreement intensity |
| S2-24 | 4 | CC | O L123 | O | present (avoided) | rounds capped at two |
| S2-25 | 6 | CC | O L118 | O | present | O L118 "Read a unanimous fan-out as evidence about the prompt first: open one return whole before you trust the tally"; T1-16 fired |
| S2-26 | 5 | CC | O L116-117 | O | conditional | adversarial verification prescribed without the information-asymmetry condition |
| S2-27 | 5 | CC | O L116-117 | O | conditional | as S2-26 |
| S2-28 | 4 | CC | O L123 | O | present | "at most two rounds" |
| S2-29 | 4 | CC | C L110-111; O L106 | C + O | partial | continuation is a mechanism; no rule on thread length; adverse for theme (b) |
| S2-30 | 3 | CC | C L140; O L38 | C + O | partial | rights declared per agent by the coordinator (C L140 "Choose the smallest `RIGHTS`"; O L38 "what each may write"); no separate audit step |
| S2-31 | 3 | CC | C L144 | C | present | rights are the sandbox's, not the agent's reasoning: C L144 "the sandbox refuses a write anywhere else" |
| S2-32 | 6 | CC | O L16 | O | present (avoided) | no debate |
| S2-33 | 5 | CC-v | O L119, L60 | O | present | O L119 "Judge panel for a design task"; the judge is an LLM (L60 "final review and verdict") |
| S2-34 | 5 | CC-v | O L119 (nearest) | O | not located | no order-swap or position control for the "Judge panel" (L119) |
| S2-35 | 5 | CC-v | O L143 | O | partial | O L143 "result: at most 30 lines" bounds return length; no verbosity control on judged artifacts |
| S2-36 | 5 | CC-v | O L25, L88 | O | present | O L88 "Cross-review runs the other way round, a Claude implementer's diff to a Codex agent and a Codex agent's diff to a Claude agent" |
| S2-37 | 5 | CC-v | O L25, L88; C L47 | O + C | present | as S2-36; C L47 "A dissenting agent pays for decorrelation" |
| S2-38 | 5 | CC-v | O L119 (nearest) | O | not located | as S2-34 |
| S2-39 | 5 | CC-v | O L143 | O | partial | as S2-35 |
| S2-40 | 5 | CC-v | O L114-121 (nearest) | O | unknown | phase-3 method (labelling incidents); no page counterpart expected |
| S2-41 | 5 | CC-v | O L114-121 (nearest) | O | unknown | phase-3 method; no page counterpart expected |
| S2-42 | 5 | CC-v | O L117 (nearest) | O | unknown | bears on T1 sample sizes (3+3 readers T1-35; 3 Luna per set T1 §2.3b); the page sets no verifier count beyond "vary the angle" (L117) |
| S2-43 | 5 | CC-v | O L119 (nearest) | O | not located | consistent: no counterbalancing rule for the judge (L119), and the study says it would not remove bias |
| S2-44 | 5 | CC-v | O L114-121 (nearest) | O | unknown | phase-3 method; no page counterpart expected |
| S2-45 | 4 | CC-v | O L63 (nearest) | O | unknown | bears on T1-40 (Luna recognition panels as simulated readers); the bulk row (L63) says nothing about panels as readers |
| S2-46 | 3 | CC-v | C L181, L259 | C | partial | C L181 "ran AND succeeded"; C L259 "Evidence of success is root-thread-only"; T1-28 made behaviours happen |
| S2-47 | 5 | CC-v | O L114-121 (nearest) | O | unknown | phase-3 method; no page counterpart expected |
| S2-48 | 2 | CC-v | O L100 (nearest) | O | unknown | bears on T1 §3 (a continuation cost 1.23× a first round per agent) and T1-U2; the page allocates "by judgement" (L100) with no cost accounting |
| S3-02 | 1 | ME | O L37-38 | O | partial | O L37 "scout, then decide the composition and the agents"; no fact classes (given / lookup / derived / guessed) |
| S3-05 | 7 | ME | O L123; C L304 | O + R | partial (environment-and-internals.md "Bounding or stopping an agent" not read) | O L123 "at most two rounds"; no per-agent turn cap on the pages |
| S3-06 | 8 | ME | O L93 | O | present | O L93 "simple task: 1 agent" |
| S3-07 | 2 | ME | O L16; C L19-20 | O + C | present | C L19-20 "the coordinator chooses and synthesises the composition; one Codex agent performs one deliverable" |
| S3-08 | 2 | ME | O L16 (nearest) | O | not located | the conversation is never handed to an agent: O L16 "the work-list, the plan, the composition and the synthesis are yours" |
| S3-09 | 1 | ME | C L182, L124 | C | partial | output schema-bound: C L182 "`OUTPUT_SCHEMA:` … the answer must parse as one JSON object"; input is free text (C L124 "TASK: …") |
| S3-10 | 4 | ME | C L180 | C | present | C L180 "`RESUME:` `<threadId>`, `last` — this agent continues an earlier thread instead of opening one" |
| S3-11 | 5 | ME | C L181, L191; C L305 | C + R | partial (result-gates.md not read) | C L191 "Declare gates on the command line instead" |
| S3-12 | 4 | ME | C L220; C L304 | C + R | partial (Observability section not read) | C L220 "`<REPORT>` is the report, the same JSON the run also wrote to `<DIR>/out.json`" |
| S3-13 | 5 | ME | O L123 | O | present | "Fix, then cross-review, at most two rounds" |
| S3-14 | 7 | ME | C L304 | R | not located (Bounding or stopping an agent not read) | no turn cap on the pages |
| S3-15 | 1 | ME | O L108 | O | present | O L108 "`pipeline(items, ...stages)` runs items through stages with no barrier" |
| S3-16 | 2 | ME | O L108 | O | present | O L108 "`parallel(thunks)` is a barrier" |
| S3-17 | 7 | ME | O L123 | O | partial | rounds capped at two; no loop primitive with an escalate event |
| S3-18 | 4 | ME | C L180; O L106 | C + O | partial | resume vs fresh exists; no "chat mode" where an agent becomes the counterpart |
| S3-19 | 1 | ME | O L148; C L182 | O + C | present | O L148 "In a Workflow they are a JSON schema, and a Claude agent takes the `schema` option" |
| S3-20 | 2 | ME | O L72; C L183 | O + C | present | O L72 "Tag every Claude Agent call with an explicit `model`"; C L183 `MODEL:` slug |
| S3-21 | 2 | ME | O L76 | O | present | O L76 "Subagents may spawn subagents" |
| S3-22 | 6 | ME | O L140; C L71, L115-116 | O + C | partial | the coordinator reads five fields (O L140 "all five are yours to read, never to forward"); the wrapper "never sees the agent's prompt" (C L71); the full answer is on disk (C L115-116 `answerPath`) |
| S3-23 | 4 | ME | C L180, L196 | C | partial | C L196 "a resumed worktree starts at its recorded base and restores its harvested diff and untracked files" |
| S3-24 | 7 | ME | C L144, L250-254, L260 | C | partial (design differs) | the driver declines rather than pauses: C L144 "an approval request in its place is declined and recorded in `escalations`" |
| S3-25 | 8 | ME | O L93; C L11 | O + C | partial | "simple task: 1 agent" |
| S3-26 | 2 | VE-n | O L68 (nearest) | O | unknown | no page counterpart for a pattern comparison; the page's only comparative number is L68 |
| S3-27 | 2 | ME | O L58-63 | O | partial | agents have a tier, rights and a task; no goal/backstory fields |
| S3-28 | 1 | ME | C L267-269; O L142-146 | C + O | present | TASK / CHECK / RETURN and the five fields |
| S3-29 | 2 | ME | O L16 | O | present | the coordinator is the manager |
| S3-30 | 4 | ME | O L105; C L304 | O + R | not located (Bounding or stopping an agent not read) | only the coordinator's poll timeout: O L105 "`timeout: 600000`" |
| S3-31 | 5 | ME | C L181; O L148 | C + O | partial | EXPECT gate; schema retry only inside a Workflow (S3-52) |
| S3-32 | 2 | ME | O L84-87 | O | present (avoided) | no software-company SOP; judgement roles around one implementer |
| S3-33 | 1 | ME | C L177-187, L267-269 | C | partial | contract = header fields + TASK/CHECK/RETURN; no watched message types |
| S3-34 | 4 | ME | C L180 | C | partial | memory only via `RESUME:` of a thread |
| S3-35 | 7 | ME | O L41, L96-97 | O | not located | caps on alive agents (O L96 "alive at once 6"), no monetary or token budget |
| S3-36 | 2 | VE-n | O L68 (nearest) | O | unknown | no page counterpart for a cost figure |
| S3-37 | 2 | ME | C L144-146; O L87 | C + O | present | rights-based roles: C L144 read, L145 worktree, L146 write; O L87 "one per task, split by ownership" |
| S3-38 | 1 | ME | C L59, L133 | C | not located | a Codex agent starts from its prompt file (C L59 "Write the prompt to a file with the Write tool"); no history fork |
| S3-39 | 3 | ME | C L140 | C | present (opposite default) | C L140 "Choose the smallest `RIGHTS`" |
| S3-40 | 4 | ME | C L110-111; O L106 | C + O | partial | continuation after completion only |
| S3-41 | 4 | ME | O L104-105 | O | partial | O L104 "what the agent map shows is its card"; O L105 the `until [ -s "<DIR>/exit" ]` poll |
| S3-42 | 7 | ME | C L260; O L104 | C + O | present | C L260 "To stop an agent, stop its wrapper — Stop on the agent map or `TaskStop` — or send `SIGTERM`" |
| S3-43 | 2 | ME | O L96, L73 | O | present | O L96 "alive at once 6"; O L73 "A Codex agent's model is its `MODEL:` line" |
| S3-44 | 2 | ME | O L72 | O | partial | models tagged (O L72); the built-in Explore/Plan types are not named on the pages |
| S3-45 | 2 | ME | O L62-63, L68 | O | present | O L68 "Prefer Luna to Haiku in the bulk row" |
| S3-46 | 1 | ME | C L122-126; O L109 | C + O | present | O L109 "A subagent's final text is its return value, not a message to a human: say so in the brief" |
| S3-47 | 3 | ME | C L145; O L46-53 | C + O | present | C L145 "`RIGHTS: worktree <repo>` — write in a driver-managed detached tree" |
| S3-48 | 4 | ME | O L106; C L110-111 | O + C | present | O L106 "the Agent tool for continuing an agent" |
| S3-49 | 4 | ME | O L16; C L19-20 (nearest) | O + C | not located | no shared task list or peer mailbox; all returns to the coordinator (C L19-20) |
| S3-50 | 5 | ME | O L54 (nearest) | O | not located | no hooks on task completion; the after-return step is the coordinator's paragraph (L54) |
| S3-51 | 4 | ME | O L104; C L56-57 | O + C | partial | card, Stop, completion notification, continue; no respawn |
| S3-52 | 5 | ME | O L148 | O | partial | O L148 "In a Workflow they are a JSON schema"; retries not mentioned (T1-02 lost 4 returns) |
| S3-53 | 2 | ME | O L96 | O | present (stricter) | O L96 "alive at once 6" against the runtime's 16 |
| S3-54 | 8 | ME | O L100, L87 | O | partial | O L100 "Disjoint filenames do not make work independent" |
| S3-55 | 2 | ME | O L84, L88 | O | partial | roles named by function, not a catalogue |
| S3-56 | 3 | ME | O L38; C L142-146 | O + C | partial | rights per agent are in the plan (O L38 "what each may write") and the RIGHTS level; no role→rights table |
| S3-57 | 1 | ME | O L100 | O | partial | O L100 "settle the contract between the owners before they start"; no dependency graph |
| S3-58 | 4 | ME | O L106; C L110-113 | O + C | partial | continuation by message; no live dialogue |
| S3-59 | 2 | ME | O L91-95 | O | present | the bounds table (O L93-95) |
| S3-60 | 6 | ME | O L117, L25 | O | present | O L117 "vary the angle across verifiers"; O L25 attribution |
| S3-61 | 8 | ME | C L11; O L93 | C + O | present | C L11 "Skip trivia and mechanical fact-gathering" |
| S3-62 | 2 | ME | O L58-63 | O | partial | tiers, not worker types |
| S3-63 | 2 | ME | O L96 | O | present | "alive at once 6" |
| S3-64 | 4 | ME | O L28-30 | O | partial | reports under the run directory (O L28); no shared progress records |
| S3-65 | 4 | ME | O L123-124 (nearest) | O | not located | no re-planning primitive; after two rounds the page escalates (L123-124) |
| S3-66 | 2 | VE-n | O L68 (nearest) | O | unknown | no page counterpart for a routing figure |
| S3-67 | 5 | ME | O L87-89, L119-120 | O | present | O L87 one implementer per task; L88-89 cross-review; L119 judge; L120 "Completeness critic at the end" |
| S3-68 | 1 | ME | O L142-146 | O | partial | O L142 "status: done / partial / blocked"; L144 evidence with counts; no NEEDS_CONTEXT status |
| S3-69 | 4 | ME | O L123-124 | O | partial | "at most two rounds; then escalate" — the page escalates to a stronger agent where superpowers resumes to round 3 then goes fresh |
| S3-70 | 2 | ME | O L56-63, L60 | O | present | O L60 "a case stuck after two failed attempts" goes to the top row |
| S3-71 | 7 | ME | O L123-124, L45; C L146 | O + C | partial | two rounds → top tier → user (O L123-124); stops for writes and commits (O L45, C L146); no destructive/security list |
| S3-72 | 1 | ME | O L37-54 | O | partial | plan → "go" → "Fan out, verify, cross-review, then synthesise" (O L54); no requirements stage |
| S3-73 | 2 | ME | O L58-63, L84 | O | not located | no role table (theme a) |
| S3-74 | 2 | ME | O L41-42 | O | present | O L41 "A cap the user overrides in words ("two Fable") replaces the default for this run; composition words ("only codex", "no codex") follow the sibling's table" |
| S3-75 | 6 | ME | O L84, L25 | O | present | O L84 "half the agents beyond the implementers, rounded up, are Codex, in the judgement roles" |
| S3-76 | 2 | ME | O L58-63 | O | present | the tier table |
| S3-77 | 2 | VE-n | O L68 (nearest) | O | unknown | no page counterpart for a savings figure |
| S3-78 | 6 | ME | O L25; C L32 | O + C | present | C L32 "Attribute every finding" |
| S3-79 | 2 | ME | O L16 (nearest) | O | not located | no handoff graph; the coordinator holds the conversation (L16) |
| S3-80 | 4 | ME | O L106; C L110-113 | O + C | partial | as S3-58 |

Value totals are tallied in §4 (script over this table). Rows whose scope names a reference are absence claims bounded to the two pages: `S1-37`, `S3-05`, `S3-11`, `S3-12`, `S3-14`, `S3-30`.

---

## 3. Applicability to the record (T1: 54 incidents, 5 runs + 2 work-project runs + 3 earlier sessions)

Every row is a **hypothesis**: "bears on" means a plausible mechanism links the claim to the incident, with a confidence (high / medium / low) and the measurement phase 3 would need. No row says the practice would have prevented anything. Rows cover every claim valued `partial`, `not located`, `contradicts` or `conditional` in §2 (102 claims, 78 rows); `present` claims appear in §3.3 where a T1 incident shows the page rule firing. Incident ids carry their T1 primary stage in brackets.

### 3.1 Per claim

| claim | value | T1 incidents it plausibly bears on | hypothesis (mechanism) | conf. | phase-3 measurement |
|---|---|---|---|---|---|
| S1-05 | not located | T1-45 [2], T1-37 [6] | the panels and the judge lacked the decisive input (the collision check); passing the coordinator's context, not a distilled brief, would have carried it | low | stage-1 incidents tagged "missing input" per run, with the brief's context size as the arm |
| S1-08 | partial | T1-05 [1], T1-09 [1], T1-39 [1] | three brief-assembly defects (a join, a doubled path, shell quoting) each multiplied across a fan-out; L115's critic reads the split, not the assembled prompt | high (recurrence) / medium (mechanism) | brief-assembly defects reaching a fan-out per run, with a one-brief pre-launch check as the arm |
| S1-09 | not located | T1-01 [2], T1-54 [2] | "a bigger wave" (owner) became 80 agents; a stated range in the plan would have fixed the quantity before launch | low | agent counts proposed vs approved per plan |
| S1-15 | not located | T1-07 [2], T1-53 [2], T1-01 [2], T1-44 [3] | with no admission price, a 51-agent workflow and a 2.65 M-token blocked check were not weighed before launch | medium | paid turns per adopted outcome; owner cost-stops per run |
| S3-02 | partial | T1-12 [5], T1-13 [1] | a facts ledger marks the changelog claim as "guessed" (T1-12) and the addresses as "lookup" (T1-13 did it by hand) | low | unverified claims accepted at stage 5 per run |
| S3-09 / S3-19 | partial / present | T1-09 [1], T1-39 [1] | an input schema for bulk briefs (address must resolve) fails at assembly rather than 20 turns later | medium | as S1-08 |
| S3-33 | partial | no local counterpart | — | — | — |
| S3-38 | not located | T1-45 [2] | a forked history would have carried the collision-check requirement to proposers | low | as S1-05 |
| S3-57 | partial | T1-24 [1] (fired), T1-05 [1] | the join between script and reports was an unstated contract; a dependency record names it | low | stage-1 contract defects per run |
| S3-68 | partial | T1-39 [1], T1-44 [3] | agents returned `partial` and named the cause (T1-39); a NEEDS_CONTEXT status would separate "blocked by input" from "blocked by rights" (T1-44) | low | returns whose status names its cause, per run |
| S3-72 | partial | no local counterpart | — | — | — |
| S1-11 | partial | T1-U4, T1-02 [2], T1-03 [5] | Terra was never tried; Haiku lost 4/50 returns to schema; the cheap tier's fit is unmeasured per role | medium | per-role correctness by tier on matched claims |
| S1-13 | partial | T1-45 [2] | three tiers of proposers gave the same outcome; the missing context decided | medium | outcome by tier on matched tasks |
| S1-14 | partial | T1-01 [2], T1-53 [2], T1-26 [5], T1-U2 | a width band keyed to the unit count would have priced 80 and 51 agents at plan time; 13 Luna + a judge who read the tree himself is width without a stated need | medium | independently verified findings per agent at widths 5 / 10 / 20 / 50 |
| S1-16 | partial | no local counterpart (the lead's model is the session's) | — | — | — |
| S1-19 | partial | no local counterpart (no recursive planners, T1 §4) | — | — | — |
| M3 | partial | T1 §4 (roles without a table) | theme (a); no incident shows a missing role table | low | stage-2 incidents with a role table vs without |
| S1-23 | not located | T1-U4, T1-02 [2] | seats were never demoted against an eval; Luna over Haiku was adopted from one wave | medium | seat-by-seat demotion on matched claims |
| S2-09 | partial | T1-45 [2], T1-46 [4] | a progress ledger would record "no adopted name after round 2" and "notification already read" | low–medium | rounds to adoption; turns with no new information |
| S2-10 | partial | T1-13 [1], T1-52 [2], T1-37 [6] | the architect role produced the highest-value return; the judge role was overturned 2 of 6 — a per-role removal test is absent | low | run with / without a critic on matched tasks |
| S2-12 / S2-13 | partial | T1-45 [2], T1-19 [8], T1-48 [8], T1-26 [5] | 16 agents and no adopted name against 2–3 agents and a merged PR; no iso-cost test exists locally | medium | panel vs one agent at equal budget, outcome verified independently |
| S2-14 | partial | T1-36 [5] | writer/verifier separation caught a cross-plugin break; a test-designer role has no local counterpart | low | — |
| S3-27 / S3-55 / S3-62 / S3-73 | partial / not located | T1 §4 | theme (a) | low | as M3 |
| S3-44 | partial | T1-14 [3] | agent-type resolution failed once; a named catalogue does not fix a stale install | low | — |
| S3-08 / S3-79 | not located | no local counterpart (no handoffs) | — | — | — |
| S1-27 | partial | T1-18 [7] (fired), T1-23 [8] | a reversibility gate names "temp dir may be swept" (fired) and "go with forks open" (not) | low | owner corrections after "go" |
| S2-30 | partial | T1-51 [3], T1-44 [3], T1-14 [3] | 10 of 13 work-project agents hit declined escalations; a pre-launch command inventory against the rights level separates "needs a grant" from "cannot run here" | medium | exit-6 rate per run by declared rights; checks redone by the coordinator |
| S2-46 | partial | T1-28 [3] (fired), T1-37 [6], T1-45 [2] | verdicts that rested on an un-run check were overturned; an executed check is definitive | medium | judge verdicts overturned by a later executed check |
| S3-56 | partial | T1 §4 | theme (a) | low | — |
| S1-29 | not located | T1-33 [4], T1-25 [5] | continuations worked for fix rounds; no thread was long enough to meander | low | continued vs fresh agent on fix rounds |
| S1-30 | partial | T1-22 [4], T1-46 [4], T1-44 [3] | the wait-then-continue model cost 19 dumps and 7 empty turns, and could not route N2 around SSL | low–medium | supervision tokens per agent; mid-turn redirects needed |
| S1-31 | partial | T1-43 [4] (fired), T1-33 [4], T1-44 [3] | relaunch once and resume fired; "tell the agent its tool failed" had no channel (N2 reported it, could not adapt) | low | agents that adapt after a reported failure |
| M1 | not located | T1-45 [2], T1-46 [4], T1-22 [4] | a five-question check between rounds would have asked "is forward progress being made?" after round 2 of the naming task | medium (T1-45) | rounds to adoption; repeated-round incidents |
| M2 | partial | T1-45 [2] | each round "progressed" to a new winner, so the two-round rule never counted a stall; a stall counter keyed to "no adopted outcome" would have tripped at round 2 | medium | same |
| S1-34 | not located | T1-05 [1] | four anchoring rules tried in sequence on a broken join reads as goal drift under load | low | plan-drift incidents per run |
| S1-35 | partial | T1-44 [3], T1-43 [4] | failed steps were reported (C L278) and acted on | low | — |
| S2-23 | partial | T1-03 [5], T1-08 [5] | the instructed refuter bias killed 24 of 36 and cut "proven" items; the false-refutation rate is unmeasured | low | refutations later overturned |
| S2-29 | partial | T1-33 [4], T1-25 [5], T1 §3 | continuations cost 1.23× a first round per agent and showed no measured degradation; adverse for a standing advisor | medium (adverse) | continued vs fresh agent, outcome and tokens |
| S3-12 / S3-41 / S3-51 / S3-64 | partial | T1-22 [4], T1-46 [4] | a status-only wait surface is what L105 now prescribes by hand | medium (T1-22) | supervision tokens per agent |
| S3-18 / S3-34 / S3-58 / S3-80 | partial | no local counterpart (no standing counterpart agent) | theme (b) | — | — |
| S3-23 | partial | T1-33 [4] (fired) | cross-session recovery worked once | low | — |
| S3-40 | partial | T1-44 [3] | no mid-turn message could redirect N2 | low | — |
| S3-49 | not located | no local counterpart; S1-58 argues against | — | — | — |
| S3-65 | not located | T1-45 [2], T1-05 [1] | re-planning happened only after an owner correction (T1-45) or a withdrawal (T1-05) | low | as M1 |
| S3-30 / S3-05 / S3-14 / S3-17 | not located / partial (reference not read) | T1-44 [3], T1-22 [4] | a per-agent cap would have cut a 2.65 M-token blocked check | medium | tokens per agent above a cap, per run |
| S1-37 | not located | T1-50 [6], T1-08 [5] | ten regressions in one round were qualifications added to satisfy findings; a bounded-finding reviewer brief removes the pressure | medium | regressions per round, bounded vs unbounded reviewer brief |
| S1-39 | contradicts | T1-04 [5], T1-11 [5], T1-30 [5], T1-31 [5] (coordinator caught agent errors) vs T1-08 [5], T1-12 [5], T1-49 [6] (agents cut the coordinator's claims) | L25 holds for the coordinator's own work; the coordinator checking agents inline is already allowed (O L27) — both halves of the record fit the page, none fits S1-39's "skip the verifier" | medium | coordinator claims overturned by agents vs agent claims overturned by the coordinator, per run |
| S1-40 | partial | T1-08 [5], T1-12 [5], T1-37 [6], T1-49 [6] | four early victories: reported as proven, cut later | medium | claims reported then retracted, per run |
| S1-42 | not located | T1-01 [2], T1-53 [2] | wide autonomous waves ran with one verification pass | low | verification agents per autonomous agent |
| S2-02 / S2-03 | partial / not located | T1-45 [2], T1-19 [8], T1-48 [8] | the naming task hinged on one sequential, tool-dominated check; the two small tasks kept in the coordinator's hands landed | medium | agents and paid turns per adopted outcome with a no-delegation comparator |
| S2-15 / S2-16 / S2-17 | partial | T1-45 [2], T1-U4 | tiers were used as proposers, not as a cascade by failure | low | cascade by failure count |
| S2-18 | not located | T1-U4, T1-02 [2] | no in-domain calibration of Luna or Terra | medium | correctness on matched local claims per tier |
| S2-26 / S2-27 | conditional | T1-03 [5], T1-36 [5] | verifiers held information the coordinator lacked (the tree, the diff) — the asymmetry condition held | low | verifier yield with vs without information the coordinator lacks |
| S2-34 / S2-38 | not located | T1-37 [6], T1-45 [2] | judge verdicts were overturned; order effects untested | low | judge consistency under order swap |
| S2-35 / S2-39 | partial | T1-30 [5] | a 50 k-character paste was judged per part | low | — |
| S2-43 | not located | no local counterpart | consistent with the pages | — | — |
| S3-11 / S3-31 | partial | T1-27 [5] (fired), T1-44 [3] | gate verdicts were read, not discarded | low | — |
| S3-52 | partial | T1-02 [2] | 4 of 50 Haiku returns died on schema; a retry would re-ask | medium | returns lost to schema per wave |
| S3-50 | not located | no local counterpart | — | — | — |
| S1-44 | partial | T1-49 [6], T1-20 [6] (fired), T1-50 [6] | an attribution pass reads "lost to an expired transcript" as an unattributed claim | medium | unfaithful-synthesis incidents per run |
| S1-46 | partial | T1-29 [5] (fired), T1-20 [6], T1-39 [1] | out-of-brief findings and `partial` causes were carried; nothing reopened a plan | low–medium | plan changes triggered by a return |
| S1-47 | conditional | no local counterpart (width six) | — | — | — |
| S3-22 | partial | T1-10 [5], T1-16 [5] (fired) | opening one return whole is the full-history projection | low | — |
| S1-49 | partial | T1-07 [2], T1-45 [2] | rule-driven escalation to a top tier at 1 % quota, and two judge verdicts overturned | low | top-tier escalations that changed the outcome |
| S1-50 | partial | T1-18 [7] (fired), T1-23 [8] | — | low | — |
| S1-51 | partial | T1-45 [2] | the re-plan came at round 4 after an owner correction | medium | rounds to re-plan |
| S1-52 | partial | T1-23 [8], T1-38 [6], T1-44 [3] (fired) | forks were left open and an option was presented as free | medium | owner corrections after "go" |
| S3-24 | partial (design differs) | T1-51 [3], T1-44 [3] | declined approvals ended 10 of 13 turns at exit 6 | medium | exit-6 rate; a pause-for-user alternative is a harness change |
| S3-35 | not located | T1-07 [2], T1-53 [2], T1-01 [2] | no budget stop existed; the owner was the stop | medium | as S1-15 |
| S3-71 | partial | T1-45 [2] | a five-round breaker would have stopped at 5; the local task ended at 4 | low | — |
| S1-54 / S1-56 / S1-60 | conditional / partial | T1-19 [8], T1-48 [8] (fired), T1-45 [2] | the two tasks the coordinator kept landed; the sixteen-agent task did not | medium | no-delegation comparator on matched tasks |
| S1-55 | not located | no local counterpart (corpus is one domain) | — | — | — |
| S1-57 | not located | no local counterpart | — | — | — |
| S1-59 | partial | T1-33 [4], T1-25 [5] | continuation preserved the reasoning trail in both | low | as S2-29 |
| S3-25 / S3-54 | partial | T1-24 [1] (fired), T1-45 [2] | ownership by file avoided same-file collisions | low | — |
| S1-17 | not located | no local counterpart (no incident turns on a tool count or domain confusion) | — | — | — |
| S1-41 | conditional | no local counterpart (width six never reached); T1-25 [5] shows gated rounds without serialisation | — | — | — |
| S3-69 | partial | T1-25 [5], T1-33 [4] | the page stops at two rounds then escalates; superpowers resumes the same implementer to round 3 then goes fresh — the local rounds ended at two with 9 of 10 points closed | low | as S2-29: continued vs fresh implementer per round, outcome and tokens |

### 3.2 Incidents no survey claim bears on (page rules or harness facts only)

T1-06 [4] workflow script crash (only S1-31's recovery, loosely); T1-14 [3], T1-15 [3] stale agent-type and symlink; T1-17 [3] egress denied in one run; T1-21 [7] Skill tool refused the page; T1-32 [1] a repo-rule step struck; T1-34 [6] "Сиденье" in the coordinator's prose (nearest analogue S1-09's concreteness, weak); T1-41 [5] owner-supplied fact; T1-42 [6] a wrapper named as a skill; T1-46 [4] redundant notification turns (only mechanism rows, weakly); T1-47 [7] paid gates named as unrun (rule fired). Twelve incidents.

### 3.3 Successful handling — page rules that visibly fired (evidence for the rule; level 3 in the repo's scale where T1 shows the trace)

| rule (line) | incidents | claims it is evidence for |
|---|---|---|
| O L115 critique the split | T1-13, T1-52 | S1-08, S2-10 (critic role), against generalising S2-11 |
| O L118 open one return whole | T1-10, T1-16 | S2-25 |
| O L100 ownership contract | T1-24 | S1-03, S1-06, S1-25, S3-37 |
| O L88-89, L123 cross-review, two rounds | T1-25, T1-36 | S2-04, S2-28, S2-36/37 (cross-family) |
| O L25 a fresh agent verifies; coordinator checks agents inline (O L27) | T1-04, T1-11, T1-30, T1-31, T1-35 | S1-38, S1-40; both halves of S1-39's question |
| O L116-117 adversarial, diverse verify | T1-03 | S2-04, S2-23 |
| O L63, L119 bulk verifiers + judge who reads the tree | T1-26 | S1-22; also the redundancy question in S2-12 |
| O L134 read a gate verdict | T1-27 | S3-11 |
| O L128-132 result ladder; relaunch once | T1-28, T1-43 | S1-31, S2-46 |
| O L121 no silent caps | T1-47, T1-29 | S1-46 |
| O L54 name the composition that ran | T1-48, T1-20 | S2-07, S3-75 |
| O L22-23 own hands | T1-19, T1-48 | S1-54, S1-56, S1-60 |
| O L106 continue an agent; L105 breached by a session end and recovered | T1-33 | S3-48, S3-23, S1-31 |
| O L31 artifacts under `$TMPDIR` | T1-18 | S1-45, S1-50 |
| O L6 `disable-model-invocation` | T1-21 | — |

---

## 4. Coverage matrix — stage × evidence strength (merged claims; count, strongest id per cell)

"Strongest" = largest sample or cleanest comparator in the cell, not the most favourable. CC-v rows are counted with CC and marked.

| stage | controlled comparison | vendor experience (n = with a number) | rationale | mechanism only | pages have (lines) | mapping values (pres / part / not loc / cond / unk / contr) |
|---|---|---|---|---|---|---|
| 1 decompose | 2 — S2-01 (260 configs; S2-07 for practice) | 5 — S1-02 | 5 — S1-01 | 11 — S3-28 | O L16, L22, L37-38, L87, L100, L114-115; C L133, L265-274 | 13 / 7 / 3 / 0 / 0 / 0 |
| 2 compose | 6 + 1 v — S2-05 & S2-06 (same study) | 10 (n 3) + 4 S3 numbers — S1-11 (n), S1-16 (n, un-audited) | 2 + M3 — S1-23 | 22 — S3-43 | O L41-43, L56-79, L83-100; C L27-48 | 23 / 12 / 6 / 0 / 5 / 0 |
| 3 rights | 2 + 1 v — S2-30 | 3 — S1-26 | 2 — S1-28 | 3 — S3-47 | O L28-33, L38-40, L44-53; C L140-168, L196-216 | 7 / 4 / 0 / 0 / 0 / 0 |
| 4 supervise | 5 + 1 v — S2-29 (15 models); S2-09 (ablation) | 5 — S1-31 | 1 + M1, M2 — M2 | 16 — S3-48 | O L104-110, L123, L126-135; C L50-57, L70-80, L108-113, L220-261 | 5 / 18 / 6 / 0 / 1 / 0 |
| 5 verify | 4 + 13 v — S2-04 (22.7 %, CI); validity S2-38 | 6 (n 1) — S1-40 | 1 — S1-39 | 6 — S3-67 | O L25, L100, L114-124, L144; C L181, L189-192, L278, L295-297; R: result-gates.md, adversarial-review.md | 9 / 6 / 6 / 3 / 5 / 1 |
| 6 synthesise | 4 — S2-25 | 2 — S1-46 | 3 — S1-45 | 4 — S3-78 | O L16, L25, L54, L121, L139-146; C L32, L284-290 | 9 / 3 / 0 / 1 / 0 / 0 |
| 7 escalate | 4 — S2-15 (12 APIs) | 1 (n 1) — S1-52 | 4 — S1-53 | 7 — S3-35 | O L44-45, L53, L123-124, L135; C L146, L154-155, L250-254, L260-261 | 2 / 11 / 3 / 0 / 0 / 0 |
| 8 do not delegate | 5 — S2-02 (−39 to −70 %) | 3 — S1-56 | 4 — S1-60 | 4 — S3-54 | O L4 (user-invoked), L22-23, L93; C L10-11, L40 | 4 / 8 / 3 / 1 / 0 / 0 |
| total | 32 + 16 v | 35 (n 5) + 4 | 22 + 3 | 73 | | 72 / 69 / 27 / 5 / 11 / 1 |

Reading the matrix: stage 5 has the controlled evidence, most of it about the *validity* of LLM judges, and the pages already carry the structural answers (fresh agent, cross-family, two rounds). Stages 4 and 7 are where the pages are thinnest relative to what exists elsewhere (18 and 11 `partial`), and where the evidence is mostly mechanism (16 and 7 rows) plus one strong adverse controlled result each (S2-29; S2-18). Stage 2 is the widest in every column and carries the only local numbers (T1 §2.4). Stage 8 has five controlled rows, three of them null or adverse for delegation, against four `partial` page rows and a mode that presupposes delegation (O L4).

---

## 5. The four themes

Verdict set: supported / unsupported / contested / untested, on the sources' study designs and T1's local data. None of these verdicts says a practice improves management; they say what the evidence and the record show.

### (a) A table of potential agent roles

For (by id): S2-10 (each Magentic-One agent's removal −21…−39 %, roles bundled with tools), S2-14 (+8.6 / +10.5 pp from a programmer / test-designer split), S2-07 (+9.4 % from a designated integrator), S1-17 (specialise on tool signals), S1-19 (recursive planners), S1-20 (narrow specialists), S3-01/37/44/55/62/73/32/79 (catalogues shipped everywhere). Against: S1-04 (role-by-phase agents spent more on coordination than work), S1-03, M3/S1-21 (tool-based, roles force redundant capability; untested), S1-22 (identical instances), S2-11 (planner and critic prompts evolved to empty on a 7B backbone), S2-12/13 (team not separable at iso-cost), S1-18 (nine objectives overwhelmed one orchestrator), S1-47 (integrator deleted as a bottleneck). Lens split (§1.3 D1, D4): roles cut by tool, rights or judgement are defended; roles cut along phases of one feature are attacked.

T1 locally: twelve roles were assigned without a table (T1 §4); the split critic / architect gave the single highest-value return (T1-13, prevented an outcome-blocked fan-out; T1-52); judges were overturned 2 of 6 by a check they could not run (T1-37, T1-45); the completeness critic (O L120) was never its own agent; Terra never took a seat (T1-U4); a role's *rights* mattered in the record (T1-28 probes, T1-44 sandbox) more than its name. No incident is attributed to the absence of a role table.

**Verdict: contested** — the controlled rows split by what a role is cut on, and the local record shows judgement roles paying (T1-13, T1-20, T1-36) with nothing measuring a table's own effect.

Candidate roles table (roles the pages name, the sources define, or T1 used; "may write" is the rights level under C L142-146 and O L31-33):

| role | responsibility | may write | returns | when spawned | sources defining it | T1 runs that used it |
|---|---|---|---|---|---|---|
| scout | inventory the work-list with cheap commands before any fan-out | own checks → `mktemp` file (O L33) | the plan's work-list | first, inline, by the coordinator (O L22, L114) | O L22; S3-37 explorer; S3-44 Explore | all seven (T1 §4) |
| split critic / architect | read the decomposition, not the subject: what the cut lost, what wording added, which items are two, which the rights cannot decide | nothing | corrected split, addresses, dropped items | after the plan, before "go" or before a fan-out (O L115) | O L24, L60, L115; S1-08; S2-07 (integrator authority) | verify-09-12 (Fable), issues-fix (Fable), arcadia (Fable + Astra); T1-13, T1-52 |
| implementer / writer | one task by file ownership, in the live tree or a worktree | its owned files (live) or the worktree, harvested as a diff (O L51) | diff or commits ref + five fields | after "go", one per task (O L87) | O L61, L87, L100; C L145-146; S3-37 worker; S3-67/68 | issues-fix (2 Opus + 2 Sol), field-audit (1 Opus), naming (1 Opus); T1-24, T1-33 |
| cross-reviewer | review the other family's diff, path in `TASK:` | nothing | findings, five fields | after a writer returns, at most two rounds (O L88-89, L123) | O L88-89; C L47; S1-12; S3-67 reviewer | issues-fix (4, two rounds), field-audit (2 Sol), naming (1 Sol), arcadia (1 Sol); T1-25, T1-36 |
| refuter / adversarial verifier | attack one claim; default `refuted` when uncertain | nothing | verdict + evidence | on claims the coordinator or extractors produced (O L116) | O L116; S1-38, S1-40; S2-04; `adversarial-review.md` (not read) | 2026-09-11 wave (10 Opus), arcadia (1 Sol); T1-03 |
| bulk verifier / extractor | one claim, one address, a verbatim quote, a closed-set verdict about the subject | nothing | quote + verdict + open | wide, shallow, up to 50 alive, outside the pool (O L63, L70) | O L63, L70; S1-22; S3-45 | verify-09-12 (20 Luna), issues-fix (13 Luna), naming (18 Luna), wave (50 Haiku); T1-09, T1-16, T1-26 |
| judge | final review and verdict; reads the tree itself, not the returns | nothing (Codex artifacts under the run dir, O L32) | verdict, marked-up artifact | end of a design or verification round (O L60, L119) | O L60, L119; S2-07; S2-33..38 (validity) | all five runs (Astra), plus Opus critic in orchestrate-rules; T1-08, T1-27, T1-37 |
| completeness critic | what is missing, unverified, unread | nothing | list of gaps | last, before synthesis is published (O L120) | O L120; S1-44 (attribution pass) | never as its own agent (T1 §4) |
| live prober | make a behaviour happen (rights, stop, paths) for level-3 evidence | `$TMPDIR` and the probe's target by design | what happened, with the report fields | when a claim about behaviour must be proven (O L128-132) | S2-46; O L128-132; C L220-261 | issues-fix (4 Luna), wave (7 Luna); T1-28 |
| reader / recognition panel | blind read of a frozen artifact; rank or recognise | nothing | ranks, recognitions | when a wording decision needs a measurement (T1-35, T1-40) | S2-45 (validity caveat); S2-42 (n) | field-audit (6 Sonnet, `git show` frozen), naming (18 Luna); T1-35, T1-40 |
| blind proposer | generate candidates without seeing the others | nothing | candidate list | design rounds (T1-45) | — (local only) | naming (Opus, Sonnet, Sol); T1-45 |
| dedup-and-rank | merge a wave's returns, attribute each finding | its report under `$TMPDIR` | ranked, attributed list | after a wide wave (round 07) | S1-44; O L25 | wave round 07 (1 Fable) |
| advisor / oracle | planning or debugging counsel from a different lineage, summoned per call | nothing (S1-24) | counsel | on the coordinator's explicit call (S1-49) | S1-12, S1-24, S1-49; S3-75; O L60 "mentoring" | none as a standing seat (nearest: Astra critic 308, Fable architect 30a) |
| strong reader / re-deriver | claims that need commands run or a source re-derived | nothing | findings with the commands run | when a claim needs execution (T1 §2.1 SA/SB) | O L61; C L181 | verify-09-12 (2 Sol + 2 Opus), wave (16 Sonnet) |
| planner (recursive) | own a slice and spawn sub-planners | nothing | task list | large projects (S1-19) | S1-19; S3-02; S3-21 | never (the plan is the coordinator's, O L16, L24) |
| integrator / merge gate | land harvests, resolve collisions | live tree on the user's word | landed tree | after writers (O L51-53) | S2-07; S1-47 (adverse at width) | coordinator only (T1-24, T1-25) |

### (b) A productive multi-turn dialogue with one persistent agent (advisor, "grey cardinal", architect)

For: S3-10, S3-40, S3-48, S3-58, S3-69, S3-18, S3-23, S3-34 (the mechanisms exist in eight systems), S1-59 (one chat per unit of work preserves the reasoning trail), S1-12 (a different-lineage partner "surprisingly good" at planning and debugging — per call, not persistent), S1-31 (resume, do not restart), S2-28 (two-round critique boosts, no equal-cost arm), S2-23 (agreement modulation changes debate outcomes). Against: S2-29 (every model degrades ~39 % over turns; a proxy), S1-29 (compaction breeds meandering threads), S1-30 (a synchronous lead cannot steer), S1-36 (no steer surface), S1-58 (peer collaboration fragile in 2025), S1-49 (the oracle deliberately not pushed, for cost and latency), S2-24 (more debate turns insignificant), S2-21. S2's own gap statement: "No fetched controlled comparison directly tested a persistent advisor/architect/critic thread against one-shot briefing." S1's: "No source found reports operating a long-lived advisor thread and measuring it."

T1 locally: 12 `SendMessage` continuations and 4 `RESUME:` threads (T1 §3), all fix or review rounds on a writer or reviewer — none an advisor; a continuation cost 1.23× a fresh first-round agent (18.7 M / 4 vs 22.8 M / 6), so persistence is not cheaper; T1-33 recovered a writer across a session end; T1-25 closed 9 of 10 review points through continuations; the Fable architect and Astra critics were one-shot and produced the record's highest-value returns (T1-13, T1-20); judge verdicts were overturned by checks, not by dialogue (T1-37). No local run has a comparator.

**Verdict: untested** — the mechanisms exist and local continuations worked for fix rounds at no cost saving, but no source measured a persistent advisor against one-shot briefs, the only controlled multi-turn evidence is adverse and a proxy (S2-29), and the local record has no advisor thread at all.

### (c) More use of cheap agents ("Luna is nearly free and probably good")

For: S1-11 (cheap search subagent 3× faster at "the same quality"), S1-16 (strong lead + cheaper workers +90.2 %, vendor eval, un-audited), S3-45 (Claude Code recommends Haiku routing), S3-70, S3-76, S2-15/16/17 (cascades and routers match strong-model quality at lower cost — with a learned trust decision), S1-43 (a verifier seat at $0.20 median), S2-19 (more samples help on closed tasks). Against: S2-06 (heterogeneous teams −12.6 pp on BrowseComp), S2-18 (off-domain routers are random), S2-12 (a team is not better than one agent at iso-cost), S1-13 (model choice does not change one task; difficulty, context and review do), S1-23 (demote only against evals), S2-05 (marginal agents not monotonic).

T1 locally (§2.4): 53 Luna agents, 94 % documented use, median 90,065 tokens (Sol 3,032,161 = 34×; Astra 903,705 = 10×), 15.4 % of Codex spend — cheap, not free (12.9 M tokens). Correctness where checkable: 20/20 located the real file under a broken path; 19/20 returned a wrong verdict word caused by the coordinator (T1-09); 13/13 agreed with an Astra judge who read the tree himself (T1-26 — coverage, no decision changed); one unique substantive correction (T1-16, L06); recognition panels: 6 of 18 predicted the adopted name, 3 confirmed a component, 6 pointed elsewhere, 3 discarded on the coordinator's bug (§2.3b); as finding-raisers in round 07, Luna was sole or first raiser on 2 of 87 findings, both low-ranked (§2.3c). Haiku: 4/50 lost to schema, most candidate findings died under Opus refutation (T1-03: "the real harvest came from the verifiers themselves"). Terra: never used. The width question (20 Luna vs 5–6 strong readers) was never run (T1-U2).

**Verdict: contested** — the local data support Luna for bounded one-claim verification, quoting and recognition panels at 1/34 of a Sol agent, and show a low yield as a raiser of findings; "more" is untested because no run compared a Luna width against fewer strong readers, and the one controlled row on mixed tiers is adverse (S2-06).

### (d) Re-shaping the pool from fixed counts to a capacity model with weights (owner: Astra 8, Sol 5, Terra 3, Luna 1)

Published forms found (none prices a mixed pool — S1 §(d), S2 "no fetched source provided a general pool-capacity optimizer", S3 "No fetched framework combines a hard monetary pool budget with automatic team-width selection and dynamic cheap/strong worker routing"):

| form | sources | shape | page counterpart |
|---|---|---|---|
| per-task effort caps | S1-14 (1 agent / 3–10 calls; 2–4 / 10–15 each; 10+), S3-30 (`max_iter`, time, retries), S3-14 (`max_turns`), S3-05 (max rounds) | a cap per agent or per query class | none per agent (O L78 no `EFFORT:`); rounds capped at two (O L123) |
| width bands | O L91-98 (1 / 2–4 / 5+ in batches; 6 alive; 1 Fable + 1 Astra; bulk 50), S3-59 (1–2 … 4–5), S3-53 (cap 16), S3-63 (8), S2-05 (optimum 5–7, model-specific) | fixed counts by task class | present (O L91-98) |
| admission prices | S1-15 (4× / 15× tokens; delegate above a value threshold), S1-13 (task difficulty, not model) | a value threshold before delegating | not located |
| stall and round budgets | M2 (threshold 2), S3-71 (five rounds), S3-69 (3 + 2), S2-24 (depth adds nothing) | a count that ends a loop | two rounds then escalate (O L123-124) |
| monetary or token budgets | S3-35 (MetaGPT `invest`, `NoMoneyException`), S2-15/16 (FrugalGPT: fixed budget, learned cascade) | a hard stop at spend | not located |
| learned routing | S2-17, S2-18 (needs ~1,500 in-domain pairs) | route by predicted difficulty | not located (judgement by work type, O L60-63) |
| user-set width | S3-74 (`omc team N`), O L41 (caps overridden in words) | the user names the number | present |

Owner's weights against T1's measured cost per agent by tier (Codex tokens per report; Claude agents unrecorded, T1-U3; Terra unmeasured, T1-U4):

| tier | owner weight | tokens/agent median | ratio to Luna (median) | tokens/agent mean | ratio to Luna (mean) | what the tier did locally |
|---|---|---|---|---|---|---|
| Luna | 1 | 90,065 | 1 | 243,718 | 1 | one-claim verification, probes, recognition |
| Terra | 3 | — | — | — | — | never used |
| Sol | 5 | 3,032,161 | 33.7 | 3,384,982 | 13.9 | writers and cross-reviewers, long turns, continuations |
| Astra | 8 | 903,705 | 10.0 | 1,700,441 | 7.0 | judges and critics, one turn each |

By tokens, Sol is the expensive tier locally (3.4× Astra per agent at the median, 2× at the mean), because Sol agents ran the long write and review turns while Astra agents judged once. The owner's weights order the tiers by model price, not by the turn length each role runs; T1 records tokens, not money, so the two cannot be reconciled without per-token prices. A capacity model that weights by *role × tier* (a Sol writer ≠ a Sol reviewer) would fit the record; one that weights by tier alone contradicts it on Sol.

**Verdict: untested** — no published capacity model for a mixed pool exists in the 185 claims, the local ratios disagree with the proposed weights on Sol, and the missing inputs (per-token prices, Claude agent tokens, any Terra measurement) are the phase-3 measurement, not something this phase can settle.

---

## 6. Contradictions

### 6.1 Practice versus page (a source instruction or finding against a page instruction)

| # | claim | page line | kind | note |
|---|---|---|---|---|
| P1 | S1-39 (RA): a strong orchestrator may evaluate subagent work directly | O L25 "you never grade your own work, a fresh agent does" | **contradicts** (incompatible instructions, same conditions) | the only strict contradiction; S2-37/38 (CC-v) and T1-08/T1-12 weigh for the page, T1-04/T1-11/T1-30/T1-31 show the coordinator checking *agents* inline, which O L27 allows |
| P2 | S2-06 (CC): heterogeneous teams −12.6 pp vs strong-homogeneous | O L56-63, L68 tiering and "Prefer Luna" | adverse finding against a present rule | one benchmark (BrowseComp); locally the cheap tier did bounded work, not the deep search S2-06 tested |
| P3 | S2-19 (CC): identical sampling + voting helps | O L117 "vary the angle across verifiers instead of N identical refuters" | finding vs rule, different conditions | S2-19 is closed-answer voting, S2 itself says "not orchestration"; S2-25 shows majority pressure harms |
| P4 | S1-49 (RA): escalation to the expensive tier only on the human's word | O L123-124 escalate by rule after two rounds | design difference, no evidence either way | T1-07 shows a rule-driven escalation would have met a 1 % quota |
| P5 | S1-37 (VE): bound what counts as a finding | O L116 "a refuter defaults to `refuted` when it is uncertain" | tension, not incompatible | a refuter's verdict bias and a reviewer's finding scope can coexist; T1-50 is the local cost of unbounded findings |
| P6 | S1-05, S1-57 (RA): share full traces; gate architectures on it | C L122-127 brief = TASK/CHECK/RETURN; O L14 prompt-only mode | design difference | the page neither forbids nor instructs passing the trace |
| P7 | S1-41 (VE): an absolute green gate serialises a wide team | O L100 "the evidence that decides comes from an agent that did not write the code" | conditional on width | never reached locally (six alive) |
| P8 | S3-39 (ME): a Codex child inherits the full tool surface | C L140 "Choose the smallest `RIGHTS`" | the page is stricter | no conflict of instruction; a difference of default |
| P9 | S3-53 (ME): Claude workflows allow 16 concurrent; S1-14 (VE): 10+ subagents for complex research | O L96 "alive at once 6" | the page is stricter | T1-01 and T1-53 are why |
| P10 | S3-24 (ME): interrupt, surface a payload, wait for the human | C L144 approval requests "declined and recorded" | design difference | T1-51: 10 of 13 turns ended at exit 6 under the decline design |

Count: 10, of which 1 `contradicts`, 2 adverse findings against present rules, 7 design differences or conditional.

### 6.2 Lens versus lens

The ten disagreements of §1.3 (D1–D10), plus two handoff gaps: S1-16's +90.2 % and S1-52's accuracy comparison were passed to S2 by S1's own text and S2 fetched neither source. Count: 10 disagreements + 2 gaps = 12.

### 6.3 Page versus its own record (T1 "page then / page now")

| # | page line now | incident(s) | kind |
|---|---|---|---|
| R1 | O L96 "alive at once 6"; L63/L69 bulk outside the pool | T1-01 (80 agents under a 6-alive page), T1-53 (51 agents, no rule then) | rule absent or unfollowed then; written after |
| R2 | O L115 critique the split | T1-05, T1-09, T1-39 (assembly defects the critic did not cover; L115 written after T1-09) | rule covers the split's content, not the assembled prompt — three recurrences, one after the rule |
| R3 | O L70 verdict set describes the subject | T1-39 (a generator bug the set could not catch; "L70 unchanged") | rule scope narrower than the failure class |
| R4 | O L54 fan out, verify, cross-review, then synthesise | T1-08, T1-12 (reported to the owner before verification; no rule then) | rule written after |
| R5 | O L118 open one return whole | T1-10 (self-corrected; the rule's origin) | rule born of the incident |
| R6 | O L105 never end your turn with an agent alive | T1-33 (a session ended with W1 alive; recovered) | rule present, breached by the session end, recovery worked |
| R7 | C L284-290 what the user reads | T1-34 ("Сиденье Codex Sol R1", a recidive measured on 0.11.1) | rule present and abstract; now L54 names the shape |
| R8 | O L44 "go" covers only what the plan listed | T1-23 (bare "го" over open forks, three times) | rule present, read loosely |
| R9 | O L119 judge panel | T1-37, T1-45 (2 of 6 Astra verdicts overturned by a check no agent could run) | rule present; the judge lacked the decisive check |
| R10 | O L41, L66-69 the pool sentence "six alive" | T1-54 (owner on 2026-09-12: 1 astra, 1 fable, 2 opus, 2 sol, 10 luna, 5 terra) against the 2026-09-08 word (6 alive) | numbers on the page follow the earlier owner statement; low confidence which is current |
| R11 | O L68 "Prefer Luna to Haiku … measured better and smarter, and four times cheaper" | T1 §2.4: Haiku 4/50 schema losses and 12 surviving findings; Luna 20/20 located; no Haiku token count recorded ("not recorded per agent") | a "measured" sentence whose price half has no trace in T1 (C0: treat measured changelog sentences as claims) |
| R12 | O L120 completeness critic | T1 §4 "never assigned anywhere in the corpus"; T1-49 | rule present, never executed as its own agent |

Count: 12 (5 rule-written-after or born of the incident: R1, R2, R4, R5, R11's origin; 5 rule present but not followed or too narrow: R3, R6, R7, R8, R9; 2 discrepancies in the record: R10, R12).

Totals: practice vs page 10 (1 strict); lens vs lens 12; page vs record 12.

---

## 7. Shortlist (≤ 12) and do-not-adopt

Ranking key: study-design strength first (CC > VE > RA > ME), then a linked T1 incident, then not already `present`. Change type: prompt-only (a sentence on a page), mechanism (a script, schema or check the coordinator runs), harness (needs the driver, the wrapper or Claude Code). "Phase 3 measures" is the metric; none of these rows claims the change improves management.

| # | claim ids | stage | what it implies | change type | linked T1 | phase 3 measures |
|---|---|---|---|---|---|---|
| 1 | S2-02, S2-03 (+ S2-12/13, S1-56, S1-60) | 8 | a sequential, tool-dominated or single-check step stays with the coordinator or one agent; it does not enter a panel | prompt-only | T1-45; T1-19, T1-48 (fired) | agents and paid turns per adopted outcome, with a no-delegation comparator |
| 2 | S2-05 (+ S1-14, S3-59) | 2 | a bulk width keyed to the unit count, with the plan stating why that many; marginal agents are not assumed useful | prompt-only | T1-01, T1-53, T1-03, T1-26, T1-U2 | independently verified findings per agent at widths 5 / 10 / 20 / 50 on matched claims |
| 3 | S2-06, S2-18 (+ S1-23, S1-13) | 2 | calibrate the cheap tier on local claims before widening it; demote seat by seat against a measurement | mechanism (a measurement) | T1-U4, T1-02, T1-03, T1-16 | per-claim correctness by tier (Luna, Terra, Sol) on matched claims |
| 4 | S2-37, S2-38 (+ S2-33, S2-46, S1-40) | 5 | a judge verdict that rests on a check the judge could not run returns `unknown`, or the check is gated (`EXPECT:`, C L181) | prompt-only (mechanism exists) | T1-37, T1-45 | judge verdicts overturned by a later executed check |
| 5 | S2-09 (+ M1, M2, S1-51) | 4 | a progress check between rounds ("is there an adopted outcome? what changed?") with a stall count that triggers a re-plan, not another round | prompt-only | T1-45, T1-46 | rounds to adoption; repeated-round incidents |
| 6 | S2-30, S2-31 (+ S1-28, S3-24) | 3 | before launch, list the commands the task needs and check them against the rights level and the sandbox (network, SSL) | prompt-only | T1-51, T1-44, T1-14 | exit-6 rate per run by declared rights; checks redone by the coordinator |
| 7 | S1-08, S1-09 (+ S3-09, S3-19, S3-46) | 1 | open one assembled brief whole and resolve its addresses by a command before any fan-out; a quantity in a brief is a range | mechanism | T1-05, T1-09, T1-39 | brief-assembly defects reaching a fan-out per run |
| 8 | S1-40, S1-37 (+ S2-08) | 5 | the verifier's scope is named in full; the reviewer flags only gaps that affect correctness or the stated requirement | prompt-only | T1-50, T1-08, T1-12 | regressions per round; owner corrections at stage 6 |
| 9 | S1-15 (+ S3-35, S2-15/16) | 2 / 7 | the plan states expected tokens per tier and a run cap; the run stops at the cap | prompt-only | T1-07, T1-53, T1-01, T1-44 | paid turns per outcome; owner cost-stops and quota near-misses |
| 10 | S1-44 (+ S1-46, S2-07) | 6 | the completeness critic (O L120) runs as its own agent before anything is published | prompt-only (role exists, never spawned) | T1-49, T1-50, T1-08, T1-20 | unfaithful-synthesis incidents; owner corrections at stage 6 (8 of 27) |
| 11 | S1-52, S1-50 (+ S3-24) | 7 | no open fork survives "go": each fork is a numbered choice in the plan with its cost | prompt-only | T1-23, T1-38 | owner corrections after "go" |
| 12 | S3-52 (+ S3-68, S3-31) | 2 / 5 | a schema failure on a bulk return is re-asked once, not lost | mechanism | T1-02 | returns lost to schema per wave |

Rows 1–6 rest on controlled comparisons (four of them adverse or null findings turned into a rule about *when not to* do something); rows 7–11 on vendor experience; row 12 on a mechanism. Nine are prompt-only (1, 2, 4, 5, 6, 8, 9, 10, 11), three are mechanisms (3, 7, 12), none is a harness change or touches the driver.

### Do-not-adopt (the evidence argues against; strongest counter-claim id)

| candidate practice | strongest counter | supporting counters | note |
|---|---|---|---|
| agent-to-agent debate or peer messaging as a verification or synthesis step | S2-21 | S2-24, S2-20, S2-22, S2-25, S2-32, S1-58 | S2-28's boost has no equal-cost arm; the pages have no debate (present-avoided) |
| a role catalogue cut along the phases of one feature (planner / implementer / tester / reviewer as a pipeline; S3-32, S3-72) | S1-04 | S1-03, S2-11, S1-18 | S2-14 dissents under narrower conditions (two roles, GPT-3.5, function-level) |
| a standing persistent advisor thread as the default (theme b) | S2-29 | S1-29, S1-49, S1-30, S2-24 | untested rather than refuted; local continuations cost 1.23× a fresh agent |
| mixed cheap/strong teams on deep search without in-domain calibration | S2-06 | S2-18, S2-12, S1-23 | local Luna work was bounded, not deep |
| N identical refuters with a majority vote as verification | S2-25 | S2-19 (pro, but sampling not orchestration), O L117 | T1-09/T1-10: nineteen identical verdicts answered the prompt |
| an absolute green gate before every commit at width | S1-41 | — | conditional; not reached at six alive |
| a learned router trained off-domain to pick tiers | S2-18 | S2-17 | in-domain pairs needed first |
| handing the conversation to a specialist (handoffs, S3-08, S3-79) | S1-58 | S1-30 | no evidence for it in any lens |
| "measured" as a page word without a trace behind each half (O L68) | C0 rule | R11 | not a practice to adopt; a sentence to re-measure |

---

## 8. Hypotheses for phase 3

Each names its metric (C0's ruler: unique coordinator incidents per comparable run by stage, owner corrections, independently verified outcomes, agents and paid turns) and its comparator. Where the evidence calls for it, the comparator is a single agent or no delegation. Each names a T1 incident or says "no local counterpart". These are hypotheses; nothing above tests them.

| # | hypothesis | stage | metric | comparator | local anchor |
|---|---|---|---|---|---|
| H1 | for a design question that hinges on one decisive check, running the check before any panel (one agent or the coordinator) reaches an adopted outcome in fewer paid turns than a proposer / reviewer / judge panel | 8 / 2 | paid turns and agents to adoption; owner corrections at stage 6 | single agent or no delegation | T1-45 vs T1-19, T1-48 |
| H2 | beyond a bulk width of about ten on one claim class, added Luna agents add no independently verified finding per unit | 2 | verified findings per agent; tokens per verified finding | 5 strong readers vs 20 Luna on the same claims (T1-U2) | T1-03, T1-26, T1-01 |
| H3 | on bounded one-claim verification Luna's per-claim correctness is not lower than Sol's at ~1/34 the tokens; on raising findings it is lower | 2 | correctness on matched claims; unique findings | Sol, Terra on the same claims | T1-16, T1-26, §2.3c, T1-U4 |
| H4 | a judge brief that returns `unknown` when the disqualifying check did not run (or gates it with `EXPECT:`) yields fewer verdicts overturned by later checks | 5 | verdicts overturned by a later executed check | the current judge brief | T1-37, T1-45 |
| H5 | opening one assembled brief whole and resolving its addresses by a command before a fan-out reduces stage-1 contract defects reaching a fan-out | 1 | stage-1 incidents per run; agents burned on a defective brief | O L115 critic alone | T1-05, T1-09, T1-39 |
| H6 | a between-round progress check with a stall threshold of two reduces rounds spent without an adopted outcome | 4 | rounds per adopted outcome; repeated-round incidents | O L123 "two rounds then escalate" alone | T1-45 |
| H7 | a pre-launch command inventory against the rights level and sandbox reduces exit-6 turns and coordinator-redone checks | 3 | exit-6 rate; redone checks; tokens on blocked turns | the current rights table alone | T1-51, T1-44 |
| H8 | a bounded-finding reviewer brief reduces regressions per round in documentation edits | 5 / 6 | regressions per round (rounds.md style); owner corrections at stage 6 | an unbounded critic brief | T1-50 |
| H9 | continuing an implementer for fix rounds and briefing a fresh implementer with the diff give the same independently verified outcome, and continuation is not cheaper | 4 | verified outcome; tokens per round | fresh agent per round | T1-25, T1-33, T1 §3 (1.23×) |
| H10 | a standing advisor thread consulted across a run changes no decision that a one-shot critic at the same points would not | 4 / 2 | decisions changed by the advisor; owner corrections; tokens | one-shot top-tier critics at the same points | no local counterpart |
| H11 | a plan that states expected tokens per tier and a run cap reduces owner cost-stops and quota near-misses | 2 / 7 | owner corrections at stage 2 (5 of 27); runs stopped for cost; paid turns per outcome | alive caps only (O L96) | T1-07, T1-53, T1-01 |
| H12 | a completeness critic spawned as its own agent before publication reduces stage-6 incidents | 6 | stage-6 incidents; owner corrections at stage 6 | the coordinator's own completeness pass | T1-49, T1-08, T1-20 |
| H13 | closing every fork in the plan before "go" reduces post-"go" owner corrections | 7 / 8 | owner corrections after "go" | the current plan step 2 | T1-23, T1-38 |
| H14 | a written role table (§5a) changes stage-2 incident counts only where it fixes rights and return shape per role, not names | 2 | stage-2 incidents; agents per outcome | the same runs without the table | no local counterpart (T1 §4 has roles without a table) |
| H15 | on matched tasks with the same budget, an orchestrated run and a single strong session differ in independently verified outcome, owner corrections and paid turns in a direction this phase cannot predict | all | C0's ruler in full | single agent / no delegation | T1-19 (2 agents, landed) vs T1-45 (16 agents, no name) are unmatched hints only |

Measurement cautions carried from S2-B: n = 20 cells give ±20 pp intervals (S2-42), so a hypothesis needs matched pairs and paired tests (S2-44); Luna or Sonnet reader panels are simulated readers whose external validity is unknown (S2-45); a same-model judge favours its own output (S2-37), so outcome verification in phase 3 must be cross-family or human; token accounting must be iso-call or iso-cost, not equal-rollout (S2-48). Nothing in this document claims that any practice improves management; it claims what the sources measured or said, what the pages contain, and what the local record shows.
