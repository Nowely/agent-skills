# S1 survey: "Rethinking skills and prompts for GPT-6 Astra"

## Pages fetched

| # | URL | Route | HTTP | Bytes (raw HTML) | Fetch time (UTC) | SHA-256 raw HTML | SHA-256 text |
|---|---|---|---|---|---|---|---|
| 1 | https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra | curl -sL --compressed | 200 | 316245 | 2026-09-22T11:31:40Z | 4ac74e2454a4e869f10b1c04168720633d9771c7e2c4ba5f2c4ea62e7de9e59b | 5b84e77d2bb2a6c108d698d35d7795da56c628500c01915663eb47a42eb301ad |

Note: the first `curl -sL` (no `--compressed`) returned the raw gzip stream (47337 bytes — matches the task's "47 KB" figure, which is the *transfer-encoded* size). Re-fetched with `--compressed` to get decoded HTML (316245 bytes). Both `pages/main.html` (raw) and `pages/main.txt` (text, script/style stripped, inline tags flattened so sentences aren't broken across lines) are saved under `pages/`.

## Links the post itself makes, and which were opened

Extracted every `<a href>` inside `<article id="mainContent">...</article>` (the article body, excluding the site's global nav/sidebar, which repeats the same ~15 "Skills"/"Prompting" nav items on every page of developers.openai.com). Command:

```
python3 -c "re.search(r'<article id=\"mainContent\"[^>]*>(.*?)</article>', html, re.S)" + re.finditer(r'<a [^>]*href=\"([^\"]*)\"[^>]*>(.*?)</a>', body, re.S)
```

Result: **exactly one** `<a>` element in the article body:

- `https://agents.md` (anchor text "AGENTS.md")

That domain is `agents.md`, not `developers.openai.com`. So, read strictly, **zero pages on developers.openai.com are linked by this post's body** — the only pages that look relevant (nav items like `/codex/agent-configuration/agents-md`, `/codex/build-skills`, `/codex/skills-and-plugins`, `/codex/enterprise/skills`, `/codex/prompting`, `/api/docs/guides/tools-skills`, `/api/docs/guides/prompt-engineering`, `/api/docs/guides/prompt-generation`, `/plugins/build/skills`, `/plugins/concepts/skills`) come from the site's persistent left-hand doc navigation, present on every developers.openai.com page, not from an inline link the article makes. I did not fetch any of them, since they are not links "it" (the post) makes — see `open` in the report for the ambiguity this leaves.

**Links not opened:**
- `https://agents.md` — off the `developers.openai.com` domain the task scopes to; not fetched.
- The ~10 nav-sidebar items listed above — present on every page of the site (not inline article links); not fetched. Listed for the coordinator's awareness in case the looser reading is wanted.

## Claims table

Page for all rows: https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra — subject model: **GPT-6 Astra**. Where a row's claim also names another model for comparison (GPT-5.6 Sol, Sol, Luna, or the "Codex" product generally rather than Astra specifically), it is flagged in the condition column. Fetch status for every row: fetched, curl route, 200, verified below.

| id | page / model | verbatim quote | practice | condition | evidence | direction | audience | fetch status |
|---|---|---|---|---|---|---|---|---|
| S1-1 | GPT-6 Astra (general/all releases) | "If you've been using agents like Codex for your projects over the last year, you've likely accumulated a lot of instructions as you worked to steer the models toward good outcomes." | revisit accumulated skill/AGENTS.md/prompt instructions at each model release | said to be true "with each release," "more important than ever" specifically for GPT-6 Astra | asserted | harm (of not revisiting) | human | fetched, curl, 200 |
| S1-2 | Codex (product), not Astra-specific | "But many descriptions are far too long, and when you add too many skills, Codex starts shortening their descriptions to fit." | keep skill descriptions short | when many skills are packaged into a project | asserted | harm | human | fetched, curl, 200 |
| S1-3 | GPT-6 Astra (general skill-writing) | "What's worse is that descriptions can often contradict each other or over-emphasize when skills should be used, leading the model to load instructions that don't actually help the task." | avoid contradictory or over-emphasized skill descriptions | none stated | asserted | harm | human | fetched, curl, 200 |
| S1-4 | GPT-6 Astra (general) | "Here, the bad skill description can push the model to use it anytime it touches anything related to a database, rather than only when it has to handle a migration." | scope a skill's trigger description to the specific task, not the general topic | illustrated via a bad/good example pair | argued | harm (of broad trigger) | human | fetched, curl, 200 |
| S1-5 | GPT-6 Astra (general) | "Second, one of the key markers of a useful skill is progressive disclosure." | make the root skill doc a minimal router to supporting docs/scripts | for skills with multiple workflows | argued | benefit | human | fetched, curl, 200 |
| S1-6 | GPT-6 Astra (general, "models" broadly) | "Models have gotten much better at understanding nuance and ambiguity, so overly specific guidance can now hinder results where it previously helped." | avoid overly specific, itinerary-style skill instructions | "now" — holds for current-generation capable models | asserted | harm | human | fetched, curl, 200 |
| S1-7 | GPT-6 Astra, contrasted with Sol and Luna | "Repository skills also guide other contributors' agents, which may use different models. Guidance that helps Sol or Luna may overconstrain GPT-6 Astra, so consider which models will use the instructions you leave behind." | consider which models will read a shared repo skill before writing it | repo skills used by multiple contributors on different models | argued | harm avoidance | human | fetched, curl, 200 |
| S1-8 | GPT-6 Astra (general, AGENTS.md) | "Because AGENTS.md applies whenever the model works in your repository, you should frequently revisit each instruction and ask yourself whether it's still needed." | frequently prune/revisit AGENTS.md instructions | AGENTS.md is always-loaded context | argued | benefit | human | fetched, curl, 200 |
| S1-9 | GPT-6 Astra specifically | "Requiring a stack of docs or a full repo map before every edit is excessive for a typo fix. GPT-6 Astra can work out what it needs to read without being pushed to review the whole project before every change." | don't require reading a doc stack / full repo map before every edit | GPT-6 Astra-specific capability claim | asserted | harm (of old requirement) | human | fetched, curl, 200 |
| S1-10 | GPT-6 Astra (general) | "Prompting the model to read files before every edit is a great way to burn context and slow work down. Pointing to some docs can still be helpful, however, so long as it is contextual." | point to docs contextually rather than as a blanket pre-edit rule | "so long as it is contextual" | argued | harm (of blanket rule) | human | fetched, curl, 200 |
| S1-11 | GPT-6 Astra specifically, contrasted with "previous models" | "Previous models needed encouragement to run tests and check their work. GPT-6 Astra does that on its own, so the same instructions can lead to unnecessary testing." | drop test-encouragement instructions for GPT-6 Astra | GPT-6 Astra-specific | asserted | harm (of keeping old instructions) | human | fetched, curl, 200 |
| S1-12 | GPT-6 Astra specifically | "GPT-6 Astra is thorough, but it can be more tentative about how far to take a task. Sometimes it needs a little push to keep going." | push GPT-6 Astra explicitly when it is being overly tentative | GPT-6 Astra-specific trait claim | asserted | harm (of default tentativeness) | human | fetched, curl, 200 |
| S1-13 | GPT-6 Astra specifically (example AGENTS.md text) | "The local tests use disposable fixtures and have no production access. Run them, fix failures caused by the requested change, and rerun affected tests without asking for approval at each step." | grant explicit standing permission in AGENTS.md for one named, known-safe workflow | "a specific workflow you know is safe, such as a local test suite" | argued (worked example) | benefit | model (text addressed to the model) | fetched, curl, 200 |
| S1-14 | GPT-6 Astra specifically | "That can be useful, but GPT-6 Astra, as our most aligned model, has much better judgment and will not perform tasks unless it knows it is safe – so you should treat it as such." | relax "ask first" boundary language for GPT-6 Astra | GPT-6 Astra-specific ("our most aligned model") | asserted | benefit (of relaxing) | human | fetched, curl, 200 |
| S1-15 | GPT-6 Astra specifically | "If you stated boundaries previously because you wanted to prevent other models from going too far and you're now switching to GPT-6 Astra, consider updating that language: Astra could take it too seriously and may stop work where you'd actually be happy for it to continue." | update old ask-first boundary language when switching to GPT-6 Astra | condition: switching from an earlier model to Astra | argued | harm (of not updating) | human | fetched, curl, 200 |
| S1-16 | GPT-6 Astra, contrasted with GPT-5.6 Sol | "If you're used to GPT-5.6 Sol taking a request and continuing for long stretches, GPT-6 Astra can feel more tentative about when to stop. It may reach a first implementation and come back for your review while there's still work to do." | (descriptive, not a practice by itself) sets up S1-17/S1-18 | comparison to GPT-5.6 Sol usage habits | asserted | null (descriptive) | human | fetched, curl, 200 |
| S1-17 | GPT-6 Astra specifically | "This is where it helps to define completion before starting. You might need to push Astra to continue until it's fully done." | define what "done" means before starting the task | GPT-6 Astra-specific (persistence section) | argued | benefit | human | fetched, curl, 200 |
| S1-18 | GPT-6 Astra (general) | "A requirement to stop for review after the first implementation will pull the model toward an earlier stopping point, so check whether that's a decision you actually need to make." | avoid unneeded "stop for review after first implementation" requirements | none additional | argued | harm (of the requirement) | human | fetched, curl, 200 |
| S1-19 | GPT-6 Astra (general) | "If you want it to keep exploring beyond a first pass, say what you want explored and where it should stop." | state explicitly what to explore and where to stop | when more exploration than a first pass is wanted | argued | benefit | human | fetched, curl, 200 |
| S1-20 | GPT-6 Astra specifically | "A new model is a good opportunity to clean your house, but you don't need to review everything manually: ask GPT-6 Astra to do an audit based on what was discussed in this article, then go build something you wouldn't have attempted before!" | have GPT-6 Astra audit your existing instructions instead of a manual review | when adopting a new model | asserted | benefit | both (human delegates, model performs) | fetched, curl, 200 |

No row repeats another — there is only one source page, and each row is a distinct sentence-level claim (S1-16 through S1-18 form one argument chain but state three separable claims: a comparison, a fix, and a caveat).

### grep verification (evidence)

Every row's first six words were checked with `grep -n -F "<first six words>" pages/main.txt`; all 20 found (see `/tmp/s1_grepcheck.txt` in this run, reproduced inline in the checking script). No rows were dropped. Example:

```
$ grep -n -F "Because AGENTS.md applies whenever the model" pages/main.txt
737:Because AGENTS.md applies whenever the model works in your repository, you should frequently revisit each instruction and ask yourself whether it's still needed.
```

## The post's five main points (my selection, level 2 — the post has no self-declared "top 5" list; it has an intro claim plus 4 H2 sections: "Better skills," "Up-to-date AGENTS.md," "Decision boundaries," "Persistence")

1. S1-1 — revisit accumulated instructions with each model release, more urgently for GPT-6 Astra.
2. S1-5 — progressive disclosure: the post calls it "one of the key markers of a useful skill" (Better skills section).
3. S1-9 — GPT-6 Astra doesn't need to be told to read everything before every edit (Up-to-date AGENTS.md section).
4. S1-14 — GPT-6 Astra's alignment/judgment means "ask first" boundary language can be relaxed (Decision boundaries section).
5. S1-17 — define completion before starting, or Astra may stop early (Persistence section).

---

## Part 2 — the loose reading: six developers.openai.com nav pages (S1-21..S1-59)

Coordinator instruction: fetch and add rows for the six nav-sourced candidate pages listed above as "not opened" in Part 1. Same columns, same `grep -n -F` rule, ids continuing from S1-21.

### Pages fetched

| # | Requested URL | Final URL (after redirect) | Route | HTTP (final) | Bytes (raw HTML) | Fetch time (UTC) | Subject model named by page | SHA-256 raw HTML | SHA-256 text |
|---|---|---|---|---|---|---|---|---|---|
| 2 | https://developers.openai.com/codex/build-skills | https://learn.chatgpt.com/docs/build-skills | curl -sL --compressed (308→200) | 200 | 381638 | 2026-09-22T11:37:51Z | unstated (general ChatGPT/Codex skills guide; a screenshot caption incidentally shows "5.6 Sol" as a model-picker UI example, not the page's subject) | dfd83783bfb5287fde3308acedf998fe12c4dc8a3e4c4dd9caa8657081bb2a66 | 82b842ab4424f9022806395f93eade7b19ae8694471a6a5093427ed441d7e1a2 |
| 3 | https://developers.openai.com/codex/skills-and-plugins | https://learn.chatgpt.com/docs/skills-and-plugins | curl -sL --compressed (308→200) | 200 | 334948 | 2026-09-22T11:37:52Z | unstated (general overview, no model named) | 3894627cfeee9e54e8ee0bc3b45ce7e285ff26485935ab003a1e59dcc30f9420 | fabc9621a74d0376f5e9183c7fe5e43ed9f0f925ee4a164dc10983175cf826cc |
| 4 | https://developers.openai.com/codex/prompting | https://learn.chatgpt.com/docs/prompting | curl -sL --compressed (308→200) | 200 | 511165 | 2026-09-22T11:37:52Z | unstated (general ChatGPT/Codex prompting guide, no model version named in the article body) | 2574e370100f4eee7c0ca05023cef6dc4ca72777aa4a8aeb726af8c6683bc7e1 | 2b447d7e9dca194535189506aad5440e3c3be8180d1e02dfdf4eb988b0a52e32 |
| 5 | https://developers.openai.com/codex/agent-configuration/agents-md | https://learn.chatgpt.com/docs/agent-configuration/agents-md | curl -sL --compressed (308→200) | 200 | 370667 | 2026-09-22T11:37:52Z | unstated (Codex mechanics doc, model-agnostic) | 51edc3d340df6136675c76f9689b4d7883ea7a272f169b42943d30e920f3a5d5 | b6e2b7a4419dfbb91c0b6e6aad72e9dff226dff8c92def02b3187418e21d15b0 |
| 6 | https://developers.openai.com/api/docs/guides/prompt-engineering | (no redirect — served directly) | curl -sL --compressed | 200 | 686028 | 2026-09-22T11:37:53Z | GPT-6 Astra named explicitly and repeatedly, incl. as the default example model (`gpt-6-astra`) and subject of a dedicated "GPT-6 Astra prompting guide" callout and per-workload best-practice sections (coding, front-end, agentic); the page overall is model-agnostic ("Prompting" guide covers GPT models and reasoning models generally) with Astra as its current flagship example | 30e55d71ed7a6e24a1d66b8dcc8c9f38460f085ba83f3e1b4d27853812d093e4 | 29ab16d08ee05294a94c9874589f456bdcd40d163f82e158fa60273e6397dc7a |
| 7 | https://developers.openai.com/api/docs/guides/tools-skills | (no redirect — served directly) | curl -sL --compressed | 200 | 535290 | 2026-09-22T11:37:53Z | unstated as page subject; `gpt-6-astra` used throughout as the example `model` value in every code sample | f8994aebadf3abdb4c45f7e80038901a8029d9a5deb3e8e04970a3d9ddc4bcdf | 5f6379a310347c1562bf6ffe66de6903aaa55a6ca3241e8f8be1c06421c70d69 |

Note on route: all four `/codex/...` URLs 308-redirected to `learn.chatgpt.com/docs/...` (Location header confirmed in saved `headers_*.txt`); `curl -sL` followed automatically and the final 200 response is what's saved and hashed. The two `/api/docs/guides/...` URLs served 200 directly on developers.openai.com. No page needed the WebFetch fallback — curl returned full article bodies for all six.

Text extraction was corrected from Part 1's method: inline-code spans (e.g. `AGENTS.md`) no longer force a line break, and this pass also collapses source line-wraps *within* a block element to single spaces (block boundaries = p/li/h1-h6/div/tr/br/td/th/pre/etc.), so sentences that happened to wrap across lines in the raw HTML are not split. This was necessary because these six pages' HTML is pretty-printed with embedded newlines inside `<p>` text, which Part 1's simpler script would have broken mid-sentence.

### New claims (S1-21..S1-59)

Page/model column omitted per-row below where identical within a page block; see the page table above for the subject-model note. All quotes verified: `grep -n -F "<first six words>"` against the page's own saved `.txt` file, 39/39 FOUND, 0 dropped.

**From /codex/build-skills (→ learn.chatgpt.com/docs/build-skills), subject unstated:**

| id | verbatim quote | practice | condition | evidence | direction | audience | repeats |
|---|---|---|---|---|---|---|---|
| S1-21 | "Because implicit matching depends on description, write concise descriptions with clear scope and boundaries." | write concise skill descriptions with explicit scope and boundaries | for implicit (auto) skill matching | argued | benefit | human | related to S1-2/S1-4, adds "boundaries" — not an exact repeat |
| S1-22 | "Front-load the key use case and trigger words so a host can still match the skill if descriptions are shortened." | front-load the key use case and trigger words at the start of a description | so matching still works if descriptions get truncated | argued | benefit | human | new |
| S1-23 | "To avoid crowding out the rest of the prompt, this list uses at most 2% of the model's context window, or 8,000 characters when the context window is unknown." | (mechanism) Codex's initial skills list is capped at 2% of context / 8,000 chars, which is why descriptions get shortened | applies to the initial skills list only | measured (explicit numeric budget) | harm avoidance | human | repeats S1-2, adds a measured number |
| S1-24 | "Keep each skill focused on one job." | single-responsibility skills | none | asserted | benefit | human | new |
| S1-25 | "Prefer instructions over scripts unless you need deterministic behavior or external tooling." | prefer plain instructions over bundled scripts by default | unless deterministic behavior/external tooling is required | asserted | benefit | human | new |
| S1-26 | "Write imperative steps with explicit inputs and outputs." | write skill steps as imperatives with explicit inputs/outputs | none | asserted | benefit | human | new |
| S1-27 | "Test prompts against the skill description to confirm the right trigger behavior." | test prompts against the description to verify triggering | none | asserted | benefit | human | new |

**From /codex/skills-and-plugins (→ learn.chatgpt.com/docs/skills-and-plugins), subject unstated:**

| id | verbatim quote | practice | condition | evidence | direction | audience | repeats |
|---|---|---|---|---|---|---|---|
| S1-28 | "Skills are most useful when good results depend on a repeatable approach." | only build a skill when the task genuinely benefits from a repeatable approach | "when good results depend on a repeatable approach" | asserted | benefit | human | new (echoes an unquoted framing line in the post's "Better skills" intro, but that line wasn't captured as an S1-n row) |
| S1-29 | "Explain the goal, the steps to follow, the expected format, and anything the skill should always include or avoid." | when drafting a skill via skill-creator, state goal + steps + expected format + always-include/avoid list | when describing the workflow to the skill-creator | argued | benefit | human | new |
| S1-30 | "Check the instructions, test the skill with a realistic request, and refine it if the result misses a step or drifts from the format you want." | test a drafted skill against a realistic request and refine it | none | argued | benefit | human | related to S1-27 (testing), different scope: draft-quality testing vs. trigger testing |

**From /codex/prompting (→ learn.chatgpt.com/docs/prompting), subject unstated:**

| id | verbatim quote | practice | condition | evidence | direction | audience | repeats |
|---|---|---|---|---|---|---|---|
| S1-31 | "A short prompt is often enough. For larger or more important tasks, include the parts that matter:" | use a short prompt for simple tasks; use the Goal/Context/Output/Boundaries framework for larger or important ones | "for larger or more important tasks" | asserted | benefit | human | new |
| S1-32 | "Use only the parts that help. You don't need to fill in every item or follow a required format." | don't force-fill every framework field | none | asserted | benefit | human | new |
| S1-33 | "Start with the result, not a detailed list of steps. Include the audience or format when those details change what ChatGPT should produce." | describe the desired result rather than a step-by-step process | include audience/format only when they change the output | argued | benefit | human | new |
| S1-34 | "Describe a process when the process itself matters. Otherwise, leave ChatGPT room to search, compare information, and adjust its approach." | only specify process/steps when the process itself matters | "when the process itself matters" | argued | benefit | human | related to S1-33 |
| S1-35 | "Share the information that could change the result. Add only the sources that matter, and explain what ChatGPT should take from each one." | include only relevant context/sources, and state what to take from each | none | argued | benefit | human | new |
| S1-36 | "Focus on the one or two boundaries that matter most. You don't need to control every step ChatGPT takes." | state only the one or two boundaries that matter most | none | argued | benefit | human | new |
| S1-37 | "For important work, ask ChatGPT for a final check, such as confirming every action item has an owner and due date or flagging information it couldn't verify." | request a self-check step for important work | "for important work" | argued | benefit | human | new |
| S1-38 | "Your first prompt doesn't need to be perfect. Review the result, then ask for the specific change you want." | iterate via follow-up messages rather than perfecting the first prompt | none | argued | benefit | human | new |
| S1-39 | "A useful Codex prompt names the behavior you want, points to the relevant code or reproduction steps, preserves important constraints, and says how to verify the change." | structure of a good Codex prompt: behavior + code/repro pointer + constraints + verification method | for Codex/coding prompts specifically | asserted | benefit | human | new |

**From /codex/agent-configuration/agents-md (→ learn.chatgpt.com/docs/agent-configuration/agents-md), subject unstated:**

| id | verbatim quote | practice | condition | evidence | direction | audience | repeats |
|---|---|---|---|---|---|---|---|
| S1-40 | "Codex skips empty files and stops adding files once the combined size reaches the limit defined by project_doc_max_bytes (32 KiB by default)." | (mechanism) AGENTS.md content is truncated past a fixed byte budget | default cap 32 KiB, configurable | measured (explicit number) | harm (of exceeding budget: silent truncation) | human | new |
| S1-41 | "Raise the limit or split instructions across nested directories when you hit the cap." | split AGENTS.md instructions across nested directories (or raise the byte cap) rather than one large file | "when you hit the cap" | argued | benefit | human | new, follows from S1-40 |
| S1-42 | "Codex stops searching once it reaches your current directory, so place overrides as close to specialized work as possible." | place AGENTS.override.md files as close as possible to the specialized work they govern | none additional | argued | benefit | human | new |
| S1-43 | "Keep rules concise, explain the behavior to flag and any safe path or exception, and reserve formatting and lint checks for CI." | for AGENTS.md code-review rules: keep concise, state behavior + safe path/exception, leave formatting/lint to CI | for the "Code Review Rules" section specifically | argued | benefit | human | new |

**From /api/docs/guides/prompt-engineering, subject: GPT-6 Astra named repeatedly (see page table):**

| id | verbatim quote | practice | condition | evidence | direction | audience | repeats |
|---|---|---|---|---|---|---|---|
| S1-44 | "GPT models like gpt-6-astra benefit from precise instructions that explicitly provide the logic and data required to complete the task in the prompt." | give GPT-family models precise instructions with explicit logic and data | applies to "GPT models" generally (gpt-6-astra as example), contrasted with reasoning models later on the same page | asserted | benefit | human | new — in tension with the post's S1-6 ("overly specific guidance can now hinder results"); not resolved here |
| S1-45 | "Prompting gpt-6-astra for coding tasks is most effective when following a few best practices: define the agent's role, enforce structured tool use with examples, require thorough testing for correctness, and set Markdown standards for clean output." | 4-part bundle for coding-task prompts to GPT-6 Astra | for coding tasks specifically | asserted | benefit | human | new, GPT-6 Astra-specific |
| S1-46 | "Frame the model as a software engineering agent with well-defined responsibilities. Provide clear instructions for using tools like functions.run for code tasks, and specify when not to use certain modes—for example, avoid interactive execution unless necessary." | role-frame the model and give explicit tool-use instructions, including when *not* to use certain modes | coding tasks, GPT-6 Astra | argued | benefit | human | new |
| S1-47 | "Instruct the model to test changes with unit tests or Python commands, and validate patches carefully since tools like apply_patch may return "Done" even on failure." | instruct testing, and validate patch results carefully rather than trusting a "Done" status | coding tasks, GPT-6 Astra, when using tools like apply_patch | asserted | harm avoidance | human | new |
| S1-48 | "Include concrete examples of how to invoke commands with the provided functions, which improves reliability and adherence to expected workflows." | include concrete tool-invocation examples in the prompt | coding tasks, GPT-6 Astra | argued | benefit | human | new |
| S1-49 | "Guide the model to generate clean, semantically correct markdown using inline code, code fences, lists, and tables where appropriate—and to format file paths, functions, and classes with backticks." | instruct explicit markdown formatting standards | coding tasks, GPT-6 Astra | asserted | benefit | human | new |
| S1-50 | "For front-end engineering work in larger codebases, we've found that adding these categories of instruction to your prompts delivers the best results:" | include specific instruction categories (principles, UI/UX, structure, components, pages, agent instructions) in front-end prompts | front-end engineering in larger/established codebases | measured ("we've found") | benefit | human | new |
| S1-51 | "For agentic and long-running rollouts with gpt-6-astra, focus your prompts on three core practices: plan tasks thoroughly to ensure complete resolution, provide clear preambles for major tool usage decisions, and use a TODO tool to track workflow and progress in an organized manner." | 3-part bundle for agentic/long-running GPT-6 Astra prompts | agentic and long-running rollouts specifically | asserted | benefit | human | related to post's S1-17/S1-18 (persistence), not identical — a concrete instruction bundle the post doesn't give |
| S1-52 | "Instruct the model to resolve the full query before yielding control, decomposing it into sub-tasks and reflecting after each tool call to confirm completeness." | explicitly instruct persistence: resolve the full query, decompose into sub-tasks, reflect after each tool call | agentic/long-running tasks | argued | benefit | human | related to S1-17/S1-18, new specific technique |
| S1-53 | "Ask the model to explain why it is calling a tool, but only at notable steps." | request tool-call preambles, but only at notable/major steps | "only at notable steps" | argued | benefit | human | new |
| S1-54 | "Use a TODO list tool or rubric to enforce structured planning and avoid missed steps." | use a TODO list/rubric mechanism for structured planning | none | argued | benefit | human | new |
| S1-55 | "Generally speaking, reasoning models will provide better results on tasks with only high-level guidance. This differs from GPT models, which benefit from very precise instructions." | match instruction specificity to model type: high-level guidance for reasoning models, precise instructions for GPT models | model-type dependent (reasoning vs. GPT models) | asserted | null (comparative, not single-direction) | human | new — no equivalent in the post, which only discusses one model family |
| S1-56 | "A GPT model is like a junior coworker. They'll perform best with explicit instructions to create a specific output." | give GPT models explicit, specific-output instructions | for GPT models specifically (vs. reasoning models) | argued (metaphor-based) | benefit | human | new |

**From /api/docs/guides/tools-skills, subject unstated (gpt-6-astra used as example model ID throughout):**

| id | verbatim quote | practice | condition | evidence | direction | audience | repeats |
|---|---|---|---|---|---|---|---|
| S1-57 | "Write a description that explains both what the skill does and when to use it. For example, "Review and redline vendor agreements using the fallback clauses" gives the model more useful context than "Helps with legal work."" | write a skill description that states both what it does and when to use it | none | argued (with example) | benefit | human | repeats S1-4 |
| S1-58 | "Keep the main instructions in SKILL.md and link to supporting files as needed:" | keep primary instructions in SKILL.md, link out for supporting material | none | argued | benefit | human | repeats S1-5 |
| S1-59 | "Once a skill is mounted, the model can decide when to use it. If you want more deterministic behavior, explicitly instruct the model to "use the <skill name> skill" when appropriate." | to force deterministic skill use, explicitly name the skill in the prompt text | "if you want more deterministic behavior" | asserted | benefit | human | new |

### Rows kept / dropped per page

All 39 candidate rows were grep-verified (39/39 FOUND on first pass after fixing the line-wrap extraction bug; 0 dropped). Breakdown: build-skills 7, skills-and-plugins 3, prompting 9, agents-md 4, prompt-engineering 13, tools-skills 3.

Repeats of Part 1 rows: S1-23 repeats S1-2 (adds a number); S1-57 repeats S1-4; S1-58 repeats S1-5. S1-21, S1-28, S1-30, S1-51, S1-52 are marked "related to" a Part 1 row without being exact repeats (they add content the post doesn't have).

### Three claims across the six pages that the post did not carry

1. **S1-55** — instruction specificity should be calibrated by model *type* (reasoning vs. GPT), not just by model version: "reasoning models will provide better results on tasks with only high-level guidance," while "GPT models... benefit from very precise instructions." The post only ever discusses variation across GPT-family model versions (Astra vs. Sol vs. Luna); it never raises the reasoning-vs-GPT axis at all.
2. **S1-45/S1-46/S1-47/S1-48/S1-49** — a concrete, named bundle of coding-prompt techniques for GPT-6 Astra (explicit role framing, tool-invocation examples, a specific caution that `apply_patch` can report "Done" on failure, and explicit Markdown formatting standards). The post's "Better skills"/"Up-to-date AGENTS.md" sections stay general; it never gives this coding-specific technique set.
3. **S1-40/S1-41** — AGENTS.md is not just something to prune for relevance (the post's advice); it has a hard, measured size ceiling (`project_doc_max_bytes`, 32 KiB by default) past which Codex silently stops adding files, and the fix is to split instructions across nested directories. The post gives no hint that there's an actual byte cap.

### Pages that would not fetch

None. All six URLs returned usable article bodies via `curl -sL --compressed` on the first attempt (four via a 308→200 redirect to learn.chatgpt.com, two directly at 200 on developers.openai.com). WebFetch fallback was not needed.
