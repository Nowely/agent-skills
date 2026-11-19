# What v6 changes and how to test it

## Proposed intervention

V6 condenses v5's workflow around a decision the worker has to make before implementing: **what is the smallest public surface on which the user could tell that this design decision is wrong?** If meaning or action depends on neighboring content, include that content in the check. When a fix affects a shared layout, replay the failure and the nearest previous success together. V6 retains the working-journey, data-contract, clarification, browser-profile, built-package and readiness guidance. The [full text](drafts/08-v6-reviewed.md) and its [tested predecessor](drafts/06-v5-tested.md) make the change inspectable.

The intervention is motivated by two observations. The early full submission acknowledged distinct rendering paths but treated a shared-library build and source-story checks as sufficient for handoff. Later, the mixed-list issue needed multiple repairs because a test could see either the ordinary item or the demanding one without seeing their shared meaning. Neither observation proves that the proposed instruction changes an agent's behavior. The final correction was made after the defect was explained.

V6 is suitable for a shared responsive feature that has different states, hosts or input methods. For a one-line cosmetic change, the likely value of a multi-stage workflow is small. For independently varying controls inside a shared surface, the cost of the wrong choice is easier to identify. A builder can often use a pre-existing public story and a stateful fixture. A second model should have a bounded question and a plausible chance of preventing material work before it is assigned.

## Cheap formative check before another full build

Use saved submissions only where a neutral presentation of them is authorized. Provide the ordinary product intent and an anonymized interactive entry or capture set, labeled without dates, filenames that reveal outcomes, ruler overlays or instructions to look for a particular issue. Include multiple accepted variants, a meaningful defect and a legitimate difference that should pass. Keep the mapping and ground truth with the judge. Randomize identity and order. The written brief should not promise that exactly one item fails.

Give fresh workers comparable models, effort, permissions, access and a predeclared short budget. One receives tested v5, the other receives v6. Ask for readiness decisions and minimal reproduction evidence. Grade whether the worker can locate a **user-visible** violation and explain its consequence, whether it incorrectly rejects a valid variant, and its time to a defensible decision. A correct guess without an observation does not pass that check. An equivalent design can pass without sharing the reference's DOM or exact pixel coordinates.

Keep false acceptance, false rejection, useful extra findings and unverified observations separate. If v6 merely names more possible problems, misses the decisive relationship or rejects an acceptable layout at comparable cost, do not advance it on that evidence. A gain on a previously used case is evidence about this diagnostic, not an independent replication or time saved on implementation.

## Prospective delivery comparison

If the cheap check warrants another implementation run, capture a different real task before drafting the scoring answers. Prefer an existing public interface, an available live precedent, differing valid states and genuine remaining work past the first slice. Keep the original user requirements. Do not select a case solely because it reproduces a known defect from the card study.

1. Freeze the authentic brief, approved-reference inputs, starting source, runtime version, consumer fixture and acceptable product decisions. Preflight the final tests on a functioning control and a discriminating counterexample. Prove that the required behavior is observable through the public entry.
2. Freeze a rubric based on the user's outcome. Include matched design/data states, a user action to completion, observable side effects, unaffected consumer contracts and the deliverable boundary. Distinguish owner decisions, legitimate limitations, nonblocking visual differences and material failures.
3. Give a genuine baseline and the candidate equal access to normal tooling and independently prepared working copies. Balance order or keep the judging independent when feasible. State the intended intervention, numeric budget, cap on returns and stop rule before either worker sees the case. Keep the actual judge probes private.
4. Freeze each submission when the author says it is ready. Return all reproduced material symptoms in one batch, without the implementation answer. Keep first-submission evidence distinct from repaired output. Record the time spent by the author, any observer and the judge, infrastructure, waiting and unmeasured coordination.
5. Compare first-submission material failures, returns through the agreed threshold, total active role time and regressions introduced by repairs. Inspect the trace to see whether the worker really ran the decisive test before handoff. A faster writer who shifts substantial work to the judge has not demonstrated lower delivery cost.

One worker per arm can screen an idea. It does not establish a twofold speedup, a stable ranking or broad deployment readiness. Stop and keep the simpler workflow when there is no attributable benefit. These are proposed studies for future work inside Entrust. No v6 behavioral result, installed-host trial or external-skill benchmark is claimed in this PR.
