# Measures of test D

Run from the repository root on 2026-09-25. `visible.mjs` counts words the way `rulers/form.md` does; `sentences.mjs` counts prose sentences, tables and fences excluded — a rough count that prompts a review.

## rule1.mjs on 02-repaired.md

```text
! line 15  flag name      --skill
! line 34  absolute path  /marketplace.visualstudio.com/items
! line 34  absolute path  /open-vsx.org/extension/sharpdeveye/maestro-workflow
! line 35  absolute path  /www.npmjs.com/package/maestro-workflow-mcp
! line 35  protocol name  MCP

5 violation(s), 0 excused
exit 1
```

## sections.mjs on 02-repaired.md, budgets written after the repair

```text
  138 / 140  -2   (opening)
  161 / 165  -4   Quick start
  588 / 590  -2   Commands
  252 / 255  -3   How it works
    6 / 10   -4   Documentation
   42 / 45   -3   Contributing
 1187 TOTAL, 0 section(s) over budget
```

## Visible words and sentences

| Text | visible words | prose sentences | median words | over 25 words | longest | code spans per sentence |
|---|---|---|---|---|---|---|
| A | 2104 | 71 | 14 | 12 | 47 | 1.34 |
| B | 1175 | 48 | 17 | 14 | 40 | 0.94 |
| C | 1001 | 27 | 11 | 4 | 68 | 0.30 |
| D 01-draft | 1017 | 29 | 18 | 5 | 50 | 1.23 |
| D 02-repaired | 1048 | 30 | 17 | 7 | 44 | 0.94 |
