# Code defects — rewrite of plugins/terse/README.md, run 20260922-233021-terse-readme

These are findings the rounds routed to the code, per `rewrite/SKILL.md` step 4 item 6 (:149-155) and
`loop.md:41`. Each is a defect with its check, offered to the owner as a proposal. Nothing here is in the
repository: its `ISSUES.md` takes an entry only on the owner's word (`rewrite/SKILL.md:153-154`). Each
entry is written in that file's register (`ISSUES.md:1-5`: evidence at file:line, an evidence level, and
wording that can become an issue unchanged). On the owner's word it would go there as the next number:
E14 at `f677303`.

## D1. `rewrite` keeps its candidate outside the repository, and no page says where the candidate stands when it is re-audited, whose readers open only the repository's `.md` files

**Evidence, level 2.** `plugins/terse/skills/audit/references/measure.md:35-37` (the reader's rights):
a reader opens "the `.md` files in the repository", starts "at the entry file" and follows "links it
finds in the text". `:49` (the reader's brief): "You may open only .md files in <REPO>". `:106-109`
("Re-measuring after a rewrite"): "Same questions, same key, same entry file, same model."
`plugins/terse/skills/rewrite/SKILL.md:66-67` writes every round into "a run directory of the document's
own, outside the repository that holds it", and `:190-192` hands the round over with its diff and
applies it to the user's files only on their word. `plugins/terse/skills/rewrite/references/bake-off.md:138-139`
breaks a tie "by re-auditing each surviving candidate". A candidate in the run directory is neither the
entry file nor one of the repository's `.md` files, and no page of the three skills says where it stands
for that re-audit, or for the one the README's pipeline ends with (`plugins/terse/README.md:10-12`,
"candidate + diff → /terse:audit again").

This was found on 2026-09-22 by the adversarial whole-document read (Codex Astra, F4, plausible:
`research/2026-09-22-terse-process/rewrite-2026-09-22/l3-adversarial-findings.md:91-124`). That read
also ran the link failure: a copy of the README outside the repository resolves `references/prior-art.md`
to nothing. It was found again on 2026-09-23 by the verifier of round 02 (Codex Sol, R02f1 does not
answer), which refused a README sentence that filled the gap with advice no page gives.

**Check.** From any directory:

    sed -n '35,37p;49p;106,109p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/audit/references/measure.md; sed -n '66,67p;190,192p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/SKILL.md; sed -n '138,139p' /Users/ruliny/Git/agent-skills/plugins/terse/skills/rewrite/references/bake-off.md; echo "pages saying where a candidate stands for its re-audit: $(grep -rl -i -E 'temporary candidate|copy of (the|its) (markdown )?tree|relative (link|location)|links? (still )?resolve' /Users/ruliny/Git/agent-skills/plugins/terse/skills | wc -l | tr -d ' ')"

It prints the lines quoted above and ends `pages saying where a candidate stands for its re-audit: 0`
(run on 2026-09-23 at `f677303`, exit 0; the output is kept at `probe-02/d1-check.out`). The regex this
output must match:

    the `\.md` files in the repository[\s\S]*starting at the entry file[\s\S]*You may open only \.md files in <REPO>\.[\s\S]*Same questions, same key, same entry file, same model\.[\s\S]*outside the repository that holds it[\s\S]*re-auditing each surviving candidate[\s\S]*re-audit: 0

**Issue text.** `rewrite` keeps every candidate outside the user's repository and applies it only on
their word. `audit` re-measures with the same entry file and lets its readers open only the repository's
`.md` files. Between the two, no page says how a candidate is re-audited before it is applied: where it
must stand, and what keeps its relative links pointing where the original's did. The README's pipeline
ends with that re-audit, and `bake-off.md` calls for one to break a tie. A user who re-audits the
candidate where `rewrite` leaves it gives the readers a file outside the repository, with relative links
that resolve against the run directory. The pages should say where a candidate stands for its re-audit
(for example, at the original's path in a copy of the repository's Markdown tree), and `rewrite`'s
hand-over should say so next to the diff.
