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
The finding names what must be read together today and what no longer must be afterwards. The same shape
proposed for code where nothing is shared between the rules would be a preference, and an idea at most.

## Ordered rules that stay together

`shippingQuote(parcel, route)` returns the first refusal that applies, then a price: the route is closed; the
parcel is over the route's weight limit, which is lower for air; a fragile parcel on a route with a transfer;
otherwise the rate times the weight. Each rule is a guard with an early return, reads only the two arguments,
and sets nothing a later rule reads. The air limit is one conditional expression inside its guard.

Nothing here must be read together: a rule is changed by editing its own guard, and the order of the guards
is the precedence. A function per rule and a coordinator that calls them in the same order would restate the
function with more names to follow. The verdict is `keep`, with one line saying why. A small calculation
inside a guard is not by itself a calculation that obscures the order.

## A split that adds no useful boundary

A local decision `attempts < limit && isTransient(error)` is already easy to follow and reuses the existing
classification utility. Extracting wrappers named `hasAttemptsLeft` and `hasRetryableError` merely moves the
two obvious conditions. It adds navigation without isolating a meaningful calculation or hiding coordination.
Keep the decision local unless the actual contracts or callers demonstrate a benefit from another boundary.
