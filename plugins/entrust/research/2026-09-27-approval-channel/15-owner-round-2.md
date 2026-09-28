# The owner's second round: no flags, tools just work, nothing tool-specific in the driver

2026-09-28, after the implementation was committed (af4e82f, c0d7117) and the answer in [14-answer.md](14-answer.md). The owner's words, the coordinator's checks, and what v5 must do.

## What the owner said

On the two flags the implementation shipped (`--approvals`, `--approval-timeout`): «Не нужно плодить флаги. Они забываются, используются неправильно, их нужно поддерживать и тд. А самое главное - не понятно, кому он нужен и зачем. Нужно зафиксировать где-то в этом репозитории, что если можем не создавать флаг, если нет веской причины, то и не надо его создавать. Не надо их плодить. Нужно продумать оптимальный дизайн. Может нужен дедлайн в 30 минут или что-то переписать в архитектуре.»

On arc: «когда ты вызываешь, например, arc status, тебя вообще не должно волновать, какие оно под капотом спецэффекты вызывает. Не нужно думать о кеше и других по сути системных вспомогательных файлов и уж тем более их править. Нужно как с гитом или обычной cli командой, просто вызываешь и смотришь результат.»

On the coordinator's proposal that the driver detect an arc checkout and grant its store itself: «не очень хочется зашивать в драйвер знание о существовании арка. Мотивация: арк - это специфичная штука, которая существует только здесь. Для большинства пользователей это только лишний груз. … arc использует виртуальную файловую систему macfuse или как-то так. Может это знание поможет обыграть по другому - поддержку виртуальной файловой системы в сендбоксе?»

Then: «сделай, разрешаю. С арком можешь повозиться в /Users/ruliny/arcadia/data-ui/cloud-components пути. Там как раз активна моя ветка.»

## What the coordinator checked

- The Arcadia checkout is mounted as `macfuse_arc` (`mount`, level 1). Reads of the mount inside the sandbox never failed in any report; the failure P1 measured is the arc client opening its own store in the home (`~/.arc/store/.arc/objects/objectdb/data.dat`, `~/.arc/store/.arc/sync`) read-write ([01-probe-2.md](01-probe-2.md)). So a sandbox feature for virtual filesystems as such would not make `arc status` work; letting the tool write its own state would.
- Codex 0.155.1's protocol carries a request for exactly that, tool-agnostic: `item/permissions/requestApproval` with `permissions.fileSystem.entries: [{path, access: read | write | deny}]` and `permissions.network`; the response is a granted profile with a `scope` (generated schema at the path in `/tmp/entrust-schema-155.path`, `PermissionsRequestApprovalParams.json`, `PermissionsRequestApprovalResponse.json`, level 1). The driver today answers it with an empty profile (`driver.mjs`, the REFUSALS table). Whether the Codex model issues this request for a tool's state writes, rather than asking to run outside the sandbox, is unmeasured; on `touch /tmp/…` it asked for the escape ([01-probe.md](01-probe.md)). The standing instructions the driver sends may steer it.

## The rule recorded in CLAUDE.md

> **Flags**: a new flag, header field or option is born only with a sentence that names who sets it, why the default cannot decide, and what breaks without it; when that sentence cannot be written, the default decides. Flags are forgotten, misused and maintained.

## What v5 must do

1. No flags: the mailbox exists for every agent (`--new` makes it, `--run` hands it to the driver, no `--approvals`); `--approval-timeout` goes, replaced by one constant in the driver's LIMITS table with its reason (the owner's figure: 30 minutes), a safety net for a run nobody attends.
2. The wrapper hands the request back instead of a coordinator poll: `--run` returns when a request is pending, printing the request in place of the report lines; the wrapper hands those lines back as any result; the coordinator decides with `--decide` and continues the wrapper with the same command; a headless session continues it with a second wrapper. To be weighed against Astra C2's F6, F9, F12 and the ten-minute ceiling's rerun.
3. Three request kinds are offered: a command's escape, a file change outside the roots, and a permissions widening for named paths; the coordinator's rule prefers a widening to an escape when either would do, because the command then stays sandboxed; a widening is what makes a tool's own state writable without anyone naming the tool.
4. Nothing tool-specific in the driver: the arc grant and `WRITABLE:` at read level go; arc works through the widening (or, failing that, through the approved escape), and the plan says only "reads the Arcadia checkout".
5. Everything else stands as implemented at af4e82f and fixed in the same round (containment, owner file, auto-yes with its checks, causes, report, exit ladder).

Opus P1 measures 3 before v5 is final: whether the model asks for paths (with and without a steering sentence in the standing instructions), whether a granted profile makes the command succeed inside the sandbox, and whether the grant's scope covers the rest of the turn; first with a toy tool that writes its own state under the home, then with arc in the owner's checkout.
