---
name: blast-radius
description: Find what a change could break somewhere else before it ships, beyond the diff, and prove the one fact it's safe because of by running real code instead of writing it up. Use for "blast radius of X", "what could this break", or before merging a change you don't fully trust yet.
---

# Blast radius

Find what a change breaks somewhere else, before it ships.

Listing the callers is not the job — that's a grep away. The job is the breakage grep won't show you.

## Don't trust your own writeup

A blast-radius writeup that sounds right is worthless: it reads as convincing whether or not it's true. Don't hand back a writeup on its own. Find the one or two facts the whole thing depends on and prove them by running code.

### How sure are you

For each fact the change's safety depends on, get it as far down this list as is cheap, and say where it stopped:

1. You said so. Worthless on its own.
2. You pointed at the line. A real `file:line`, or the library's own source.
3. You showed the bad case can't happen. You walked the failure step by step and it doesn't reach.
4. You ran it. A script or test that calls the real code and fails loud if you're wrong.
5. You reproduced it in the running app.

Step 4 is usually one small script that imports the same code the app ships and calls the exact function you're worried about. Don't skip straight to claiming rung 3 or higher without actually doing the walk-through or the run — a plausible-sounding rung-1 claim dressed up as rung-3 prose is exactly the failure mode this skill exists to catch.

## Steps

1. Read the change: the diff, the symbols it adds, changes, and deletes, and what it now does differently — including the part the diff doesn't spell out. Pull the originating PR/commit description and any linked issue with `git log`/`gh`/`glab` for context on intent.
2. Find the one fact it's safe because of. Most changes that look risky are safe because of a single fact, like "this call only drops already-dead cache entries and does nothing else." Find that fact. If it holds, most risky cases are cleared at once. Spend your time here, not on a long list of maybes.
3. Look where grep stops. Read the source of the library you call, check its pinned version and any local patch. Work out when things actually run (init order, teardown, async callbacks, signal handlers). Follow what a symbol search misses: the JSON an API returns, a DB column, a wire format, another process or language reading the same bytes, a config flag, code three hops downstream.
4. Be honest about each risk. Give it a real chance of happening and a real cost if it does. Keep the risks you confirmed. List the ones you checked and cleared separately. Cite a real `file:line` — a search that finds nothing is still an answer, and never invent a caller or an API that doesn't exist.
5. Prove the one fact. Write a script or test that runs the real code, run it, and paste what happened.
6. For a change that's big or touches many call sites, consider forking a few parallel subagents (`subagent_type: fork`) to each independently chase a different branch of the blast radius, then merge what they find — different investigation paths catch different real bugs.

## What to hand back

- **What it does.** What changed, including the part that isn't obvious.
- **The one fact it's safe because of.** State it, say which rung you got it to, and show the proof. If you couldn't prove it, write "unproven."
- **Risks.** Each names how it breaks, the `file:line`, how likely and how bad, and how to check. Paste the proof for the ones that matter.
- **Cleared.** What you checked and why it's fine.
- **Before you merge.** The cheapest test or repro that catches the real bug, including the script you wrote.

Write the report in plain, direct language: no AI-vocabulary hedging ("delve," "crucial," "showcase"), no em dashes standing in for periods or commas, no passive voice hiding the actor ("queries are validated" → "the compiler validates queries"), no meta-commentary about what you're about to do, no chatbot filler ("I hope this helps!"). State the fact or cut the sentence. Cite real code, and strip anything private before this goes anywhere public.

**Reply:** the writeup above, with the one safety fact either proven or marked unproven.
