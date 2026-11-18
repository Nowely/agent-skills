# Vendored Shiki

`shiki.mjs` is the syntax highlighter the report renders with: one self-contained ESM bundle, no network,
no WASM, no install step. It is built from the pinned **@shikijs 4.6.0** packages (MIT) with the JavaScript
regex engine (`@shikijs/engine-javascript`, pure JS), the `github-light` and `github-dark` themes, and the
languages the report highlights: typescript, tsx, javascript, jsx, scss, css, json, markdown, xml, yaml.

The report's `highlight.mjs` imports it lazily at render time (`createSyntax`), creates one highlighter per
render, tokenizes the old and the new line sequences whole, and pre-adjusts every token color to ≥4.5:1 on
the context/added/removed backgrounds of both themes. If the bundle is absent, the built-in pattern
highlighter draws the code instead; the report never reaches the network for it.

## Rebuild

In a scratch directory (not in the skill):

```sh
npm install esbuild@0.25.12 @shikijs/core@4.6.0 @shikijs/engine-javascript@4.6.0 @shikijs/langs@4.6.0 @shikijs/themes@4.6.0
```

Write `entry.mjs`:

```js
import { createHighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import githubLight from "@shikijs/themes/github-light";
import githubDark from "@shikijs/themes/github-dark";
import typescript from "@shikijs/langs/typescript";
import tsx from "@shikijs/langs/tsx";
import javascript from "@shikijs/langs/javascript";
import jsx from "@shikijs/langs/jsx";
import scss from "@shikijs/langs/scss";
import css from "@shikijs/langs/css";
import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/markdown";
import xml from "@shikijs/langs/xml";
import yaml from "@shikijs/langs/yaml";
export const themes = [githubLight, githubDark];
export const langs = [typescript, tsx, javascript, jsx, scss, css, json, markdown, xml, yaml];
export { createHighlighterCore, createJavaScriptRegexEngine };
```

Bundle and prepend the two provenance comment lines the current file carries:

```sh
./node_modules/.bin/esbuild entry.mjs --bundle --format=esm --platform=node --minify --outfile=shiki.mjs
```

A version bump is a deliberate change: rebuild, re-run `evals/review-report.test.mjs` and the browser
acceptance (the token contrast walk), and say so in the changelog.