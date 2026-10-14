---
name: brainstorm
description: Work an idea into a decision before any code shape exists. Takes a prompt or a document describing something to build, plus its open questions, and works them one at a time - each step forks parallel sub-agents that each steward one option and must report the evidence against it, then the user decides. Every decision and the assumptions it rests on land in a durable log. Ends by handing the chosen direction to `architect`, `plan-to-issues` or `prototype`. Run only through "/brainstorm <input>".
disable-model-invocation: true
---

# Brainstorm

Work an idea into a decision, one question at a time. Each step: one blocking question, at most three genuinely different options, one parallel sub-agent stewarding each, one decision by the user. No waterfall - every decision reshapes the queue before the next step is chosen.

This skill decides **what** and **whether**. It never decides the code's shape (`architect` does) and never implements (`run-issues` does).

Usage: `/brainstorm <input> [--max <N>] [--steps <N>]`

- `<input>` is a path to an idea document, a path to an existing brainstorm log (which resumes it), or text pasted into the conversation.
- `--max <N>` runs at most N stewards at once. Default 3.
- `--steps <N>` overrides the step budget. Default 8.

You keep the loop, the queue and the synthesis. Sub-agents only explore. Never delegate the synthesis or the decision framing: that is what the user reads at the moment they commit.

Track the phases below as a todolist before starting: Restate, Ground, Queue, Steps, Finish.

## 0. Restate the idea

Read the input. If it is a file holding a `<!-- brainstorm:` marker, go to **Resuming**.

Then write back, and wait:

- one paragraph: the idea as you understood it,
- what you believe is **out of scope**,
- the open questions already visible in the input, unranked,
- the slug and the log path (`docs/brainstorms/<slug>.md`), asking once for permission to create it.

Create `docs/brainstorms/` if it is missing. Outside a repo, or with no `docs/`, write under the working directory and say which. After this one approval, append to the log freely without asking again. Never run `git add` or `git commit`: committing is the user's.

If the input describes several loosely related ideas, say so and ask which one this session is about. The others need their own session - one log, one tree, one handoff.

Write the artifacts in the language the input is written in; for a pasted prompt, the language of the conversation.

## 1. Ground

**Detect the evidence rung by trying, never by assuming.** It differs per machine and per agent:

1. `WebSearch` works -> **rung 1**. Stewards search and fetch freely.
2. No `WebSearch`, but `WebFetch` or `curl` reaches the network -> **rung 2**. For each question, tell the user what kind of source would settle it ("the framework's migration guide", "issues on repo X about Y") and ask for URLs. Stewards read what is supplied. Be specific about the source needed, or the user is guessing what to paste.
3. No network -> **rung 3**. Codebase and model knowledge only. Every claim not backed by a file path is marked `(unverified)`, in the reports and in the log.

Record the rung in the log header.

Then launch `Explore` agents in parallel over whatever exists:

- **the code** this idea would touch: what is already there, what constrains it, what already does part of it;
- **prior decisions**: `docs/brainstorms/`, `docs/plans/`, `docs/adr/`, `docs/decisions/`, `CONTEXT.md`, `GLOSSARY.md`, `README`;
- **related issues**, when `.plan-to-issues.yml` exists or a forge CLI is already logged in. Detect the forge as `plan-to-issues` step 1 does and use only the commands in its `references/`. Skip silently when neither holds - never make this a hard dependency.

Skip only what does not exist. Greenfield still gets the prior-decision sweep.

**If grounding finds the question already decided, stop and show it before anything else.** Re-deciding something settled months ago is the most expensive way this skill can fail.

## 2. Build the question queue

Turn the idea and its open questions into a design tree. Rank the questions by how much each blocks the rest.

Call the Skill tool with `grilling` to shape the queue with the user: which questions are real, which are already answered, what is missing, in what order. What comes out is the session's spine.

Write the queue into the log. **No sub-agent runs before the user has approved it** - forking four agents at the wrong question is this skill's most expensive single mistake.

## 3. Run a step

One step = one question. Repeat until the user stops or the budget runs out.

### 3.1 Pick the shape

Read `references/step-shapes.md` and pick **comparison**, **feasibility** or **open-ended**. Record which in the step block.

### 3.2 Put up the options

At most 3 (`--max`). Screen them before forking: *are these genuinely different, or three flavours of one shape?* Three near-identical options is the most expensive way to learn nothing - the reports come back subtly different, the user picks one, and the option that mattered was never explored. When deriving candidates yourself, derive each under a **different** constraint (smallest public surface, fewest moving parts, cheapest to reverse, best fit to what exists); the same constraint twice gives the same candidate twice.

"Do nothing / not yet" is never a steward. It is always on the table and you argue it yourself in the synthesis - a skill that can only produce decisions will manufacture them.

Show the option set and wait. The user cuts, edits, adds.

### 3.3 Fork the stewards

One `general-purpose` sub-agent per option, in parallel, at most `--max` at once. If your agent cannot run sub-agents in parallel, run them one after another. Sonnet at high effort is the default; raise it when the evidence is subtle.

Give each **pointers, not copies**: the question, its one option, the grounding findings as paths, the rung and what it may use, and `references/exploration-report.md`, which it fills as written - counter-evidence section included.

Each steward **stewards** its option: researches it as well as it can and reports honestly, *including what it found against it*. It is not an advocate. Send back once any report whose counter-evidence section is empty or hedged.

When only an experiment can settle the question, ask the user, then call the Skill tool with `prototype`. Throwaway code goes in the scratchpad, never into the repo.

### 3.4 Synthesize

Yourself, in this thread. Never delegate it: a sub-agent summarising sub-agent reports hands the user a summary of a summary at the moment of commitment.

Read every report end to end. Then write, in the round format of `grilling`: the question, each option with its decisive evidence and its strongest counter-evidence, the "do nothing" case, and your recommendation with the reason.

### 3.5 Decide

Wait. The decision is the user's.

If they want it pushed harder, call the Skill tool with `grilling` on that one question and bring the outcome back here.

A step may end without a decision. Name which:

- **converged** - the stewards reached the same answer. A strong signal, not a failure: record it and move fast.
- **needs an experiment** - back to `prototype` (3.3).
- **needs the user** - a fact, a constraint, a URL at rung 2. Ask, and hold the step open.
- **deferred** - record a **reopen trigger**. Deferral without one is dropping the question; do not accept it.

### 3.6 Record, then check back

Append the step block to the log: shape, options, decision, *why not the others* (a line or two each, "do nothing" included), and **what the decision rests on** - the assumptions, each marked `(unverified)` where nothing checked it. Append the full reports to the appendix. Rewrite the Remaining queue.

Then check this step's evidence against every assumption already written down. If it contradicts one, **stop and propose reopening that decision.** Never pass a contradiction quietly: early decisions becoming unquestionable is what a waterfall actually is.

Recompute the queue - a decision usually spawns the questions hanging off it - and print one line:

> Step 3 of 8 - 3 stewards - rung 1 - 5 questions left

Then ask: **continue / stop here / reshape the queue**. At the budget, stop and ask rather than rolling on.

## 4. Finish

Write the outcome into the log, then map it to one next command and **print it, never call it**. These sessions are long; the next one wants a fresh context.

| Outcome | Next |
| --- | --- |
| Build it, shape still open | `/architect <plan>` |
| Build it, splittable into issues | `/plan-to-issues docs/plans/<slug>.md` |
| Feasibility is still the open question | `/prototype` |
| Do not build it | none - the log is the deliverable |

Write `docs/plans/<slug>.md` **only** when the outcome is to build something, in the shape `plan-to-issues` step 3 reads (`## Issue:` headings, `Type:`, `Labels:`, dependencies). It carries the decisions, never the rejected options - those stay in the log, which `plan-to-issues` must not read as scope.

Finish with: where the log is, what was decided, what was deferred and under which trigger, and the next command. Suggest clearing the context first.

## Resuming

`<input>` is a file holding `<!-- brainstorm: <slug> v1 -->`:

1. Read it whole, appendix included.
2. Re-detect the rung - it may have changed since.
3. Re-ground cheaply over the code the recorded decisions touch.
4. Check every recorded assumption against what you now find. Contradictions become reopen proposals (3.6).
5. Show the reconstructed state - decided, deferred with triggers, remaining queue, proposed reopens - and wait.

Spend nothing before the user has confirmed the reconstruction. The gap between sessions is exactly when assumptions rot.
