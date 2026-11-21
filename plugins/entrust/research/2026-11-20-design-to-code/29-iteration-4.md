# Iteration 4: the price as one group, values the contract leaves open, and fewer strict rules

[Iteration 3](28-iteration-3.md) cut the cost by four to five times, but draft 26.1's submission was returned for
the price split from its period, a break the page itself had allowed. Fable read the result before anything was
built.

## What changed: draft 27

- **A value and its period are one group.** A break on either side of "/" ("₽ /" | "месяц", "₽" | "/ месяц") is a
  finding while the component could hold the whole group on one line; the finding gives the group's width against the
  component's. Only a group wider than the component itself may break before its "/": the last resort, a warning for
  the owner. The page: `nowrap` on the whole group, not on its parts, and its block takes the group's width; a fixed
  or maximum width around content that grows is a construct, as a fixed height is.
- **The "may split" forecast sees a break between elements,** as between a `nowrap` amount and a `nowrap` period
  inside a block that wraps.
- **Values the contract leaves open:** the dense story takes a value that does not fit its line at the narrowest
  width, so the fallback shows, and the builder asks the owner for the bound. The evidence file lists each story's
  longest texts.
- **The kit's type token** may be proposed as `system` for a text wider than the font explains, in one entry with no
  frame, giving its measured size against the drawn one.
- **The five-distance relation rule is gone:** it never caught a real return and ended a run at `fail`. A gap that
  closes until two pieces nearly touch stays a finding.
- **The pages agree:** the review pass names the same price classes and the kit's token as the builder page.

## Replay before any model run

- **Draft 26.1's frozen submission, with the judge's long price ("1 234 567 890,00 ₽"):** the split is named at
  280–284, 404–524 and 636–724 px, with the group's 215 px against the component's 692. On the builder's own data it is
  named too: its dense price at 404–460 px and its short plain price at 500–604.
- **The positive control:** silent from 280 px up. Its only finding is "₽ /" | "месяц" at 240–252 px, below the
  contract's narrowest width, which it swept from.

## The run: written down before it starts

One Sonnet run of draft 27 on the server card, the same case and brief, no review pass. Judged by judge v2 and a blind
review against the control (the same prompt), key revealed after the verdicts. Draft 27 does what it was made for if
all four hold:

- accepted by the blind review;
- fewer than about 30 check rounds;
- fewer than about 10 ledger entries;
- the evidence file ends at `pass` or `pending`, the states the page allows a handover in.
