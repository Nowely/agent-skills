# Codex report R2

The five fields of the driver report, verbatim. Commands: 20.

## status

done

## result

Codex Sol R2: changes requested, reviewed a4db68f..HEAD read-only and ran all requested checks.
(a) PASS — both environment branches created directories outside every Git worktree; each `git rev-parse --show-toplevel` exited 128, while the assertion harness exited 0.
(b) PASS — rewrite selftest reported exactly 45 `ok` cases and exited 0.
(c) PASS — only ISSUES.md, terse/CHANGELOG.md, rewrite/SKILL.md, and loop.md changed; neither frozen reference nor a version declaration changed.
(d) PASS — four `research/` hits are provenance/measurement narratives; both `ISSUES.md` hits expressly require the user's word.
(e) PASS — steps 4–6 identify the external run directory and absolute-path report, preserve copying audit.md from its known sibling path, establish the run directory as command cwd, require an absolute cited file, and contain no unconsented repository write.
(f) PASS — all five promise surfaces are consistent with the instruction pages: generated artifacts stay in the external run directory, while applying a candidate or recording a defect in the repository requires consent.
(g) PASS — Unreleased names E5 and both changes; E5 is absent; E4 cites rewrite/SKILL.md:101, which is the ledger-seed command.
Finding 1 — plugins/terse/skills/rewrite/SKILL.md:71: `RUN="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}/terse}/runs/..."` uses a form Claude Code does not substitute. The repository's explicit contract at plugins/entrust/evals/agent-contract.test.mjs:160-169 says only exact `${CLAUDE_PLUGIN_DATA}` is substituted and `${VAR:-default}` reaches Bash with no exported variable, so installed rewrite runs fall through to TMPDIR. This contradicts plugins/terse/CHANGELOG.md:34-35 (`in the plugin's data directory or $TMPDIR`). Audit uses the same defective formula at audit/SKILL.md:33 and shares the risk.
Finding 2 — plugins/terse/skills/rewrite/SKILL.md:74 says only `Name the absolute path in your report`; it does not tell the executor or user that the sole returned artifacts can disappear when TMPDIR is purged, or—once plugin-data placement works—when the plugin is uninstalled without `--keep-data`. This is a lifecycle instruction gap, not merely wording taste.
Decision — `-<slug>` tail: accept; it identifies the document and reduces cross-document collisions. A safe-character convention would be optional hardening.
Decision — `absolute` at rewrite/SKILL.md:109: accept and necessary because round.mjs executes checks from the external run directory.
Decision — step-6 `code-defects.md` bullet: accept; it makes the new routed artifact part of the return contract.
Decision — E4 citation-only commit: accept; the changed line number now resolves to the seed command.
Decision — why-sentence only in SKILL.md: accept; the executable page explains the reason and loop.md:41 still carries the consent gate, so duplicating the rationale is unnecessary.
Risk — plugin-data substitution is confirmed by the repository's own contract, not hypothetical; audit shares it exactly. Direct observation inside an installed Claude Code runtime was unavailable.
Risk — retention is real in both intended branches: TMPDIR is purgeable, while plugin data survives updates but is removed at uninstall unless `--keep-data` is used, per plugins/entrust/README.md:129-134.
Mergeability — not mergeable as documented until the substitution behavior and retention handoff are addressed; the core E5 property—no unconsented write into the user's repository—is otherwise fixed.

## evidence

- (a) `zsh -c '<set CLAUDE_PLUGIN_DATA; execute formula; git -C "$RUN" rev-parse --show-toplevel; unset it; set TMPDIR; repeat>' | tee .../check-a-rundirs.log` — exit 0; both inner git commands exited 128.
- (b) `node plugins/terse/skills/rewrite/scripts/selftest.mjs 2>&1 | tee .../check-b-selftest.log` — exit 0; `test "$(grep -c '^ok   ' .../check-b-selftest.log)" -eq 45 && grep -c '^ok   ' ...` — exit 0, output 45.
- (c) `zsh -c '<git diff a4db68f..HEAD --stat; reject frozen filenames; reject changed version declarations>' | tee .../check-c-stat-version.log` — exit 0.
- (d) `grep -rn "research/\|ISSUES.md" plugins/terse/skills plugins/terse/README.md | tee .../check-d-grep.log` with pipefail — exit 0.
- (e) `sed -n '/^## Step 4\./,/^## Reference/p' plugins/terse/skills/rewrite/SKILL.md > .../check-e-steps4-6.log; rg -n 'outside the repository|Name the absolute path|audit\.md.*in|run directory as the working directory|file.*absolute|only on the user.s word|applying.*needs their word' .../check-e-steps4-6.log` — exit 0. An earlier quoting attempt exited 1 with exact diagnostic `zsh:6: unmatched "`; it was not counted as the check.
- (f) grouped `nl -ba` over the five promise surfaces plus `rg -n 'write|written|tree|repository|word|run directory'` over all three skill pages, teeing to check-f-promises.log — exit 0.
- (g) `zsh -c '<rg changelog E5/change; assert no current E5; resolve E4 citation; assert line 101 contains ledger-seed.mjs>' | tee .../check-g-e5-e4.log` — exit 0.
- Risk verification: asserted the exact `${CLAUDE_PLUGIN_DATA}` placeholder is absent and `${CLAUDE_PLUGIN_DATA:-` present in both terse formulas, then read entrust substitution and retention contracts into risk-plugin-data-substitution.log — exit 0.
- Final `git status --short --branch` — exit 0 and clean on terse-process-2026-09-22. No repository files were changed.

## artifacts

- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-a-rundirs.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-b-selftest.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-c-stat-version.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-d-grep.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-e-steps4-6.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-f-promises.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/check-g-e5-e4.log
- /var/folders/mf/9v804k_57lq30kwtlr7468xr0000gn/T/terse-review-sol-r2-20260922/risk-plugin-data-substitution.log

## open

- Direct behavior inside an installed Claude Code plugin runtime was not observable; the substitution finding relies on the repository's explicit, tested contract.
- Taste: whether `<slug>` should prescribe safe characters and stronger uniqueness. The current tail is otherwise a sound decision.
- Product choice: whether retention should be handled by a warning, an explicit durable-copy offer, or a different storage location.
