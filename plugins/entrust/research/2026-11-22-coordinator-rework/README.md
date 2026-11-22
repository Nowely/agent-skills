# Coordinator rework of `orchestrate` (2026-11-22)

The design run behind PR #110. The owner asked for four things:
- the main session is always the coordinator, also after a compaction;
- the default team is small: a coordinator, a critic and a verifier;
- another provider only on the user's word;
- possibly an architecture critic.

**Result.** `orchestrate` was reworked in place under its own name, with no hook:
- **Contract first.** The page opens with an unconditional coordinator contract, and the approved card lives in `card.md`.
- **Smaller.** The body went from 15,507 to 7,993 characters.
- **Default team.** Coordinator, worker, plan critic and fresh verifier, with an architecture critic on triggers.
- **Native only.** Other providers come in only when the user names them.

The shipped text is the tree at the PR's head, not these files.

## Files

| File | What it is |
|---|---|
| [01-review.md](01-review.md) | Fable's independent review of the page at `def9f23` against the owner's goals (Russian). |
| [02-spec-v1.md](02-spec-v1.md) | The first change spec. |
| [03-survey.md](03-survey.md) | A survey of published practice on multi-agent roles, 59 sources, with a verdict on each element of the draft roles (Russian). |
| [04-spec-v2.md](04-spec-v2.md) | v1 with the plan critic's C1–C7 and the survey folded in. |
| [05-spec-v3.md](05-spec-v3.md) | v2 with the plan critic and the architecture critic as separate roles, at the owner's word. |
| [06-spec-v4.md](06-spec-v4.md) | v3 with the critic's diff-read objections N1–N5; the version implemented. |
| [rounds.md](rounds.md) | Every round: who read what, the findings, the outcome and the regressions. |

The files are copied verbatim from the session's scratch directory. Their absolute `/tmp/…/scratchpad/` paths
and the names `fable-review.md`, `roles-survey.md` and `spec-vN.md` refer to these files.

## Not kept

- The owner's messages and the agents' returns. `rounds.md` summarises the returns.
- The live probe's transcripts. They hold a whole session's context. Their result is recorded in
  `plugins/entrust/plugin/skills/claude/references/incidents.md` ("A compaction in one process and in a
  resumed one").
- The verifier's logs and mutation scripts.

## Limits

- **The live probe** is n=1 per mode, on Claude Code 2.1.330. It ran on the page as first delivered
  (`44b1660`), not on the PR's head.
- **The live orchestrate gate** did not run: it needs model calls.
- **Codex** was not checked: neither its host behaviour nor its behaviour after a compaction.
- **Same model family.** The verifier and the implementer both ran on Opus. Verdicts on how the pages read
  rest on its judgement; the rest rest on executed checks.
- **The survey's vendor sources.** Many of its strongest sources on either side are vendor posts with
  internal evaluations. Its quotes passed through a fetch tool's extractor, apart from three sources checked
  word for word.
