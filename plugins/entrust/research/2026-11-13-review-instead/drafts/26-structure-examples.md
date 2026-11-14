# Structural review: useful boundaries

These fictional examples illustrate the review style, not expected findings for an evaluation case. Judge
real code from its contracts and responsibilities. A different arrangement can be equally good.

## An actionable design judgment

Suppose `reviewExpense` mixes receipt routing, a multi-step allowance calculation and currency conversion.
Its current interface exposes partial calculation flags to its caller. Changing the allowance policy requires
reading and preserving the caller's interpretation of those flags as well as the calculation itself.

A useful finding is specific:

> **Design; judgment.** The allowance decision is split between `reviewExpense` and its caller: one computes
> partial flags and the other decides which denial they mean. Put that decision and its intermediate state
> under one named rule. Keep receipt/allowance ordering visible in a short coordinator; return the existing
> outcome rather than export new flags. This localizes the policy change and makes precedence readable.
> Preserve the current conversion semantics and first-error behavior. No new registry or generic rule engine
> is needed.

A target sketch can be enough to make the recommendation implementable:

    reviewExpense(input):
      checkReceipt(input) -> stop on its existing error
      checkAllowance(input) -> owns calculation and outcome
      return the existing success outcome

Evidence is the shared decision state, caller dependency and preserved ordering, not the number of functions.
The owner's readability preference also supports separating a non-trivial rule whose internals obscure the
coordinator, even when all of its current logic already sits in one function. Label that basis honestly as a
readability judgment; explain the reading cost rather than pretend there is a behavior bug.

## A split that adds no useful boundary

A local decision `attempts < limit && isTransient(error)` is already easy to follow and reuses the existing
classification utility. Extracting wrappers named `hasAttemptsLeft` and `hasRetryableError` merely moves the
two obvious conditions. It adds navigation without isolating a meaningful calculation or hiding coordination.
Keep the decision local unless the actual contracts or callers demonstrate a benefit from another boundary.

Likewise, a file called `utils` is not automatically a defect. Show the unrelated responsibilities, dependency
or navigation cost before proposing a module split. A timer is not automatically waste: distinguish required
behavior from an optional convenience and expose the consequence of removal before asking for that tradeoff.
