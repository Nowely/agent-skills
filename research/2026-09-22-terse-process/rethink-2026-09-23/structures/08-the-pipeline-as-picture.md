# Structure 08 — The pipeline as picture

> в моем понимании, главная миссия - цель плагина. Это оценка и улучшение текста (чтобы это ни значило).
> Документация, комментарии, проза, текст и даже код, и тд - не важно. Плагин итеративно через пайплайн и
> мультиагентность, храня множество правил, бестпрактис и быть способными их найти, оценивает текст,
> делает его лучше итеративно. Для этого есть пайплайн. Без признака нейрослопа, неся истинную ценность.

> As I understand it, the main mission is the plugin's goal: assessing and improving text, whatever that
> means. Documentation, comments, prose, text, even code — it does not matter which. Iteratively, through a
> pipeline and multi-agency, holding many rules and best practices and being able to find them, the plugin
> evaluates text and makes it better, iteratively. The pipeline exists for that. Without the marks of AI
> slop, carrying real value.

First need: decide in one screen that terse is for improving their text, then see the route from their document to a checked new draft.
This reading therefore makes the handoffs, rather than three independent feature descriptions, the means of choosing a skill and trusting its result.
It leaves out a separate technical architecture, rule catalogue, licence, long experiment account, and any unverified promise about languages, cost, retention, or universal human benefit.

- **terse — start with the text** — Purpose: state the broad mission and the reason to enter the workflow before its mechanism; excludes prerequisites, AI-reader mechanics, and a claim that model answerability proves human improvement; **budget: 60 words**; **device: plain paragraphs**; rests on **A01, A06, A15; owner: “the first screen says the mission” and “opening sells and does not warn”; reader profile mission/scope and Q6**.
- **Install** — Purpose: turn the decision to try it into one copyable Claude Code installation path that leads directly to the first stage; excludes shell alternatives, version history, package-manager matrices, and unverified runtime reassurance; **budget: 40 words**; **device: bash code block**; rests on **A05, A08, A21; owner: commands belong in a language-tagged code block; Q1**.
- **The workflow** — Purpose: show once, in run order, `audit → rethink (when shape is the problem) → rewrite → audit again`, with the document or report entering and the next handoff leaving each stop; excludes the internals that the later stage sections explain and any implication that a skill starts the next one itself; **budget: 75 words**; **device: compact numbered flow diagram/table**; rests on **A02, A03, A20; owner: pipeline should be shown once, not described twice; Q3; terms: workflow, report, draft**.
- **1. Audit — measure before changing** — Purpose: make the default first run legible: a document enters; AI-reader questions and checked claims produce a report of what failed and why, or a result that says it need not be changed; excludes proposed wording, the claim-ledger machinery, and a human-reader equivalence claim; **budget: 105 words**; **device: command-and-output excerpt**; rests on **A03, A09, A16; Q3; reader profile “cannot tell whether a document is fine”; terms: AI reader, answer key, score, cause**.
- **2. Rethink — decide the document’s shape** — Purpose: show the conditional structural route: the audit report or a document of the wrong shape enters; documents like it, terms, and order yield the document’s outline before writing; excludes prose drafting, technical survey method, and a second pipeline recital; **budget: 75 words**; **device: two-column input/output table row**; rests on **A02, A03, A04, A20; Q3; terms: documents like yours, outline, shape**.
- **3. Rewrite — produce a reviewed draft** — Purpose: show the writing leg: an audit report or outline enters; iterative writers and reviewers produce a whole draft and a diff, with the consequential file and agent-authorization boundary before the command; excludes a guarantee that no pre-consent file is written, fixed price/duration, reviewer internals, and the false framing of targeted fixes; **budget: 120 words**; **device: command plus input/output/boundary table**; rests on **A12, A17, A18, A19; Q2, Q4, Q6; owner: no technical detail before decision; terms: draft, diff, reviewers, until you say so**.
- **4. Audit again — check what held** — Purpose: close the loop by having the new draft re-enter audit, state that it checks whether a later pass made things worse rather than promising it cannot, and point briefly to the bounded one-small-trial evidence; excludes a long experiment narrative, McNemar explanation, and a claim of proven human benefit; **budget: 85 words**; **device: return-arrow diagram with one linked evidence note**; rests on **A04, A20; Q5; reader profile evidence expectations; terms: “one small trial; the gain could be chance (p = 0.25)”**.

**Total budget: 560 words.**
