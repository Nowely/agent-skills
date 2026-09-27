# Defects found in passing: the repository

Defects of the repository as a whole, recorded per the repository rule: evidence at file:line, an evidence
level (1: the line resolves; 2: an independent reader of the code would say the same; 3: the behaviour was
made to happen), and wording that can become an issue unchanged. An entry leaves when its fix lands. Ids are
shared with `plugins/entrust/ISSUES.md` and `plugins/terse/ISSUES.md`, so one id names one entry in all three.

## E56. Tracked files carry absolute paths from the owner's machine, and nothing keeps personal data out

**Evidence, level 1.** On `main` at `882bcf3`, `git grep -l -E '/Users/[A-Za-z0-9._-]+/' origin/main` lists 319
files, 315 of them under `plugins/terse/research/`, all with one account's home directory, and
`git grep -l -F '/var/folders/' origin/main` lists 583. The installed
part carries two such paths: `plugins/terse/plugin/references/practices-full.md:26` and `:1166` name
downloads under the owner's home directory, so every install ships them. The branch for terse 0.3.0 adds
23 more files, among them the coverage records
`plugins/terse/research/2026-09-26-writing-replication/measures/coverage/rulecheck.json`,
`rulecheck2.json` and `h1check.json`, and the official trigger results under `measures/clarity-trigger/`,
found by the release review of 2026-09-28. `CLAUDE.md` has no rule on personal data in tracked files, and
CI runs no check for it.

**Issue text.** Research records, measurements and one installed page keep absolute paths from the owner's
machine: the home directory with the account name, and per-run temporary directories. They mean nothing to a
reader outside that machine and expose personal data. The repository should state that tracked files carry
no personal data or machine paths, write paths relative to the repository or as placeholders, clean the
existing files, and have CI fail on a home-directory or temporary path in a tracked file.
