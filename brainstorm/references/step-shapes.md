# Step shapes

One question, one shape. Record which one in the step block.

## Comparison - "A or B?"

The options are given, or you derive them. One steward per option: same report template, different option.

Use when the question names its alternatives, or when the grounding makes them obvious.

Watch for: options that differ only in name. Screen the set before forking (SKILL.md 3.2).

## Feasibility - "would this be possible?"

Asymmetric. Two stewards, opposed mandates, same report template:

- **The builder** tries hardest to make it work: a path, a precedent, a library, someone who already did it. Its `Evidence against` section is where it reports the walls it hit.
- **The breaker** tries hardest to kill it: the limit, the licensing wall, the performance floor, the platform that does not support it, the version that removed it. Its `Evidence against` section argues the other way - why it might work after all.

When both sides come back weak, nobody can tell from documents whether this works. Say so and reach for `prototype` rather than picking a side; this is the question type where a confidently written report is worth least.

Watch for: a builder reporting "possible" with no implementation and no precedent. That is model knowledge, not evidence - mark it `(unverified)` and leave the step open.

## Open-ended - "is a better implementation possible?"

No options exist yet, so they have to be generated - by you, in the main thread, not by a first agent wave. Generate-then-steward is two forks per step and rebuilds the waterfall in miniature, at twice the cost, for the step type that dominates the start of a session.

1. Derive 3 candidates, each under a **different** constraint: smallest public surface, fewest moving parts, cheapest to reverse, best fit to what already exists. The same constraint twice gives the same candidate twice.
2. Include the incumbent - what the idea originally proposed, or what the code does today - as one candidate. Without it there is nothing to beat.
3. Put the set to the user, who cuts, edits and adds.
4. From there it is a comparison step.

Watch for: three candidates that are all refinements of the incumbent's shape. At least one should question the shape itself.
