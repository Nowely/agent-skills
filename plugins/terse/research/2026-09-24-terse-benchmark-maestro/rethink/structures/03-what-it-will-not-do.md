# Structure 03 — What it will not do

This reading takes the reader's first need as reassurance, not persuasion: before a route or a command, they need to know what Maestro reads, writes, where, and whether it asks first.
It therefore gives that disclosure its own early section, in the slot the genre usually spends on "how it works" or "why this, not that."
It leaves out a methodology narrative and a feature tour that another reading — selling capability before disclosing footprint — would keep near the top.

> This README is Maestro's front door on GitHub. It is the one page that covers the whole project: 25 skills (one core skill, 24 slash commands and 7 reference files) and the three ways to give them to an AI coding agent: the skill files themselves, the VS Code extension, and the MCP server. After reading it, a developer must be able to:
>
> - tell whether Maestro fits their tool and their problem
> - install it by the route that fits
> - run `/teach-maestro` once, then a first command such as `/diagnose`
> - find the command for their next problem in the command table
>
> It links to the Marketplace page, the npm page and maestroskills.dev for depth rather than repeating them. It tells contributors that `source/skills/` is the only place to edit ("Source of truth: source/skills/", `scripts/build.js:4`).
>
> — purpose.md §1, verbatim

## Structure

| # | Section | Purpose | Excludes | Device & sub-blocks | Budget | Rests on |
|---|---|---|---|---|---|---|
| 1 | Maestro | Name the product and its true counts; give a wary reader four anchors up front. | Feature pitches, sponsor content, stale counts. | H1+tagline; banner; 1 live badge row (VS Code Marketplace, Open VSX, npm); 1-line identity; 1-line count; 1-line nav, 4 anchors. No sub-heading. | 120w | D01, D02; answers-02 §9 (overrides D12); D13 + 1 anchor; purpose §1 |
| 2 | What it will not do | Show what Maestro reads, writes, where, and whether it asks — before any route. | Persuasion; unevidenced claims (no telemetry/network line); route commands (→ §4). | 1 table, 7 rows: Action / What / Where / Asks first?. One block. | 165w | New heading+placement; content = D26–28 (fmt D19). Default (terms.md headings-check) scatters it: D26 @ §4, D27 @ §7, D28 @ §4. Consolidated since purpose §2's reader "have not picked an install route yet" (purpose §1 cap.1). Fills the genre's pre-setup rationale slot (s1.md slice1 place2, 4/7 G1). |
| 3 | Choose how to install | Match an undecided reader's need to a route, in one glance. | Install commands (→ §4); write-effects (→ §2). | 1 table, 3 rows: Need / Route / Prerequisite / First step. | 75w | D03; purpose §1 cap.1–2, §2; heading per terms.md (conditional) |
| 4 | Installation | Make each route actionable: its command or click-path, then its result. | Write-effects (→ §2); MCP HTTP command (linked, answers-02 §8). | 3×H3 — "Skill files" / "VS Code extension" / "MCP server" — each: prerequisite, command, result, pointer to §2. | 180w | D04, D05; purpose §1 cap.2; answers-01 §5.3, §5.6; answers-02 §1, §8, §11d; heading per terms.md |
| 5 | Usage | Carry every route's reader to one observable first result. | Per-client MCP invocation differences (unverified). | 2-step numbered list; 1 fenced example (`/teach-maestro` then `/diagnose`); 1-line output. | 70w | D06; purpose §1 cap.3; answers-01 §5.4; answers-02 §11b–c; heading per terms.md (conditional) |
| 6 | Commands | Let both reader groups find the command for their problem. | Model-facing "Use when…" text; a category-bullet substitute (D08 rejects). | 1 table, 24 rows, grouped by a Group column in the owner's order. No per-group heading. | 300w | D07; D08 rejects the alternative; answers-02 §2; heading "Commands" per terms.md ("never with a number in it") |
| 7 | Session memory | Name the capture-recap-reflect loop as the headline capability, without repeating §2. | Cost/audit mechanics (in §2); a dated-changelog framing (D29 rejects). | 1-line loop; 1-line pointer to §2. No table. | 65w | D15; answers-01 §5.5; terms.md row 34 (rename); heading is terms.md's own recorded departure |
| 8 | Documentation | Point to the channel pages and the site for depth, unduplicated. | Content that belongs on those pages (D10). | Labeled link list, 4 items. | 35w | D10; purpose §1 |
| 9 | Support and contributing | Name the edit boundary and the check to run; tell a stuck reader where to go. | Invented Code of Conduct / PR template (none in the snapshot). | Paragraph, 2–3 sentences; 1 issues link. Combined heading. | 65w | D16, D17; answers-02 §5, §7; spec-kit's phrase, matching terms.md's suggestion |
| 10 | License | Answer reuse rights in one line. | A guessed license name (link only). | 1 sentence + 1 link. | 12w | D18; answers-02 §6 |

**Total budget: 1,087 words across 10 sections (1 H1, 9 H2, 3 H3).**

§2's 7 rows, briefly: context file (reads every run; written once by the `/teach-maestro` interview — the one place Maestro asks first); skills sync + MCP config entry (write on activation, all ten skills folders regardless of which tool you have, no prompt); Zero-Defect's rules (write into `CLAUDE.md`/`.cursorrules`/`.agents/rules/` on toggle, no prompt); session data (writes to `.maestro/`, gitignored unless you opt in); MCP waves (server memory only); cost/token figures (always `~`, never metered).

## Genre sections this drops

| Dropped kind | Count | Top usage weight | Reader loses | Cheaper because |
|---|---|---|---|---|
| Sponsor / commercial-services aside | 3/7 G1 | Superpowers, 290,955★ | A commercial-support contact | No paid tier to disclose; the slot instead carries §2 |
| Full manual Table of Contents | 2/7 G1 | Superpowers, 290,955★ | A jump to an arbitrary heading | GitHub auto-generates one; §1's nav covers the required jumps at 15 words |
| "How it works" / Philosophy narrative | 4/7 G1 (rationale slot); 1/3 E | Superpowers, 290,955★ | A prose account of the method | D21 rejects it; unverifiable narrative persuades a skeptical reader less per word than §2's facts |
| Feature / configuration reference | 3/7 G1 | Spec Kit, 138,668★ | An in-page flags/options reference | D10: link maestroskills.dev for depth; repeating it doubles the page for route-undecided readers |
| Star history / social proof | 3/7 G1 | Spec Kit, 138,668★ | A stars-over-time chart | Zero words toward any of the 4 purpose capabilities (D23) |
| Updating / Uninstalling | 1/7 G1, but the set's most-used document | Superpowers, 290,955★ | A named place for "how do I upgrade" | No verified update semantics for any route (D22); each route's own clause fits inside §4 |
