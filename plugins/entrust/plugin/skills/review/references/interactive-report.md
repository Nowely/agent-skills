# Interactive presentation

The page is drawn from a `review.json` that `check` passed, with the diff saved beside it; a partial review has no
record to draw. Writing it needs permission to write artifacts; without it, say the page could not be made.

1. Check that the record's base, head and diff digest still match the repository or the saved diff; if they do not,
   name what changed instead of drawing from another version.
2. From the reviewed repository, run:

       node "<skill-dir>/scripts/report.mjs" render /path/to/review.json

   It checks the record again, writes `review.html` beside it and prints the report as text. It does not change
   the JSON.
3. Link the page. Everything on it comes from the record; a new conclusion needs a revised record, not a repair
   while drawing.

The page is self-contained: the verdict, the solution now and the target, the steps, requirements and where they come
from, mechanisms with their cost and weight, the files, the units now and in the target, the change map line by line,
the findings and the manual checks. The user marks findings and ideas to apply or skip, comments on any passage, and
copies those decisions back as text. They are proposals for the next step, not edits to the source.
