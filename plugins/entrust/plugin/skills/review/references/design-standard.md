# Design standard

What this review counts as clean structure, and how it compares two solutions. A structural finding shows a
concrete burden in the code and why another arrangement removes it; a preference for another shape is an idea.

## The measure

A structure costs when one change of the task touches several places that must agree, needs unrelated code read to
make it safely, or hides something the person changing it needed to know (Ousterhout's change amplification,
cognitive load and unknown unknowns). Cleanest means the result: code that is easy to read and change, each rule owned
once, every concept earning its place. It does not mean the smallest diff or the fewest functions or files.

## Principles

Where the literature disagrees, the side this review takes is stated.

1. **One owner per rule.** Changing a rule edits several places that must stay in step (shotgun surgery). Look-alike
   code that serves different rules is not a copy; merging it couples what changes apart.
2. **One reason to change per unit.** Two unrelated changes edit the same body, each reading the other's state, or a
   mode parameter switches a unit between unrelated contracts. Rules in the order they win, each reading only its
   own inputs, are already apart, even in one function.
3. **Rules do not talk through shared state.** Moving or changing one rule changes another's outcome: precedence made
   by later assignments overwriting earlier ones, a flag one rule sets and another tests. Ordered guards with early
   returns are not this.
4. **Decisions apart from effects.** Changing a decision means reading or keeping the order of writes, requests,
   counters or timers around it, or testing it needs a fake store or clock. One effect after a short decision is fine.
5. **A boundary hides a decision.** A unit earns its place when a likely change is made inside it and its callers do
   not change (Parnas; Ousterhout's deep modules). One that only forwards or renames obvious lines adds a concept.
   Deep modules over small functions: when non-trivial calculations obscure the precedence of several rules, prefer
   a short coordinator that reads as the rules in the order they win, each such calculation named; a rule that reads
   at a glance stays inline.
6. **Interfaces hide internals.** A caller interprets another unit's partial flags or intermediate values, or a unit
   changes an argument or shared object its caller does not expect.
7. **Phases own their knowledge.** Splitting work into read, parse, decide and write is sound when each phase reads
   only the previous phase's result; two phases that must agree on a format or decision are one decision split apart.
8. **Fewest concepts.** Each mechanism, option, layer and piece of state is weighed against its benefit and against
   what existing code, inputs or contracts already provide.
9. **No speculative generality.** An option, mode, registry, configuration or interface needs a concrete need in
   the task or code; one caller alone is not a defect.
10. **Trust the contract; check at the boundary.** A guard, fallback or conversion is a claim about the data, checked
    where the data comes from: noise inside a boundary that guarantees it, required at an untrusted one.
11. **Dependencies point one way.** No cycles, no lower layer knowing a higher one, no caller depending on a callee's
    internals. Compare with the project's closest precedent.
12. **Names say what.** A name that is hard to pick, or needs "and", points at a unit with two jobs.

## Structure and target

Trace each mechanism's owner, inputs, effects and lifetime, and tell missing context from entanglement: overwritten
state, flags crossing rules, unrelated work needed to reach an outcome, a scattered rule, a caller reading another
unit's partial result. Difficulty tracing is a lead, not a finding.

Decide for each unit of the change whether to keep it, simplify it in place, separate its decisions from its effects,
consolidate, extract or remove, and record the `reason`, a kept unit included. Where the burden is not plain from the
code, walk a change grounded in the task or code through both arrangements, noting the places edited and the code
read; do not invent future requirements.

Then sketch the target before the detailed passes: its units, what each owns and reuses, and the mechanisms it needs.
It is provisional and does not inherit the change's premises. A target someone supplied is assessed the same way: kept where the evidence holds, revised where it does not, not rebuilt only because it was supplied. Trace every requirement and rule through it. Keep the
timing, failure, retry and no-input behavior that the task, an owner decision or a contract requires, citing it; a
required outcome does not by itself require the automatic way the change reaches it. For a mechanism whose need is
unproven, sketch the simplest alternative without it: what then triggers the required behavior, what is lost, what is
unknown. An unresolved tradeoff goes to the owner as a question. Where the change already has the right structure,
say so.

To compare two solutions, first both must keep the required behavior. Then compare what a maintainer must read and
change, how rules are owned, the dependencies, and the boundaries and coordination each adds. Counts of places are
signals, not a score: several small edits can need less understanding than one. Keep cohesive code when a split shows
no benefit.

A structural finding names the burden, its evidence and the arrangement that removes it; it still stands with every
behavior finding fixed in place, and it is labelled `judgment`.
