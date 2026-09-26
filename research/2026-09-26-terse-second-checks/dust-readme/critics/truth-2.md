<!-- truth-2; 3.6 min; 488373 tokens; exit 0 -->

Codex Sol T2: complete — 3 sentences found refuted or overstated.

- Line 65 — Refuted: “Keep only paths that match a regular expression.”  
  Evidence (level 2): `dust/src/dir_walker.rs:248-254` applies the regular expression only to files; directories are still traversed at `:364-381` and retained as tree context.  
  Plainest true sentence: “Keep files whose paths match a regular expression, with parent directories retained for context.”

- Line 69 — Refuted: “Combine these controls as needed: `dust -D -d 2 -n 50` shows up to 50 directories within two levels.”  
  Evidence (level 2): `dust/src/filter.rs:75-83` counts up to 50 selected descendants, while `:136-145` adds them beneath the starting directory, which is displayed separately. The output can therefore contain the starting directory plus 50 subdirectories.  
  Plainest true sentence: “Combine these controls as needed: `dust -D -d 2 -n 50` shows the starting directory and up to 50 subdirectories, at most two levels deep.”

- Line 82 — Overstated: “See the [sample config](config/config.toml) for the available keys, including full paths, apparent size, colors, bars, output units, and collapsed directories.”  
  Evidence (level 2): `dust/config/config.toml:6-36` contains examples, not all supported keys; `dust/src/config.rs:16-44` defines additional keys absent from the sample, including `screen-reader`, `only-dir`, `only-file`, and `output-json`.  
  Plainest true sentence: “See the [sample config](config/config.toml) for examples of supported keys, including full paths, apparent size, colors, bars, output units, and collapsed directories.”
