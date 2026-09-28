# Probe, fifth round: the softened steering clause

Opus P1, 2026-09-28, two paid turns on gpt-5.6-terra at effort low, both features on, `experimentalApi: true`, the steering paragraph's last clause replaced by v7's "Ask to run outside the sandbox only when no path would make the command succeed." Its return follows.

---

status: done

result:

Opus P1: done. Q11a: with the revised last clause the model still asks for the path first, a permissions request for state.log; granted with scope turn, both runs succeeded under Seatbelt. Q11b: for a failure no path can fix, the model went straight to an escape (require_escalated), a command approval with no additionalPermissions; I declined it and the model gave up and reported, asking for no path.

Q11a (level 3): flags on, experimentalApi true, the imperative paragraph with its last clause replaced by "Ask to run outside the sandbox only when no path would make the command succeed."
- After the sandboxed failure (exit 1, "cannot write ~/.entrust-probe-tool/state.log … Operation not permitted") the model called `tools.request_permissions({permissions:{file_system:{write:["~/.entrust-probe-tool/state.log"]}},reason:…})`.
- item/permissions/requestApproval arrived with write ["…/state.log"] and entries [{path:{type:"path",path:"…/state.log"},access:"write"}], reason "The requested status command must append its state log at this exact path before it can complete."
- I granted the copied fileSystem with scope "turn".
- Both reruns used exec_command with sandbox_permissions "with_additional_permissions" and additional_permissions for the file. Neither raised a new request: exit 0, output "nested_sandbox_exec=71 … / status: ok". state.log got 2 lines.
- The model never asked to run outside the sandbox.

Q11b (level 3): the same setup, command `/usr/bin/sandbox-exec -p "(version 1)(allow default)" /usr/bin/true`.
- The sandboxed attempt gave exit 71, "sandbox-exec: sandbox_apply: Operation not permitted".
- The model then called exec_command with sandbox_permissions "require_escalated", a justification, and a prefix_rule (rollout).
- item/commandExecution/requestApproval arrived with reason "May I run the exact supplied sandbox-exec command outside the enclosing sandbox so it can succeed?". It carried no additionalPermissions field, although experimentalApi was on. proposedExecpolicyAmendment was the full argv, and availableDecisions were ["accept",{acceptWithExecpolicyAmendment:…},"cancel"].
- I answered {"decision":"decline"}. Although "decline" is not among availableDecisions, the server accepted it: serverRequest/resolved at once, the item completed with status "declined" and exitCode null, and the model saw `CreateProcess { message: "Rejected(\"rejected by user\")" }`.
- The model made no further attempt and requested no path. It reported both attempts and the turn completed.

Distinguishing the two kinds (level 3, with experimentalApi true): an escape approval has a reason and no additionalPermissions. A paths approval (Q10b) has additionalPermissions, no reason, and availableDecisions ["accept","cancel"].

evidence:
- Paid turns: 2 of 2 (q11a thread 01a0e50f-e629…, q11b thread 01a0e50f-e793…).
- Requests by kind: permissions 1 (granted, scope turn); command approvals with additionalPermissions 0; escape 1 (declined); fileChange 0.
- Commands: q11a 3 exec (exit 1, 0, 0); q11b 2 exec (exit 71; then status declined, exit null).
- Files written: state.log 2 lines, both nested=71.
- No VCS-client involvement. index.dat was not touched and not re-measured.
- Cleanup: ~/.entrust-probe-tool and scratch-q11 removed, auth.json symlinks deleted from home-q11a and home-q11b, and 0 probe processes left.

artifacts:
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q11a.jsonl
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q11b.jsonl
$TMPDIR/entrust-p1.54JBSVGo09/cfg-q11a.json, cfg-q11b.json (the exact steering paragraph is in devExtra)
$TMPDIR/entrust-p1.54JBSVGo09/probe.mjs
Rollouts: ~/.codex/sessions/2026/09/28/rollout-2026-09-28T01-50-19-01a0e50f-e629-7681-a508-3d3b93630340.jsonl and rollout-2026-09-28T01-50-19-01a0e50f-e793-7ce0-bd6e-cc6d4ede8b30.jsonl

open:
- Accepting an escape with the flags on was not exercised this round (Q11b declined, per the brief). With the flags off, accept was proven unsandboxed in Q2 and Q5 of the earlier runs.
- Only one path-free failure kind was tested (a nested Seatbelt). Other non-path failures, such as a blocked mach service or a network host, may draw a path request or an escape.
- Whether the model would try a path after an escape is declined, given a failure a path could fix, is untested.
- Q9 (the VCS client under exact iterative grants) is still blocked by the auto-mode classifier.
- n=1 per variant.
