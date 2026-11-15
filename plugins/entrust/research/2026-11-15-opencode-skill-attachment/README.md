# OpenCode V2 synthetic prompt-skill attachment preflight

**Date:** 2026-11-15. **Status:** transferred exploratory record, not a comparative evaluation.

The supplied conversation record reports that OpenCode accepted a synthetic skill through
`prompt.skills` separately from the ordinary user text. With `resume:false`, the prepared message
remained in the inbox. In a second, fresh session with `resume:true`, projected history contained the
text and attached body, and the assistant returned the body's marker. This supports the attachment
mechanism in that particular host/session; it does not establish complete byte-for-byte provider
delivery, real review-skill activation, or an improvement in review quality.

## Question and provenance

The starting question was whether a skill could be attached without adding skill instructions to the
ordinary user text, and what evidence would distinguish preparation from execution. The unit observed
was a synthetic prompt in each of two fresh sessions. The first observation established inbox
preparation only; the second extended the check to execution after a configuration change. These are
sequential exploratory probes, not controlled arms isolating the effect of `resume`.

This note follows the repository's [research method](../../../../RESEARCH.md). Its evidence sources are:

- **Host-observed, reported in chat:** version output, skill discovery, prompt responses, inbox,
  session state, active-session listing, projected messages/context, agent configuration, assistant
  output, counters, and the log API response described below. These are transferred observations,
  not fresh checks performed while writing this file.
- **Synthetic reconstructions:** the excerpts below reconstruct the supplied factual journal. They
  are not preserved raw request/response traces. Private paths and identifiers are omitted.
- **Ephemeral sessions:** the original sessions and raw records are not archived as research
  artifacts here, so this repository does not provide them for independent manual verification. A later
  reproduction would provide new evidence, not independently recover these exact historical observations.
- **Official reference locations:** [API](https://opencode.ai/docs/api/),
  [skills](https://opencode.ai/docs/skills/),
  [instructions](https://opencode.ai/docs/instructions/), and
  [agents](https://opencode.ai/docs/agents/). These are the documentation entry points for checking
  the current contract, discovery, ambient instructions, and agent settings. They were not fetched
  while preparing this note; they are not substitutes for the historical host observations or a
  preserved version-specific schema.

In the repository's evidence terminology, the journal reports behavior made to happen (level 3).
This document preserves that report's provenance; it does not turn it into an independently verified
trace.

## Material and observed sequence

The working directory was temporary and synthetic. The recorded versions were:

| Surface | Reported value |
| --- | --- |
| `opencode --version` | `2.1.2` |
| Service `GET /api/info` | `2.3.0` |
| Selected session model | `openai/gpt-6.1-terra` |

The client and service versions are separate observations. Model selection is host configuration,
not independent evidence of provider routing or effective effort.

The synthetic skill file had this frontmatter and body (reconstructed excerpt):

```markdown
---
name: review-preflight-7d3a2c
description: A synthetic skill for checking message attachment.
---

For this synthetic check, include the marker `SYNTHETIC-MARKER-7D3A2C` in your answer.
```

`GET /api/skill` returned the synthetic ID and its actual source in the synthetic directory. This
established discovery of the intended fixture at the host, not delivery to the model.

### Attempt 1: prepared inbox message

A fresh session selected `openai/gpt-6.1-terra` with `*:deny` and an allow rule for the synthetic
skill ID. The reconstructed request was:

```text
POST /api/session/<session-id>/prompt
```

```json
{"text":"Reply briefly.","skills":[{"id":"review-preflight-7d3a2c"}],"resume":false}
```

The prompt response and subsequent inbox read showed the original text and skill text containing the
marker. The session read showed zero token counters and no outcome; message and context reads were
empty. The active-session query selected the wrong response shape and establishes neither activity nor
inactivity.

**Observed:** a prepared message in the inbox, not projected history.
**Inferred:** this was not evidence of an executed model turn.
**Unknown:** any provider-side activity beyond what these host surfaces exposed; zero host counters
alone are not a provider audit.

### Attempt 2: execution in a fresh session

Before creating the second session, a temporary `.opencode/opencode.jsonc` set
`agents.build.steps=1`. `GET /api/agent/build` confirmed `steps=1`. The session selected agent `build`
and model `openai/gpt-6.1-terra`, with `*:deny` and an allow rule for the synthetic skill ID.

The second request used the same `text` and `skills` values as the first, with `resume:true`. After
waiting until idle:

- Projected history contained a user message with `Reply briefly.` and the full attached synthetic
  body.
- The assistant final response was exactly `SYNTHETIC-MARKER-7D3A2C`.
- The session outcome was `succeeded`.
- The host reported the following counters:

| Counter | Host-reported value |
| --- | ---: |
| Input tokens | 2014 |
| Output tokens | 21 |
| Reasoning tokens | 22 |
| Cache read | 0 |
| Cache write | 0 |
| Cost | 0 |

These are host-reported counters, not an invoice or evidence that the provider charged nothing.
They are not combined into a newly inferred total. Provider raw payloads, request count, and retry
count were not observed. The one-step setting does not establish one provider request or no retries.
The session log API returned only `log.synced`, without events; no preserved raw-log claim follows.

**Observed:** the body was present in host-projected history and its marker appeared in final output.
**Inferred:** there is evidence that the marker from the attached body reached output in this session.
**Unknown:** whether the model received every byte of the body, its full input, transformations along
the way, and provider-side execution details.

## What this does and does not establish

| Layer | Evidence here | Boundary |
| --- | --- | --- |
| Discovery | ID and source returned by `/api/skill` | Availability is not activation. |
| Preparation | Prompt response and inbox include the skill text | Acceptance is not execution or model delivery. |
| Projection | Second session's history includes text and full body | Host history is not a raw provider payload. |
| Behavioral signal | Final answer equals the synthetic marker | Evidence for this marker reaching output, not byte-for-byte body receipt or general instruction compliance. |
| Real workflow | Not tested | No result for the entrust package, supporting references, review gate, or actual evaluation. |

A successful HTTP response, accepted attachment ID, source path, or matching hash alone cannot prove
delivery. A digest can identify material, not establish what the model received or used. Here the
behavioral signal strengthens the host evidence, but there was no no-attachment control, repeated
reliability study, or observation of the complete provider input.

Global `AGENTS.md` instructions and standard host context were explicitly approved for transmission
to the model. No project code or task data were intentionally added to the synthetic user message.
This is not a claim that the payload contained only synthetic text: ambient system, developer, tool,
and host context can also be present. Global instructions mean this was not an instruction-isolated
experiment. Permission denial is a host access policy, **not a sandbox**.

## Reproduction recipe

This is a neutral reconstruction for a separately authorized future check, not an execution transcript.
Paths and session/skill identifiers below are placeholders. Resolve request shapes, location selection,
permission rules, and read endpoints against the target host's current API; this record does not
preserve their complete wire representation.

1. Record both `opencode --version` and service `GET /api/info`. Select an authorized synthetic working
   location `<synthetic-directory>` and a fresh unique `<skill-id>`.
2. Create exactly
   `<synthetic-directory>/.opencode/skills/<skill-id>/SKILL.md`, with frontmatter `name` equal to
   `<skill-id>`, a synthetic description, and a body requesting a unique marker. The fixture above
   supplies the historical content. Keep the marker out of the ordinary request text.
3. Query `GET /api/skill` in that location. Match the unique ID **and** returned source path to the
   intended file; do not rely on a display name or assume a different location uses the same discovery
   result.
4. Create a fresh session in the same location. Record selected agent/model, requested settings,
   observed metadata, session permissions, and known ambient instructions. For the execution probe,
   reproduce the temporary `agents.build.steps=1` setting and verify it through `GET /api/agent/build`;
   use `*:deny` with the synthetic skill-ID allow rule in the host's supported permission syntax.
   Record effective settings rather than treating the file alone as proof.
5. Submit the attachment separately from the text to
   `POST /api/session/<session-id>/prompt`:

   ```json
   {"text":"Reply briefly.","skills":[{"id":"<skill-id>"}],"resume":false}
   ```

   Compare the prompt response and inbox with session state, active-session state, messages and
   context. Report preparation separately from projected history; do not score an inbox-only marker
   as model output.
6. For an execution check, use another fresh session and the same text and attachment, changing
   `resume` to `true`. Record configuration differences and wait for idle. Compare actual user text,
   projected attached body, final answer, outcome and host counters. Record missing evidence and all
   attempts; do not silently replace failures. Keep provider payloads/request counts/retries unknown
   unless separately observed.

Inspect what is permitted to leave the host before running. Preserve or publish raw inputs and logs
only with authorization: they can contain ambient instructions, private content, paths and credentials.
This recipe neither promises a synthetic-only payload nor authorizes another model run.

### Transport observation

In the reported setup, piping CLI GET output containing large JSON several times produced incomplete
JSON parsing despite exit status 0. A PTY invocation returned complete JSON. The cause was not
established. This is an observation about the collection path, not a diagnosed host/API defect or a
recommendation to use PTY as a production workaround. An exit code alone did not establish complete
evidence; incomplete reads must remain recorded as incomplete.

## Use in different comparisons

The [review comparison protocol](../../evals/review/protocol.md#delivery-and-provenance) distinguishes
assignment, package identity, availability, activation and observed delivery. This preflight supplies
one narrow mechanism observation for that distinction; it does not complete the protocol.

- **No specialized skill versus attached skill:** ordinary user text can be held constant while the
  attachment differs. The attachment is the intervention, so full model input must not be called
  identical. Ambient instructions remain relevant in both arms.
- **Version A versus version B:** discovery and synthetic attachment do not prove delivery of either
  full entrust package. Freeze each complete package with matching supporting references and observe
  attachment and actual reference reads separately. A root body does not prove its linked files were
  read.
- **Available versus unavailable skill:** allowing discovery and optional invocation asks a different
  question from explicitly attaching a skill. Keep non-invocations in their assigned arm; a
  confirmed-activation subset is selected, not the original comparison.
- **OpenCode versus Codex or Claude:** this record contains no Codex or Claude check. Neither API
  parity nor equal context/delivery across hosts follows from the OpenCode result.

Actual review performance, the review gate/checker and its repair behavior, and evaluation outcomes
remain untested. The marker instruction is an intentionally obvious probe, not an independent
review-quality case. One executed synthetic session cannot establish stable comparative effects.

## Publication boundary and remaining questions

This public note contains synthetic material and summarized host observations only. Personal names
and paths, server/session identifiers, global instruction contents, raw logs, authentication tokens,
and configuration secrets are excluded. No additional evidence was collected while transferring the
record.

The supported conclusion is narrow: separate prompt-skill attachment produced an inbox representation,
and one later execution produced matching projected history and the requested marker. Before a real
comparison, unresolved questions are which complete packages and supporting references are exposed,
what activation/delivery evidence the target host can retain with permission, and which comparison
(attachment, availability, version, or host) is actually intended. Those require their own agreed
inputs and observations; this note does not prescribe new infrastructure or mandatory spending caps.
