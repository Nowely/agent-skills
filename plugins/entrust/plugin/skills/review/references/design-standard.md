# Design standard

What this review counts as clean structure, and how it compares two solutions. Read it for every review, before
step 2 of the procedure. Assess actual readability, rule ownership and dependencies. A structural finding
shows a concrete burden in the code and why the proposed arrangement improves it. When useful, walk a plausible
change grounded in the task or code through both arrangements; do not invent future requirements.

The principles are not new. Where the literature disagrees, this page takes a side and says which.

## The measure

Places that must agree, code that must be read safely, and hidden knowledge are diagnostic signals of
complexity: change amplification, cognitive load and unknown unknowns. Weigh the actual burden and benefits
of each arrangement; counts alone do not decide. Smallest means the result: comprehensible code, cohesive
ownership and justified concepts, not the smallest diff or the fewest functions, files or edit locations.

## Principles

1. **One owner per rule.** A rule of the task lives in one place every consumer uses. Shown by: changing the
   rule edits several places that must stay in step (Fowler's shotgun surgery). Not a violation: look-alike code
   serving different rules. Two copies of one rule are a defect; merging code that changes for different
   reasons couples what should move apart.
2. **One reason to change per unit.** Shown by: two unrelated scenarios edit the same body and each must read
   the other's state (divergent change), or a mode parameter switches one unit between unrelated contracts. Not a violation: several rules in one function, each a guard or step
   edited alone. Rules written in the order they win, each reading only its own inputs, are already apart.
3. **Rules do not talk through shared state.** Shown by: changing or moving one rule changes another's outcome;
   precedence produced by later assignments overwriting an earlier one; a flag one rule sets and another tests.
   Not a violation: ordered guards with early returns, where the order is the precedence.
4. **Decisions apart from effects.** What to do is decided apart from doing it: writes, requests, counters,
   timers. Shown by: changing a decision means reading or preserving the order of effects around it, or testing
   it needs a fake store or clock. Not a violation: one effect after a short decision.
5. **A boundary hides a decision.** A unit can earn its place when a likely change is made inside it and its
   callers do not change (Parnas; Ousterhout's deep modules). Consider whether the scenario that motivated the unit
   still edits its callers, or the unit only forwards or renames one or two obvious lines, alongside its benefits
   and costs. Side taken: deep modules over small functions. A function per rule is not a goal. When non-trivial
   calculations obscure the precedence of several rules, prefer a short coordinator that reads as the rules in
   the order they win, with each such calculation named; a rule whose body reads at a glance stays inline.
6. **Interfaces do not expose internals.** Shown by: a caller interprets another unit's partial flags or
   intermediate values, so a change inside the callee edits the caller; or a unit changes an argument or shared object its caller does not expect it to touch.
7. **Phases own their knowledge.** Splitting work by the order it runs (read, parse, decide, write) is sound when
   each phase reads only the previous one's result. Shown by: two phases must agree on a format or decision, so
   one scenario edits both (temporal decomposition).
8. **Fewest concepts.** Weigh each mechanism, option, layer and piece of state against its benefit and what
   existing code, inputs or contracts already provide (Beck: fewest elements).
9. **No speculative generality.** No option, mode parameter, registry, configuration or interface without a
   concrete need grounded in the task or code. One caller, value or implementation alone does not establish a defect.
10. **Trust the contract; check at the boundary.** A guard, fallback or conversion is a claim about the data,
    checked where the data comes from: noise inside a boundary that guarantees it, required at an untrusted
    one. Where possible, define the error out of existence instead of handling it.
11. **Dependencies point one way.** No cycles; a lower layer does not know a higher one; a caller does not
    depend on a callee's internals; a forwarding layer adds a concept and hides nothing. Compare with the
    project's closest precedent.
12. **Names say what, not how.** A name that is hard to pick, or needs "and", points at a unit with two jobs.

## Scenarios

When a concrete plausible change helps evaluate a design, derive it from the task or the code before sketching
the target. Record the places to edit and code to read today and in the target. Avoid inventing future needs;
a simple or already cohesive change may need no scenario.

## Comparing two solutions

Both solutions must preserve required behavior. Compare actual readability, ownership, dependencies and the
costs of changes supported by evidence. Consider the cost and benefit of boundaries, coordination and concepts
as well as code a maintainer must understand. Numbers of edit or read locations are diagnostics, not an ordered
score: for example, more small edits can require less code to understand. Keep cohesive code when a split has
no demonstrated benefit; do not introduce a helper merely to meet a shape preference.

## A structural finding

- Shows the concrete burden and why the proposed arrangement improves the tradeoff, with a grounded scenario
  when useful.
- Still stands if every behavior finding were fixed in place. If those fixes would remove the cost, it belongs to
  them.
- Is labelled `judgment`: the assessment is reasoned from the code, not a run.
- Explains the burden that remains without the structural part.
