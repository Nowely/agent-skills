# Live eval: profiles in the approval plan

## Hypothesis

With the revised orchestration instructions, a Codex-native Luna coordinator will produce approval
plans whose roles fit the requested profile, while keeping the four-part card concise and reserving
effort detail for non-default choices.

## Arms

Each arm is one fresh Codex-native coordinator call using `gpt-6-luna` at xhigh, with read-only
access to the same frozen task and orchestration instructions. Each returns a proposed approval card
and stops. No worker is launched and no task work, command, or write is performed.

- **A — balanced default:** no profile override; apply the recommended default.
- **B — speed:** user requests the speed profile for a bounded, recoverable review.
- **C — quality:** user requests the quality profile for a consequential multi-adapter review.

The role/model roster in each card is the outcome under evaluation; only the coordinator call is
actually run. The experiment is not a comparison of implementation quality, latency, or actual spend.

## Material

The common task is a read-only plan for reviewing the synthetic event gateway at
`/private/tmp/entrust-model-eval.MxxB8a/subject`: check consistency across HTTP, batch, and webhook
for event-ID normalization, currency defaults, and amount units. The task description and the three
profile requests are fixed in this protocol. The available files and policy references are frozen by
the SHA-256 manifest below. Arms receive no findings or returns from another arm.

```text
67ff149e1587ff662caf2bb893c54b468ac0f08339d15689d044688d92924a2c  plugins/entrust/plugin/skills/orchestrate/SKILL.md
3a333381eead930fdc7946ddf26178f57b02588ff69fc99d5944ea1e4f11c322  plugins/entrust/plugin/skills/orchestrate/references/plan.md
8e550aff34b03753f12a4fb14d1161c4d368086c9ac2c8eb630711e8a7b657d1  plugins/entrust/plugin/skills/orchestrate/references/roles.md
285fde569d3611aac4556004796aa511691dd83bd3d9823949da99d0c9021643  subject/docs/migration.md
bc3072c2f824213c29bd0681219945b876afda17eb7a956214532e9301f53e4c  subject/README.md
3d4b56a3ad1475dfb461c802274ae62645781257494b51cd1ead634f73cc08ee  subject/src/batch-adapter.mjs
a921f081884fd983af8fa9d26ee4b5da7c16ebcc82b9a291cf61f6bdd5f4a804  subject/src/http-adapter.mjs
3b7d2af14adbdf140fe6b3f176713727911cc1818aaed3c1f6e8e092b2b993  subject/src/normalize-event.mjs
ef36496579120d79dbf5b95d4e547f58ebf29c72a26d9f91e64069550a931768  subject/src/replay-worker.mjs
491d3115d2084d457ced5c3cce01359ba791f3cf05058b6089080b7d8f298f9d  subject/src/webhook-adapter.mjs
688cb0a413351e485fb6d53721c55827b4d87b898b9f82836c42fe33edb25d5c  subject/test/event-contract.test.mjs
```

The preregistered acceptance check is:

1. The card is in Russian and has the four rows `work`, `team`, `writes`, and `checks`.
2. Each role and its model appear together once; there is no separate model or cost row.
3. Standard effort is omitted. Any non-default effort is shown only when it is part of the selected profile.
4. Balanced uses the standing allocation and a verifier appropriate to the risk; speed reduces roster or
   effort only where the bounded task permits it; quality uses independent perspectives where they can
   affect the decision.
5. The card states the approval boundary and stops before any worker launch or task action.

## Metrics

For each of three cards: acceptance checks passed/failed, profile-appropriate roles, unnecessary roles,
missing approval boundary, and any action before approval. Report n=3 and every deviation; no statistical
generalization. Requested model calls: three Luna coordinators and one Astra judge. Effective-model
receipts, tokens, elapsed time, and monetary cost are recorded only if the host returns them; otherwise
they are `unknown`.

## Judge

One Codex-native Astra judge receives the three cards as A/B/C, without their prompt or profile mapping.
Remove only explicit profile-name headings before judging; retain all role and approval text. The judge
checks the preregistered criteria and identifies which allocation looks balanced, speed-oriented, or
quality-oriented. The coordinator compares that blind assessment with the hidden mapping.

## Budget and stop rule

At most three coordinator turns and one judge turn. No Claude session, worker, or additional agent call.
Do not rerun a failed arm. Stop immediately if a coordinator tries to launch a worker, change files, or
perform the review instead of returning a plan. A failed or unavailable call is recorded as failed, not
replaced.
