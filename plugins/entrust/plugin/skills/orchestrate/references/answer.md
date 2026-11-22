# The answer

## Before it goes out

The answer names every agent that ran, or names it as dropped, with any dropped task or check, and a success
claim names the evidence behind it or says it is unverified. A verdict the verifier marked as judgement alone,
with no executed check, goes into the answer as such, and says so when its judge shares the workers' model family.
Before the answer goes out, check the run against `card.md`: every launch, every write and every dropped agent.
Your own reads stand beside the agents' tokens, and `unknown` where nothing counted them.

## A recommendation

Recommend only what an analysis stands behind. For each item the user must decide: the problem, what it costs the user, two or more options with closing it among them, what each removes or moves and who relies on it, and an outside critic's view of the recommendation. An item with no such analysis goes to the user as a question with the options known so far, never as a recommendation.

## The read

One reader reads the linted draft before it goes out, never per return; a publication (a README, a changelog, a
synthesis) is read the same way. The card decides who reads: when it ran the architecture critic, or the answer
is a publication, a fresh [final reader](roles.md#other-roles), given only the request, the draft's path and the
artifact paths; otherwise the verifier's thread, continued. Either reader:

1. re-reads the user's request verbatim;
2. tags each claim of the draft as backed by a raw artifact, by its own earlier report only, or unbacked;
3. lists each request item the draft does not answer.

It returns three lists in `result`: the claims a raw artifact backs, the claims backed only by its own earlier
report or by nothing, and the request items the draft does not answer.

Lint the draft last, then start the read with a message that names the draft's path. Fix each gap or name it
open; a changed draft is linted again and gets the second read, and no answer gets more than two. After the
second read the only change allowed is an `Open:` list appended to the draft, each item quoting a gap the reader
returned; then send it. The user receives the text that was read: a shorter message sent instead quotes it and
restates nothing, and any change after a read is a new read.
