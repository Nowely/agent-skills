# The rules

Two requirements hold for every text: a pleasant read and truth within its world. Everything else is advice. Take it where it helps this reader; a critic should explain the reader's gain or loss, not cite a rule number as a verdict. The dated evidence and its limits live in [measurements.md](measurements.md). The [sentence rules](writing-rules.md) and [curse of knowledge](curse-of-knowledge.md) are techniques to judge against the reader, not templates to apply without judgment.

## Required of every text

### A pleasant read

A text should invite reading and be easy to take in. Shape, spacing, sentences and familiar words all contribute; a complete account of a subject does not automatically make a pleasant one. Simplify or remove a hard sentence without hiding a fact the reader needs. A model's mark can find a defect, but the owner's read decides whether this text is pleasant. This applies to a code comment as much as a README, though their useful shapes differ. See [M26](measurements.md#m26).

### True within its world

A claim should hold in the world the text describes: code for documentation, evidence for a report, and established facts within a story. Check its exact scope; a fact, feature or story rule the world has not established goes to the owner as a question rather than entering as a claim. An unsupported feature or unprepared turn in a story breaks the reader's trust. Fiction can invent within its established world; a proposed expansion of that world still needs the owner's decision. For evidence levels and guarantee words, see [truth.md](truth.md). *Owner, 2026-09-10 and 2026-09-26.*

## Advice

### Start from the context

**Know the text's world before choosing its form.** Learn what the thing is, what it resembles, who reads this text, what they need first, and the one thought it carries. Then look at strong examples of its kind before choosing a form, so a convention serves this reader rather than displacing their purpose. A routine reply needs only the relevant parts of that picture. See [M30](measurements.md#m30).

**Look at strong examples of the kind.** Nearby good texts and [genre notes](genres/) show what readers expect; use the convention as a starting point, then let this text's purpose decide where to depart. A genre with no useful precedent is a reason to investigate, not to invent a fixed section list. *Source: owner, 2026-09-12.*

### The reader

**Give each part a job for this reader.** Ask what someone with their experience learns, decides or does because it is here; remove material irrelevant to that task. This cuts speculative filler while retaining a long explanation, full deletion list or concrete example when it serves a real decision. Word count alone cannot decide. Use their terms where those terms are exact. *Owner, 2026-09-10 and 2026-09-11.*

**Meet the reader at their actual knowledge.** Explain what they lack, not what any imagined beginner might lack; equally, do not assume they know the author's internal context. Leave out facts they already know or cannot use here, while keeping a prerequisite they would otherwise miss. A text they have seen is not one they have at hand: quote what they will act on, such as a text to insert or a value to check, with its source after it. Ordinary editor use may be familiar to developers while a project's hidden configuration is not. See [curse of knowledge](curse-of-knowledge.md).

**Keep a fact when it changes a decision.** Versions, prerequisites, paths, protocol names and machine fields need space when compatibility, reproduction or the next action depends on them. Otherwise they distract from the task; that includes routine runtime and editor versions, PATH, credential files and internal paths for a reader who can already act without them. Keep a prerequisite when its absence would make the reader fail without knowing why. Avoid duplicating a changing value in prose unless the reader needs it; see [M31](measurements.md#m31).

**Use the reader's name for a thing.** A private label makes an outside reader translate; an exact public or internal term can stay when they must search or act on it, with a brief explanation at first use. A label carried from an earlier thread needs its meaning when the new reader lacks that thread. *Source: owner, 2026-09-11.*

**Comments carry what code alone cannot.** Apply the reader's task and knowledge to the edit point; the full definition and its boundaries live in [code comments](genres/code-comments.md). *P21 in `plugins/terse/research/2026-09-26-writing-replication/publication/issue-comment.md`.*

### Winning the reader

These suggestions apply to a text that introduces something and asks a reader to want or choose it, such as a README or proposal. They need not shape a status message or code comment.

**Say early what it is and what it is for.** The opening gives the reader a recognizable job for the thing, often through a comparison they understand. This prevents a definition or process tour from hiding the purpose. A story or reference page may need a different opening. *Source: owner, 2026-09-10, 2026-09-23 and 2026-09-26.*

**Show what distinguishes it.** A short list can make distinct benefits easy to scan; each item should connect a real capability to what this reader gains. Qualities any alternative could claim and a tour of later steps seldom help a choice. Use another form if the reader needs a narrative or one decisive example. See [M32](measurements.md#m32).

**Let the reader see the thing.** Real output, a demo or an image can make an unfamiliar interface tangible before installation. Use the form that fits the thing; an invented command or screenshot that no longer matches it breaks trust. *Source: owner and genre count, 2026-09-26.*

**Open with value, and place cautions where choices occur.** A problem the thing solves can invite reading, while an early inventory of mechanisms or warnings can obscure why to continue. The opening should normally establish value; a limit belongs there only when the reader must know it before the first action. See [M33](measurements.md#m33).

### Where the reader acts

**Give the usable route.** Name the action in a form the reader can follow. Choose routes by audience: one plugin command may suffice, while a tool distributed through several common package managers may need each route. Link less common paths when detail would interrupt the main action. *Source: owner, 2026-09-23 to 2026-09-26; [M30](measurements.md#m30).*

**Place detail where it earns its space.** A mechanism belongs near an action only if it changes that action; otherwise give it a later home for the reader who wants it. A dedicated “How it works” section is useful when it answers a real question, not because the genre seems to require it. *Source: owner, 2026-09-11 and 2026-09-25 to 2026-09-26.*

**Offer alternatives when there is a real choice.** Explain the meaningful options, their consequences, and the recommendation you can support; the owner still chooses. If one missing fact alone blocks progress, ask for that fact directly. This adds judgment inputs to the usable route without inventing decisions. *P16 in `plugins/terse/research/2026-09-26-writing-replication/publication/issue-comment.md`.*

**Make warnings proportionate.** Label a change by its actual effect on the affected reader and say what action it requires. A private new script with one consumer and a published interface with integrators have different consequences; a real failure can still matter to one consumer. This supplements route and detail advice where action depends on severity. *P06 in `plugins/terse/research/2026-09-26-writing-replication/publication/issue-comment.md`.*

### Form

**Format for the way the text is read.** Headings help navigation, lists help parallel points, tables help compare genuinely distinct rows, and fenced blocks help copy anything meant to be pasted, with a useful language tag when it is code. A short answer may need none of these; a table of repeated rows adds work without distinction. An enumeration of three or more items reads best as a numbered list. A table cell holds only inline text, and a chat may show `<br>` or HTML there as literal tags, so a row whose content is an enumeration keeps a short summary in its cell and its numbered list goes right below the table, not into rows of its own. *Owner, 2026-09-11, 2026-09-24 and 2026-09-29.*

### What seldom helps

**The project's own history.** Dates, measured counts and editing stories matter in a report, changelog or audit, but usually distract a new user deciding what to do. Put them where the reader needs provenance rather than in every opening. *Source: owner, 2026-09-11 and 2026-09-24.*

**A version-bound description of something current.** Describe present behavior from the present source. Pin a version when compatibility or reproducibility depends on it; otherwise a stale number makes a current text misleading. *Source: owner, 2026-09-24.*

**An invented example presented as real.** A fabricated path or command can misdirect a reader. Use a checked example or omit it in practical documentation; fiction and clearly hypothetical proposals have different worlds. The inherited 2026-09-11 provenance is limited; see [M34](measurements.md#m34).

**A qualification used as a repair.** When a sentence overstates its case, choose by the meaning this reader needs: remove the claim if it does no work, replace it with a narrower claim, or clarify it with a substantive limit, honest range or trade-off. A needed qualification is content, not an apology. Avoid a string of caveats that leaves the broad impression standing or invents false edges; link the detailed source when the reader needs that detail elsewhere. See [M23](measurements.md#m23).
