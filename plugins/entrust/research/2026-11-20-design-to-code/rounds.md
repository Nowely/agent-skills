# Rounds

| Round | Text | What ran | Result |
|---|---|---|---|
| 0 | [drafts/01-v1.md](drafts/01-v1.md) | the tooling, no model | 15 tests; the planted defects found |
| 1 | [drafts/02-v2.md](drafts/02-v2.md) | an independent critic and a verifier on round 0, then the tooling again | each of the critic's 8 findings changed the check or the pages, one suggestion declined; each of the verifier's 16 corrections applied, some reworded; 25 tests |
| 2 | [drafts/03-v3.md](drafts/03-v3.md) | real design input, browser regressions, and an independent mixed-list check | self-comparison false positives repaired; the alignment gate did not pass on both controls, so no model comparison was run. [Details](03-calibration.md) |
| 3 | [drafts/04-v4.md](drafts/04-v4.md) | fixes for the defects round 2 and its review left, the owner's decisions on them, then a critic and a verifier | below |
| 4 | [drafts/05-v5.md](drafts/05-v5.md) | the corrections round 3's critic and verifier found | below; no model run |
| 5 | [drafts/06-v6.md](drafts/06-v6.md) | the owner's real-frame calibration with a blind review, and image-only references | the column defect found by checker and reviewer alike; one control 1.02 px over the tolerance, unresolved; the gate stays open. [Details](05-calibration-followup.md) |
| 6 | [drafts/07-v7.md](drafts/07-v7.md) | E143, image-only text and missing fonts made simpler, the summary-first rule back, then a critic and a verifier; the pair protocol | below; no model run. [Protocol](06-pair-protocol.md) |
| 7 | [drafts/08-v8.md](drafts/08-v8.md) | the corrections round 6's critic and verifier found; the pair protocol's second version | below; no model run. [Protocol](07-pair-protocol.md) |

The drafts are byte-identical copies of the skill page; their relative links resolve from the skill's directory.

## Round 0: the tooling

`node plugins/entrust/evals/design-to-code.test.mjs`: 15 cases, 15 passed, about 23 s on one Linux container with
Chromium. Planted on the offer card, one at a time: badges 6 px lower (in all three frames "start here" between the
SKU and "New", +6 px, the rows below inherited); the price at 20 px instead of 22 (at 720 a `font` and a `width`
finding with no position moved; at 480 and 320 the old price beside it also moved 6.7 px); a bottom padding of 28
(a root height difference, passing when accepted and pending when proposed); two fixed 150 px columns below 420 (the
sweep's root overflow from 280 up). The reference against itself: 0 % differing pixels.

## Round 1: a critic and a verifier

Two agents of the coordinator's model read round 0 without its author's conclusions. The critic judged the skill
against the owner's goal and ran its own variants of the offer card; the verifier checked every claim of the pages
against the code, the images and the sources. Their reports are summarized here; the scratch files they made were
not kept.

| Critic's finding (verified by running unless marked) | Change |
|---|---|
| A smaller image, a wrong badge colour and a wrong button colour pass: the check sees only text | The pixel comparison now finds the areas outside text that differ and reports each with its box (`region`); an area that matches once shifted by a nearby text's offset belongs to that text. Text colour joins the font check |
| The ledger excuses findings, not causes: the kit's 3 px shorter badge, accepted, still leaves every row below it failing; and one `proposed` entry with `*` turned 98 failures into pending | An entry excuses a cause and what it carries down or along, and the root's height; only an accepted entry may use `*`; `landmark` may be a list. Gaps no frame shows stay in `review.md`, not the ledger. The page says to use a kit component and record its difference as `system`, never restyle it |
| "Start here" misleads: a narrower root is blamed on the right-aligned price; a Figma text box taller than its line invents a cause below it, and the agent loops | The root's size is the first cause and is listed first. A horizontal position is read from whichever root edge it moved least from. An offset below is carried from the neighbour's top or bottom, whichever explains more |
| Text is not found when markup splits it (`1 499<span>€</span>`) or CSS changes its case | Texts are matched without spaces and case |
| Building the pack through MCP means retyping tool answers as output tokens, and an image the model receives may not reach the disk (reasoned) | `design.mjs figma` reads a frame from Figma's REST API with a token: the spec with fonts and the 2× image, no model tokens. The page says to save what a tool writes itself and retype only for a handoff |
| The protocol measures access to the judge, not the skill: the skill arm gets the judge's own spec; no arm can be pushed, so pushes are not measured (from the code) | The skill arm's spec drops exact text widths, as Figma's would; both arms get the same scripted push, up to three; tier 1 is a gate with the misses it must see; a private case's judge is set up by hand |
| A layout that changes at 500 instead of 640 passes | The sweep reports the widths where the layout changes and, given `switches`, fails a change elsewhere |
| No cap on rounds (reasoned) | Each round's diff is saved; the summary names the best round; the page says to stop after three rounds without a lower score |
| Overbuilt: `--boxes` (it crashed the check), `pixelLimit`, a separate `sweep` command, the `rejected` status, a gallery overwritten by a one-frame check | Removed; the gallery is written only by a check of every frame and now shows the sweep and the ledger |

Kept against the critic: the pack's other files (context, Code Connect, variables) are the implementer's reading,
not the check's; the page now only advises against retyping them.

The verifier found the pages' code claims holding, and these wrong: `result.json` does not hold every landmark's
offsets; "start here" can also start at a root edge; the sweep samples every `step` px, not every width; the
seat limits were unsourced; 1.4.11 was missing beside the 3:1 contrast; tier 0 planted no column gap; the 280 px
bottom spacing is 22 → 38 (+16), not 21; in the owner's final card the availability line is 1 px off, not 4, and its
badge is 18 px high in both, not 15 (the first reading had mixed badge and text in one band); the "New" badge's
text is not darker; RubSE does not prescribe keeping the best round and 1D-Bench uses execution feedback, not a
difference image; the context of the case omitted three colours and said every arm gets a spec. Each is corrected
in its page.

`node plugins/entrust/evals/design-to-code.test.mjs`: 25 cases, 25 passed, about 45 s.

## Independent recommendations

After the round 2 calibration, one independent advisor inspected the report and relevant code. The advisor found a bounded-exception aggregation defect and documented concrete successes, limits and [ideas for the next version](04-recommendations.md). No model implementation comparison was run.

## Round 3: what round 2 left

The coordinator re-ran round 2's findings before changing anything. Reproduced: a scorer that stopped at a check
missing one reference image instead of recording it as incomplete; an accepted entry with `max: 1.02` excusing an
8 px alignment spread at another width, because sweep findings had no size and widths were grouped before the ledger
was applied; a frame awaiting one decision summarized as "fail, 0 findings". Measured: Chromium paints boxes laid
out at 11.015625 px and at 10.5 px at 11 px, at 1× and 2×, so the 1.015625 px spread of round 2's control B is 1 px on
screen.

The owner decided: no copies of the work per round (the project's commits cover the worst case; the work moves
forward), a stop to adjusting after two or three rounds without progress, followed by sorting what remains into
fix, record or ask, since pixel-perfect is not the goal where a design missed a case or a kit component differs;
texts for MCP specs joined from the design context by node id and checked against the frame's screenshot.

Changes: sweep findings carry their size and are classified per width; alignment is read on painted pixels against
the configured tolerance, and a group matching fewer than two elements is reported as not measured (exit 2);
`score.mjs` records an incomplete check; the summary says a frame awaits a decision; `spec --context` joins the
design context's texts by `data-node-id`; the round diffs are gone and `history.jsonl` keeps each round's score,
read by the summary as the round before and the lowest. The join was tested on code written like the design
context, not yet on the owner's real answer.

### Round 3's critic and verifier

Two fresh agents of the coordinator's model read round 3 at `fc4f516`: a critic against the owner's goal and the
calibration gate, and a verifier of every claim. Their reports are summarized; the round 3 text above stays as it
was written, and these are its corrections.

- **The alignment rule was wrong for text.** Round 3 rounded each edge to a whole pixel because boxes paint that
  way. The critic showed text paints at subpixel positions: on the offer card, a true 1.99 px spread passed and a
  1.01 px spread failed, depending only on where the edges fell within a pixel. The verifier showed a composited
  ancestor can paint a box 1 px from its rounded edge, and that "control B's 1.015625 px spread is 1 px on screen"
  does not follow from a synthetic box: two edges 1.015625 px apart can paint 1 or 2 px apart. The round 3 claim
  about control B is withdrawn. It also changed the measurement after seeing one control, which
  [04-recommendations.md](04-recommendations.md) warned against.
- **"Not measured" blocked layouts that hide a column on narrow screens**: a group short of two elements at some
  widths made the whole check incomplete for good, and the ledger could not excuse it.
- **The context join could give a wrong text silently**: `{count} cores` became "cores", a template literal "$ GB",
  some entities stayed raw, and a deeply nested attribute broke the parse.
- **`max` did not bound findings without a size** (overlap, clipped, resize, switch): an overlap of 40 × 12 px passed
  under `max: 1`. Only overflow, outside and alignment had gained a size; "sweep findings carry their size" was
  partly true.
- **The stop rule left the implementer guessing** ("two or three" rounds, lower than what, where each kind of
  remainder goes), and a round that only turned failures into proposals lowered the score.
- **Pages contradicted the owner or the code**: the description and the README row promised "pixel for pixel";
  exit-code precedence was unstated; the changelog said texts "are checked against the frame's screenshot", which
  no code does; `protocol.md` and the research README still named the removed round copies; `design.mjs` kept an
  unused import. Round 2's [03-calibration.md](03-calibration.md) and [04-recommendations.md](04-recommendations.md)
  describe the Git snapshots of their time; round 3 removed them.

## Round 4: the corrections

Alignment compares the spread as laid out with the configured tolerance, without rounding: 1.015625 px fails a
tolerance of 1 and passes one of 1.5. Which tolerance is right is the owner's decision, to be taken from evidence
and frozen before the next control run, as 04-recommendations.md proposes. A group that never has two elements is
not measured; one short at some widths is reported and aligned where it has two. The context parser takes only
what the code states and leaves a layer with an expression, an unknown entity or unparsed code without text, to be
read from the image. A `max` covers only a difference with a size; overlap, clipped and resize findings now carry
one. The score counts open proposals with failures. The stop rule says two rounds without a new lowest, commit at
each new lowest, and where each kind of remainder goes. The pages say "every remaining difference explained"
instead of "pixel for pixel", and state the exit-code order. `node plugins/entrust/evals/design-to-code.test.mjs`:
34 cases, 34 passed.

The critic's conclusion stands: tool changes alone do not move the gate. It needs the owner's real frame through
`spec --context`, the screenshot check of its texts, an answer key made before seeing the check's output, and the
alignment tolerance frozen beforehand.

### Round 4's verifier

A fresh verifier checked round 4 at `6194df5` by running each claim. Holding: sizes and `max`, the score with open
proposals, the pages against the code, the draft and the test counts. Partly holding, and corrected at once:
- two alignment groups on one selector (its left and right edges) that never had two elements passed, since widths
  were counted per entry; a group is now one selector and edge, counted once per width;
- the context parser was silently wrong in three ways: commented-out JSX after the component overrode a real text,
  a JS escape (`{"14\" screen"}`) was kept raw, and entities were decoded inside JS strings; it also threw on
  `&#99999999;`. Code outside JSX is now skipped as code, an id seen twice and a literal with an escape give no text,
  literals are taken as written, an undecodable entity gives no text, and an id inside another attribute's value is
  ignored;
- the spread was rounded to 0.01 px before the comparison (1.004 px passed a tolerance of 1); it is compared
  unrounded and rounded only for display;
- the script's header did not state the exit-code order.

Not changed: code the parser cannot read (TypeScript generics, fragments, `<br>` without a slash) gives every layer
as missing, which is loud and sends the implementer to the image. 34 tests pass.

## Round 5: the owner's real-frame calibration

Recorded in [05-calibration-followup.md](05-calibration-followup.md). A blind reviewer and the check both found the
known column shift (17–44 px) in the defective build at 601 and 624 px; control C passed; control A at 601 was 1.02 px
over the 1 px tolerance, which the reviewer saw as aligned: an unresolved boundary. Against the real 601 px frame all
three builds failed with 27–30 findings, with the design font missing in the stand, no ledger and a 1× export. The
owner's round also added image-only references and recorded E143.

## Round 6: simpler, after the owner's reminder

Reviewing round 5, the coordinator found three things to change before a pair uses the check, and the owner
reminded that the product is established, with its kit, components and fonts: no spaceship.

- **E143**: a ledger's `max` was held to the spread rounded for display. It is held to the measured one; tests take
  1.004 px against `max: 1` (fails) and 1.015625 px against `max: 1.019` (passes). Fixed in its own commit.
- **Image-only references.** Round 5 compared their text pixels too. On the public captures, the owner's accepted
  release against its design in that mode failed with 10 areas, real differences and smoothing mixed. Text is now
  left out of the pixels as in every other frame, and the frame is incomplete: the eye judges the text. A first draft
  of this round added two finding statuses for it; the owner's reminder removed them.
- **Missing fonts.** The stand of round 5 lacked the design font, and every text measure compared a fallback. A
  page whose text renders in none of the named families of its stack now makes the check incomplete until the font
  loads; a stack whose first family is absent but another named one is present is no fallback.
- **The summary-first rule is back** on the skill page: each round reads the text summary; images when it cannot
  explain a difference, for a screenshot-only reference, and before handoff. Round 5 had replaced it with "compare
  visually as well", which brought back the token cost of comparing images every round.
- The pair on the card task is registered in [06-pair-protocol.md](06-pair-protocol.md).

`node plugins/entrust/evals/design-to-code.test.mjs`: 36 cases, 36 passed.

### Round 6's critic and verifier

Two fresh agents of the coordinator's model read round 6 at `9e00715`: a critic against the owner's goal and the
reminder not to over-build, and a verifier of every claim.

- **The font rule did harm.** Round 6 made a missing font switch the whole check to incomplete. The critic loaded an
  icon font whose glyphs sit in the Private Use Area: availability was tested on a fixed Latin and Cyrillic sample, so
  the icon font counted as missing and a planted 6 px defect went unreported. A product font that failed to load
  behind `Arial` went unreported too, since a later named family rendered; its 17 px column offsets then showed as
  inherited with no place to start. The verifier found the same icon-font case and `BlinkMacSystemFont` counted as a
  font.
- **The E143 pattern remained in frame findings:** a root of 301.004 px passed `max: 1`, because frame deltas were
  rounded before the ledger saw them.
- **An offset caused by a neighbour's width had no place to start**: the texts it pushed were marked inherited and
  the neighbour's width, not compared for Figma specs, was named nowhere.
- **The pair protocol** shared history between worktrees, made the skill arm alone write its pack, scored only one
  arm on listing its differences, and fixed no primary measure, cap or run order.
- **Over-building**, by the critic's reading: the `tap` setup step (it always threw), `--before`, `overlay.png`, the
  undocumented `sweep.url` and `sweep.height`, and the skill page restating check.md's rules.
- **Wrong in the record**: "1.02 px over the tolerance" was 1.02 px apart, 0.02 px over it; the "10 areas" of the
  release in image-only mode is the report's cap of 10 (58–86 areas differ), and that run rendered the release as an
  image with no text, so it says nothing about text on a real page; the changelog still said image-only references
  compare text pixels; `06-pair-protocol.md` said "under the right heading".

## Round 7: the corrections

- **Fonts warn and never hide findings.** The first family each text's stack names is tried against that text's own
  characters, so an icon font that draws its glyphs is present and a product font that failed to load, or lacks a
  subset, is reported even with a fallback after it. The verdict follows the findings.
- **Sizes reach the ledger as measured**, in frames as in the sweep; only what a person reads is rounded.
- **A neighbour's change of size is a cause**: "start here: the width of “New” changes by +N px".
- **Removed**: the `tap` step, `--before` (delete `out/before/` instead), `overlay.png`, `sweep.url` and
  `sweep.height`, and the skill page's restatement of check.md. Kept against the critic: the design review of
  `review.md` (the owner asked for design and UX to be judged), the exit code for pending decisions, the `category`
  field, and both routes to a spec (MCP without a token is the owner's setup; the REST route is a candidate for
  removal if the pair does not use it).
- **The pair protocol's second version** is [07-pair-protocol.md](07-pair-protocol.md).

`node plugins/entrust/evals/design-to-code.test.mjs`: 38 cases, 38 passed.

### Round 7's verifier

A fresh verifier read round 7 at `77682ef`, built test fonts (a Latin-only regular and bold face, an icon font with
glyphs in the Private Use Area) and served them over HTTP. Holding: missing fonts warn without hiding findings; a
404 font behind fallbacks is reported; an icon font is not; frame sizes reach the ledger unrounded; a neighbour's
change of width or height is named, still excused by an accepted entry, without duplicates; the removed options are
gone; the protocol's Playwright setup works. Partly holding, and the ones that would have misled the skill arm in
every round of the pair:

- a font used only in its bold face was reported missing, since the test measured at the normal weight;
- a stack starting with a system family (Tailwind's default, `-apple-system, BlinkMacSystemFont, …`) reported its
  next named family, such as "Apple Color Emoji";
- a missing Cyrillic subset went unreported in any text with a space, digit or punctuation the font draws;
- check.md did not describe the size cause of "start here".

Corrected: the first family of a text's stack is tried only when it is not a system or generic family, in the
text's own style and weight, character by character, without emoji. On the verifier's fonts, rerun: bold-only, the
icon font and emoji are not reported; a Cyrillic phrase in the Latin-only font and the 404 font are. check.md
describes the size cause and the font rule. 38 tests pass.

## Round 8: what the first real submission missed

Inputs: the owner's b8eb852 (unmeasured content), the [third pair protocol](08-pair-protocol.md) and the
[first submission](09-first-submission.md), reviewed by two readers in parallel: a fresh Fable reviewer given the
code and the records without conclusions, and the coordinator, who reran each finding Fable marked reproduced.

**The owner's aim**, restated for this round: when the agent says done, the work is done in fact; the first
submission is the one to accept.

**What the first submission says.** 26 references were supplied and 4 became frames; the discount popover's image
was first opened after the return. `review.md` was written after implementation and six check rounds; the first
product write came four minutes in. The sweep ran on the ordinary story only, so the dense data's collisions never
reached it: a frameless `design.json` on a dense copy of the public card reported 19 text overlaps. An action laid
over a help icon was outside every check: an icon button covering a price gave no finding. Popup dismissal is
behaviour, outside the check, and nothing in the skill asked for it. The judge found all four issue classes in 4:38
with 3.4M input tokens against the worker's 42M; its strength was a prepared suite and a dense fixture.

**Defects in b8eb852, reproduced on HEAD and passing on 17499ed:**

- content that fades in was reported missing: `animation: none` left it at its starting opacity, and the new
  visibility test counts opacity;
- a text the design itself truncates with an ellipsis failed every round as `clipped`.

**Also reproduced:** rounds were compared across different specs (an emptied spec still printed "previous round"),
which is how 09's 3072 → 832 was read as progress; every page text missing from the spec was its own failure and
listed first, so nine extra texts pushed the real offset out of the summary; a `text` entry listing two landmarks
mapped both to one match.

**Changes:**

- *The skill.* Done means checked: the acceptance list is written before the first product edit and run before
  saying done, every line with its evidence: every supplied reference (a frame, or by eye with a reason), a dense
  story, every popup (open, move in, leave, closed; touch; keyboard), every action through a resize, and the owner's
  past returns from `.design/returns.md`, which each return extends. `review.md` gains how the parts relate across
  widths: what moves together, what lines up, what wraps, truncates or grows, where conditional actions go.
- *The check.* `sweep.stories` sweeps more pages the same way and pictures them at the frames' widths; `covered`
  reports a control with another element over its centre; a frame names its own `root` for a popover or sheet;
  rounds are compared only within the same specs and sweep, and after two rounds without a new lowest the summary
  says to stop; page text missing from the spec is one line and leaves the frame incomplete; animations end at once
  instead of not running; an ellipsis or line clamp is deliberate truncation.
- *Removed:* the migration of old `before/` names (nothing was released) and the 64-digit hash in directory names.

**Not taken:** two specialist reviewers and the one-versus-two-reviewer experiment, which cost three reviewer
windows for n = 1 and do not measure returns to the owner; full filesystem isolation of workers, since 09's leak was
a memory search (memory off and a clean agent home suffice; otherwise the run is marked non-blind). An independent
prober at handoff is held back as the next lever if a run with this edition still returns.

The page is frozen as [drafts/09-v9.md](drafts/09-v9.md). `node --test evals/design-to-code.test.mjs`: 50 passed.

### Round 8's critic and verifier

A fresh Fable critic read the page as an implementer would. Its findings:

- **"Done means checked" was prose that nothing enforced:**
  - an empty `sweep.stories` passed;
  - the acceptance list's "by eye in the gallery" let a reference skip its frame, with no picture in the gallery;
  - popup behaviour had no way to be shown rather than claimed.
- **`covered` gave false positives on common patterns:**
  - a hidden native checkbox in its label;
  - a floating label over its input;
  - an `aria-disabled` control;
  - a tab scrolled out of its strip.

  It missed partial covers and anything below 900 px.
- **The page said several things twice,** and two of them contradicted each other: asking before committing the
  pack against committing at each new lowest.

A verifier reran each claim against a frozen copy of 1608fcf. What held:

- fade-in;
- the stall count;
- the grouped page text;
- the ledger's text rule.

It also showed that every new test fails when its fix is undone. What held only in part, and other defects:

- **Deliberate truncation:** an ellipsis still produced sweep overlaps and "outside" findings, and an "ellipsis"
  that draws none excused a hard cut.
- **Stories:** a story with an absent root threw the main sweep away; a story's setup failure crashed the check.
- **Hidden roots:** a root present but hidden made a 30 s timeout and a crash.
- **`basis`** ignored the tolerance and the frames' settings.
- **Scripted animations** were not finished.
- **The pointer** rested at the top-left corner, hovering whatever was there.
- **`check.md`** still described the removed migration.

The suspected flaky test passed 10 of 10 alone and 16 of 16 in parallel. Its one failure most likely overlapped an
edit of the working tree.

## Round 9: evidence the check can give

- **Journeys** in `design.json` run steps and expect what follows (`visible`, `hidden`, `text`), by pointer, touch or
  keyboard. A popup that stays open is now a failing line in the report.
- **A check of every frame is incomplete** without `review.md`'s acceptance list, a frame for every
  `frames/<name>/reference.png`, or a dense story. Its "pass" is therefore evidence of the measured part of the
  list.
- **`covered`** tries five points with the window scrolled to the control. It no longer counts the control's own
  label, a disabled control, or a point a clipping box cuts away.
- **The page:** the "by eye" escape is gone; popups are journeys; the summary-first rule, the stop rule, the dense
  story and image-only guidance are each stated once; committing the product's code is told apart from the pack.
- **Also:** a story's file path keeps its query (`story.html?data=dense` had been encoded into the file name).
- **The [listing-card case](../../evals/design-to-code/cases/listing-card/README.md)** was added for short pairs.

## Round 10: the verifier's findings

- **Truncation:** drawn truncation is an ellipsis on one unwrapped line of a block, or a line clamp on a vertical
  `-webkit-box` (Chromium reports it as `flow-root`). Overlaps and "outside" are measured on what is painted inside
  every clipping box, which also settles visually hidden text and horizontal scrollers.
- **`covered`:** a wrapped inline link is tried on its first line. A transparent native control laid over a button
  (a file input) and a control in a disabled fieldset do not count.
- **The root:** the first visible match is measured; a root present but hidden leaves the frame incomplete instead
  of timing out.
- **Stories:** a story that cannot be swept is an acceptance gap; the rest of the sweep is kept.
- **Scores:** `basis` covers the tolerance, the page, each frame's settings, spec and image, and the sweep.
- **The page in the browser:** scripted animations are finished, and the pointer rests in the far corner.

`node --test evals/design-to-code.test.mjs`: 59 passed. The pilots on the new case are in
[10-sonnet-pilots.md](10-sonnet-pilots.md). The page is frozen as [drafts/10-v10.md](drafts/10-v10.md); round 10
changed the script and check.md, not the page.

### Rounds 9 and 10's verifier, and round 10b

A fresh verifier checked rounds 9 and 10 against a frozen copy of 6a762a1. It confirmed:

- the acceptance gaps;
- the story path query;
- 25 of 27 targeted mutations failing their tests.

What held only in part, and what round 10b changed:

- **A failing setup step ended the whole check with no report, after 30 s.** Now the frame is reported incomplete
  and the rest is checked. Every step on something that never appears fails in 5 s. An unknown step is an error in
  `design.json`. A `tap` in a frame's setup opens the page for touch.
- **Journeys looked at the first match, and `text` held on a hidden element.** Now `visible`, `hidden` and `text`
  see as a person does: any match with a size, not hidden, not transparent. They accept Playwright's selectors.
- **`covered`.** It no longer counts:
  - the page outside the component;
  - fixed and sticky bars;
  - a control the pointer ignores or a few-pixel screen-reader control (Bootstrap's `.btn-check`);
  - a badge on one corner, since a finding now needs the centre or two inner points.

  A parent's `::after` laid over a button now counts, as does a transparent file input spanning a drop zone. The
  exception for transparent native controls now holds only for one laid exactly over the control.
- **The root.** A transparent first match was pictured while the numbers came from the second. Now the root a
  person can see is marked once, and the picture and the numbers both come from it.
- **Scores.** Journeys are part of what a score is measured against. A sweep missing a story is not scored. "A new
  series" is said only when no earlier round was measured the same way.
- **The pointer** rests outside the page: the far corner hovered a card in a tall story.
- **Screen-reader text** is no longer a sweep `clipped`.
- **The acceptance list** must be a heading that names it, with rows or items under it; the word alone no longer
  passes.
- **The listing judge** now:
  - takes whatever `renderListing` put in `#host` as the root;
  - counts a text as shown only when a person could see it;
  - ignores regions of 4 px or less one way;
  - refuses an out directory inside the implementation.

  All four pilot arms were judged again, with the same verdicts.

`node --test evals/design-to-code.test.mjs`: 65 passed.

## Round 11: verification without a second agent

The owner set extra agents aside as a later mode, and asked for quality from one agent and the script. Round 11
moves what a critic and a verifier do into the implementer's own steps, and makes the script hold the parts that can
be held:

- **The evidence file.** A check of every frame writes `out/handoff.md`; the handoff quotes it, and any other claim
  names its evidence or goes under what was not checked.
- **Journeys must expect something.** One with no `visible`, `hidden` or `text` step is refused, since it could not
  fail.
- **The owner's read of `review.md`** before building, and a verification pass before handoff: pictures before
  numbers, every claim with its evidence, two tries the list did not name.

**Round 11's critic (Fable)** ran it and found:

- "pass" without a sweep, with `--no-sweep`, or with the frames' own page as the dense story;
- a journey that only opens counted as checking dismissal;
- the owner's questions and the look-first step remained paper;
- `handoff.md` hid excused findings, could go stale, and did not say whether a ledger entry matched anything;
- the page had grown to 150 lines.

The third pilot, on draft 11, was accepted and showed the same blank Result column
([10-sonnet-pilots.md](10-sonnet-pilots.md#a-third-run-with-draft-11)).

## Round 11b

**The check refuses "pass" when:**
- there is no sweep;
- a story is the frames' own page;
- a control that opens something (`aria-expanded`, `aria-haspopup`, `popovertarget`) has no journey.

**Partial checks.** `--no-sweep` is now partial, like `--frame`: it writes no `handoff.md` and removes an old one.

**`handoff.md`** is stamped with its time and commit. It adds:
- what the ledger excused;
- what each entry excused, or that it matched nothing, flagging wildcards;
- the acceptance rows, a blank result reading "not checked";
- the pictures to look at;
- journeys that check opening only;
- each first finding with its expected and actual values.

**The page** is cut from 150 to 120 lines:
- the owner's questions the script now answers are gone; the one the script cannot answer stays (what may never
  cover what);
- the look-first step asks for a sentence per listed picture;
- the two tries become journeys named `probe: …`;
- frames must render their own data.

`node --test evals/design-to-code.test.mjs`: 68 passed. The page before is
[drafts/11-v11.md](drafts/11-v11.md); after it, [drafts/12-v12.md](drafts/12-v12.md).

### Round 11b's verifier, and round 11c

A fresh verifier checked round 11b against a frozen copy of f18be28. It confirmed:

- `handoff.md` is written only by a complete check;
- the refusals hold on `<details>`, `<select>` and `aria-haspopup="false"`;
- 14 of 20 mutations fail their tests.

Where the evidence misled, and what round 11c changed:

- **Ledger use was credited by reason to the first entry,** so an entry that excused a finding read "matched nothing"
  and another with the same reason read "excuses 1". A proposed entry read "excuses". Each finding now records the
  entries that excused it, and a proposal reads "awaits your decision on N".
- **The acceptance result came from the last column,** a list was "no rows", and subheadings, Russian headings,
  `+` and `1)` items and code fences were mishandled. The list is now every line under its heading, subheadings
  included; the result comes from a column named Result, or after a colon in a list item.
- **`handoff.md` gaps:**
  - it listed pictures that did not exist;
  - it showed "no findings" despite ledger faults, unmeasured alignment, missing fonts or a missing reference;
  - it missed `["*"]` as a wildcard.

  All are now shown, and the pictures come first, before the numbers.
- **Partial checks.** `--frame` and `--no-sweep` said "pass" and rewrote the gallery. Now their verdict is said to
  be about what they measured, and they write no gallery. Every check removes an old `handoff.md` first, including
  one that stops on an unknown frame.
- **Impossible probes.** The page suggested a resize and the keyboard order as probes that journeys could not
  express. Journeys now have a `width` step and a `focused` expectation, and names must be unique. A `text` step
  needs a text. A `hidden` step on what never opened is noted.
- **Smaller fixes:**
  - the stamp says when the tree had uncommitted changes;
  - a story at any frame's own page is refused;
  - `aria-haspopup` of "False" or empty is not an opener;
  - option objects print as JSON.
- **The page:** step 5 now runs the probes, fills in the results, runs the complete check last, and only then looks
  at the pictures and writes "What I saw".

**Left as known limits, in check.md:**

- a story differing only in its query counts as its own (Storybook's stories do);
- one journey satisfies the opener rule;
- openers are looked for inside the component, in the frames.

`node --test evals/design-to-code.test.mjs`: 70 passed. The page is frozen as [drafts/13-v13.md](drafts/13-v13.md).
