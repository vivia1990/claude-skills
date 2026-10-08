<!-- contract: bug v1 -->
<!--
Purpose: one bug from a plan, small enough to fix and merge on its own.
Lifecycle: grilled. No `ready` label means this issue still needs grilling: the griller shapes it with the user and adds `ready` only when every item of the Ready checklist is ticked. If this issue should be split, merged or renamed, the griller comments on it and doesn't add `ready`; a person decides.
Questions: Open questions are answered by the user.
Implementer: fix this bug only; write the test that reproduces it before the fix.
-->

## Summary
<!-- griller refines: what is wrong, and for whom, in one or two lines -->

## Steps to reproduce
<!-- griller refines: numbered, from a clean state; each step is one action, then what happens -->

## Expected behaviour
<!-- griller refines: what must happen instead; what, not how to fix it -->

## Actual behaviour
<!-- griller refines: what happens today, with the exact message or output -->

## Open questions
<!-- griller resolves: only what the code can't answer. Answer inline and tick: - [x] <question> — **A:** <answer>. The griller may add questions; any unticked one blocks `ready`. -->

## Ready checklist
<!-- griller ticks these, then adds `ready` -->

- [ ] Every open question is answered inline
- [ ] The steps reproduce the bug from a clean state
- [ ] Expected behaviour says what must be true after the fix

## Acceptance criteria
<!-- implementer ticks these -->

- [ ] The issue had the `ready` label when work started
- [ ] A test reproduces the bug and passes after the fix
- [ ] PR merged with CI green
