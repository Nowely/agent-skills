# Codex Astra L3 — adversarial README findings

Target: `~/Git/agent-skills/plugins/terse/README.md`, commit `ed7335f9db83f859f1fe5ba767c7d63b2622dfb6`, branch `terse-process-2026-09-22`. Checks performed on 2026-09-22. All README lines below refer to that snapshot. Relative source paths below are relative to the repository root.

Four findings: three CONFIRMED, one PLAUSIBLE. These are additions to the earlier truth pass, not a repetition of its known refutations. The independent candidate list was saved as `independent-pass.txt` before the earlier audit was opened. The 46 prose entries of `research/2026-09-22-terse-process/audit-2026-09-22/audit.md` were then read and compared. That audit targets `1a24018`; the README is unchanged between that commit and the requested snapshot, but the rewrite implementation changed.

## F1 — CONFIRMED — the documented install does not deliver the checkout's repaired write boundary

**README:** 35–36, 43–49. **Lenses:** A, C, E. **Ledger relationship:** ADDS TO C18/C19; distinguishes the now-superseded checkout allegations C15/C16 from the still-published instructions. The earlier pass installed a local checkout and expressly did not fetch the GitHub source. This finding is about what the actual published install commands delivered.

The exact two shell commands fetched `main` at `21a225b12f15221f978492718ecdc00eb7ea5924` and installed terse 0.1.1. That installed rewrite page tells the agent to create `research/<date>-<slug>/` inside the document's repository and route a code defect to the repository's `ISSUES.md`. The permission boundary is stated only for applying the candidate. The reviewed checkout instead requires an external run directory and permission before putting a code defect into `ISSUES.md`. Both payloads still identify themselves as 0.1.1. A reader obeying Install gets the older recipe while relying on “Applying anything to your files needs your word.” The local repair therefore does not settle the README's promise for its advertised installation route.

This confirms the fetched payload and its instructions, not that a model performed the unapproved writes. No rewrite model run was made.

**Reproducible check, isolated under TMPDIR:**

```sh
AUDIT_TMP=$(mktemp -d "$TMPDIR/terse-install-repro.XXXXXX")
cd "$AUDIT_TMP"
export CLAUDE_CONFIG_DIR="$AUDIT_TMP/config"
export DISABLE_AUTOUPDATER=1 DISABLE_TELEMETRY=1 DISABLE_ERROR_REPORTING=1
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_TERMINAL_PROMPT=0
claude plugin marketplace add Nowely/agent-skills
claude plugin install terse@nowely
claude plugin list --json
git -C "$CLAUDE_CONFIG_DIR/plugins/marketplaces/nowely" rev-parse HEAD
nl -ba "$CLAUDE_CONFIG_DIR/plugins/cache/nowely/terse/0.1.1/skills/rewrite/SKILL.md" | sed -n '64,68p;110,114p;146,150p'
```

**Observed output:** both install commands started and exited 0. Marketplace add printed `SSH not configured, cloning via HTTPS: https://github.com/Nowely/agent-skills.git`, `Clone complete, validating marketplace`, and `Successfully added marketplace: nowely (declared in user settings)`. Install printed `Successfully installed plugin: terse@nowely (scope: user)`. List returned one enabled plugin, `terse@nowely`, version `0.1.1`. The marketplace HEAD was `21a225b12f15221f978492718ecdc00eb7ea5924`.

Installed `skills/rewrite/SKILL.md`:

```text
66 Work in a run directory of the document's own — `research/<date>-<slug>/` at the root of the
67 repository that holds the document; `audit` writes its run file elsewhere, and you copy `audit.md` in.
112 next round's edits, a boundary or a term back to `rethink`, a code defect to the repository's
113 `ISSUES.md`, a question the document does not answer to the user. When a finding routes to stage 3,
149 `diff-NN.patch`, the diff against `00-original.md`, written into the run directory. Then stop: applying
150 the candidate to the user's files needs their word, and a diff they have read is what earns it.
```

**Checkout comparison:** `plugins/terse/skills/rewrite/SKILL.md:66–76` requires the external run directory; lines 149–151 require permission before writing `ISSUES.md`. `git log -7 --oneline` identifies the intervening repair as `ef69fdf`. `git ls-remote https://github.com/Nowely/agent-skills.git HEAD refs/heads/main refs/heads/terse-process-2026-09-22` started and exited 0, returning the same `21a225b…` for HEAD/main and no matching branch line. This is a dated observation; future remote state is unknown.

Fetched source: <https://github.com/Nowely/agent-skills.git>; pinned source for the inspected payload: <https://github.com/Nowely/agent-skills/blob/21a225b12f15221f978492718ecdc00eb7ea5924/plugins/terse/skills/rewrite/SKILL.md>. Raw observations are retained in `remote-install.json`, `remote-probe.json`, and `remote-payload.json` beside this report; the actual installed payload is under `remote-config/plugins/cache/nowely/terse/0.1.1/`.

## F2 — CONFIRMED — “no account anywhere” hides the host authentication prerequisite

**README:** 47–49. **Lenses:** A, C, E. **Ledger relationship:** ADDS TO C20. C20 refuted the dependency claim through Node and discussed the lack of an additional Codex account requirement. It did not test a fresh, unauthenticated Claude Code installation. The missing Node prerequisite is deliberately not reported again here.

An installed but unauthenticated Claude Code can complete both plugin installation steps and still cannot start a model turn. The README says “Nothing else is needed” and “no account anywhere,” without limiting that statement to an additional terse/Codex account. A new reader is told installation is sufficient and encounters an authentication refusal only when trying to use it. The observation establishes the default first-party host's authentication requirement; it does not establish that every supported provider requires an individual Anthropic account.

**Reproducible check:** start in a new temporary directory/configuration, with inherited credentials and alternative-provider switches removed. `--bare` skips keychain reads and implicit key helpers; the installed CLI's `--help` explicitly documents that behavior. No paid request is needed.

```sh
AUDIT_TMP=$(mktemp -d "$TMPDIR/terse-auth-repro.XXXXXX")
cd "$AUDIT_TMP"
export CLAUDE_CONFIG_DIR="$AUDIT_TMP/config"
export DISABLE_AUTOUPDATER=1 DISABLE_TELEMETRY=1 DISABLE_ERROR_REPORTING=1
env -u ANTHROPIC_API_KEY -u ANTHROPIC_AUTH_TOKEN -u CLAUDE_CODE_OAUTH_TOKEN \
  -u CLAUDE_CODE_USE_BEDROCK -u CLAUDE_CODE_USE_VERTEX -u CLAUDE_CODE_USE_FOUNDRY \
  claude --bare --print --no-session-persistence 'Say ok'
```

**Observed output:** command started, exit 1; stdout exactly `Not logged in · Please run /login\n`; stderr empty. Separately, isolated `claude auth status` started and exited 1 with `loggedIn: false`, `authMethod: none`, `apiProvider: firstParty`. Isolated `claude plugin marketplace add ~/Git/agent-skills` and `claude plugin install terse@nowely` both started and exited 0 in that unauthenticated configuration. Host version: `2.1.280 (Claude Code)`. Complete output is in `cli-probes.json`.

## F3 — CONFIRMED — “every claim” conceals an explicit exclusion for external-tool recipes

**README:** 3–5; examples of the affected category at 43–49. **Lens:** A. **Ledger relationship:** ADDS TO C02. C02 already questioned the universal guarantee, the no-code fallback, and missing failures having no line. It did not identify the explicit external-tool exclusion.

The advertised coverage is “checks every claim about behaviour against the code.” The truth-pass specification explicitly excludes “recipes for tools this repository does not ship” and says they do not enter the ledger. Instructions for host tools are sentences a reader acts on; this README's own Claude Code install recipe is an example of that category. A reader cannot infer from the headline that these instructions are excluded from the systematic truth ledger and routed to rewrite instead. This is an observed scope mismatch in the prescribed process, not a claim that no individual critic will ever check an external command. Task readers or rewrite critics may catch some such defects incidentally.

**Reproducible check:**

```sh
nl -ba plugins/terse/README.md | sed -n '3,5p;43,49p'
nl -ba plugins/terse/skills/audit/references/truth-pass.md | sed -n '61,71p'
```

**Observed source:**

```text
README 4–5: checks every claim about behaviour against the code
truth-pass.md 61: ## What is not a claim about behaviour
truth-pass.md 69: - recipes for tools this repository does not ship
truth-pass.md 71: These belong to `rewrite`, under the writing rules. They do not enter the ledger.
```

The second check is decisive about the specification. Executed exclusion behavior of an audit model is unknown; there is no deterministic truth-pass CLI to run without starting a model workflow.

## F4 — PLAUSIBLE — the re-audit arrow lacks a way to preserve the candidate's reading context

**README:** 10–12, 35–36. **Lenses:** A, C, E. **Ledger relationship:** ADDS TO C05/C15. C05 confirmed the pipeline but did not check how its temporary candidate becomes the next audit's entry/corpus. C15 addressed the run directory's location; the latest implementation now puts it outside the repository.

The README promises a candidate and diff, then shows `/terse:audit` again, while applying the candidate requires a separate decision. It does not explain how to audit that external candidate with its original relative links and sibling documentation intact. The implementation also provides no staging or entry-file substitution rule: rewrite produces round files outside the repo, while the reader brief permits Markdown inside the repository and re-measurement requires the same entry file. Pointing the next audit at the original can measure unchanged text; pointing it at the bare temporary file changes its link context. A virtual overlay or staged tree could resolve this, but neither is specified by the cited contract.

The link relocation failure is confirmed by an experiment on this README. An actual audit choosing the wrong corpus is PLAUSIBLE, not observed: no paid reader run was performed.

**Reproducible check:**

```sh
python3 - <<'PY'
import os, re, shutil, tempfile
from pathlib import Path
repo = Path('~/Git/agent-skills')
original = repo / 'plugins/terse/README.md'
run = Path(tempfile.mkdtemp(prefix='terse-candidate-repro.', dir=os.environ['TMPDIR']))
candidate = run / '01-candidate.md'
shutil.copyfile(original, candidate)
for label, doc in [('original', original), ('candidate', candidate)]:
    for target in re.findall(r'\]\(([^)]+)\)', doc.read_text()):
        print(label, target, 'exists=' + str((doc.parent / target).exists()),
              'inside_repository=' + str(doc.is_relative_to(repo)))
PY
```

**Observed output, two link resolutions:**

```text
original references/prior-art.md exists=True inside_repository=True
candidate references/prior-art.md exists=False inside_repository=False
```

**Supporting file checks:** `plugins/terse/skills/rewrite/SKILL.md:66–79` places the run outside the repository and names separate round files; `plugins/terse/skills/audit/references/measure.md:49–50` permits only `.md` files in `<REPO>`; the same reference at 108–109 requires the same questions, key, entry file, and model for re-measurement. The README's entire link set contains one target, `references/prior-art.md`; it contains no candidate-staging instructions. The copied candidate and exact results are retained under `candidate-check/` and in `candidate-links.json`.

## B — internal contradictions after deduplication

No additional pair of README sentences that cannot both be true was established. This is not an assertion that the README is consistent. Its previously audited count/scope issues and implementation contradictions are not being submitted again. A plausible bad handoff (F4) is not relabelled as a logical contradiction.

## D — the two weakest sections

- **PLAUSIBLE — Install.** The readiness claim omits host authentication, and the exact recipe fetches a payload with a different write boundary from the checkout being reviewed. These affect whether a reader can start and what they authorize by starting. Checks: F1's real GitHub install and installed file lines, F2's pre-run refusal. Ledger additions: C18/C19/C20.
- **PLAUSIBLE — What each one does.** Its candidate/diff handover at lines 31–36, combined with the opening's re-audit arrow, never identifies the next audit's candidate/corpus contract. A reader seeking validation before applying cannot determine how to preserve the original navigation context. Checks: F4's two link resolutions and `measure.md:49,108`. Ledger additions: C05/C15. The existing ledger's other criticisms of this section are not counted again.

## E — what a new reader still cannot answer reliably

- **CONFIRMED omission, F2 / C20:** What host authentication or provider access is assumed before the two installation commands are enough to use terse? Check: README 47–49 versus the isolated pre-run refusal.
- **CONFIRMED omission, F1 / C18/C19:** Which revision does Install deliver, and does that revision honor the described approval boundary? Check: the fetched `21a225b…` payload versus the `ed7335f…` checkout and README 35–36, 43–49.
- **CONFIRMED omission, F3 / C02:** Do the documentation's external-tool recipes enter the promised truth ledger? Check: README 4–5 versus `truth-pass.md:69–71`.
- **PLAUSIBLE workflow gap, F4 / C05/C15:** How is a temporary candidate re-audited before applying it, with the same entry point and functioning relative links? Check: README 10–12, 35–36, the candidate-link probe, and `measure.md:49,108`.

## Commands, counts, and limits

- `git rev-parse HEAD` observed `ed7335f9db83f859f1fe5ba767c7d63b2622dfb6`; `git branch --show-current` observed `terse-process-2026-09-22`; `git status --porcelain` was empty at the beginning and after the install probes. No repository file was intentionally written; all produced files/configurations are under this TMPDIR directory.
- Fourteen isolated Claude CLI invocations: 12 exited 0 and two exited 1. They comprise version (1), help (4), auth status (1), unauthenticated bare prompt (1), local manifest validation (1), marketplace adds (2), plugin installs (2), and plugin lists (2). The two nonzero commands are recorded below. The shell install forms were executed; the slash-command UI forms were not.
- `node ~/Git/agent-skills/plugins/terse/skills/rewrite/scripts/selftest.mjs` ran once with Node `v24.11.0`: exit 0, **45 `ok` checks, zero `MISS` checks**, final line `all checks caught their planted violation`. The count was computed from this run's saved stdout. This establishes only those planted mechanical checks, not a successful model workflow. Output: `selftest.stdout`, `selftest.stderr`.
- One installed-script invocation with Node absent from PATH started and exited 127. That duplicates C20/C21's dependency finding and is not a new finding here.
- `git ls-remote` made one read-only request to `https://github.com/Nowely/agent-skills.git`: exit 0, two refs returned (HEAD and main), both `21a225b…`. The installed marketplace's `git rev-parse HEAD` independently returned that hash. No web search was used.
- Candidate experiment: two resolutions of one relative link, one existing in the original context and one absent in the candidate context. No reader model was run.
- Prior-ledger scan: 46 prose claim IDs, 46 unique. `git diff 1a24018 ed7335f -- plugins/terse/README.md` was empty.
- `git ls-files 'plugins/terse/skills/*/scripts/*.mjs'` returned **seven**, not the eight stated in the assignment. A hidden/unignored file scan also returned seven. The identity of an eighth script is unknown; this discrepancy is not a README finding.

### Nonzero-command record

Each command below started; none was an approval rejection.

1. `claude auth status` — started: yes; exit: 1; stderr: empty; exact stdout follows (JSON whitespace preserved in `cli-probes.json`):

```json
{
  "loggedIn": false,
  "authMethod": "none",
  "apiProvider": "firstParty",
  "analyticsDisabled": true,
  "projectsDirectory": "$TMPDIR/terse-astra-l3.Oa7q4P/claude-config/projects",
  "configDirectory": "$TMPDIR/terse-astra-l3.Oa7q4P/claude-config"
}
```

2. `claude --bare --print --no-session-persistence 'Say ok'` — started: yes; exit: 1; exact stdout: `Not logged in · Please run /login\n`; stderr: empty.
3. With `PATH` set to the empty temporary `empty-path/` directory, `/bin/sh -c 'node "$1"' sh <isolated-installed-plugin>/skills/rewrite/scripts/selftest.mjs` — started: yes; exit: 127; stdout: empty; exact stderr: `sh: node: command not found\n`. Full argv is retained in `no-node.json`.

The self-test also intentionally produced three refusal diagnostics from its planted cases; these are expected internal test outputs, not unavailable top-level commands. They are retained in `selftest.stderr`.

### Unsettled

- Runtime obedience of models to the skill instructions, paid fan-outs, end-to-end rewrite/audit behavior, and actual writes from the remote recipe: unknown; not run.
- How a host would implement candidate overlay/staging, or whether an actual reader would repair the relocated link on its own: unknown. F4 remains PLAUSIBLE.
- External-tool claim checking in an actual audit session: unknown beyond the explicit exclusion in the specification.
- Alternative-provider authentication behavior and the Node 22 minimum: unknown; the observed host was first-party Claude Code 2.1.280 and the observed Node was 24.11.0.
- The original 2026-09-10 readers' missing raw data remain unavailable; the prior ledger already reports that defect, so it is not re-submitted.
- Remote state after the dated fetch: unknown. The payload inspected here remains preserved in TMPDIR.
