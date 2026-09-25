# Critic briefs, one per lens

> **Superseded on 2026-09-24** by [roles.md](../../../references/roles.md), the one path `rewrite` runs: one writer, every critic at
> once, one repair. This page is kept as the record of the sequential method it describes and of what
> was measured under it; no step points here.

Every brief ends the same way: **every finding carries a reproducible check — a command and its output,
or a file and line — and a finding without one is discarded.** No praise, no summary of what reads well,
no rewrites unless the lens is the water lens. Fill `<DOC>`, `<CODE>` and the paths; send nothing else.

A Codex agent is one background Agent call of the `entrust:codex-agent` wrapper with a prompt file
whose header names the rights, as the `entrust` plugin's `codex` skill describes under *One call*
(`plugins/entrust/skills/codex/SKILL.md` in the marketplace checkout, or the installed plugin's
`skills/codex/SKILL.md`):

```
RIGHTS: read <repository>
MODEL: gpt-6-astra | gpt-5.6-sol | gpt-5.6-luna
EFFORT: high | medium
```

A Claude agent gets the same body through the Agent tool. Neither sees `rounds.md`, the ledger, or
another critic's report.

An isolated configuration for the host application's own commands, so that nothing touches the real
one — for Claude Code:

```bash
export CLAUDE_CONFIG_DIR="$TMPDIR/critic-config"; mkdir -p "$CLAUDE_CONFIG_DIR"
claude plugin marketplace add <owner>/<repo>      # every `claude plugin …` now reads and writes only there
```

## 0. The verifier of the edits

Not a lens — it reads the edits, not the document — but sized like one in the same announcement, and it
runs before the round is frozen, so what it refuses costs one regeneration instead of a wave. Its return
is the five fields, not a finding list. Its own cost is unmeasured, and the one blind run behind duties
1 to 4 below is a hypothesis about them, not a rate: [M24](../../../references/measurements.md#m24); duty 5 has not been
run. Model: `gpt-5.6-sol` on the `entrust` wrapper, for a reader the Claude writer's habits do not
reach — the run measured was on Astra and says nothing about Sol; without the plugin, a Claude Opus
agent, and say so.

```
You are the verifier of one round's edits for <DOC>. You did not write them. Two files and the code:
<edits/NN.json>, each edit with its `old`, its `new`, and a `check` where the edit carries claims and
only there; <ledger.json>, where this round's claims were written, each with its `asks` — the
proposition the sentence makes — its `saw`, what the check's command printed, and, where the edit gave
a reason for a qualifying clause, its `qualified`. The code: <CODE>.
A claim's name is what joins the two.
Do not modify any file in the repository; write only under $TMPDIR.

One verdict per claim, in the edit's order:
  HOLDS           the run bears on everything `asks` names, and the code says what the sentence says
  DOES NOT ANSWER the run is about a neighbour of the sentence — a narrower case, a different caller,
                  one call site of several — and you name the case it left out
  REFUTED         the code contradicts the sentence, with the range that does it
  UNREACHABLE     the cited file, range or command no longer exists

Five duties, on every edit, all five:
1. Every sentence in `new` that states a behaviour has a claim. Quote the ones that do not.
2. `asks` is written in the sentence's own scope words — what, for whom, under which condition — and
   `saw` answers it. An `asks` that has dropped a scope word the sentence carries is itself a finding.
3. Open the cited range yourself with the block that encloses it, and grep the call sites of every
   function named in it. A claim true at one call site and false at another is REFUTED.
4. For every guarantee word in `new` — every, always, never, cannot, guarantees, ensures, only, by
   default — search <DOC> and the repository's `.md` files for the sentence that says otherwise. Write
   in the quote you found, or `none in <the files you searched, named>`. A search you did not run is
   not `none`.
5. A `qualified` reason is a claim too: the run shows the clause to be the sentence's own scope at the
   cited range, or the claim DOES NOT ANSWER. An edit whose `new` narrows or widens a sentence the
   ledger pins is checked at the case the new words add.

Return exactly these five fields and nothing else:

    status:    done | partial | blocked
    result:    at most 30 lines. First line: "<model> verifier: <status>, <n> claims, <n> not holding".
               Then one line per claim: its name, its verdict, and the reason in a clause.
    evidence:  the commands you ran with their counts and exit codes
    artifacts: the files you read, by path
    open:      what you could not reach, and every claim whose verdict you are unsure of
```

## 1. The code, with the right to run it

```
You are the critic-against-the-code for <DOC>, reading the whole document. Standard: evidence level 2
— an independent reader of the code would state the same thing — and level 3, the behaviour made to
happen, wherever the code or the CLI can be run without cost or risk. Do not modify any file in the
repository; write only under $TMPDIR.

The code: <CODE>. Method: list every sentence that states a behaviour; for each, reach the highest
level you can. Claims about a lifecycle — what stays on disk, what is removed and when, what a
continued or retried run sees, what a killed run leaves — are the ones documents get wrong: read the
whole code path for those, and run them where a stub or an isolated configuration allows. For any
command of the host application, use an isolated configuration under $TMPDIR (for Claude Code:
CLAUDE_CONFIG_DIR), never the real one.

Report every claim whose verdict is FALSE, OVERSTATED or UNDERSTATED, with the quoted sentence, the
verdict, and the check. Then list the claims you could reach only level 1 on. Every finding carries a
reproducible check or it is discarded.
```

## 2. The mechanical rules and the water

```
You are the critic for the mechanical rules, the water, and the contradictions in <DOC>. You do not
check facts against code. Do not modify any file.

The rules the document was written to pass: <skeleton.md> — its per-section purpose, exclusions and
budget, and its mechanical rules — and <writing-rules.md>. Where a rule and a younger decision recorded
in <skeleton.md> with the owner's answer collide (a section added later, a fact restored), the younger
decision governs; say which you applied.

Three lenses, reported separately, each finding with line and quote:
1. THE MECHANICAL RULES, read as a grep would: every violation, or "clean"; each section's words
   against its budget.
2. WATER: words whose score does not pay for their space — line, quoted phrase, the shorter form you
   would keep, words saved; ranked. Never touch a condition, a limit or a warning at a point where a
   reader decides; say when you skipped one for that reason.
3. DUPLICATION AND CONTRADICTION: any fact in three or more sections, with the sections named (a
   symptom-keyed row a reader reaches without the earlier section is the one allowed repeat); and for
   every claim with a scope word — nothing, never, only, always, by default, every — the sentence
   elsewhere that says it can happen. Report each pair with both quotes.
```

## 3. Adversarial, whole document

```
You are the adversarial critic on <DOC>. Your job is to break it: no praise, no rewrites, defects only.
The code it describes: <CODE>.

A. Every sentence a reader would ACT on: is it true of the code, and would a reader who obeyed it end
   up better or worse off? Scope words are where to start.
B. Contradictions: two sentences in the document that cannot both be true.
C. Experiments, not recall, wherever the CLI or the code can settle a claim. Use an isolated
   configuration under $TMPDIR for any host-application command (for Claude Code: CLAUDE_CONFIG_DIR),
   never the real one; use pre-run refusals and --help where a full run costs money.
D. The two weakest sections, by name, and why; if you find none weak, say so and why.
E. What a reader who has never seen this still cannot answer after reading it.

Label each finding CONFIRMED or PLAUSIBLE. Write nothing outside $TMPDIR. Do not modify the repository.
```

## 4. A task

```
You are a fresh reader carrying a task. You may read ONE file, with `cat`: <DOC>. Do not open any other
file and do not read the source. Everything you do must come from that document alone.

Starting state: <STATE — create it under $TMPDIR; for a host-application task, an isolated
configuration under $TMPDIR>. Goal: <GOAL>. Do whatever the document says you must do, then show the
resulting state: <the commands whose output shows it>.

Report every command you ran with its output; the resulting state; every point where the document
left you guessing — what you guessed, why, and the sentence you wished were there; and every sentence
that turned out untrue of what you observed, quoted. Write nothing outside $TMPDIR.
```

## 5. A reader's question

```
You are a fresh reader. Read ONE file and nothing else, with `cat`: <DOC>. Do not open any other file,
and do not use anything you already know about this software.

Answer this question from that document alone: <QUESTION>

Quote the exact sentence or sentences the answer comes from and name the section heading. If the
document does not answer it, write GUESSED, give your best guess, and say what sentence you wished were
there. Say whether assembling the answer took more than one section. Run no command other than that
one `cat`. Return plain text.
```

One question per reader; a reader that has answered one question has learned the file and is not
fresh for a second. A reader told "do not run commands" reads nothing, because Codex reads files
through the shell.

## 6. Dedup and rank

```
You are the dedup-and-rank stage. <N> critics with different lenses reviewed <DOC>; their reports are
in <DIR>. Produce ONE list the coordinator can verify. Do not add findings of your own unless a
critic's evidence directly implies one; mark any such addition YOURS.

For each finding: an id; the quoted sentence with line numbers; the finding in one sentence; which
reports raised it — a finding raised by two or more lenses ranks higher; the reproducible check copied
from the critic, or NO CHECK; a category — SENTENCE, STRUCTURE, CODE (a defect the document cannot
fix), METHOD, SUPERSEDED (settled by a younger decision recorded in <skeleton.md> with the owner's
answer), UNSETTLED, SCOPE; and a proposed minimal edit where one is obvious.

Then: conflicts between critics, with both positions and evidence; what the wave did not cover; a
count by category. Nothing is softened.
```

## 7. Purpose and content

Model: Claude Opus. Claude Fable is the dedup's, and this report is one of its inputs. <RULES> is the
skeleton's own list ([`rethink` step 4](../../rethink/SKILL.md)); where the
skeleton adopted the fourteen of
[stages.md](../../rethink/references/stages.md#the-rules-this-produced), or no skeleton exists yet,
those fourteen are the default.

```
You are the critic of <DOC> against its purpose. You do not check facts against code. Do not modify
any file.

Read it against two things: the purpose — <PURPOSE>, the owner's statement at the top of the skeleton,
or the line under *Reader profile* in the audit's run file — and the rules in <RULES>. Where those are
the fourteen of <stages.md>, they are one owner's calibration, not a law of the genre: a finding under
one of them says why it applies to this document. Read the whole document once, then section by
section:
1. What the section buys a reader who came for that purpose. A section that buys nothing is a finding.
2. Every rule it breaks, by its number or its words.
3. Water at the paragraph level: a paragraph whose removal loses nothing the purpose needs — quoted,
   with the words its cut saves.
4. Technical detail above the middle of the document.
5. The opening's first sentence, against the purpose and the rules on the opening.

Every finding carries the quote, its line, and the rule or the clause of the purpose it fails; a
finding that names neither is discarded. No rewrites: the one change you may propose is a cut.
```
