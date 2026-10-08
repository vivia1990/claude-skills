<!-- contract: manual-workflow v1 -->
<!--
Purpose: one workflow of the user manual. An "Other tasks" issue holds several minor workflows: each section below is split into one part per workflow.
Lifecycle: grilled. No `ready` label means this issue still needs grilling: the griller shapes it with the user and adds `ready` only when every item of the Ready checklist is ticked. If this issue should be split, merged or renamed, the griller comments on it and doesn't add `ready`; a person decides.
Writing: headings stay in English, as they are, in this order. The content is written in the manual's language.
Questions: Open questions are answered by the user.
Labels: the opener applies `manual`.
Implementer: change only the output file below, this workflow's capture scenario and its screenshots, following `docs/manual/STYLE.md`.
-->

## Workflow
<!-- opener only: name · chapter · role · rank, then one line on what the reader achieves -->

## Output file
<!-- opener only: the one Markdown file the writer creates, e.g. docs/manual/02-admin-panel/03-create-user.md -->

## Before you start
<!-- griller refines: the role, data and state needed, and the workflows to do first -->

## Steps
<!-- griller refines: numbered; each step is one action, then what the user sees. UI labels in **bold**, exactly as the UI shows them. Screenshot ids on the step they belong to: 📷 S1 -->

## Variations and errors
<!-- griller refines: condition → exact message the user sees → what the user does next -->

## Screenshots
<!-- griller refines: - [ ] S1 — <screen>, <state>. The writer ticks each one when the capture scenario produces it. -->

## Related workflows
<!-- griller refines: other parts of the manual the reader may need, by issue or output file -->

## Source references
<!-- opener only: the files that prove this workflow exists, with paths -->

## Open questions
<!-- griller resolves: only what the code can't answer. Answer inline and tick: - [x] <question> — **A:** <answer>. The griller may add questions; any unticked one blocks `ready`. -->

## Ready checklist
<!-- griller ticks these, then adds `ready` -->

- [ ] Every open question is answered inline
- [ ] Steps cover the workflow from start to finish, each with what the user sees
- [ ] Every UI label is confirmed exactly as the UI shows it
- [ ] The screenshot list is final
- [ ] Nothing is left as TBD or a placeholder outside Open questions

## Acceptance criteria
<!-- implementer ticks these -->

- [ ] The issue had the `ready` label when work started
- [ ] Only the output file above, this workflow's capture scenario and its screenshots are added or changed
- [ ] Written in the manual's language, following `docs/manual/STYLE.md`
- [ ] Every UI label matches the current UI exactly
- [ ] Every screenshot above is produced by the capture scenario and shown where its step says
- [ ] The manual builds; PR merged with CI green
