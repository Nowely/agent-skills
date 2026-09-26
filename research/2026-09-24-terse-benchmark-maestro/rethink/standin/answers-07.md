# Question set 07: the "±20%" in must-say 8

**Option 1, your default.** Drop "±20%". Keep the rest of must-say 8 and never-say 3, word for word:

- costs and token counts are estimates (~)
- costs are useful for trends, not for invoicing
- token counts are for the context budget, not for billing

**Reason.** The README describes what Maestro records. "±20%" is the price table's own comment, not how accurate the recorded figure is. I checked the lines:

- The only call to `estimateCost` passes no model (`maestro-extension/src/chat/participant.ts:314`; grep finds no other call site). So every `@maestro` run is priced at the default rate of $2 input and $8 output per million tokens (`packages/core/src/cost-estimator.ts:39`, `:66`).
- The input side counts only the context slice (`participant.ts:313`). The command's own text is sent (`:95-100`) but never counted.

Without the number, the rest of must-say 8 is still true.

**The pricing detail stays out of the README.** It is a code question in part 6: pass the model, count the whole input. I treated the reference-file gap the same way. The README should not describe a defect as if it were the product's design.

**I was wrong in set 01.** I put a code comment's figure into must-say 8 without checking the line that uses it.

I did not rerun the judge's per-model figures. The two code facts above are enough for this decision, and they are L2: an independent reader of those lines would say the same.
