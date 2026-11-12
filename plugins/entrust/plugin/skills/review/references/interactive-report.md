# The interactive report

The report of [the review page](../SKILL.md#the-report), written as data. A script checks it against the diff and draws it as one HTML file: what the change is, the verdict, the structure as written and as it should be, and the diff cut into the blocks of the map, each with its verdict and its findings. The recommendation stands out under the verdict, and the ideas have a section of their own. The user marks there what to apply and hands the decisions back as text. `<skill-dir>` below is the review skill's installed directory.

## Steps

1. In the repository, list the changed lines:

       node "<skill-dir>/scripts/report.mjs" lines <range>

   `<range>` is the diff under review as `git diff` takes it, such as `main...HEAD`. Each changed line is printed with its address: `+12` is line 12 of the new file, `-7` is line 7 of the old one. Take each block's lines from this listing.
2. Write the review to `review.json` in a temporary directory outside the repository, in the format below.
3. Render it, again in the repository:

       node "<skill-dir>/scripts/report.mjs" render <directory>/review.json

   The script lists every fault: a changed line no block covers, a line two blocks claim, an id or unit nothing defines. Fix them and render again. When it passes, it writes `review.html` beside the data and prints the report. That printout is the review you give the user, with the page's path.

## The data

    {
      "title": "a short name of the change",
      "range": "main...HEAD",
      "change": { "goal": "what the change is for, in a sentence", "why": "the reason, when a source gives one",
                  "parts": ["what it adds or alters, one line each"], "sources": ["the task text", "the commits"] },
      "verdict": "...",
      "target": "...",
      "recommendation": "what you would do next, and which findings first",
      "requirements": [{ "id": 1, "text": "..." }],
      "findings": [{ "id": 1, "title": "what is wrong", "direction": "behavior", "evidence": "traced",
                     "at": "path:line", "what": "...", "fix": "...", "breaks": [1] }],
      "ideas": [{ "title": "the idea", "at": "path:line", "text": "what it gains and what it costs" }],
      "units": [{ "name": "importContacts", "jobs": ["parses", "validates", "writes"], "uses": ["ContactStore"],
                  "verdict": "split", "findings": [1] },
                { "name": "ContactStore", "existing": true, "jobs": ["keeps the contacts"] }],
      "target_units": [{ "name": "importContacts", "jobs": ["reads the rows", "applies the plan"],
                         "uses": ["planImport", "ContactStore"] },
                       { "name": "planImport", "jobs": ["decides what each row does"] },
                       { "name": "ContactStore", "existing": true, "jobs": ["keeps the contacts"] }],
      "blocks": [{ "path": "src/a.js", "added": "1-2, 10-16", "removed": "7", "unit": "importContacts",
                   "does": "...", "serves": [1], "verdict": "remove", "findings": [1] }],
      "questions": [{ "at": "path:line", "text": "what is unexplained, and what would settle it" }],
      "coverage": "..."
    }

Each field holds what the same part of the report holds, and these rules are checked:

- **Findings.** `direction` is one of `behavior`, `necessity`, `design`, `tests`; `evidence` one of `ran`, `traced`, `judgment`. `breaks` lists the requirements the finding shows unmet; leave it out when it breaks none.
- **Ideas.** `title` and `text`; `at` when the idea has a place. Leave the list out when there are none.
- **Blocks.** `added` and `removed` list the block's lines in one file as numbers and ranges; a decision that spans files is one block per file. Every changed line that is not blank belongs to exactly one block. `"all"` names every such line of the file, and only a block to remove may use it: code that stays is listed by its lines. `serves` lists requirement ids and is empty for a block that serves nothing. `verdict` is `keep`, `fix` or `remove`, and a block to fix or remove names its findings. `unit` names the unit the block is part of; leave it out for a test or for a line outside any unit.
- **Units.** The units as written: each has `jobs`, the units it `uses`, and a `verdict` of `keep`, `split`, `merge` or `remove`, with its findings unless it is kept. A unit of the change has at least one block. `"existing": true` marks code the change did not touch, listed because the change calls it or is called by it.
- **Target units.** The same for the target, when it differs. A name that is also a unit of the change is carried over; a name that is neither that nor existing is to be written.

Do not list the requirements no block serves, or which requirement fails: the script works both out.
