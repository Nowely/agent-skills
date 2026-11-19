# Audit of the report page before the redesign

The page rendered by `report.mjs render` at `4ad9147` (0.42.0 plus #104), on two records:
- a real review of `cb5a409`: 86 blocks, 35 files;
- a synthetic record over the #102 diff: 274 blocks, 31 files, a 646 KB diff.

Chromium at 1440×900, light and dark. Counts come from a script that walked each tab.

## The owner's complaint

The design and the experience are not pleasant. A diff of any size should be easy to inspect in one consistent interface. The owner named three places:
- Decisions has sub-tabs; maybe other tabs need them too.
- The Code tab's filtering and file tree are inconvenient.
- In Overview it is unclear how to use the SVG tiles.

## Findings

The main problem is how the page is organised, not how it looks. The same blocks are grouped six ways:
- files;
- units;
- mechanisms;
- requirements;
- findings and questions;
- file purpose.

The Code tab exposes all of them at once as filters. The five tabs mix purposes, and each tab is built differently.

- **Overview.**
  - A long verdict paragraph comes first. Then a «who uses whom» SVG graph of 12 unit tiles: their text is cut with «…» and the arrows cross.
  - A tile links to its unit's first block, but nothing shows that it is a link.
  - A table with the same units follows, then mechanisms, a seventh view of the same blocks.
  - On the large record the graph becomes a tangle.
- **Choices.**
  - Its sub-tabs (All, Decisions, Findings, Ideas, Facts · checks, Deferred, Done) are the page's best element.
  - The cards use about 800 of 1440 px, and the right half stays empty.
  - A finding and its code are never side by side: the code is behind «Related code».
  - A decision without variants shows buttons named like statuses («Accepted» / «Deferred»).
  - One question carries 21 B-chips.
  - Each card has its own «Comment» disclosure.
- **Code.**
  - About 22 controls in six rows come before the first code line: two rows labelled «Show:», «Files: N» on each purpose button, and a separate «↑ Top».
  - The tree is about 260 px wide and cuts names in the middle (`review-an…rowser.mjs`).
  - The finding under a fix block is bare text.
  - There is no way to jump to the next open item.
- **Checks.**
  - The requirements table carries clouds of 20–30 B-chips.
  - The requirement status, the main signal of whether the change did its job, lives here rather than in the overview.
- **Materials.** It mixes four things:
  - the coverage paragraph, which is also a trust signal;
  - the print buttons;
  - «Clear all decisions»;
  - an empty «Comments on passages» heading.

## Direction approved by the owner

1. **Four tabs with one logic:**
   - Summary: verdict, requirement status, coverage limits;
   - Decisions;
   - Code;
   - Details: structure, mechanisms, checks by hand, challenges, coverage and report details, under the same sub-tab control.
2. **One frame on every tab:** a main column and a side panel with the context of the selection.
   - In Decisions, the panel shows the card's code.
   - In Code, it shows the decision for the selected block.
3. **Code is a continuous diff, like a PR's Files view.**
   - One toolbar row.
   - Kept code folds.
   - A block that needs a decision is framed, with its decision in the margin, sharing state with Decisions.
   - j/k move between open items.
4. **A units table replaces the graph,** which stays only as an optional interactive view.
5. **One component vocabulary:**
   - segmented controls for modes;
   - chips only for links;
   - tags only for statuses;
   - verbs on buttons.
6. **«Other — your own answer» replaces the separate comment field** (the owner: a comment on a decision is really its «other» option). Line comments are placed by clicking a line number. The free «select any text and comment» mechanism is left out of the prototype, so the owner can judge whether it is missed.
