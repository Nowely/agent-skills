# Roles

A role defines what an agent does, what it may write and what it returns. The orchestrate page's
[default team](../SKILL.md#the-default-team) owns when each core role runs,
[Capacity and models](../SKILL.md#capacity-and-models) the exact models, and
[the agent's return](../SKILL.md#the-agents-return) the five fields every agent returns. An agent briefed with
its row here reads that row, its section below when it has one, and [Checks](#checks) when it runs any. Read
agents may return text or write permitted temporary artifacts.

A proxy relays one `--run` of an external worker and hands back what it printed; it decides no request
and reads no result ([external.md](external.md#3-run-it)), so the coordinator owns both. In the [main proxy mode](main-proxy.md),
Claude owns those orchestration decisions and executes work with its own tools and agents; the current
host transports user messages and Claude's replies.

## Core roles

| Role | What it does | May write | Returns |
|---|---|---|---|
| coordinator | the main session: what it owns and may do is [the orchestrate page's contract](../SKILL.md#the-contract); it decides when a result lands, which a worker applies and the verifier checks ([results.md](results.md#a-worktree-agents-harvest)) | its card, briefs, decision log and draft under its temporary directory | the answer |
| worker | one deliverable by file ownership, in the live tree or a worktree, or the harvest of an approved worktree result; writes its own tests and runs its checks as [Checks](#checks) says; how it writes is [its section](#the-worker) | its owned files, or its worktree, harvested as a diff | the diff, with the counts of what ran and its ledger's path, and in `open` its additions: each concept the diff adds, with the request's words that require it or `none`, and the existing code it searched and why that did not serve; commits only with existing authority and runtime permission |
| plan critic | judges the plan as written, as [its section](#the-plan-critic) says | nothing | `result`: the verdict `sound`, `change` or `stop`, at most five ranked objections, what the plan can drop, and the acceptance checks the verifier should run; on [its second read](#its-second-read), the additions the request does not require |
| architecture critic | challenges the chosen approach and the solution's architecture, as [its section](#the-architecture-critic) says | nothing | `result`: the verdict `keep`, `change approach` or `stop`; at most five ranked objections; on `change approach`, the alternative in a few lines, with what it removes or moves and who relies on it; and what evidence would change the verdict |
| verifier | checks the final combined tree, or for read-only work the claims of the workers' findings, against the requirements, as [its section](#the-verifier) says | its ledger and logs under its temporary directory | `evidence`: a requirement → evidence table, and each of the plan critic's objections marked by whether the check it named failed; `open`: the unverified parts |

### The worker

It writes the code the way the codebase's owner would: before adding anything it reads how the surrounding code
already does the same thing, reuses what exists, follows the local conventions and adds nothing it would not want
to maintain; [the design standard](../../review/references/design-standard.md) is the measure. It does what the
request asks and no more. A problem it notices outside the request it does not fix: it goes into `open` with its
path:line, what is wrong and what leaving it costs. When the task cannot be done without it, the worker returns
`blocked` with the same description.

### The plan critic

It reads the request, the card and the code locations the card names, and judges the plan as written, not the
approach: coverage of every requirement; the steps and their order; ownership, one owner per deliverable; with
several workers, the split, the sequence and the shared interfaces; each brief's completion criteria; missing
work and risks; the allocation of roles and models against the work. It reports first what the code shows that
the plan contradicts or does not know, then what the plan can drop: a step, a check or a role no requirement needs.
Each objection cites a path:line or a named consumer, names the acceptance check that fails if it is ignored and
gives the smallest fix to the plan. Only a gap that affects correctness, ownership or cost counts, never style;
"sound, no objections" is a valid verdict, and five is a cap, not a target.

#### Its second read

When a worker's diff adds a concept, as the [default team](../SKILL.md#the-default-team)'s architecture row
defines one, the coordinator continues the critic's thread, or briefs it fresh where one worker's plan ran
without it, with the user's request verbatim, the diff's path and
the worker's additions as claims to check, never the rest of the worker's return. It reads for what can go, and
leaves behaviour to the verifier: what the diff adds that the request does not ask for; for each new mechanism,
the existing code that already does it, by path:line; the smallest change that meets the request, against the
diff's size. It runs nothing. For each addition it doubts it asks one question: which requirement or test fails
without this? The worker's thread, continued, answers by quoting the requirement or naming a test of a
requirement, or removes the addition and re-runs its checks. One round.

### The architecture critic

It reads the request, the constraints, the approach the card chose with the coordinator's reasons, and the code
locations involved, not the detailed plan. Before judging the approach it states the strongest alternative it
sees: another owning unit, reuse of what exists, a different mechanism, or not doing it. It judges whether the
right problem is solved; the unit that should own the change, and why; what already exists that the approach
duplicates or bypasses; each new concept and the requirement that justifies it; coupling and the consumers
affected; reversibility and long-term cost; fit with the repository's design principles, measured against
[the design standard](../../review/references/design-standard.md). Its objections are grounded as the plan
critic's are. It differs from the architect, who authors a design; the advisor, who answers the question it is
asked; the judge, who picks among candidates; and the review's design direction, which reads code already written.

### The verifier

It checks behaviour against the requirements, and leaves what could be removed to the plan critic. It works from its brief alone, which carries what the orchestrate page's [Verification](../SKILL.md#verification)
gives it, and names its target and whole scope. Its target is the final combined tree or, for read-only work
(research, analysis, review), the claims of the workers' findings. On a tree it runs the full relevant suite as
[Checks](#checks) says and reports every failure with its command and output; a requirement with no executed
evidence is `not proven`, never passed. On findings it re-derives each material claim from the cited source or
command, and a claim it cannot re-derive is `not proven`. A verdict that rests on judgement alone, with no executed
check, says so. After the table it makes at most three attempts to break the tree, each aimed at a named
requirement, and reads the diff for what the change removed, moved or narrowed and who relied on it. A defect
outside the change is reported only when it fails a requirement. It marks each of the plan critic's objections by
whether the check it named failed, and each test a worker named in defence of an addition by whether it tests a
requirement or only the addition's internals. After a fix it re-runs the suite and re-reads the fix's diff, not
the whole change. Its thread may be continued to read the final draft, as [answer.md](answer.md) says.

## Other roles

Read a row when the card names its role. The orchestrate page's model and effort defaults apply to these
roles; the proxy is transport and follows its adapter's relay settings. A swarm's own model restrictions apply
when the user explicitly authorizes that allocation.

| Role | What it does | May write | Returns | Spawn it when |
|---|---|---|---|--- |
| scout | gathers the information available for the task into a folder the coordinator names, so the planner works from it: the files, documents, configurations and sources the task names or implies, and earlier results when the task builds on them | that folder | the folder's path, an index of what it holds with addresses, ranked by relevance to the planner's question, and what it could not reach | before planning or a design; one per area when the material is wide |
| architect | designs: competing designs, a page delta, a schema; never implements | nothing | the design with its evidence and open questions | a design task |
| advisor | counsel, in one of two modes: per call, one question on a plan, a stuck case or a verdict, one answer; standing, one thread kept for a run and asked one question at each decision point; never implements, never judges its own advice | nothing | a recommendation with its reasons, one alternative and what would change its mind | per call, on the coordinator's explicit call by the agreed composition; standing, when the user requests consultations or the approved composition includes one, started before the run's first decision |
| foreman | runs the agreed plan for the coordinator: briefs and launches the workers, has their work verified, handles their failures; no channel to the user and no right to change the plan | nothing: its workers write under their own rights | one report: a line per worker, the verifiers' evidence verbatim, every artifact path, every deviation, concern and finding outside the task | several workers, when the agreed plan and runtime support a delegated coordinator; [foreman.md](foreman.md) |
| proxy | one relay turn runs one `--run` of an external worker and hands back what it printed; decides no request, reads no result and edits no prompt | nothing | the launcher's lines, unchanged | one turn per `--run` of an external worker the user named; reuse the native task through an explicit, verifiable follow-up when supported, and use a fresh context for a measured stale-hand-back case |
| competing implementer | one of the alternatives the plan approved, in a worktree of its own | its worktree | the diff | two designs viable and cheap to build; landed by the page's harvest procedure |
| cross-reviewer | an independent agent reviews a writer's diff by [the review page](../../review/SKILL.md), which its brief names by path, with the diff's path, against the requirement, the owning unit and its consumers, all named in the brief; the coordinator handles the review page's plan and passes its approval before launch; one reviewer for the whole review by default. When the plan's checking agents are on, the coordinator conducts them as [the review page](../../review/SKILL.md#agents) says; the target's brief is the owner's requirement, not the owning unit the coordinator chose, and every agent gets the plan's scope. Under an approved multi mode the user asked for, this reviewer leads the review: it owns the connected analysis, the final map and the report, and checks the evidence of the direction helpers it uses; a valid change in the wrong unit is a finding. When the user answered a cross-review's page, the fix round's brief carries the record and the export, and the next cross-review reads them as its [next revision](../../review/references/report-data.md#the-next-revision) says. The last round reads the whole change before it lands, consequences first: what the change creates and where, who removes it, how the user finds it and whose it is; what it removes, moves or narrows and who relied on it; then whether the pages say what the code does; each finding has passed [the review page's refutation](../../review/SKILL.md#refuting-a-candidate) | its review record and page, outside the source tree | findings as the [return section](../SKILL.md#the-agents-return) defines them, plus the full record in an allowed artifact, or inline when writes are prohibited, unless the plan chose a short review; for incomplete coverage, a partial review and its limits | the user asks for a review of the change, or the card names one; after a writer returns, two rounds at most, the last before the change lands |
| review direction helper | investigates one direction of [the review page](../../review/SKILL.md) (behavior, necessity, design or tests) as [its agents reference](../../review/references/agents.md#direction-helpers) briefs it | nothing | candidates, corrections, questions and incidental leads, with source locations, attributed evidence, checks, examined and unreached scope, and limits | only when the user asked for multi mode and the approved plan names it, one per requested direction, started as that plan says; never for an ordinary cross-review. When the coordinator launches helpers, it forwards their returns unchanged to the reviewer that leads the review; if it cannot, stop and ask. Failures go to that reviewer and any user decision goes through the coordinator |
| refuter | attacks one claim, or one cluster the dedup-and-rank made, keeping its origins, each refuter from a perspective of its own, never an identical brief; a shared prerequisite runs once, by one agent, and its receipt goes into every refuter's brief; `refuted` when its check ran and contradicted the claim | nothing | `upheld`, `refuted` or `unknown`, with evidence | on claims the coordinator or extractors produced, after the dedup-and-rank |
| strong reader | re-derives a claim by running commands or reading a source whole, from a brief that names the source, its revision, the decision the answer feeds and the evidence that ends the read; it stops at that evidence | nothing | findings with the commands run and their counts, a negative result told apart from an input it could not reach | a claim needs execution |
| live prober | makes a behaviour happen for level-3 evidence: rights, a stop, a path; it takes its baseline capture before any write and never while a writer runs, and freezes it as a file with its sha256, the revision, the mode, the platform, the control it is compared with and the time; the brief of a write that depends on the capture names that file | its temporary directory; a target only under a settled write right | what happened, with the report fields, and per capture its file, sha256, revision, mode, platform and control | a claim about behaviour must be proven |
| bulk agent | one unit: one claim, one address, a verbatim quote and a closed-set verdict about the subject, or one extraction part with a fixed answer schema; native agents side by side within the alive bound or, when the user named Codex or OpenCode for the batch, a swarm, launched by one script under its own concurrency cap and stopped through the host or launcher | nothing | quote, verdict, open; a swarm's summary outside the run, a line per agent with its report path, for the swarm reducer | wide and shallow work within runtime capacity, after its pilot; a swarm on the user's "go" on a plan that proposes it with its count and cost, or on an explicit request for the swarm launcher, each in a run directory of its own |
| swarm reducer | reads every report of a swarm that is the run's own, opens one return whole, tallies the verdicts by unit, names the units whose answer did not parse or whose report was not the run's | its tally in a temporary file | the tally and one return quoted | after a swarm's summary |
| blind proposer | candidates without seeing the others' | nothing | a candidate list | a design round, after the plan has named the criterion that selects the survivors; several at once |
| judge | the final verdict by the criterion the plan named, which its brief quotes; reads the tree itself, not the returns | nothing | the verdict and a marked-up artifact, naming a missing check in `open` | the end of a design or verification round |
| dedup-and-rank | merges a wave's returns into clusters of one claim each, keeps every origin on its cluster, ranks, and names the mechanical prerequisites (a build, a suite) the refuters share; the coordinator synthesises from it | its report in a temporary file | a ranked, attributed list of clusters | before the refutation of a wave's claims, and a wave wider than the coordinator can read whole |
| surveyor | one lens of a field survey: sources fetched, claims as rows with quotes and conditions; no mapping, no ranking | its table in a temporary file | the rows and a coverage table | a survey, one agent per lens |
| measurer | a script over inputs fixed by path and digest, re-runnable by anyone who has them; numbers with the method stated, and `unknown` for what the inputs do not hold | its script and tables in a temporary file | the table and the method's caveats | a claim needs a number |
| final reader | reads the final draft fresh, with the inputs and protocol of [the read](answer.md#the-read) | nothing | `result`: the read's three lists | when [the read](answer.md#the-read) says |

## Checks

An agent that runs a check runs it when its result can change the next decision, through the runner its brief
names by its resolved path: `node "<skill-dir>/scripts/capture-check.mjs" --label <question> --ledger <file> -- '<command>'`,
with `ENTRUST_TEMP_CONTEXT` set to the JSON its brief gives. The full log and the ledger go under the run's
temporary directory, and the real exit status is reported even when a pipeline fails. Put the ledger under an
approved temporary root, and set `TMPDIR` to that root when the default temporary directory is outside the approved
scope. Cite each check's exit status and counts in `evidence`, and return the ledger's path in `artifacts`: the
coordinator's lint of the answer takes it as a receipt.
