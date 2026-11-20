# The design pack

Everything the design says about the change, fetched once and kept as files, so that building and checking need no
further Figma calls and another agent can take over.

```text
.design/<task>/
  design.json             the page, root, host, frames and sweep: check.md
  deviations.json         the ledger: check.md
  review.md               step 2: the map to the UI kit, the gaps, the options, the acceptance list
  assets/                 every icon and image the frames use, as the design holds them
  frames/<frame>/
    spec.json             its texts: characters, box, alignment, font
    reference.png         the frame at its available scale
    metadata.xml, context.tsx   the MCP answers the spec was made from, when it was
  out/                    the check's results
```

## Spec and image

**With a Figma token** (a personal access token, Figma: Settings, Security; set as `FIGMA_TOKEN`):

```bash
node "<skill-dir>/scripts/design.mjs" figma "<frame link with node-id>" --out .design/<task>/frames/<frame>
```

It reads the frame from Figma's REST API and writes `spec.json`, with every visible text's characters, box relative
to the frame, alignment, size, weight, line height and colour, and `reference.png` at 2× (`--scale` to change). No
model tokens are spent and nothing is retyped.

**Without one**, from the MCP server:

1. `get_metadata` on the frame: its layers with positions and sizes, but text layers only by name. Save it as
   `frames/<frame>/metadata.xml`.
2. `get_design_context` on the frame: its code, in which every element carries its layer's `data-node-id` and the
   actual text. Save it as `frames/<frame>/context.tsx`.
3. `node "<skill-dir>/scripts/design.mjs" spec frames/<frame>/metadata.xml --context frames/<frame>/context.tsx --out frames/<frame>/spec.json`
   places every text layer by the outline and takes its text from the context by node id. It prints which reading of
   x and y it chose (relative to the parent, or absolute on the canvas) and which layers got no text; if the
   landmarks land outside the frame, run it again with the other reading as `--coords`.
4. Save a `reference.png` from the available export; prefer 2× when the exporter supports it. Record its actual
   scale. The check rounds the image-width-to-frame-width ratio to an integer device scale, so a non-integer scale
   needs a visual comparison at a consistent size rather than being treated as a pixel-exact measurement. Compare
   every text in the spec with it: correct one that reads differently, and write in the ones the context did not
   give. A layer whose text the code builds from data (`{count} cores`) is reported as missing, not guessed. Nothing
   later catches a wrong text in the spec: the check looks for that text on the page and excludes text from the pixel
   comparison.
5. For each text whose style the design context states, add `"font": { "size", "weight", "lineHeight", "color" }`
   (CSS px, `#rrggbb`). Without it a smaller font that keeps its line height shows only in pixels.

## What else to read

- **Design context**, `get_design_context` on the frame; when the answer is cut short, on its children, one call
  each. Its code (React and Tailwind by default) is a source of values, not code to paste.
- **Code Connect**, when available and useful, can identify mapped components and props. Verify a mapping against the
  design and the consumer. For unmapped layers, inspect the project and its UI kit; record what has no match in
  `review.md`.
- **Variables**, `get_variable_defs`. A raw value where the system has a variable is a gap for `review.md`.
- **Assets.** Inspect design assets alongside the project's existing icons and UI components. Preserve the intended
  appearance and supported component behavior; download a design asset when needed. Keep an SVG's viewBox and do not
  leave a temporary Figma URL in code.
- **Comments**, `get_comments` on the remote server: states and behaviour are often written there.

Save to the pack what a tool writes itself. Retyping a tool's answer into a file costs its length in output
tokens: do it only when another agent will build from the pack.

## The data and the states

A frame's texts are its data. Render each frame with that data (a story per frame, or one story with arguments);
where the product's data cannot produce a text, the check cannot find it, and the gap goes to `review.md`. A frame
showing a state (an open menu, a selected row, hover) gets `setup` steps in `design.json` that put the page in that
state before it is measured; a state drawn outside the component, such as a popover or a sheet, also names its own
`root`.

Add one **dense story**: the longest legal data the product allows, every badge and every conditional action at
once. No frame draws it; it is where texts collide and actions cover each other. Sweep it with `sweep.stories`, and
look at its pictures in the gallery. A full check without one is incomplete.

## Screenshots without a spec

Use each supplied screenshot as a reference. Record the known CSS dimensions and scale; if unknown, state the
assumption and compare at a consistent size. Make a spec with the reference's frame dimensions and `landmarks: []`.
The check compares the root and the areas outside the page's text, and reports the frame incomplete at best (a
differing area outside the text or a differing root fails it): what the texts say, and the smoothing Figma and
Chromium give them differently, are for the eye. Inspect text, placement, typography and states against the
screenshot; report unobserved widths and interactions. Keep the reference and before/after images for the owner. Do
not invent Figma metadata or imply an assumed scale is measured.

To make a pack from an accepted implementation, for a baseline or a test case, `design.mjs snapshot` writes
each frame's spec (and, with `--images`, its reference) from the page as it renders now; such a spec also compares
text widths, which a Figma spec does not.

## Limits

Figma limits MCP calls by seat (its "Rate limits & access" page): View and Collab seats get a few calls a month; Dev
and Full seats on paid plans a daily and a per-minute allowance. Fetch each frame once and work from the pack.
