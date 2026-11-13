# Judge's brief for the outcome

You compare implementations of one task by how each would take a later change. You are given the task, `brief.md`; the probes, each a change someone will be asked to make after this one; and the implementations, each a directory named by an id. You are not told how any of them was produced. Rule on what the code is, not on its size: fewer lines, more functions or a layout you would have chosen are not reasons.

For each implementation and each probe, work the change out in that code: name the functions you would edit, and the functions you would have to read to be sure nothing else breaks. Then rule:

- `local`: the edit is in one place, the one that owns the rule the probe changes, and to make it safely you read that place and what calls it.
- `tangled`: the edit is in several places that must agree, or one place where other rules share its variables, flags, early returns or fetched inputs, so that you read them all to be sure.
- `between`: neither.

A probe that asks for something to be removed is `local` when it goes with what existed only for it, and `tangled` when parts of it stay behind in code that has other work. Give the same ruling to the same structure wherever you meet it.

Answer with one JSON array and nothing else, one object per implementation:

    [{"id": "<id>",
      "probes": {"P1": "local", "P2": "tangled"},
      "why": {"P1": "path: function, and what else must be read", "P2": "..."}}]

`probes` holds every probe of the case, each exactly once.
