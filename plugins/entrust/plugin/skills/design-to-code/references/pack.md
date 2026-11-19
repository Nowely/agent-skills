# The design pack

Everything the design says about the change, fetched once and kept as files, so that building and checking need no
further Figma calls and another agent can take over.

```text
.design/<task>/
  design.json             the page, root, host, frames and sweep: check.md
  deviations.json         the ledger: check.md
  review.md               step 2: the map to the UI kit and the gaps
  tokens.json             the frames' variables and styles
  assets/                 every icon and image the frames use, as the design holds them
  frames/<frame>/
    metadata.xml          the frame's outline
    spec.json             its text landmarks, from metadata.xml, with fonts added
    reference.png         the frame at 2×
    context.md            its design context
    code-connect.json     its Code Connect map
  out/                    the check's results
```

## For each frame

1. **Outline.** `get_metadata` on the frame: its layers with positions and sizes, cheap even for a large frame.
   Save it as `metadata.xml`. Read the group around the linked node in the same outline to find the other frames.
2. **Spec.** `node "<skill-dir>/scripts/design.mjs" spec frames/<frame>/metadata.xml --out frames/<frame>/spec.json`
   turns every text layer into a landmark: its text and its box relative to the frame. The command prints which
   reading of x and y it chose (relative to the parent, or absolute on the canvas); if the landmarks land outside
   the frame, run it again with the other one as `--coords`. A text layer the designer renamed carries its name, not
   its text: correct `text` to what the image shows.
3. **Image.** Export the frame at 2× as `reference.png` (`get_screenshot`, or `download_assets` on the remote
   server). The check takes its device scale from the image's width over the frame's.
4. **Context.** `get_design_context` on the frame; when the answer is cut short, on its children from the outline,
   one call each. Its code (React and Tailwind by default) is a source of values, not code to paste.
5. **Fonts.** For each text landmark whose style the context states, add `"font": { "size", "weight", "lineHeight" }`
   in CSS pixels. The check compares them; without them a smaller font that keeps its line height shows only in
   pixels.
6. **Components.** `get_code_connect_map`: which layers are code components, with which props. Use that component
   with those props. For a layer with no mapping, look in the UI kit (the project's own components, and
   `search_design_system` in Figma) before writing markup; what still has no match goes in `review.md`.
7. **Tokens.** `get_variable_defs` into `tokens.json`. A raw value in the context where the system has a variable is a
   gap for `review.md`.
8. **Assets.** Download every icon and image the frame uses into `assets/` and use those files; keep an SVG's own
   `viewBox`, width and height. Never draw, redraw or substitute one from an icon set, and never leave a temporary
   Figma URL in code.
9. **Comments.** `get_comments` when the file has them: states and behaviour are often written there.

## The data and the states

A frame's texts are its data. Render each frame with that data (a story per frame, or one story with arguments);
where the product's data cannot produce a text, the check cannot find it, so the gap goes to `review.md`. A frame
showing a state (an open menu, a selected row, hover) gets `setup` steps in `design.json` that put the page in that
state before it is measured.

## Without an outline

When a frame has only an image, write its spec by hand from the context's numbers, or keep `landmarks` empty: the
check then compares the root's size and the pixels only. To make a pack from an accepted implementation, for a
baseline or a test case, `design.mjs snapshot` writes each frame's spec (and, with `--images`, its reference) from
the page as it renders now.

## Limits

Figma's MCP server limits calls by seat: View, Collab and Starter seats get a few calls a month, Dev and Full seats a
rate per minute. Fetch each frame once and work from the pack.
