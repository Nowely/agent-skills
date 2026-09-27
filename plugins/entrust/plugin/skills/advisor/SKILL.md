---
name: advisor
description: >-
  Adds a standing advisor to the run it is invoked in: a top-row agent of the other model family, kept for
  the run and asked one question per decision point. The run records every decision point and what
  the advice changed, because the advisor is an experiment until measured.
disable-model-invocation: true
metadata:
  version: "0.20.0"
license: MIT
---

Load [codex](../codex/SKILL.md) now (Skill tool, `entrust:codex`); this page adds one standing thread of the other model family to whatever run it is invoked in, and needs no other page. The mode is prompt only: no driver change, no new header field or flag.

## The advisor

One top-row agent, chosen by the agreed composition, from the other model family than your own: Astra under a Claude coordinator, and Fable only when the composition words rule Codex out. Before its first question, show a plan that names it as the advisor, with its expected turns, and stop until "go". It is one thread kept for the run: a Codex thread continued with `RESUME:` under a report path of its own for every question, or a Claude agent continued by message. It holds a slot only while a turn of its runs; between questions it is not alive. That slot is one of six alive at a time, and the only Astra or the only Fable among them.

## What it is asked, and what it never does

Ask it at the decision points: the split before a fan-out, the composition, a verdict you are about to adopt, a stall, and any point the plan names. One question per message, carrying the decision you would take without advice and the evidence in a few lines. Its return is five fields: `status` (done, partial or blocked), `result`, `evidence`, `artifacts` and `open`. Its `result` is a recommendation with the reasons that decide it, one alternative, and what it would need to see to change its mind. The advisor never implements, never writes under the repository, never judges a result it advised on, and never spawns agents; a question it cannot answer from what it was given returns `unknown` with the missing check named.

## The record, because the advisor is an experiment

Before each question, write the decision you would take without advice into a notes file under your temporary directory, whose path the synthesis names; after the answer, write what changed and why. The synthesis names the decisions the advisor changed, with the outcome of each, and the advisor's turns and tokens beside the run's. Protocol E3 of the experiment skill measures a standing advisor against per-call advice and against no advice; until it has run, this page states no benefit: the 2026-09-17 research found no source that had measured a standing advisor thread, and that round's retrospective priced a continued thread at 1.23 times a fresh agent.
