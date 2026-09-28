# Vendor guidance refresh — 2026-09-28

Saved page paths below are relative to `$TMPDIR/vendor-guides-2026-09-28/`.

## Fetch manifest

All requests used `curl -sL --compressed`; the TLS-verification retry added `-k`. Initial attempt failed for all URLs with curl exit 60 (`SSL certificate problem: unable to get local issuer certificate`); retry completed. HTML extraction: `extract_openai.py` drops script/style/SVG, strips tags, decodes entities, retains block breaks, and collapses inline whitespace. Anthropic responses are saved as raw Markdown and copied byte-for-byte to text files. Final URLs equal requested URLs; all status 200.

| # | requested URL | final URL | status | fetched UTC | raw SHA-256 | text SHA-256 | raw / text |
|---|---|---|---:|---|---|---|---|
| 1 | https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra | https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra | 200 | 2026-09-28T13:20:11Z | `a50646ed18fd26fe2c2246af015bc0d8b793c639e1dcfb2310b666b636f7f605` | `003e25c50f9557916a5eb82d14fb16149082dbe66790bc0d32c704c138834159` | `01-rethinking-skills-and-prompts-for-gpt-6-astra.html` / `01-rethinking-skills-and-prompts-for-gpt-6-astra.txt` |
| 2 | https://learn.chatgpt.com/docs/build-skills | https://learn.chatgpt.com/docs/build-skills | 200 | 2026-09-28T13:20:11Z | `3427d1182ca661fd0f7a06eb88583977970a20781a56fa6babefc3cc5372ec04` | `94b113ae3633b096cc417ea77aa4e36452258b4de76e3a38f8bce92c1680522e` | `02-build-skills.html` / `02-build-skills.txt` |
| 3 | https://learn.chatgpt.com/docs/skills-and-plugins | https://learn.chatgpt.com/docs/skills-and-plugins | 200 | 2026-09-28T13:20:12Z | `f972018467bd5b29ad6802300dcb1bd4827974c97d7d77e5c062c4ae206344eb` | `b66f782d1f3f815d72b4d64aec50f9ddfd1538d7332ae9e1a7a3e78f013e6c9e` | `03-skills-and-plugins.html` / `03-skills-and-plugins.txt` |
| 4 | https://learn.chatgpt.com/docs/prompting | https://learn.chatgpt.com/docs/prompting | 200 | 2026-09-28T13:20:12Z | `8ee31e403fa7c1a69e75ab0dd6a64f47ed66c0d3a6d8dd6ba22431589d095b10` | `dec07e2177406a0019b531c559e309a61114402c3e926a28d85696dae718a954` | `04-prompting.html` / `04-prompting.txt` |
| 5 | https://learn.chatgpt.com/docs/agent-configuration/agents-md | https://learn.chatgpt.com/docs/agent-configuration/agents-md | 200 | 2026-09-28T13:20:12Z | `07b9f0142e764aae08fbd2c2a4f612cc93d98d4781f3d9ce25757189eb95d33d` | `f33c1cefa796a28808e8d8972193dcd06d81d279bf431c53005b9021bfcbeabb` | `05-agents-md.html` / `05-agents-md.txt` |
| 6 | https://developers.openai.com/api/docs/guides/prompt-engineering | https://developers.openai.com/api/docs/guides/prompt-engineering | 200 | 2026-09-28T13:20:12Z | `2985b309d2e2d25f599a9b6a643be1c96fa7c07ecd0bc697abd0e3607e1353fd` | `0fa2f9c08b7d88068af6e2e8532adbc989fb29b282302ca3970f6cc298898d29` | `06-prompt-engineering.html` / `06-prompt-engineering.txt` |
| 7 | https://developers.openai.com/api/docs/guides/tools-skills | https://developers.openai.com/api/docs/guides/tools-skills | 200 | 2026-09-28T13:20:12Z | `d8aead3f486cc4e1f816302e1e6bba1b506214349579bfd53c34ea50ffa07f56` | `78ce6db1c7b308bf57573ca50e1b4ab5c80cae1bac53a8b790c81efbf2f37848` | `07-tools-skills.html` / `07-tools-skills.txt` |
| 8 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview.md | 200 | 2026-09-28T13:20:12Z | `bbd9883560196e845718d2e3160b50afbfc828eb62d4674164536e38610d5c33` | `bbd9883560196e845718d2e3160b50afbfc828eb62d4674164536e38610d5c33` | `08-overview.md` / `08-overview.txt` |
| 9 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md | 200 | 2026-09-28T13:20:13Z | `d8da822f28a9df98f90c206466a5e808a561a3c6e9f948c3a44f27998f54cf12` | `d8da822f28a9df98f90c206466a5e808a561a3c6e9f948c3a44f27998f54cf12` | `09-claude-prompting-best-practices.md` / `09-claude-prompting-best-practices.txt` |
| 10 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1.md | 200 | 2026-09-28T13:20:14Z | `26221728e1acfce699d973c7cf9667a4ae6c5a9ab26a3134a357768e86cf3553` | `26221728e1acfce699d973c7cf9667a4ae6c5a9ab26a3134a357768e86cf3553` | `10-prompting-claude-fable-5-1.md` / `10-prompting-claude-fable-5-1.txt` |
| 11 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5.md | 200 | 2026-09-28T13:20:14Z | `44732ba550fc55f13c061d47f755169246f9b4872a7f51fe63a6c9985503313e` | `44732ba550fc55f13c061d47f755169246f9b4872a7f51fe63a6c9985503313e` | `11-prompting-claude-fable-5.md` / `11-prompting-claude-fable-5.txt` |
| 12 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8.md | 200 | 2026-09-28T13:20:15Z | `9f67fae4a2a5037da7517cdab7691c61b6c85760dc089146160475579a243b3a` | `9f67fae4a2a5037da7517cdab7691c61b6c85760dc089146160475579a243b3a` | `12-prompting-claude-opus-4-8.md` / `12-prompting-claude-opus-4-8.txt` |
| 13 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5.md | 200 | 2026-09-28T13:20:15Z | `643499b80e34139a5007226a31908d64a65a2d64f08275d502e64ccd43a8413e` | `643499b80e34139a5007226a31908d64a65a2d64f08275d502e64ccd43a8413e` | `13-prompting-claude-opus-5.md` / `13-prompting-claude-opus-5.txt` |
| 14 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5.md | 200 | 2026-09-28T13:20:15Z | `07e7db846f96915a1d533fe6f62f7812790a966361b9982b6522557e74d08127` | `07e7db846f96915a1d533fe6f62f7812790a966361b9982b6522557e74d08127` | `14-prompting-claude-sonnet-5.md` / `14-prompting-claude-sonnet-5.txt` |
| 15 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md | 200 | 2026-09-28T13:20:16Z | `542eee1e150ff7e2853099dd9e24b94626817d5a50ba50af4a4c35101a355f13` | `542eee1e150ff7e2853099dd9e24b94626817d5a50ba50af4a4c35101a355f13` | `15-best-practices.md` / `15-best-practices.txt` |
| 16 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5.md | 200 | 2026-09-28T13:20:16Z | `38355a519405b71173408c5c5f126c428eab61105eb92f38d950bf699ac5c215` | `38355a519405b71173408c5c5f126c428eab61105eb92f38d950bf699ac5c215` | `16-prompting-claude-opus-5-5.md` / `16-prompting-claude-opus-5-5.txt` |
| 17 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview.md | 200 | 2026-09-28T13:20:17Z | `acc3a81d482fc3bace77b88453a3c4c4460dc2e427255e0fb5fd628c3d24032d` | `acc3a81d482fc3bace77b88453a3c4c4460dc2e427255e0fb5fd628c3d24032d` | `17-overview.md` / `17-overview.txt` |
| 18 | https://code.claude.com/docs/en/skills | https://code.claude.com/docs/en/skills.md | 200 | 2026-09-28T13:20:17Z | `86137b6232cd54722549525729d1888717d5ee0eed6312a9a089097b2cadc181` | `86137b6232cd54722549525729d1888717d5ee0eed6312a9a089097b2cadc181` | `18-skills.md` / `18-skills.txt` |

## Part 1 — old row drift

Normalization for search: whitespace collapsed, curly quotes converted to straight quotes, and en/em dashes converted to `-`. `present` means raw quote exact; `present-normalised` means it matched after normalization. No changed wording is asserted without a matching replacement passage; `gone` rows state searchable terms.

| row id | page | status | new wording if changed / searched terms if gone |
|---|---|---|---|
| S1-1 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-2 | 01 | gone | searched whole page for: Codex, product, not, Astra |
| S1-3 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-4 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-5 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-6 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-7 | 01 | gone | searched whole page for: GPT, 6, Astra, contrasted |
| S1-8 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-9 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-10 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-11 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-12 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-13 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-14 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-15 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-16 | 01 | gone | searched whole page for: GPT, 6, Astra, contrasted |
| S1-17 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-18 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-19 | 01 | gone | searched whole page for: GPT, 6, Astra, general |
| S1-20 | 01 | gone | searched whole page for: GPT, 6, Astra, specifically |
| S1-21 | 02 | gone | searched whole page for: Because, implicit, matching, depends |
| S1-22 | 02 | present-normalised |  |
| S1-23 | 02 | present-normalised |  |
| S1-24 | 02 | present |  |
| S1-25 | 02 | present |  |
| S1-26 | 02 | present |  |
| S1-27 | 02 | present |  |
| S1-28 | 03 | present |  |
| S1-29 | 03 | present-normalised |  |
| S1-30 | 03 | present-normalised |  |
| S1-31 | 04 | present-normalised |  |
| S1-32 | 04 | present-normalised |  |
| S1-33 | 04 | present-normalised |  |
| S1-34 | 04 | present-normalised |  |
| S1-35 | 04 | present-normalised |  |
| S1-36 | 04 | present-normalised |  |
| S1-37 | 04 | present-normalised |  |
| S1-38 | 04 | present-normalised |  |
| S1-39 | 04 | present-normalised |  |
| S1-40 | 05 | present |  |
| S1-41 | 05 | present |  |
| S1-42 | 05 | present |  |
| S1-43 | 05 | present-normalised |  |
| S1-44 | 06 | present |  |
| S1-45 | 06 | present-normalised |  |
| S1-46 | 06 | present |  |
| S1-47 | 06 | present-normalised |  |
| S1-48 | 06 | present |  |
| S1-49 | 06 | present |  |
| S1-50 | 06 | present-normalised |  |
| S1-51 | 06 | gone | searched whole page for: For, agentic, and, long |
| S1-52 | 06 | present |  |
| S1-53 | 06 | present |  |
| S1-54 | 06 | present |  |
| S1-55 | 06 | present |  |
| S1-56 | 06 | present-normalised |  |
| S1-57 | 07 | present-normalised |  |
| S1-58 | 07 | present |  |
| S1-59 | 07 | present-normalised |  |
| S2-1 | 08 | gone | searched whole page for: This, guide, assumes, that |
| S2-2 | 08 | present |  |
| S2-3 | 09 | present |  |
| S2-4 | 09 | present |  |
| S2-5 | 09 | present |  |
| S2-6 | 09 | present |  |
| S2-7 | 09 | present |  |
| S2-9 | 09 | present |  |
| S2-10 | 09 | gone | searched whole page for: Use, consistent, descriptive, tag |
| S2-11 | 09 | gone | searched whole page for: Setting, a, role, in |
| S2-12 | 09 | gone | searched whole page for: Put, longform, data, at |
| S2-13 | 09 | present |  |
| S2-15 | 09 | gone | searched whole page for: If, you, prefer, more |
| S2-16 | 09 | gone | searched whole page for: Claude, Opus, 5, is |
| S2-17 | 09 | gone | searched whole page for: Tell, Claude, what, to |
| S2-18 | 09 | present |  |
| S2-19 | 09 | gone | searched whole page for: Starting, with, Claude, 4 |
| S2-20 | 09 | present |  |
| S2-21 | 09 | present |  |
| S2-22 | 09 | gone | searched whole page for: While, the, model, has |
| S2-23 | 09 | gone | searched whole page for: Replace, blanket, defaults, with |
| S2-24 | 09 | present |  |
| S2-25 | 09 | gone | searched whole page for: Prefer, general, instructions, over |
| S2-26 | 09 | gone | searched whole page for: Manual, chain, of, thought |
| S2-28 | 09 | present |  |
| S2-29 | 09 | present-normalised |  |
| S2-31 | 09 | present-normalised |  |
| S2-32 | 09 | present |  |
| S2-33 | 09 | present-normalised |  |
| S2-34 | 09 | present-normalised |  |
| S2-35 | 09 | present |  |
| S2-36 | 11 | gone | searched whole page for: In, Anthropic, s, testing |
| S2-37 | 11 | gone | searched whole page for: Define, explicit, constraints, on |
| S2-38 | 11 | gone | searched whole page for: Provide, context, about, why |
| S2-39 | 11 | present |  |
| S2-40 | 11 | gone | searched whole page for: Don, t, instruct, Claude |
| S2-43 | 10 | gone | searched whole page for: Batch, independent, tool, calls |
| S2-45 | 10 | gone | searched whole page for: Tell, the, model, what |
| S2-46 | 10 | gone | searched whole page for: Keep, changes, and, tests |
| S2-48 | 10 | gone | searched whole page for: Leave, room, for, long |
| S2-49 | 12 | present |  |
| S2-50 | 12 | gone | searched whole page for: If, you, need, Claude |
| S2-51 | 12 | present |  |
| S2-57 | 14 | present |  |
| S2-58 | 14 | present |  |
| S2-59 | 14 | present |  |

## Part 2 — new rows

Rows below are bounded recommendations selected from the requested writing/skill/agent-instruction scope.

| id | page | subject model | quote (verbatim) | practice in plain words | condition the page attaches | evidence | kind of text it is about |
|---|---:|---|---|---|---|---|---|
| N-1 | 15 | unstated | “Good Skills are concise, well-structured, and tested with real usage.” | Keep the skill concise and structured, and test it in real use. | General authoring guidance. | asserted | skill or plugin instructions |
| N-2 | 15 | unstated | “Only add context Claude doesn't already have.” | Remove explanations Claude can already supply. | When editing skill content. | argued | skill or plugin instructions |
| N-3 | 15 | unstated | “Match the level of specificity to the task's fragility and variability.” | Set instruction detail according to how fragile or variable the task is. | Task-specific. | argued | skill or plugin instructions |
| N-4 | 15 | unstated | “Test your Skill with all the models you plan to use it with.” | Test the skill on every target model. | When deploying across models. | asserted | skill or plugin instructions |
| N-5 | 15 | unstated | “Remember that the `name` field must use lowercase letters, numbers, and hyphens only.” | Restrict the skill name to lowercase letters, digits, and hyphens. | Skill frontmatter; the guide also sets a 64-character maximum and prohibits reserved words. | asserted | skill or plugin instructions |
| N-6 | 15 | unstated | “The `description` field enables Skill discovery and should include both what the Skill does and when to use it.” | Describe both the capability and its activation context. | In skill metadata. | asserted | skill or plugin instructions |
| N-7 | 15 | unstated | “Always write in third person” | Use third person in descriptions. | Description is injected into the system prompt. | argued | skill or plugin instructions |
| N-8 | 15 | unstated | “Include both what the Skill does and specific triggers/contexts for when to use it.” | Include specific trigger terms as well as the skill function. | Description field. | asserted | skill or plugin instructions |
| N-9 | 15 | unstated | “Keep SKILL.md body under 500 lines for optimal performance” | Keep the skill body below 500 lines. | For optimal performance. | asserted | skill or plugin instructions |
| N-10 | 15 | unstated | “Keep references one level deep from SKILL.md” | Link each reference file directly from SKILL.md. | Avoid nested references because Claude may only partially read files. | argued | skill or plugin instructions |
| N-11 | 15 | unstated | “For reference files longer than 100 lines, include a table of contents at the top.” | Add a contents list to long reference files. | Reference files over 100 lines. | argued | human-read docs |
| N-12 | 15 | unstated | “Break complex operations into clear, sequential steps.” | Break complex work into sequential steps. | Complex operations. | asserted | skill or plugin instructions |
| N-13 | 15 | unstated | “For particularly complex workflows, provide a checklist that Claude can copy into its response and check off as it progresses.” | Give very complex workflows a trackable checklist. | Particularly complex workflows. | argued | skill or plugin instructions |
| N-14 | 15 | unstated | “This pattern greatly improves output quality.” | Use validator-fix-repeat feedback loops. | Following the guide’s “Run validator → fix errors → repeat” pattern. | asserted | skill or plugin instructions |
| N-15 | 15 | unstated | “Don't include information that will become outdated:” | Avoid time-sensitive instructions in skills. | Content guidelines. | asserted | skill or plugin instructions |
| N-16 | 17 | unstated | “The `description` is what Claude matches your request against when determining whether to trigger the Skill, so it must say both what the Skill does and when to use it.” | Write the description as the capability and trigger condition. | Metadata is loaded at startup. | argued | skill or plugin instructions |
| N-17 | 17 | unstated | “Claude reads SKILL.md from the filesystem using bash. Only then does this content enter the context window.” | Put procedural instructions in SKILL.md; it is read only after triggering. | When a request matches the description. | asserted | skill or plugin instructions |
| N-18 | 17 | unstated | “Claude accesses these files only when referenced.” | Reference bundled materials from the skill instructions so they are loaded on demand. | Supporting files. | asserted | skill or plugin instructions |
| N-19 | 18 | unstated | “Claude uses skills when relevant, or you can invoke one directly with `/skill-name`.” | Rely on relevance-based loading or invoke the skill by name. | Claude Code skills. | asserted | skill or plugin instructions |
| N-20 | 18 | unstated | “Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact.” | Promote repeated procedures from chat or CLAUDE.md into a skill. | Repeated instructions or procedural CLAUDE.md content. | argued | skill or plugin instructions |
| N-21 | 18 | unstated | “Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it.” | Move long on-demand procedures to skills. | When that content is not needed in every session. | argued | skill or plugin instructions |
| N-22 | 18 | unstated | “Every skill needs a `SKILL.md` file with two parts: YAML frontmatter between `---` markers that tells Claude when to use the skill, and markdown content with the instructions Claude follows when the skill runs.” | Provide frontmatter for activation and markdown body instructions. | Every skill. | asserted | skill or plugin instructions |
| N-23 | 18 | unstated | “the `description` helps Claude decide when to load the skill automatically.” | Make the description communicate when to auto-load the skill. | Automatic loading. | asserted | skill or plugin instructions |
| N-24 | 18 | unstated | “You can test the skill two ways.” | Check both automatic triggering and direct invocation. | After writing a skill. | asserted | skill or plugin instructions |

## Validation evidence

- Fetches: 18/18 returned HTTP 200 after TLS retry; no fetch failures.
- Old rows checked: 105; statuses: gone 43, present 38, present-normalised 24.
- Quote validation: 24/24 new-row quotes checked with literal `grep -F` against their saved text files; zero failures.
- Validation command: Python iterated the quote column and ran `grep -Fq -- <quote> <saved-text>` per row (shell-quoted safely).
- Machine-path check: required grep scan completed; 0 matches.

## Changes since 2026-09-22

1. Anthropic now has a dedicated skill-authoring best-practices page in the surveyed corpus, with description, structure, progressive-disclosure and workflow guidance.
2. Its skill guide says to tune specificity to task fragility and variability, and test skills across all target Claude models.
3. Skills documentation spells out staged loading: metadata at startup, SKILL.md on trigger, resources/code as needed.
4. Claude Code documentation adds its own skill lifecycle and authoring flow, including auto-trigger descriptions and direct `/skill-name` invocation.
5. Claude Opus 5.5 prompting guidance is now a new model-specific page; prior S2 rows should be treated as historical quotes where missing from current pages.

## Limitations

Part 2 includes targeted, source-verified recommendations relevant to skill writing and loading; this is not an exhaustive transcription of every recommendation on pages 1–18. Part 1 reports `gone` when the old quote could not be found; no replacement passage was assigned without direct passage-level evidence.
