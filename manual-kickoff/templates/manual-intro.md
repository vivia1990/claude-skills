<!-- contract: manual-intro v1
The introduction of the user manual: what the product is, how to get access, the roles and the glossary.
Lifecycle: no `ready` label means this issue still needs grilling. The griller shapes it with the user and adds `ready` only when every item of the Ready checklist is ticked. A writer starts only on a `ready` issue.
Ownership: the planner drafted every section from the source code. Sections marked "planner only" are never changed by the griller. If this issue should be split, merged or renamed, the griller comments on it and doesn't add `ready`; a person decides.
Headings are the contract: keep them in English and in this order. The content is written in the manual's language.
-->

## Summary
<!-- griller refines: one paragraph on what this introduction tells the reader -->

## Product overview
<!-- griller refines: what the product is for and who uses it, in the reader's terms, not the developers' -->

## Getting access
<!-- griller refines: how a user gets an account, logs in for the first time and gets back in when locked out -->

## Roles
<!-- griller refines: table of role, what it can do, and the chapters written for it -->

## Glossary
<!-- griller refines: the domain terms the reader meets in the UI, spelled as the UI shows them, each with a one-line meaning -->

## Output file
<!-- planner only: docs/manual/00-intro.md -->

## Source references
<!-- planner only: the files the overview, roles and glossary come from, with paths -->

## Open questions
<!-- griller resolves: only what the code can't answer. Answer inline and tick: - [x] <question> — **A:** <answer>. The griller may add questions; any unticked one blocks `ready`. -->

## Ready checklist
<!-- the griller ticks these, then adds `ready` -->

- [ ] Every open question is answered inline
- [ ] Every role and every chapter of the manual appears in Roles
- [ ] Every glossary term is spelled exactly as the UI shows it
- [ ] Nothing is left as TBD or a placeholder outside Open questions

## Acceptance criteria
<!-- for the writer -->

- [ ] The issue had the `ready` label when work started
- [ ] Only the output file above is added or changed
- [ ] Written in the manual's language, following `docs/manual/STYLE.md`
- [ ] Every role in Roles names its chapters
- [ ] The manual builds; PR merged with CI green
