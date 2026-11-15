# Design standard

What this review counts as clean structure, and how it compares two solutions. Read it for every review, before
step 2 of the procedure. Every principle is shown the same way: by a change. Take a rule or requirement of the
task as the one that changes, and name the places you would edit and the code you would have to read to make
that change safely, today and in the target. A structural finding rests on one principle and one such scenario;
without the scenario it is an idea.

The principles are not new. Where the literature disagrees, this page takes a side and says which.

## The measure

Structure is worse when a change touches more places that must agree, needs more code read to be sure nothing
else breaks, or hides something the person changing it needed to know: Ousterhout's three symptoms of
complexity, change amplification, cognitive load and unknown unknowns. Smallest means the result: fewest
concepts, one owner per rule, fewest places a likely change touches. It does not mean the smallest diff. Length
and the number of functions or files are what a structure costs, weighed against what it buys on this scale.

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
5. **A boundary hides a decision.** A unit earns its place when a likely change is made inside it and its
   callers do not change (Parnas; Ousterhout's deep modules). Shown by: the scenario that motivated the unit
   still edits its callers, or the unit only forwards or renames one or two obvious lines. Side taken: deep
   modules over small functions. A function per rule is not a goal. When non-trivial calculations obscure the
   precedence of several rules, prefer a short coordinator that reads as the rules in the order they win, with
   each such calculation named; a rule whose body reads at a glance stays inline.
6. **Interfaces do not expose internals.** Shown by: a caller interprets another unit's partial flags or
   intermediate values, so a change inside the callee edits the caller; or a unit changes an argument or shared object its caller does not expect it to touch.
7. **Phases own their knowledge.** Splitting work by the order it runs (read, parse, decide, write) is sound when
   each phase reads only the previous one's result. Shown by: two phases must agree on a format or decision, so
   one scenario edits both (temporal decomposition).
8. **Fewest concepts.** Every mechanism, option, layer and piece of state has a requirement that existing code,
   inputs or contracts cannot meet (Beck: fewest elements). Shown by: something already in hand meets it.
9. **No speculative generality.** No option, mode parameter, registry, configuration or interface without a
   second variation the task or code actually has. Shown by: one caller, one value, one implementation.
10. **Trust the contract; check at the boundary.** A guard, fallback or conversion is a claim about the data,
    checked where the data comes from: noise inside a boundary that guarantees it, required at an untrusted
    one. Where possible, define the error out of existence instead of handling it.
11. **Dependencies point one way.** No cycles; a lower layer does not know a higher one; a caller does not
    depend on a callee's internals; a forwarding layer adds a concept and hides nothing. Compare with the
    project's closest precedent.
12. **Names say what, not how.** A name that is hard to pick, or needs "and", points at a unit with two jobs.

## Scenarios

Write them before the target, so they cannot be chosen to suit it. Derive two or three from the requirements and
from the rules of each unit that decides: a limit that varies, a rule added before or after another, a rule
removed, a second entry point, an input from a new source. Include at least one the current code already takes
in one place: it checks that the target does not make that worse. Record each in `scenarios` with the places to
edit and the code to read today, then the same for the target once it is sketched.

## Comparing two solutions

Compare the change with the target, or two candidate targets, in this order:

1. **Behavior is the entry condition.** Walk every requirement and rule through both. A solution that drops one
   does not compete.
2. **Fewer scenarios that edit several places that must agree.**
3. **At equal edits, less to read** to make each scenario safely.
4. **At equal reading, fewer concepts**, each with a requirement behind it.
5. **Only then, size.**

A boundary in the target earns its place only when omitting it makes a named scenario edit more places or read
more code; otherwise drop it from the target. If the target improves no scenario, the current structure stays,
with its reason.

## A structural finding

- Cites the principle and the scenario, with fewer places to edit or read in the target than today.
- Still stands if every behavior finding were fixed in place. If those fixes would remove the cost, it belongs to
  them.
- Is labelled `judgment`: the scenario is a reasoned walk through the code, not a run.
- Says in its fix which scenario stays non-local without the structural part, so an implementer who keeps to
  the smallest diff sees why the part is required.
