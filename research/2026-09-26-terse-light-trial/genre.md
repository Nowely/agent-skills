<!-- Codex Sol G1, genre scout; 2.6 min; 306217 tokens -->

Codex Sol G1: complete — 8 documents counted.

Corpus: [bat](fetched/bat.md), [bottom](fetched/bottom.md), [dua-cli](fetched/dua-cli.md), [eza](fetched/eza.md), [fd](fetched/fd.md), [gdu](fetched/gdu.md), [procs](fetched/procs.md), [ripgrep](fetched/ripgrep.md).

| Place from top | What the genre puts there | Prevalence | Formatting there |
|---|---|---:|---|
| 1. Masthead | Name, category, and the familiar command being replaced or improved | 8 of 8 | Five Markdown titles, one setext title, one HTML `<h1>`, and one bold-name lead-in; usually followed by a one-paragraph tagline |
| 2. Trust strip | Build, release, package-registry, license, or packaging-status badges | 8 of 8 | Linked badge images, commonly centered or placed immediately below the title |
| 3. Orientation | Jump links or a table of contents | 5 of 8 | Three headed bullet lists; two compact inline-link rows separated by bullets |
| 4. Visual proof | Screenshot, animated demo, or terminal recording | 7 of 8 | Markdown images, linked asciinema cards, or centered HTML `<img>` elements |
| 5. Value case | Features, better defaults, speed, platform reach, or comparison with the incumbent | 8 of 8 | Bullet lists in 4; small feature headings with images in 1; prose in 2; benchmark tables in 1 |
| 6. Installation | Package-manager choices, binaries, source builds, and supported platforms | 8 of 8 | A dedicated heading in all 8; OS/package subheadings, bold package-manager lead-ins, and fenced or indented command blocks. It precedes detailed usage in 5 of 8 |
| 7. First use | Minimal invocation followed by representative tasks | 8 of 8 | Short explanatory paragraphs plus fenced/indented commands; screenshots often follow commands. Long option dumps are deferred or collapsed where the README is disciplined |
| 8. Depth | Configuration, customization, integrations, modes, themes, or shell completion | 7 of 8 | Second-level headings, task-oriented subheadings, lists, config-file fences, and occasional `<details>` disclosure |
| 9. Objections and failure modes | Troubleshooting, limitations, installation notes, or reasons not to use the tool | 7 of 8 | Question-style headings, warning prose, bullet lists, and corrective command blocks |
| 10. Evidence and alternatives | Benchmarks, explicit comparisons, related tools, or competing programs | 6 of 8 | Tables for measured comparisons; headings and lists for alternatives; bold cells highlight winners |
| 11. Project tail | Building, tests, contributing, maintainers, security, translations, acknowledgements, or license | 7 of 8 | Mostly headings and link lists, with fenced build/test commands |

### Openings and quick starts

The strongest openings are [fd](fetched/fd.md:1), [dua-cli](fetched/dua-cli.md:1), and [gdu](fetched/gdu.md:1). Within roughly 150 words they:

- Say what the program is in one sentence.
- Anchor it against a command users already know: `find`, `du`, `rm`, `ps`, `ls`, or `cat`.
- Name a concrete advantage—parallelism, sensible defaults, SSD throughput, richer output—not a generic claim of being “better.”
- Show either the primary invocation or a visual result.
- Move toward installation before explaining internals.

The best true quick starts are `dua i` in [dua-cli](fetched/dua-cli.md:5) and the download/install block near the top of [gdu](fetched/gdu.md:21): each gives the reader an executable next action before documentation branches multiply.

[bat](fetched/bat.md:1) and [bottom](fetched/bottom.md:1) make a stronger visual promise, but reach the first runnable command later. [ripgrep](fetched/ripgrep.md:1) spends its opening on precise behavior and documentation routes; [procs](fetched/procs.md:1) uses feature and platform lists. [eza](fetched/eza.md:22) demonstrates the main failure mode: sponsorship and badge material delay the product explanation.

The reusable pattern is: **name and familiar comparison → one differentiating sentence → one command or screenshot → three to seven feature bullets → installation**.
