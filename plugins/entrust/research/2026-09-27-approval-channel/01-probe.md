# Probe: what `accept` grants, and how the server waits

Opus P1, 2026-09-27, codex-cli 0.155.1, five paid turns on gpt-5.6-terra at effort low, its own probe client and private Codex home under `$TMPDIR`. The return below is P1's; the coordinator added this heading and the note at the end. Its probe script and the nested-sandbox calibration it names are copied beside this file under [01-probe/](01-probe/).

---

status: done

result:

Opus P1: done. On codex 0.155.1, `accept` reruns the command with no Seatbelt at all. The server waits for the decision with no timeout (180 s tested). A JSON-RPC error counts as a rejection. Closing stdin while a request is pending aborts the turn and exits cleanly.

Q1 (level 3): The sandboxed attempt failed. item/completed reported status failed, exitCode 1, aggregatedOutput "touch: /tmp/entrust-accept-probe-0ea4d218: Operation not permitted". The codex log recorded "sandbox violation: resource=filesystem backend=seatbelt ... path=/tmp/...". The model then called exec_command with sandbox_permissions "require_escalated". item/commandExecution/requestApproval id 0 arrived in the same ms as that item's item/started, and thread status became activeFlags ["waitingOnApproval"]. Params received: kind "command", environmentId "local", reason (= the model's justification), command "/bin/zsh -lc 'sleep 25; touch /tmp/...'", cwd = the scratch directory, commandActions [{type:"unknown",command:"sleep 25; touch ..."}], proposedExecpolicyAmendment ["sleep","25"], availableDecisions ["accept",{acceptWithExecpolicyAmendment:{execpolicy_amendment:["sleep","25"]}},"cancel"]. approvalId, networkApprovalContext and proposedNetworkPolicyAmendments were absent.

Q1 flag (level 3): availableDecisions never lists "decline", yet the driver refuses every request with "decline". availableDecisions is not in the generated 0.155.1 schema properties (level 1).

Q2 (level 3): After accept, serverRequest/resolved arrived 1 ms later. The command ran for 25055 ms, exit 0, and /tmp/entrust-accept-probe-0ea4d218 appeared.
- The process list cannot tell sandboxed from unsandboxed. Both attempts show as "/bin/zsh -c sleep 25; touch ..." directly under the app-server pid, each in its own process group, with no sandbox-exec or codex wrapper.
- The item notifications carry no sandbox field.
- A nested-sandbox test settled it. Under codex's entrust_read seatbelt (checked without a model via `codex sandbox -P entrust_read`), a nested `sandbox-exec -p "(version 1)(allow default)" /usr/bin/true` fails "sandbox_apply: Operation not permitted" with exit 71; outside any sandbox it exits 0.
- Turn 5 ran that test. The sandboxed attempt printed "nested=71" plus the touch EPERM. The accepted attempt printed "nested=0" and the /tmp file appeared. So accept removes the Seatbelt entirely; it does not widen it.

Q3 hold (level 3): I held the answer for 180.006 s. The server sent 0 lines and 0 stderr in that time: no timeout, no cancel, no repeated request. Status stayed ["waitingOnApproval"]. The model's exec cell stayed blocked; the rollout shows its output only at 09:52:26.598. After the late accept: resolved +3 ms, command exit 0, file appeared, turn/completed "completed".

Q3 error (level 3): I answered with {"error":{"code":-32000,...}}. The server sent serverRequest/resolved 1 ms later and item/completed status "failed" with exitCode null. The model saw `exec_command failed: CreateProcess { message: "Rejected(\"approval request failed\")" }`. The command did not run. The turn completed normally 2.9 s later, so there was no hang.

Q3 stdin close (level 3): Because the error did not hang, turn 5 left a second request unanswered and closed stdin 5 s later. The server logged "exec_command failed: CreateProcess { message: \"TurnAborted\" }" and exited with code 0 43 ms after the close. It sent no turn/completed. No process from its tree survived, and the pending command did not run.

Q4 (level 3): item/started fileChange (changes [{path:"/tmp/entrust-fc-probe-0467e13c.txt",kind:{type:"add"},diff:"probe\n"}]) was followed 2 ms later by item/fileChange/requestApproval. The request itself names no path; the path is only in the preceding item/started. Its params: reason null, grantRoot null. There was no sandboxed attempt first. After accept: item/completed "completed", and the file appeared containing "probe".

Side (level 3): In the Q3 hold thread, the sandboxed first attempt ran (the rollout shows exec_command login:false, exit_code 1, EPERM) but produced no item/started or item/completed. Anything that counts commands from item notifications would miss it.

Side (level 3): Codex appended `[projects."<scratch>"] trust_level = "trusted"` to the private config.toml, which matches the driver comment at driver.mjs:1063-1065.

evidence:
- Codex turns: 5 (gpt-5.6-terra, effort low), 5 rollouts in ~/.codex/sessions/2026/09/27/. Also 2 dry handshakes with no turn (thread/start plus model/list). 1 model-free `codex sandbox` calibration.
- Approval requests seen: 6 (5 commandExecution: q12 1, q3a 1, q3b 1, q5 2; 1 fileChange: q4).
- Answers sent: 4 accepts (3 command, 1 fileChange), 1 JSON-RPC error, 1 left unanswered, 0 declines.
- Files that appeared: 4 (/tmp/entrust-accept-probe-0ea4d218, -8b5945b9, -4b147629, /tmp/entrust-fc-probe-0467e13c.txt). Did not appear: 2 (-5904635e after the error; /tmp/entrust-close-probe-e76a35a7 after the stdin close).
- Q3 timings (UTC): request 09:49:26.582, accept sent 09:52:26.588, resolved 09:52:26.591, command done 09:52:26.630, turn/completed 09:52:30.453.
- Error run: request and error 09:49:27.300, resolved 09:49:27.301, turn/completed 09:49:30.187.
- Stdin-close run: request 09:57:01.746, stdin closed 09:57:06.748, exit code 0 at +43 ms.
- Ways the probe differed from the driver:
  - developerInstructions drop "Nobody will answer a question." and the timeout, brief and answer-json sentences.
  - The notification opt-out list keeps command output deltas.
  - config.toml holds the model only; effort is sent as -c model_reasoning_effort=low.
- Cleanup: /tmp probe files and scratch directories removed, and the auth.json symlinks deleted from the private homes. /tmp has 0 `entrust-*probe*` entries and ~/.codex/auth.json is intact. None of the probe's processes are running.
- The one codex-code-mode-host still running (pid 95698) belongs to another session's entrust driver run (pid 91726, plugin 0.20.0). It is not the probe's and I left it alone.

artifacts:
$TMPDIR/entrust-p1.54JBSVGo09/probe.mjs
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q12.jsonl (Q1/Q2)
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q3a.jsonl (180 s hold)
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q3b.jsonl (JSON-RPC error)
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q4.jsonl (fileChange)
$TMPDIR/entrust-p1.54JBSVGo09/transcript-q5.jsonl (nested-sandbox test + stdin close with a pending request)
$TMPDIR/entrust-p1.54JBSVGo09/transcript-dry.jsonl (2 dry handshakes)
$TMPDIR/entrust-p1.54JBSVGo09/calib-nested.sh
$TMPDIR/entrust-p1.54JBSVGo09/cfg-*.json
$TMPDIR/entrust-p1.54JBSVGo09/home-q12/logs_2.sqlite (seatbelt violation and ExecApproval log lines; the other home-* directories are kept too)
~/.codex/sessions/2026/09/27/rollout-2026-09-27T12-45-38-01a0e241-7e51-7982-a979-554e9de867f9.jsonl, rollout-2026-09-27T12-49-14-01a0e244-cb40-7d02-a44b-fc97db4148f1.jsonl, rollout-2026-09-27T12-49-14-01a0e244-cb21-78d0-b897-bc12ea491c02.jsonl, rollout-2026-09-27T12-49-17-01a0e244-d6cc-7b30-890c-1f3e7c126d5c.jsonl, rollout-2026-09-27T12-56-40-01a0e24b-98f5-7683-8aeb-0f46fbd62225.jsonl

open:
- Whether "decline" is still honoured when availableDecisions omits it: no decline was sent, so this is untested. It matters because the driver's refusals rely on it.
- acceptForSession, acceptWithExecpolicyAmendment and cancel were not tried. How far the proposed amendment ["sleep","25"] would reach is unknown.
- Only a 180 s hold was tested; whether there is a longer server-side bound is unknown.
- Why the login:false sandboxed attempt emitted no item notifications: the cause was not established; only the gap was observed, once.
- Q4 tested one accepted add of one file. Whether a file-change accept also bypasses the sandbox for other paths, and which process applies the patch, is not established; the 500 ms process sampler saw no helper.
- Whether an accepted command is also free of network limits is a hypothesis drawn from "no Seatbelt at all". Network was enabled in this profile, so it could not be observed.

---

**Coordinator's note on the first open item.** Whether `decline` is honoured is answered by the production reports, level 3: the 27 runs in [00-escalations.md](00-escalations.md) each answered `decline` and continued to `turnStatus: completed`, and their command lists mark the declined command `status: "declined"` (for example `2026-09-26-layout-bd/A1`, `commandsDeclined: 1`). What is unpromised is only that the server lists it among the available decisions.
