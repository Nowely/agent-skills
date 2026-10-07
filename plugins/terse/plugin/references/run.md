# The run directory

Each skill that makes a run uses this recipe. Keep the run outside the repository
that holds the text unless the user explicitly chooses otherwise. Set the local `RUN_ROOT` to empty for
the runtime's temporary root, or to an absolute durable directory only when the user supplies
one. Temporary storage may be purged by the operating system, so a run needed later requires that choice
or a copy to durable storage. A durable directory and its cleanup belong to the user.

`<slug>` is a single filename naming the text; a `rethink` slug ends in `-rethink`.

```bash
RUN_ROOT=""
RUN=$(node --input-type=module - "$RUN_ROOT" "<slug>" <<'NODE'
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
const [suppliedRoot, slug] = process.argv.slice(2);
const root = path.resolve(suppliedRoot || tmpdir());
mkdirSync(root, { recursive: true });
const run = path.join(root, `terse-${randomUUID()}-${slug}`);
mkdirSync(run);
console.log(run);
NODE
) && printf '%s\n' "$RUN"
```

The recipe sets local `RUN` to the printed absolute path; pass it in later commands and agent briefs. Keep the owner's words in
`purpose.md`; name the path to the user and in the run's files. The next skill receives a path from the
user and cannot guess it. An audit's report may go into the repository only in the folder the user
settles; every path in that report is relative to the repository. Running code in full mode still uses
a disposable copy under the runtime's temporary root, even when the report directory is durable.
