# Results from the owner's machine (2026-10-09)

The owner ran `04-opencode-probe.mjs` and `05-codex-probe.mjs` through `06-prompt-for-the-owner.md` on macOS
(darwin 25.6.0): OpenCode 1.18.35 on an OpenRouter model, Codex CLI 0.159.3 on its default model. Paths below
are shortened: `<user-temp>` is the per-user temporary directory macOS gives each account
(`/private/var/folders/<two characters>/<an id derived from the account>/T`), which names the account on that
machine and stays out of this file.

## E1. The rules a session reports (no model call; level 3)

| Session | Rules sent | `POST /session` echoed | `GET /session/:id` |
| --- | ---: | --- | --- |
| read | 8 | the same | the same |
| write | 22 | the same | the same |

The server keeps the rules as sent, in order, so step 4's exact read-back holds against a live V1 server: no
OpenCode run exits 4 for it. The comparison stays exact.

## E2. An edit asked of a read session (level 3)

Exit 7, "an approval was needed and no approval directory was configured", the file not written. No edit
request reached the driver: V1's rules denied the edit outright. The model then tried a shell command, which
asked, was declined at once (no mailbox), and made the run exit 7. V1's session rules, all of OpenCode's
enforcement, held.

## F. Bash allow patterns for a read-only set (level 3)

A write session with `bash: "git diff*": allow` and `bash: "rg *": allow` after the driver's own rules:

| Command | Asked | Ran | File written |
| --- | --- | --- | --- |
| `git diff --stat` | no | yes | — |
| `rg -n probe .` | no | yes | — |
| `git diff > f1.txt` | no | yes | yes |
| `rg probe . > f2.txt` | no | yes | yes |
| `git diff; touch f3.txt` | yes, as two patterns, `git diff` and `touch f3.txt` | rejected | no |

OpenCode splits a command at `;` and asks for each part, but matches a redirect against the allowed prefix: an
allow for a read-only command lets the same command write any file. So the adapter keeps asking for every shell
command (X7's exit-7 half stays as it is): a read run with no mailbox that needs a command exits 7.

## G. A network-denied Codex command (level 3)

A read agent with `NETWORK: no` ran `curl … https://example.com`: the command failed (curl exit 6, the host could not be resolved), the
sandbox reported `networkAccess: false`, and no approval request reached the driver. A denied fetch is a failed
command, not a question, so egress off by default would leave an agent nothing to ask for: decision 1's default
(on) stands, and the pages now say what `NETWORK: no` does.

## H. The Codex file-change auto-accept on macOS (level 3)

A write agent created a file in its `$TMPDIR` (`<user-temp>/entrust/…/agents/…`) and one in its directory with
its edit tool: both written, no request reached the driver, `approvalsAutoAccepted: 0`. The server asked about
neither: the `/private/var` spelling the accept was made for (0.21.0) no longer reaches the edit tool, since the
run's `$TMPDIR` is built on a resolved root (0.26).

Finding 7 of the Codex audit proposed deleting the accept on a zero count, and it was deleted, then restored on
the owner's word: the accept answers only a request whose every path is proven inside the writable roots by
inode, so it grants nothing the sandbox does not, while a request the edit tool raises for another spelling (a
project reached through a link, a path the task spells differently, a later Codex) would otherwise decline a
write the agent was entitled to and fail its task. One run showing the original cause gone is not evidence that
no other cause exists, and the owner's measure is that a task completes.

## After the owner's review (same day)

The owner's measure is that a task completes, and an agent that fails silently is no use. Two changes followed:

- The auto-accept stays (section H).
- Every driver now gives its agent standing rules: what its rights let it do, how to ask the coordinator for
  anything else (a Codex agent by rerunning the refused command with escalated permissions; an OpenCode or Claude
  call waits for the decision), and to record a refusal with what it blocked instead of working around it. A
  live Claude read agent (Haiku) asked to write a file made one Bash request; declined, it answered `blocked`,
  named the command and what it needed, and tried nothing else.

G and E2 are worth running again on the branch that carries the rules: G to see whether the Codex agent now asks
for its fetch, E2 to see whether the OpenCode agent now stops at the refused edit.
