# The interactive report

The report of [the review page](../SKILL.md#the-report), written as data. A script checks it against the diff and draws it as one HTML file: the task, the conclusion, what to do and the target, each under its own label; what each requirement gets; the structure as written and as it should be; the files; and the diff cut into the blocks of the map, each with its verdict and its findings. The user marks there what to apply and hands the decisions back as text. `<skill-dir>` below is the review skill's installed directory.

## Steps

1. In the repository, list the changed lines:

       node "<skill-dir>/scripts/report.mjs" lines <range>

   `<range>` is the diff under review as `git diff` takes it, such as `main...HEAD`. Each changed line is printed with its address: `+12` is line 12 of the new file, `-7` is line 7 of the old one. Take each block's lines from this listing.
2. Write the review to `review.json` in a temporary directory outside the repository, in the format below, in the language the user writes to you in. Paths, identifiers and the words of the format stay as they are.
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
      "recommendation": "accept, fix in place or rewrite as the target, in a sentence",
      "steps": [{ "text": "what to do first", "findings": [1] }, { "text": "what to do next", "findings": [2] }],
      "requirements": [{ "id": 1, "text": "...", "source": "task" },
                       { "id": 2, "text": "...", "source": "discussion", "met": "traced", "doubt": "what contradicts it" }],
      "findings": [{ "id": 1, "title": "what is wrong", "direction": "behavior", "evidence": "traced",
                     "at": "path:line", "what": "...", "fix": "...", "breaks": [1] },
                   { "id": 2, "title": "what no test would catch", "direction": "tests", "evidence": "traced",
                     "at": "path:line", "what": "...", "fix": "...", "untested": [2] }],
      "ideas": [{ "title": "the idea", "at": "path:line", "text": "what it gains and what it costs" }],
      "screens": [{ "name": "the screen and its state", "mockup": "https://...", "before": "before.png", "after": "after.png",
                    "differences": [{ "what": "how the result differs from the mockup", "why": "the reason given" },
                                    { "what": "a difference nothing explains", "finding": 1 }],
                    "missing": "what you could not compare, and the picture that would settle it" },
                  { "name": "a screen whose result is the mockup", "mockup": "mockup.png", "after": "after.png", "match": true }],
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
      "coverage": "...",
      "labels": { "findings": "the report's own word, in the user's language" }
    }

Each field holds what the same part of the report holds, and these rules are checked:

- **Requirements.** `source` says where the requirement comes from: `task`, the task as given; `discussion`, a decision made while the work was discussed; `question`, a point the discussion left open; `assumption`, yours or the author's. `met` says how you know the change meets it, `ran` or `traced`; leave it out for a requirement you did not check or that a finding breaks. `doubt` is for a requirement you would not take as given: say what in the code or in a contract contradicts it, so that whoever decided it can decide again.
- **Steps.** What to do, in order, a short line each, with the findings it settles. Leave the list out when the recommendation is one thing. Do not restate a finding: name it by its number.
- **Findings.** `direction` is one of `behavior`, `necessity`, `design`, `tests`; `evidence` one of `ran`, `traced`, `judgment`. `breaks` lists the requirements the finding shows unmet. A finding about tests breaks none: it lists under `untested` the requirements a regression of which no test would catch. Leave either out when it is empty.
- **Ideas.** `title` and `text`; `at` when the idea has a place. Leave the list out when there are none.
- **Screens.** Only when the change alters what the user sees. `mockup`, `before` and `after` are each a picture you were given: a file, by its path from the data's directory, which the page takes in whole, or an `https` link, which stays a link. A difference has `what`, and `why` or the `finding` it is. `"match": true` says you compared the result with the mockup and found no difference: it needs both pictures. A screen with no difference and no match was not compared, and says in `missing` what would settle it. Leave the list out for a change nobody sees.
- **Blocks.** `added` and `removed` list the block's lines in one file as numbers and ranges; a decision that spans files is one block per file. Every changed line that is not blank belongs to exactly one block. `"all"` names every such line of the file, and only a block to remove may use it: code that stays is listed by its lines. `serves` lists requirement ids and is empty for a block that serves nothing. `verdict` is `keep`, `fix` or `remove`, and a block to fix or remove names its findings. `unit` names the unit the block is part of; leave it out for a test or for a line outside any unit.
- **Units.** The units as written: each has `jobs`, the units it `uses`, and a `verdict` of `keep`, `fix`, `split`, `merge` or `remove`, with its findings unless it is kept: `fix` is for a unit that stays one unit and changes inside. A unit of the change has at least one block. `"existing": true` marks code the change did not touch, listed because the change calls it or is called by it.
- **Target units.** The same for the target, when it differs. A name that is also a unit of the change is carried over; a name that is neither that nor existing is to be written. A unit to split has what it splits into here.
- **Labels.** Only when the user's language is not English. `node "<skill-dir>/scripts/report.mjs" labels` prints the report's own words by key; give the ones the reader will see in that language, and keep each `{n}`. A key you leave out stays in English.

Do not list the requirements no block serves, or which requirement fails or lacks a test: the script works these out.
