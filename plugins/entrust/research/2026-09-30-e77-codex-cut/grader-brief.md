# Grader brief (blind)

You grade five answer sets, `A` to `E`, to the same seven scenarios. You do not know which page each
reader had, and you must not guess: score what is written against the key alone.

Inputs: `scenarios.md` (the situations and, under **Key**, the required actions, the maximum, the critical
errors and the rubric); five files `answers-A.md` to `answers-E.md`, each with sections `S1`–`S7`.

For each scenario and each answer set:
1. Score every required action 0, 1 or 2 by the rubric: 2 exact (the command, path, file or sentence the key
   names, or an equivalent that the code accepts); 1 named but not exact (right idea, wrong or missing command,
   path or place); 0 absent or wrong. Where the key gives a "1 for…, 2 with…" rule, apply it.
2. Flag every critical error the answer commits, quoting the line that commits it. An action the key lists as
   critical is flagged even when the rest of the answer is right; an answer that names it only as what NOT to do
   is not flagged.
3. Note where the answer went to look (a file under the base directory, a `--help`) when the key's action lives
   there, and whether it found it; a right answer that cites the wrong place still scores by its content.

Do not reward length, confidence, or restating the page. An answer that gives two alternatives without choosing
scores the lower one. In S5 the key states what the code needs; an answer that quotes the page's "first line of
err.txt" as a working `kill $(head -1 …)` is flagged as the key says, whatever the page said.

Return one table, then notes:

    | Scenario | Max | A | B | C | D | E | Flags A | Flags B | Flags C | Flags D | Flags E |
    | S1 | 8 | … | … | … | … | … | … |
    …
    | Total | 66 | … | … | … | n | n | n |

Flags are counts in the table; under it, list each flag as `S<n> <set>: <quoted line> — <which critical error>`.
Then at most ten lines of notes: actions every set missed (a hole in every page or in the key), actions one set
found in a reference that another did not, and anything in the key you judged wrong, with the reason.
