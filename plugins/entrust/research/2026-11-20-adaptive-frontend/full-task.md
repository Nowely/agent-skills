# The full task and its acceptance boundary

The first narrow pilot could establish whether one card let a user select an item and continue. The larger task also required coordinated behavior across a stock list, an ordered list and a template chooser, compatibility with a fourth consumer composing older pieces, matching grouped designs and working distribution. A ten-minute narrow implementation was never a baseline for the entire product task.

## Control before grading a worker

The later runs used the same 26 design exports, a pre-change library, consumer excerpts, ordinary public stories and a packaged reference. Some early exports were recovered from the original design captures. A wide frame that had since disappeared was found in the historical material with its lower edge cropped. Another available frame had changed height; the historical export took precedence. An unavailable portion of a frame could not be graded pixel by pixel. The case was already known to the skill designers. Workers got clean contexts and the original brief, with the judge's examples and release withheld. This does not make the case held out.

The judge verified the release archive against the saved registry integrity and compared 14,244 unpacked files. A neutral consumer imported the actual public entry, mounted the three real paths, exercised a copy of the older site's adapter, and checked the previous public prop types. A separate earlier screenshot exercise mounted an internal card on synthetic data. Its images were useful when comparing composition, but did not prove that a public import worked.

The release control passed 27 browser scenarios in 61.1 seconds with no page exceptions. On four representative records its heights differed by at most about 1 CSS px from their design references. A dense record was measured across eleven widths. The judge checked paired data and action hit regions, behavior in each selection mode and the state on returning to a wider layout. A price or hint that legitimately belongs to one type of configuration was not required on an unrelated type. A baseline that cannot demonstrate an expected result leaves that detail open.

| Area | Positive observation on the public control | A plausible check that would have missed a failure |
|---|---|---|
| Geometry and readability | Matched records at four design widths plus valid long content in a real host at and between modes. Inspect individual groups, neighboring text, primary action and shared alignment. | Comparing viewport presets, card outer width or aggregate height alone |
| Data and role distinctions | Counts distinguish units, per-item and aggregate values; labels follow data flags; priced, discounted, unpriced and special-order states remain distinguishable. | Matching text on one favorable sample or deriving a warning solely from remaining quantity |
| Lifecycle and actions | Select one record, select another, resize the mounted list, continue, and observe the one expected ID. Test direct selection independently of the CTA mode. An auxiliary action must preserve the surrounding selection. | Checking only the presence of the CTA or its callback name |
| Explanatory controls | Verify visible text, units, old and new price where applicable, working link or action; exercise hover into the popup and leave through to the stable closed state. On mobile open the surface and dismiss it after it has actually opened. | Confirming that an icon exists, or treating an accessible name as proof of a visible explanation on tap |
| Public consumers and compatibility | Ordered and ready selections reach their consumer, selecting a template changes the form, previously exported legacy pieces still compose and disclose at wide and narrow sizes. Verify sharing in source separately from similar appearance. | A private story importing internal modules, or a type-only list of export names |

Calibration caught mistakes in the test itself. A selection event could belong to a parent rather than the local component; the observer had to watch the actual public effect. A sheet ignored background clicks during its opening animation. Using an immediate click would have rejected the working reference. Equivalent visible actions and callbacks were accepted even when DOM structure or locator text differed.

## What failed at each handoff

| Submission | Finding and disposition |
|---|---|
| v4, first | An image imported by the card was missing from both built module formats. A normal consuming bundler failed before rendering. For diagnosis only, the grader supplied that exact image from the submitted source. In that diagnostic setup it found a missing list header at medium widths; storage quantity and capacity in the wrong order; overlapping action and inventory text; price and discount material in the wrong region; missing explanations for known label keys with empty translations; a mobile special-order action reduced to a small link; five types of hover content that stayed open after pointer exit. Templates used separate core markup and omitted a provided thread count. Selection and continuation of the correct item still worked. The unmodified shipped artifact remained a failure throughout that round. |
| v4, second | The package now imported as delivered. The common renderer served all three paths and the site integration still worked. The shared header, price layout, dense data and hint closing had been repaired. The remaining material failure was touch on the inventory warning: in one mode it opened the containing item's CTA, in the other it immediately selected the item. A localized accessible name had been added but the original selection was lost when using the explanation. |
| v4, third | With another item already selected, an ordinary tap opened and closed the warning without changing the URL, checked item or expected callback. The final suite, public type checks and independent actions passed the rubric. Eleven widths showed no overlaps among the twelve tracked text groups. Two automated locator differences required equivalent-action verification. Typography and spacing still differed from the design. |
| Updated v5, first | Before handoff this worker discovered the missing image and verified a real import and selection from the built entry. Its ordinary medium card was close to the reference height. On a longer price plus three storage rows, the price covered memory or storage at 601, 624 or 683 px. Hint closing and label fallback behavior failed on real gestures/valid data. Comparison prices and the visible primary action were grouped incorrectly in some states. The template chooser lacked the provided thread count and still owned a separate characteristics layout, a limitation the author had disclosed. Six material groups were returned together. |
| Updated v5, second | The original corrections worked on the actual package, including touch on warning labels and shared rendering. Preventing overlap on dense data had moved the price of an ordinary item into another row and reversed its relation to the badge. At 601 px its height rose from about 147 to 207 px, against 146 in the design. Two neighboring ordinary entries with a gap occupied about 378 px, against 298 in the reference implementation. |
| Updated v5, third | The ordinary card's density and price/badge order were restored. Under the same header, values in the dense neighbor now landed in a different column from the corresponding ordinary values. This defect was verified at 601 and 624 px. The accepted v4 was tested in the same mixed-list scenario and retained the association. This control addressed the risk of imposing a stricter requirement on v5 after seeing its result. |
| Updated v5, fourth | Both types of record aligned to the same header and long prices remained readable. All public flows and the old adapter passed independent acceptance. Five text/locator mismatches among the automated main and supplementary scenarios were resolved using actual actions and outcomes. This pass required three returns. |

### Visual trajectory across every full-task submission

The entries below are card heights in CSS px, rounded to the nearest pixel. Each column uses the corresponding reference state and a comparable record. Widths in the header are the measured card widths. The v4 first-submission measurements were obtained on the explicitly diagnostic build with the submitted image supplied; the package as delivered failed to import.

| Source and submission | 764 px | 601 px | 486 px | 280 px |
|---|---:|---:|---:|---:|
| Design | 114 | 146 | 228 | 499 |
| Reference release | 114 | 145 | 228 | 500 |
| v4 first, diagnostic render | 106 | 168 | 264 | 491 |
| v4 second | 106 | 162 | 218 | 465 |
| v4 third, accepted | 106 | 162 | 218 | 464 |
| Updated v5 first | 122 | 147 | 228 | 492 |
| Updated v5 second | 122 | 207 | 228 | 492 |
| Updated v5 third | 122 | 144 | 228 | 492 |
| Updated v5 fourth, accepted | 122 | 171 | 228 | 492 |

The most informative column is 601 px. V5 started within about a pixel of the design on the ordinary record while a demanding record was illegible. Making the dense record legible initially cost about 60 px on the ordinary one. The next ordinary record measured within about 2 px of the design while the mixed list still put a value under the wrong heading. The accepted submission used more vertical space there. Deciding from that single number would reverse the order of two submissions.

## The case that changed v6

Reading a table means following a heading into more than one row. In the third v5 submission, available width could allocate the last column differently according to each row's content while the header used its own allocation. Each row was readable in isolation. With one ordinary and one dense row under the shared heading, a numeric count sat wholly under the neighboring frequency heading. A user could confidently read the wrong fact.

On the same 601 px scene the erroneous mixed-list image was 365 pixels high and its release counterpart was 366. The repaired image was 392 pixels high. These are heights of the **entire captured scene**, including the header, not the per-card CSS heights in the [trials table](trials.md#matched-visual-heights). A score based on total height alone would have favored the version with the misassociation. Actual text-to-heading geometry and visual inspection distinguished the two. This is a post-hoc diagnostic on known states, not a prospective measurement of v6.

The repairs illustrate different questions with different test units:

1. Does one item fit when several variable-length values compete? A single demanding record at the real host width can expose the overlap.
2. Does fixing that item preserve the ordinary layout? Compare the affected and previously passing inputs without changing unrelated host conditions.
3. Can a user compare items under the same headings? Put both into the same collection at once. A before/after screenshot of either row by itself cannot answer.

The interaction equivalent is an icon inside a selectable item. The user should get an explanation **and** keep the existing selection. An accessible name, the existence of text or a screenshot after a click only proves part of the contract. Use an initial selected item distinct from the one containing the icon so an accidental selection becomes visible.

## Visual fidelity on the narrow screen

The owner revisited the accepted images at 280 px. V5 is 7 px shorter than the design; its price text starts 21 px higher and its availability text starts 24 px higher. V4 is 35 px shorter overall. This is visible improvement in several details, with a remaining design discrepancy. A pass under the historical layout-and-behavior rubric did not certify pixel-perfect delivery. The [public visual report](visual/README.md) includes the measured internal landmarks and the original comparison gallery. The owner asked that a future handoff flag visual deviations and specific obstacles even when responsive behavior and interactions already pass.

## Interpreting the pass

The final verdict covers the frozen local contract on the measured browser, data and public package paths. The judge inspected equivalent outcomes where automation misunderstood a text node or selector. The release and design were not identical at every pixel. Touch used browser emulation; the physical keyboard and end devices were not exercised. A complete deployed customer workflow, real backend and release CI were outside these runs. These boundaries matter when choosing between “ready for review,” “passes this acceptance suite,” and “ready for production.”
