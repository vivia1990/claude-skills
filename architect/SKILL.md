---
name: architect
description: Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills them in. Use for "/architect", "design this", "architect this", or any non-trivial work where jumping straight to code would lock in the wrong shape.
---

# Architect

Design before implementing. Sketch types, function signatures, and module boundaries with `not implemented` bodies and pseudocode, get explicit sign-off, then fill in code against the chosen sketch. If implementation proves the sketch wrong, throw it out and redesign rather than bolting fixes onto a bad shape.

Track the five phases below as a todolist before starting: Ground, Sketch, Agree, Implement, Scrap.

## Phase 1: Ground the problem

Build a real mental model of every system the new code touches before sketching anything — naming a file isn't grounding. Launch one or more `Explore` agents (via the Agent tool) to trace how the surrounding code actually works: ownership, layering, existing call patterns, what already exists that should be reused. Use "quick" breadth for a narrow, single-module question; "very thorough" for something spanning several files or subsystems.

Skip this phase only when the work is genuinely greenfield with no surrounding system to integrate against.

## Phase 2: Sketch — at least two structurally distinct candidates

Never synthesize from a single attempt. Dispatch 2 candidates in parallel (single message, two Agent tool calls, `subagent_type: "Plan"` or `"general-purpose"`), each seeded with the Phase 1 grounding and told to produce a full candidate design package: usage sketch, type sketch, function signatures, module map, and a short rationale shaped per `references/rationale-template.md`.

The two candidates must be **structurally distinct** — whole-shape alternatives, not point fixes inside one shape. Force real divergence: give each agent a different design constraint or philosophy to optimize for (e.g. one for the smallest possible public surface, one for the fewest new types; or one favoring composition, one favoring a single owning object) rather than the same prompt twice — two runs of the same prompt tend to converge on the same shape and defeat the point of exploring. If genuine model diversity would sharpen the contrast further, override `model` on one of the two calls (e.g. `"opus"` on one, leave the other default); use judgment, don't force it when the philosophy split already produces distinct designs.

Each runner should apply this discipline, drawn from what actually matters when comparing candidates:

- Usage first. Write the caller's usage (a short README-style sketch plus two or three real call sites) before the types, then derive the type sketch from it. The usage is the spec — when they disagree, fix the types, not the usage.
- Data structures first — trace each dominant access pattern through the proposed structure. If the answer is "we'll add a map / index / cache later," the structure is wrong.
- Interface depth — prefer hiding more complexity behind a smaller public surface, even when the implementation itself gets less simple. Never put transport/wire types on the public API; parse into domain types behind the interface.
- Make boundaries visible: `not implemented` for bodies, `// TODO` pseudocode for tricky logic, doc comments stating intent and invariants — a reader should be able to trace data from input to output from types and signatures alone.
- Encode invariants in types where possible; validate at boundaries and trust types inside.
- Short call chains — if tracing a flow needs more than three files, flatten it.
- Don't hedge toward a safe middle ground — the differences between the two candidates are the signal used to pick a base and graft.

**Screen every candidate** against `references/design-red-flags.md` before synthesis: shallow modules, information leakage, temporal decomposition, pass-through methods. Reject or revise anything that trips a red flag.

**Synthesize one design** yourself: read both candidates end to end, pick the stronger as the base (the one a future maintainer could extend most easily without breaking invariants — prefer the cleaner boundary when two feel tied), then walk the losing candidate once more for one or two ideas worth grafting in by hand. Don't paste mechanically — the result has to hold together under one mental model. If the two candidates converge on the same shape, that's a strong signal on its own; ship the consensus shape with no graft needed. Record the pick and grafts in the rationale's "Synthesis decision" section.

## Phase 3: Agree

Surface the synthesized design to the user and pause for explicit sign-off before implementing. This is a real checkpoint, not a formality — wait for the response.

If the human pushes back on the shape, treat that as Phase 1 evidence: re-ground and re-sketch before writing more code, rather than patching the disagreement away.

## Phase 4: Implement against the sketch

Replace `not implemented` bodies and pseudocode with real code and logic. The synthesized sketch is the contract.

Deviations from the sketch are signal worth surfacing, not friction to silently absorb. If a function needs a parameter the sketch didn't anticipate, say so and ask whether the sketch was wrong, a requirement was missed, or the implementation is overreaching.

## Phase 5: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out — don't bolt fixes onto a wrong design. The signal is a *pattern*, not a single instance:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types needing escape hatches (`any`, casts, optional fields always set in practice) to compile.
- A "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.

A few edge cases don't condemn an architecture — use judgment; some problems are legitimately complex, and complexity in the data isn't complexity in the design.

When scrapping: re-run Phase 1 over what's been built, redesign as if the new constraints had been day-one assumptions, subtract before adding (the new sketch should start smaller than the old one), then return to Phase 2.

## Outputs

Write the caller's usage first, derive the type sketch from it. One file with new types and signatures for a small change; a module map plus type definitions for larger work. Ship the rationale alongside, per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
