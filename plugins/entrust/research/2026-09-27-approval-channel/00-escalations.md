# Every approval request the driver declined on this machine, 2026-09-27

Source: the report files under the plugin's data directory, 914 reports, 27 with a non-empty escalations array. The rights level is the agent's prompt header; (none) is a read agent with no header, and n/a a report older than the launcher, with no prompt beside it. Detail is the server's own wording, clipped.

| Run / agent | Model | Rights | Method | Detail |
|---|---|---|---|---|
| 2026-09-12-issues-fix/j1-astra-judge | gpt-6-astra | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'ps -o lstart= -p 1'` |
| 2026-09-12-issues-fix/s4-sol-review-lock | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'ps -o lstart= -p $$'` |
| 2026-09-12-issues-fix/t3-sol-review-seatpage | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
| 2026-09-12-issues-fix/t3-sol-review-seatpage | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'kill -9 44899'` |
| 2026-09-22-terse-process/I1 | gpt-5.6-sol | (none) | commandExecution/requestApproval | `/bin/zsh -lc "sed -n '29p' ~/Git/agent-skills/plugins/terse/skills/rewrite/references/writing-rules.md; diff` |
| 2026-09-22-terse-process/V1 | gpt-5.6-sol | (none) | fileChange/requestApproval | `` |
| 2026-09-22-terse-process/V1 | gpt-5.6-sol | (none) | fileChange/requestApproval | `` |
| 2026-09-24-terse-benchmark-maestro/SYN | gpt-6-astra | (none) | commandExecution/requestApproval | `/bin/zsh -lc 'python3 $TMPDIR/terse/runs/20260924-125421-maestro-readme-rethink` |
| 2026-09-26-entrust-issues/A2b | gpt-6-astra | read ~/Git/agent-skills | commandExecution/requestApproval | `/bin/zsh -lc 'python3 $TMPDIR/entrust-a2-c828b7f/run.py baseline-lock-unsandbox` |
| 2026-09-26-entrust-issues/V1 | gpt-5.6-sol | read ~/Git/agent-skills-entrust-issues | commandExecution/requestApproval | `/bin/zsh -lc 'node $TMPDIR/e45-d1/e45-check.mjs ~/Git/agent-skills-` |
| 2026-09-26-layout-bd/A1 | gpt-6-astra | (none) | commandExecution/requestApproval | `/bin/zsh -lc 'curl --silent --show-error --max-time 30 --head https://code.claude.com/docs/en/plugins/loading'` |
| 2026-09-26-writing-replication/A2-2 | gpt-6-sol | (none) | commandExecution/requestApproval | `/bin/zsh -lc "vcs log -n 1 --format='{date_rfc} {commit}' AGENTS.md"` |
| 2026-09-26-writing-replication/A2d | gpt-6-sol | (none) | fileChange/requestApproval | `` |
| field-audit-20260916/sol-r1 | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
| naming-20260917/sol-n2 | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc "curl -fsSL https://code.claude.com/docs/en/agent-teams \\| rg -n -i -o '.{0,100}delegate mode.{0,220}' \\|` |
| practices-2026-09-17/s2-sol-2 | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
| practices-2026-09-17/s2-sol-2 | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
| practices-2026-09-17/s3-sol-2 | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
| 20260924-upgrade/R1 | gpt-5.6-sol | read ~/monorepo/app | commandExecution/requestApproval | `/bin/zsh -lc 'vcs diff -- package.json pnpm-lock.yaml'` |
| branch-audit/a2 | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc "vcs status --short; vcs log -n 1 --format='%H %ad %s'"` |
| branch-audit/a2 | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc "vcs status --short; vcs log -n 5 --format='%H %ad %s'"` |
| branch-audit/a2 | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'rm -rf /private$TMPDIR/a2-vcs.X4qYCh'` |
| branch-audit/a9 | gpt-6-astra | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show 719d4945cd0e7c7e402f92b6bc1c2d145332eb8e:app/src/components/` |
| branch-audit/b1 | gpt-5.6-sol | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show --stat b7548aa'` |
| branch-audit/b1 | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
| branch-audit/l2 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show 719d4945cd0e7c7e402f92b6bc1c2d145332eb8e:src/components/` |
| branch-audit/l2 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'rm -rf -- $TMPDIR/tmp.N34pcf4VVt $TMPDIR/` |
| branch-audit/l3 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show 719d4945cd0e7c7e402f92b6bc1c2d145332eb8e:src/components/` |
| branch-audit/l3 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'rm -rf $TMPDIR/tmp.9n0qUNhiIB'` |
| branch-audit/l4 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show b7548aaadaefc105191622c2d926fd3a79b6ac59:src/components/` |
| branch-audit/l5 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show 719d4945cd0e7c7e402f92b6bc1c2d145332eb8e:src/components/` |
| branch-audit/l6 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show e7eb4da6f8d9b0d26cb96ca45f821949b1eac009'` |
| branch-audit/l7 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show 719d4945cd0e7c7e402f92b6bc1c2d145332eb8e:src/components/Changelog.mdx && vcs show 719d4` |
| branch-audit/l8 | gpt-5.6-luna | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'vcs show 719d4945cd0e7c7e402f92b6bc1c2d145332eb8e:app/src/components/` |
| reports/round04-astra-20260912 | gpt-6-astra | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'CODEX_HOME=$TMPDIR/readme-critic-3cg5ymsv/codex-home codex sandbo` |
| reports/round07-astra-20260912 | gpt-6-astra | n/a | commandExecution/requestApproval | `/bin/zsh -lc 'CODEX_HOME=$TMPDIR/lifecycle-audit-ypki0pjw/codex codex sandbox -` |
| reports/round07-sol2-20260912 | gpt-5.6-sol | n/a | fileChange/requestApproval | `` |
