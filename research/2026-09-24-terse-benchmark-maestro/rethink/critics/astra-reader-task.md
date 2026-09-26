# Stage 3 critic: the reader's task

## Standard and scope

This is a comparative judgement of all ten numbered files in `structures/`, not an audit of an existing README. `document.md` says there is no document yet. The governing standard is `purpose.md` §1, read with its §2 reader profile and the owner's decisions in `standin/answers-01.md` and `standin/answers-02.md`. The synthesis and terms supply context; the later owner decisions prevail when they disagree.

The four abilities are **F**: tell whether Maestro fits the reader's tool and problem; **I**: install by the fitting route; **R**: run `/teach-maestro` once, then `/diagnose`; **N**: find the next command in the command table. Reader **A** knows their coding tool and slash commands, may not know MCP or skills folders, and has not chosen a route. Reader **B** already uses the extension or MCP and wants the command list, source, or contribution boundary. Neither should have to read another distribution page to obtain the minimum first-run instructions.

A section's assigned purpose can establish a home for an ability at this outline stage. That does not establish that its devices, exclusions, or budget can deliver the answer. I distinguish **no home** from an incomplete answer within a home; otherwise every incomplete installation detail would misleadingly become a missing Installation section. “Fatal flaw” below means the most consequential reason to reject a draft that follows the structure unchanged, not an observed rejection by the owner. No draft or reader trial exists here.

## 1. Ranking of every structure

1. **`04-against-the-alternatives.md`** — Best complete allocation of fit, route-specific first use, checkable outputs, and direct return-user lookup; its extra comparison section costs attention but the core tasks have explicit instructions and room.
2. **`08-the-process-as-the-spine.md`** — Best order for completing a first project and immediately choosing the next command, with full output criteria; invocation back-references make the route-to-run transition weaker than 04.
3. **`05-change-without-harm.md`** — Explicit per-route Usage bullets, substantial setup, and immediate command lookup serve both groups, but the speculative pre-install change-check sequence delays the actual task.
4. **`02-what-do-i-type.md`** — Action/result pairing, substantial installation space, and Commands immediately after first use are useful; its universal typing frame and displaced invocation instructions undermine that advantage.
5. **`07-the-genres-shape.md`** — Direct navigation and a conventional task order make the answers easy to locate, but its shared two-chat-step device does not allocate the owner's route-specific first-use explanation.
6. **`09-claims-with-their-evidence.md`** — Strong route effects, explicit first-run outputs, and direct command-to-source links help both groups; making authorized instructions conditional on execution adds a gate the reader's task does not require.
7. **`03-what-it-will-not-do.md`** — All tasks are locatable and first-run output has a slot, but separating the extension's effects from its installation forces a consequential backtrack and violates the owner's placement decision.
8. **`01-decide-in-thirty-seconds.md`** — Problem fit receives clear space, but invocation exclusions, no specified opening task shortcuts, and Session memory before Commands make both first use and return lookup harder.
9. **`06-outside-the-field.md`** — Keeping installation and first use together is valuable, but the invented novice profile and a bash block mixing terminal and chat actions sabotage the promised copy-and-run path.
10. **`10-the-shortest-that-serves.md`** — Every task has a nominal home, but 115 words for all setup, 25 for first use, and 100 for the entire command table compress away the distinctions and outcomes those homes must deliver.

## 2. One fatal flaw in each structure

### 04 — The source-install alternative stops before the reader's project

**Location:** §3 Getting started → Skill files and First project. The structure allocates clone/build fences and a folder/tool map, then proceeds to commands in the reader's project, without assigning the handoff from generated files in the clone to skills available in that project. `terms.md` row 19 explicitly says build output lands in the clone. This is an unfinished installation path even in the strongest structure: the reader must guess which files go where before starting the promised first project.

**Owner/purpose clause failed:** “install it by the route that fits” (`purpose.md` §1), followed by the owner's “Skill files: type `/teach-maestro`, then `/diagnose`, in the agent's chat” (`answers-02.md` §11b). The structure does not join those two states for the build alternative. This objection does not require inventing the missing transfer command.

### 08 — The extension first-run instruction points back to a slot that does not specify it

**Location:** Getting started → VS Code extension; First project. First project explicitly sends route-specific invocation wording back to the selected H3. The extension H3 specifies installation clicks, requirements, and effects, but no Command Center, palette, or `@maestro` invocation. The MCP H3 does explicitly name its prompt/tool surface. Following the outline literally therefore leaves an extension reader hunting for the interface in which the two first-run actions occur.

**Owner clause failed:** “Extension: run the same two from the Command Center sidebar, from the command palette” or “as `@maestro /teach-maestro` in VS Code's chat” (`answers-02.md` §11b). This is an incomplete handoff inside R's assigned sections, not an absent R section.

### 05 — The build alternative again has no completion step in the target project

**Location:** §3 Installation → Skill files, then §4 Usage. Two terminal fences and ten folder/tool names are followed by well-specified route invocation bullets. Neither installation nor usage assigns the action connecting the build output to the project being taught. The strong Usage section cannot make a locally generated copy available to that project's agent.

**Owner/purpose clause failed:** “install it by the route that fits” (`purpose.md` §1); “The other way is to clone the repo and run `npm run build`, which copies `source/skills/` into the ten provider folders” (`answers-01.md` §5, must-say 3). The owner establishes the alternative; terms row 19 establishes its clone-local destination. The outline treats those facts as a completed install rather than reserving the missing project handoff. This is the same serious inherited gap as 04, not a claim that 05 alone introduced it.

### 02 — The invocation instructions are displaced without being specified at their destination

**Location:** §4 First project excludes “per-route invocation syntax (see §3).” §3's sub-blocks allocate acquisition commands, folders, extension ID/effects, and MCP runtime/wave facts; none explicitly allocates the three invocation interfaces. Meanwhile §2 and §5 both label their action column “Type this,” and §4 supplies one shared code block. A literal draft can meet this device plan while leaving the reader to infer whether to type, select a prompt, or use the extension UI.

**Owner clause failed:** “The first-run block must not promise one interface for all three routes” (`answers-02.md` §11b). The cross-reference does give the subtask a proposed destination; it does not actually specify the answer there. Repair the handoff rather than treating a shared typing example as sufficient.

### 07 — Two chat steps stand in for three established invocation surfaces

**Location:** §3 First project. It specifies “one numbered list of two chat steps” and excludes route-specific UI claims not evidenced for every MCP client; §2's MCP H3 supplies the local launch command but no prompt-picker/by-name instruction. The owner has already supplied a route-level invocation fact that needs no exhaustive client survey. A universal chat sequence omits that fact and leaves the MCP adopter translating syntax alone.

**Owner clause failed:** “MCP server: pick them as prompts … or ask for them by name” and “The first-run block must not promise one interface for all three routes” (`answers-02.md` §11b). Citing that section in “Rests on” does not fix a device specification that only names chat steps.

### 09 — Its execution prerequisite can remove the owner's authorized install route

**Location:** Rules, then Installation → Skill files. “A fenced line ships only once the author has run it” makes the required skills CLI instruction conditional on an additional exercise. No fallback is specified if the author cannot execute it. The reader can consequently lose an install answer the owner deliberately authorized as unrun. This is a structural publication gate, not evidence that the CLI fails.

**Owner clauses failed:** “The three install routes, each with its command” and “`npx skills add sharpdeveye/maestro` is my own wording of the command … I have not run it” (`answers-01.md` §5, must-say 3). Keep its unrun status in authoring evidence; do not let an invented verification gate silently delete the default route.

### 03 — A reader must leave the extension route to discover its consequences

**Location:** §2 What it will not do; §4 Installation. Installation expressly excludes write-effects and points backward to the seven-row disclosure table. A reader who jumps directly to the fitting extension route must backtrack to decide whether to install it. This is particularly costly for a known-tool reader using same-page navigation.

**Owner clause failed:** “the effects are listed in full beside the extension route” (`answers-02.md` §4). An earlier all-product table plus a pointer is not the beside-the-route disclosure the owner chose because the writes happen without asking.

### 01 — It explicitly cuts the interfaces needed to perform its first run

**Location:** §3 Getting started excludes extension UI names; §4 First project excludes MCP prompt-picker UI detail and supplies only two numbered steps. The combined exclusions provide no explicit instruction surface for two routes. Removing an interface tour would be harmless; removing the minimum place to invoke the first command is not.

**Owner clause failed:** “The first-run block must not promise one interface for all three routes” (`answers-02.md` §11b), which supplies the sidebar/palette/chat and prompt-picker/by-name alternatives. The plan must distinguish minimum invocation instructions from dispensable UI detail.

### 06 — Its advertised copyable block crosses execution environments

**Location:** Getting started → Skill files. It specifies one bash block containing installation, a build comment, a boundary comment, then the two chat commands. A comment does not move execution from a terminal to the coding agent's chat; copying the advertised block does not perform the promised first run. The initial premise also underestimates this reader, whom the owner says already knows slash commands.

**Owner clause failed:** “Skill files: type `/teach-maestro`, then `/diagnose`, in the agent's chat” (`answers-02.md` §11b). The reader must split the block and choose the destination themselves, defeating this structure's defining device.

### 10 — Its first-run budget cannot carry the authorized first-run contract

**Location:** §4 First project, 25 words, one shared chat sequence and context-precedence note. There is no allocated route-specific invocation device in §3 to compensate, and the scored report/checkable completion criteria are not specified. Twenty-five words cannot explain the three invocation surfaces, once-per-project prerequisite, file output, context precedence, and diagnosis result. Cutting those facts would turn the promised observable first run into a pair of names.

**Owner clauses failed:** “The first-run block must not promise one interface for all three routes” (§11b) and “the first-run block should end on something the reader can check” (§11c, `answers-02.md`). The owner specifies a root `.maestro.md`, five scores of 1–5, an overall /25 score, and a next command per gap. Increasing the budget is required; citing these requirements does not fit them into the allocated slot.

## 3. Shared failure: the brief budgets installation facts, not a completed installation task

**Shared failure in one sentence:** All ten leave the clone/build-to-project handoff unspecified, exposing a brief that treats acquiring or generating skills as equivalent to making them available for the reader's first project.

The evidence is unusually concrete: `terms.md` row 19 says `npm run build` creates folders in the Maestro clone, not the reader's project. Yet 01–05, 07, and 08 specify a clone/build alternative without a transfer/readiness step; 06 reduces build to a comment; 09 expressly tells the reader the output remains in the clone but assigns no next action; 10 inherits D04 in its compressed setup/action slots without reserving this handoff. A folder/tool map answers recognition, not the action needed to get from generated files to a usable skill in the target project.

This is a brief-level failure in the requirements inherited by all ten, not a claim to have read the structures brief. The synthesis's D04 requires the alternative and “expected availability”; D06 separately begins first use. The missing dependency between the two was not settled. Merely shifting the same headings and budgets cannot supply the fact. The best outlines improve route-specific invocation, but none closes this earlier gap.

**What the brief should have required:** For every offered installation path, reserve an explicit transition from the reader's starting tool and target project to commands available there. Name the action's execution surface and destination; distinguish generated files from installed skills; then connect the route's actual invocation surface to `/teach-maestro` and the checkable `/diagnose` result. For clone/build, either supply the authorized project handoff or record it as an unresolved fact that must be settled before describing the alternative as usable. Do not ask a writer to invent filesystem instructions. Require a separate entry path for existing users to Commands and the editable source, without making them repeat onboarding.

The exact transfer procedure is **unknown** in the permitted materials. I have not tested it or inspected source, and no guessed copy command is proposed here.

## 4. Three grafts onto 04, with displacements

1. **From `06-outside-the-field.md`, Getting started → the route-local install/first-use arrangement:** take the placement of the first-use surface beside each selected route and its explicit default-to-skill-files lead-in. It displaces 04's repeated first-use information split between chooser and the shared First project block. Preserve separate terminal and chat/prompt surfaces; do not import 06's mixed bash block. Keep shared success criteria once.
2. **From `09-claims-with-their-evidence.md`, Commands → each command name links to its `SKILL.md`:** take this source-access device inside 04's existing 24-row table. It displaces 04's command-name-only cells and makes source reachable from the lookup used by reader B. The contributor edit/build/check line remains; a command link does not replace it.
3. **From `05-change-without-harm.md`, Installation → chooser's “writes and records” column:** take the consequence cue at the route decision. It displaces 04's separate three-row “What Maestro adds” comparison table and its speculative alternative categories; put the necessary product/problem boundary in the existing opening fit text. Keep the full extension effects beside that route as the owner requires. This gives A evidence for the actual choice rather than a comparison with loosely defined alternatives.

None of these grafts supplies the unknown clone/build project handoff. That requires a brief correction, not a borrowed presentation device.

## 5. Ability homes and the actual reader paths

Section numbers below refer to each candidate's numbered structure or ordered rows. **None** means no entire ability lacks an assigned home; it does not mean the structure is ready to draft unchanged.

| Structure | F: tool/problem fit | I: fitting install | R: teach then diagnose | N: next-command lookup | Ability with no home / base disqualification |
|---|---|---|---|---|---|
| `01-decide-in-thirty-seconds.md` | §1 Opening + §2 Choose your route + §3 compatibility | §3 Getting started | §4 First project | §6 Commands | None; not disqualified by the no-home rule. |
| `02-what-do-i-type.md` | §1 Maestro + §2 Choose your route + §3 requirements | §3 Install and run | §4 First project, with invocation assigned back to §3 | §5 Commands | None; not disqualified by the no-home rule. |
| `03-what-it-will-not-do.md` | §1 Maestro + §2 effects + §3 chooser | §4 Installation | §5 Usage | §6 Commands | None; not disqualified by the no-home rule. |
| `04-against-the-alternatives.md` | §1 Maestro + §2 What Maestro adds + §3 chooser | §3 Getting started, three route H3s | §3 First project | §4 Commands | None; not disqualified by the no-home rule. |
| `05-change-without-harm.md` | §1 Maestro + §2 change check + §3 chooser | §3 Installation | §4 Usage | §5 Commands | None; not disqualified by the no-home rule. |
| `06-outside-the-field.md` | §1 Maestro/tool names + §2 lead-in | §2 Getting started, three route H3s | First-use actions inside each §2 route | §3 Commands | None; not disqualified by the no-home rule. |
| `07-the-genres-shape.md` | §1 opening + §2 route matrix/compatibility | §2 Getting started | §3 First project | §4 Commands | None; not disqualified by the no-home rule. |
| `08-the-process-as-the-spine.md` | Maestro + Getting started chooser | Getting started | First project + route back-references | Commands | None; not disqualified by the no-home rule. |
| `09-claims-with-their-evidence.md` | Maestro + Installation chooser/fit table | Installation | Usage | Commands | None; not disqualified by the no-home rule. |
| `10-the-shortest-that-serves.md` | §1 Maestro + §2 chooser + §3 requirements | §3 Getting started | §4 First project | §5 Commands | None; not disqualified by the no-home rule. |

### Where a task needs a guess or backtrack, by structure

- **01:** A must reach setup to establish tool fit, then infer extension/MCP invocation because the relevant interface detail is excluded. N follows Session memory, so a new user leaving the baseline cannot immediately consult the promised next-command table. B has no specified opening command/source shortcuts and must scroll or use GitHub's outline to reach §6 or §8. The build alternative also has the shared project-handoff gap.
- **02:** A's chooser displays an action before prerequisites/effects, so acting on the row requires a forward check in §3. At first use §4 sends them backward to §3 for an invocation explanation not explicitly allocated in its sub-blocks. B does get shortcuts and a near-immediate Commands section; a new MCP user reading “Type this” still has to remember the route's non-universal interface. The build alternative has the shared gap.
- **03:** A choosing the extension must backtrack from §4 to §2 to inspect the unasked writes. Usage's single example needs a route distinction beyond its declared device. B has four opening anchors and a visible Commands table, though their exact destinations are not enumerated; source/help is in §9. The clone/build handoff remains unspecified under D04.
- **04:** A choosing source build must guess how clone-local output reaches their own project. First-use surface appears in the chooser, route blocks, and shared First project block, requiring reconciliation despite the clear overall sequence. B has an explicit Commands/source shortcut and the full problem/outcome table; no forced onboarding backtrack is specified for B.
- **05:** A meets a four-stage change-check story before an install route. It both promises a re-check and excludes that re-check pending a real before/after pair; the reader cannot know whether this is an actionable procedure or an illustrative future one. After install, the per-route Usage bullets restore a clear path, apart from the shared build handoff. B can bypass the story via the opening command/source shortcuts and use §5/§8.
- **06:** A must manually divide the skill route's single bash block between terminal and chat; the build alternative is only a comment, and the MCP route does not explicitly allocate its Node requirement or client-registration handoff. First commands are named but no route specifies the owner's full output check. B has the Commands table and source boundary but no specified opening shortcuts. The omission of literal folder/tool mappings also removes an owner-required recognition aid for source users.
- **07:** A choosing MCP sees a local launch command followed later by “two chat steps” and must infer the prompt-picker/by-name bridge. “Baseline result” gives less explicit completion guidance than the owner's scored report. B has command/source shortcuts and a visible full table, so the return path is strong. Source build still ends before project availability.
- **08:** A is sent from First project backward to their route; MCP names its surface, while extension first-use instructions are not specified at that destination. The two-step completion criteria themselves are strong. B can jump directly to Commands or source, bypassing the process picture. Source build has the same unresolved destination handoff.
- **09:** A may have to leave the page if the author's execution gate suppresses the inferred CLI line; execution status is unknown. The build note openly identifies the clone destination but leaves the next action to the reader. MCP client configs are excluded, leaving connection setup as a further handoff to depth documentation. B gets the strongest direct command-to-source path and need not read Installation to use it. The extra re-run instruction is not part of the owner's mandatory first-run sequence.
- **10:** A must infer the first-use interface and much of the success check from a 25-word slot; 115 words for all installations also leaves very little room for skills-folder/MCP definitions, prerequisites, consequences, and the build handoff. B reaches a table through the shortcut, but its 100-word budget leaves little usable problem/outcome text across 24 commands, particularly after group cells and command names. Thus the lookup has a home but is underfunded as an answer.

**Disqualified structures under the specified no-home rule: none.** All ten allocate all four abilities. Several allocate an inadequate or contradictory answer, which is a reason to reject their unchanged execution, but is not evidence that an entire ability has no section. In particular, a citation alone does not remedy missing route details, and an existing first-run section does not prove that its first-run instructions work.

## Evidence and limits

Read: `purpose.md` (including a second pass as the task list); `standin/answers-01.md` (including §§1–2); `standin/answers-02.md`; `survey/synthesis.md`; `terms.md`; `document.md`; and all ten numbered `structures/*.md` files named above. The structures brief, other critics, repository snapshot, published README, distribution pages, website, forks, mirrors, and quotation pages were not read. No network fetch was made. No repository was modified. This report contains no proposed README prose.

Unknown: the exact clone/build-to-project handoff; clean-machine installation success; actual reader completion and backtracking; what the owner would accept after seeing a draft. These are not filled in from source or external pages. No product tests were run or claimed passing.

Command limitation: `rg --files structures` — started no (executable unavailable); individual exit status unknown because the compound shell command continued and exited 0; exact diagnostic: `zsh:1: command not found: rg`. Used `ls` to enumerate the ten structures and `cat`/`sed` to read the permitted files.
