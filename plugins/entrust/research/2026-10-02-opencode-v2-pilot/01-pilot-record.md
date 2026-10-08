# V2 router configuration and transport pilots

Executed on 2026-10-02 with the user's approval. The first native configuration supplied the selected
model but failed at SDK dispatch. Two separately approved transport overrides then produced native
assistant results. A further approved interaction window passed six native cases. The original
singleton was restored after every window; V2 selection in the adapter is explicit, with V1 retained
as the compatibility default.

Sections: [Original SDK configuration](#original-sdk-configuration-result) · [Source and conclusion](#source-and-conclusion) ·
[Offline transport gate](#offline-transport-gate) · [Native transport comparison](#approved-native-transport-comparison) ·
[Native interaction gate](#approved-native-interaction-gate) · [Adapter acceptance](#approved-adapter-acceptance-passed).

## Original SDK configuration result

- Binary: OpenCode `1.18.34`, SHA256
  `7b63b34fafabded7d9231f6a9032755d0cdeaf8b9d2b70df8e25535471469eea`.
- Model: `openrouter/deepseek/deepseek-v4.1-flash`; API ID
  `deepseek/deepseek-v4.1-flash`; endpoint: a private OpenRouter-compatible router.
- Actual selected V1 model SDK: `@openrouter/ai-sdk-provider`. The provider configuration instead
  declares `@ai-sdk/openai-compatible`; V1 resolves the SDK from the model's API metadata. The pilot
  preserved the actual SDK, API ID and `high` variant body `{"reasoning":{"effort":"high"}}`.
- V2 advertised the exact model and variant at the isolated location. Its available catalogue
  contained 424 models after activating the provider's built-in catalogue; only the target was called.
- Session `ses_f0399ea9fffeCkrmmfRb7oKNob`, input `msg_entrust_v2_config_48a110d7860f`.
  One synthetic input was admitted with HTTP 200. No assistant message appeared during 60 seconds.
  Native runner log recorded:

  ```text
  SessionRunnerModel.UnsupportedApiError:
  Unsupported API for openrouter/deepseek/deepseek-v4.1-flash: aisdk:@openrouter/ai-sdk-provider
  ```

- Native `wait` still returned 503, `Session wait is not available yet`.
- No continuation call was made: the first call produced no attributable assistant result.
  Admission is not evidence that the model provider was called. No provider billing receipt was obtained.
- Only one OpenCode server ran at a time. The pilot had separate configuration, DB, state, cache and
  location. After stopping it, hashes confirmed the original configuration and DB had not changed
  during the window. Restoring the original process environment, authentication and working directory
  yielded healthy `1.18.34` and the original DeepSeek and GLM model availability.

The run's private evidence root is `<the run's private evidence directory>`:
`result.json`, `observations.json`, and `data/opencode/log/opencode.log`. Credentials were supplied
through a child-process environment variable; none belong in the result or model prompt.

## Source and conclusion

The pinned source provides native [provider configuration](https://github.com/anomalyco/opencode/blob/aec0b9a6d8898f68f923aaf08b7306d931fd9d76/packages/core/src/config/provider.ts)
and [integration environment methods](https://github.com/anomalyco/opencode/blob/aec0b9a6d8898f68f923aaf08b7306d931fd9d76/packages/core/src/config/plugin/provider.ts).
Its [model resolver](https://github.com/anomalyco/opencode/blob/aec0b9a6d8898f68f923aaf08b7306d931fd9d76/packages/core/src/session/runner/model.ts)
dispatches `@ai-sdk/openai`, `@ai-sdk/anthropic` and `@ai-sdk/openai-compatible` with an explicit URL;
it has no dispatch branch for `@openrouter/ai-sdk-provider`. The native error proves that gap for
this exact pilot. The earlier missing-catalogue explanation was a hypothesis, not its established cause.

## Offline transport gate

The pinned native LLM pipeline was executed with its exact `effect@4.0.0-beta.83` dependency and a
dummy bearer key. Source files matched the pinned Git blob hashes. TypeScript compilation erased
types and resolved local imports; provider/serializer logic was unchanged. A fake executor captured
the final HTTP request before transport, after native protocol lowering, validation and body overlay:

```json
{
  "method": "POST",
  "url": "<the private router>/chat/completions",
  "model": "deepseek/deepseek-v4.1-flash",
  "reasoning": { "effort": "high" },
  "stream": true
}
```

Assertions also checked the dummy bearer header, preservation of a test header, absence of a body
`apiKey` and absence of a substituted `reasoning_effort` field. No model request was sent. This proves
serialization from native route defaults through the executor boundary; catalog variant/credential
merging was checked in source, not executed through a live session resolver.
A second offline gate captured the native OpenAI Responses request at `/responses`, with the same
model, `reasoning` body and credential checks. No model request was sent by either wire gate.
Evidence: `<the run's private evidence directory>`,
`wire-gate-responses-result.json` and the retained harness in
`<the run's private evidence directory>`. Temporary dependencies are outside the plugin payload.

## Approved native transport comparison

The user approved comparing several transports. Each changed the selected model's API package
explicitly, retaining the binary, model/API IDs, Eliza endpoint and high body:

| Native package | Endpoint | Session | Result | Observation time |
| --- | --- | --- | --- | --- |
| `@ai-sdk/openai-compatible` | `/chat/completions` | `ses_f03733df5ffeBZzn2v1Re1L8L2` | `V2_CHAT_OK` | 2.593 s |
| `@ai-sdk/openai` | `/responses` | `ses_f03732b44ffesHaVhIRrXMNeFf` | `V2_RESPONSES_OK` | 1.821 s |

Both inputs were admitted once, with no tools or repository data. Native history attributed each
completed assistant result to the exact requested model and `high` variant, with `finish: stop`
and no native error. Chat usage was 3,128 input / 6 output / 0 reasoning tokens; Responses was
3,190 input / 9 output / 11 reasoning tokens. Native cost was zero for both. That is not a provider
billing receipt or proof of free inference. One request per transport, including polling delay,
does not compare speed, quality or tool compatibility.

Cold catalogue reads initially returned zero models. Bounded read-only readiness polling then
observed 421 / 424 models and verified the target's API package, URL and variant before admission.
Two earlier preflight windows ended before any input was sent; their evidence was retained.
Native `wait` returned 503 for both successful transport sessions.

Each transport had private configuration, DB, state/cache and an empty location. Only one OpenCode
server ran at a time at the original address. The final comparison window lasted 10.921 seconds
and admitted two inputs total. Configuration, recent-model state and DB hashes remained unchanged
during that window. Restoring the original environment, authentication and directory produced
healthy `1.18.34`; no global model/default or adapter API-family migration was made.

Evidence: `<the run's private evidence directory>`, with per-transport
model metadata, observations and native logs in that directory. Private credentials are excluded
from these results and prompts.

This establishes V2 text execution through two explicit native transports. It does not establish
support for the original OpenRouter SDK. No binary upgrade, global configuration change, custom
serializer or DB migration was performed.

## Approved native interaction gate

Executed in an isolated Chat Completions window with the same binary, DeepSeek/Eliza/high and native
`@ai-sdk/openai-compatible` package. A dedicated agent `entrust-v2-probe` had default deny, question
allow and ask rules for three literal synthetic shell commands. Its returned rules and four-step
limit were checked before session creation. The pinned permission resolver reads agent rules; the
session-create handler does not forward its advertised `permissions` field.

Session: `ses_f035cb8fdffeTMUXrKJzRo78lQ`.

| Case | Observed result | Seconds |
| --- | --- | --- |
| Question, fixed Read answer | `V2_QUESTION_READ`, native reply 204 | 4.274 |
| Permission-controlled printf | `V2_PERMISSION_OK`, native tool exit 0 | 3.250 |
| Same-session recall | `V2_RECALL_READ` | 1.715 |
| Stop during sleep 20 | interrupt 204; idle, cleared callbacks, tool error, recorded process gone | 2.467 |
| Continuation after Stop | `V2_RESUME_OK` | 2.892 |
| Active delivery during sleep 5 | `V2_STEER_NEW` after native steer admission | 9.943 |

The window admitted seven inputs once, lasted 29.295 seconds and performed no repository reads or
writes, external network tools or model fallback. Every completed assistant carried the exact
requested native model/variant. Stop and active delivery required positive owned shell-process
identity before mutation. Recorded processes disappeared within the ten-second observation bound;
that observation does not prove a server-side generation fence or every possible descendant state.
The script used direct native HTTP calls: it proves the engine contract, not the new adapter's live
end-to-end implementation.

Only one server ran at the original address. Configuration, recent-state and original DB hashes
were unchanged during the stopped-original window. Restoration returned healthy 1.18.34 with both
recent models, at PID 80024. Evidence:
`<the run's private evidence directory>`, including callback payloads,
native messages/history, process identities and restoration checks. Private credentials are excluded.

This corrects the earlier blanket claim that V2 cannot provide a workable result wait. Native
`wait` remains 503, but authoritative messages/history/active polling produced these results.
Strict active steer remains unproven: the installed prompt schema has only `id`, `prompt`, `delivery`
and `resume`, with `additionalProperties: false`, and no expected-generation field. Next-boundary
steer admission cannot be renamed generation-bound delivery. The installed `/doc` and pinned
[session protocol](https://github.com/anomalyco/opencode/blob/aec0b9a6d8898f68f923aaf08b7306d931fd9d76/packages/protocol/src/groups/session.ts)
are this gate's contract; current web examples already differ in form/question and session paths.

The completed window does not authorize another server window, permanent default migration, binary
upgrade or server-side generation patch. Adapter live acceptance remains a separate bounded gate.

## Approved adapter acceptance: passed

The real launcher and driver passed a registered-plan V2 invocation and three fresh-report
continuations. This exercised `--new`, repeated `--run`, typed `--decide`, independent schema
validation and Stop through the waiting wrapper. Binary/model/endpoint/high and native Chat
Completions matched the previous engine gate. Dedicated agent `entrust-v2-adapter` was verified as
default deny, bash ask and question allow. No global profile/default migration was performed.

| Invocation | Session | Adapter evidence |
| --- | --- | --- |
| Question, answer Read | `ses_f03244181ffeEtyMbLZNQUaD7F` | exit 0, receipt true, schema true |
| Permission-controlled printf | same | exit 0, receipt true, schema true, command exit 0 |
| Wrapper Stop during sleep 20 | same | exit 3, receipt false, cancellation observed idle; recorded native process gone |
| Resume and recall Read | same | exit 0, receipt true, schema true; inherited V2/profile/model/high |

The successful window took 28.913 seconds and admitted four inputs once. There was no schema repair,
model fallback, repository read/write or other-service tool. Stop's command exit remains null, not
fabricated as zero; its interrupted report retains the requested model, and continuation attributes
its new answer to the observed exact model. The session stayed the same across all four reports.

Earlier attempts in this approved acceptance activity were retained:

- A zero-input preflight used an incorrectly assumed `/api/agent/{id}`. Installed `/doc` and the pinned
  agent handler expose only `/api/agent`; the adapter now selects the exact ID from that list. The
  fixture was corrected and includes an unsafe unrelated default to check selection.
- One question input completed natively, but the adapter requested history limit 1000. The pinned
  protocol caps history at 100. That failed observation was fixed; a second input then exposed the
  independent message-page cap of 200 through native HTTP 400. The fixture now enforces both limits.
- These failed windows restored the original server each time. No ambiguous input was resent; later
  attempts used fresh private state/session/report identities. Cancellation from a failed observation
  remained unknown and was never used as authority to resume that session.

Across all attempts: six admissions and 254.016 seconds of server-window runtime, within the approved
eight-input/ten-minute bounds. The harness checks remaining slots before starting an invocation,
including its potential one schema repair, and reserves time for restoration. Configuration, recent
state and original DB hashes matched during every stopped-original window. Final restoration returned
healthy 1.18.34 and both recent models, at PID 26386; only one server ran at the address.

Final evidence: `<the run's private evidence directory>`, containing CLI
handoffs, full callback payloads, four adapter reports, durable admissions and restoration checks.
Earlier evidence is in `v2-adapter-live`, `v2-adapter-live-2` and `v2-adapter-live-3`; the two diagnostic
receipts identify the native limits. The machine-specific ignored harness is
a gate script kept outside the repository.

The final GLM continuation reviewed the current adapter and pinned agent/session protocols. It
identified an undeclared `title` in V2 session creation; the adapter now sends only agent, location
and model. The fixture rejects undeclared create fields, and a fresh 65-case adapter suite passed
after this change (`opencode-v2-final.log`). The live gate predates this field removal; no additional
native inference was run. The broader local run had 22/23 suites green before the final native
contract corrections; the paid orchestrate-live gate was not run.

This proves these adapter interactions on the selected native transport. It does not establish
server-side generation-bound active delivery, all tool families or performance comparisons. Strict
steer remains unsupported. The original singleton retains its prior configuration and compatibility
path; permanent native default adoption, upgrade and server-side changes remain separate owner actions.
