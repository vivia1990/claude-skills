<!-- contract: e2e-workflow v1 -->
<!--
Purpose: one user workflow to cover with end-to-end tests.
Lifecycle: grilled. No `ready` label means this issue still needs grilling: the griller shapes it with the user and adds `ready` only when every item of the Ready checklist is ticked. If this issue should be split, merged or renamed, the griller comments on it and doesn't add `ready`; a person decides.
Writing: headings stay as they are, in this order.
Questions: Open questions are answered by the user.
Labels: the opener applies `e2e`.
Implementer: write tests for this workflow only, using the shared fixtures from the setup issue; shared test code belongs to the setup issue.
-->

## Workflow
<!-- opener only: name · role · rank, then one line on what the user achieves -->

## Preconditions and fixtures
<!-- griller refines: the state the tests need, by fixture name. Every fixture is defined in the setup issue -->

## Test cases
<!-- griller refines: - [ ] **TC1 — <name>** (happy path | edge | error), with numbered steps under it, each one action → what the user sees. No selectors or framework code. The implementer ticks each case when a test covers it. -->

## Out of scope
<!-- griller refines: what these tests deliberately don't cover, and why -->

## Source references
<!-- opener only: the files that prove this workflow exists, with paths -->

## Open questions
<!-- griller resolves: only what the code can't answer. Answer inline and tick: - [x] <question> — **A:** <answer>. The griller may add questions; any unticked one blocks `ready`. -->

## How to run locally
<!-- griller refines: the command that runs only this workflow's tests -->

## Ready checklist
<!-- griller ticks these, then adds `ready` -->

- [ ] Every open question is answered inline
- [ ] Every test case has numbered steps, each with what the user sees
- [ ] The happy path and every edge and error case the code handles are covered, or listed in Out of scope
- [ ] Every fixture used is defined in the setup issue
- [ ] Nothing is left as TBD or a placeholder outside Open questions

## Acceptance criteria
<!-- implementer ticks these -->

- [ ] The issue had the `ready` label when work started
- [ ] Every test case above is covered by an automated e2e test
- [ ] Every step's assertion is checked, not only the final result
- [ ] Tests use the shared fixtures from the setup issue; none are re-implemented
- [ ] PR merged with CI green
