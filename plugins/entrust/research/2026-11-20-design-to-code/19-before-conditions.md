# Post-series check: preserve the meaning of a Before image

This is a targeted correction to the checker, not another frontend implementation iteration. The owner asked for reference/after/before images that can actually be compared. The existing checker kept the first image by frame name alone. On the reproduced sequence, a frame called `control` first rendered at 300 px and then at 450 px under a different query. The old gallery displayed the original 300 px image under the unqualified caption `Before` next to a 450 px `After`; the reference and current image could still pass their own comparison. The handoff did not identify the changed capture settings. Before each phase, the reproduction generated its synthetic reference from the current page with `snapshot --images --force`: the reported pass is therefore a self-comparison, not proof against an independent design or a fixed reference.

[Original gallery](19-before-original.html) · [Gallery with the correction](19-before-fixed.html). Download the raw HTML files and open them locally. Both include the reference, Before, After and difference. The image content is a public synthetic fixture. The original first capture remains unchanged.

## Correction

The checker retains a digest of the first capture and its capture settings. When a later check of that frame has different recorded URL, width, root, host, setup or actual browser options, the gallery and handoff label the existing Before as **different capture settings, not comparable**. An older image or marker with no valid matching record is labelled **capture settings unknown**. No raw URL is stored in that record. A preserved image/absence marker is not replaced by the current render. The warning is separate from the `Design` versus `After` verdict; in this reproduction that verdict is only a self-comparison, not a fixed-reference parity test.

Equal settings are not proof that the server's data, feature flags, authentication state or theme are unchanged. The gallery and handoff therefore still ask the reader to confirm rendered data and theme for a Before/After comparison. The record cannot infer such changes when the same URL produces different content. Concurrent checks writing the same output directory have not been established as supported; the checksum record is not a concurrency protocol.

## Evidence

| Sequence | Before pixels | After pixels | Before caption | Design/After |
|---|---:|---:|---|---|
| First capture | 300 | 300 | `Before` | pass |
| Repeat, same capture settings | 300 | 300 | `Before` | pass |
| Different width and query, old checker | 300 | 450 | `Before` | pass |
| Different width and query, corrected checker | 300 | 450 | `Before — different capture settings, not comparable` | pass |

Each phase recreates Design from that phase’s page before checking it. The table therefore illustrates provenance labels, not independent design parity. In all phases the saved first PNG has the same SHA-256. The implementer's seven targeted Chromium tests covered unchanged, changed and absent/legacy baseline cases. An independent Terra verifier reran the new browser case and separately checked URL variants, root, host, viewport, scale, missing/invalid metadata and altered PNG, along with retention of the first image; no raw URL appeared in the record. The initial verifier test from a checkout lacking Playwright was skipped; it was rerun successfully from an environment with Playwright. These checks establish the named cases, not all possible data changes or concurrent writers.

The writer was requested as Astra xhigh and the independent verifier as Terra xhigh; effective model and effort were not separately reported by the host. Their post-series continuation deltas were approximately:

| Role | Elapsed wall time | Uncached input | Cached input | Output |
|---|---:|---:|---:|---:|
| Checker correction | 4:51 | 30,960 | 5,882,752 | 10,277 |
| Independent verification | 3:06 | 27,771 | 2,919,808 | 6,203 |

Output includes reasoning; do not add it twice. Coordinator, browsers and permission-review costs are not included. Times and token counters are continuation observations, not a monetary cost.

The full final Chromium profile passed 78/78 with no skips; skill-page and link validation passed 8/8. This correction makes one observable provenance difference explicit; it does not show that draft v20 produces an acceptable first frontend submission. The owner's limit of five such iterations remains in force.
