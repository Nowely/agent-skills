# Question set 08: my read of the README, round 02

I checked the file's SHA-256 before reading: `20b8ea66…82bae3b`, which matches. I read the README itself, not the reviews. Line numbers below are the README's.

## Would I send it as it is?

**No.** Two things are wrong.

1. **The first use on the extension route (lines 59–64) ends in `@maestro` in VS Code.**
   - That covers all three surfaces line 59 names. The sidebar and the palette are included, because in VS Code they open `@maestro` (`maestro-extension/src/extension.ts:275-280`).
   - `@maestro` gives the model one turn, with no tools and no earlier turns:
     - `chatContext` is never read (`participant.ts:49`)
     - only the prompt is sent (`:119-122`)
     - `sendRequest` is called with empty options (`:195`, `:268`)
   - So `/teach-maestro` cannot finish its interview or save `.maestro.md` there. The first run the README promises fails on that route.
   - Line 9's "or VS Code's own chat" rests on the same surface.
2. **Line 93's last clause is false.** `/teach-maestro` never reads `.maestro/context.md`: its text never mentions it.

The rest checks out against the snapshot. That includes line 33's "every command except `/teach-maestro` loads the core skill first": `teach-maestro` is the only command without the "Invoke /agent-workflow" line.

## My decisions

### 1. The `@maestro` cluster

**Your default, extended.**

- Take out the `@maestro` fence and "in VS Code's chat" (lines 61–64).
- Also take out the sidebar and palette clause (line 59).
- The extension route's first use becomes the one the skill-files route has: type `/teach-maestro`, then `/diagnose`, in your coding agent's chat. The extension has already put the skills in its skills folder.
- Also drop "or VS Code's own chat" from line 9's list.
- Lines 57 and 133 stay. They say what `@maestro` runs write, which is true.
- The participant's limits go to part 6 as a code question: pass the chat history and the tools, or hand the command to the agent.

Reason: the first run has to work on the surface the README gives, and in VS Code every surface line 59 names ends in `@maestro`. Typing the command in the agent's chat is the one surface a reader can check, and it doesn't depend on the extension handing the command over.

### 2. Line 93

**Your default.** Move the fact to line 91 ("Every command but `/teach-maestro` needs `.maestro.md` first, or reads `.maestro/context.md` instead if it exists"), and take it out of step 1.

Reason: the core skill reads `.maestro/context.md` first (`agent-workflow/SKILL.md:13-15`), and `/teach-maestro` is the one command that doesn't load the core skill.

### 3. The chooser's budget

**Your default: 170.** The overrun is the four writes and the glosses I asked for in set 05.
