---
name: e2e-kickoff
description: Plan end-to-end tests for an existing project that has none. Sub-agents read the source code to find every user workflow (registration, inserting articles, ...); the skill ranks them, picks one test framework, and writes a plan with a setup issue plus one issue per workflow, each with step-by-step test cases, then hands the plan to plan-to-issues. Use for "/e2e-kickoff", "plan e2e tests for this project", "kick off end-to-end testing", or when a project needs e2e tests so coding agents can verify their work.
---

# E2E kickoff

Plan end-to-end tests for a project with none, so coding agents can later verify their own work by running them. This skill only plans. It ends with a committed plan file and, if the user agrees, issues opened by `plan-to-issues`. What comes after is someone else's job:

1. `grill-issue` shapes each workflow issue with the user and adds the `ready` label.
2. `run-issues` writes the tests for each `ready` issue: one issue, one agent, one PR.

The project's issue contracts (`.issue-contracts/`) are the agreement between those steps. `../issue-contract/references/spec.md` (next to this skill's folder) says how they work.

Run from the project's repo root. Each step ends at a checkpoint: wait for the user's answer before moving on.

## 1. Find the workflows

First check the project's layout: if `.github/ISSUE_TEMPLATE/` or `.gitlab/issue_templates/` has a template whose body starts with `<!-- contract:`, stop and tell the user to run `/issue-contract migrate`, then this skill again.

A workflow is something a user does from start to finish to get a result: register, log in, insert an article, export a report, run `tool sync`.

Detect the project type (web, desktop, CLI, API/service; see Step 2) first, so you can pick the reading areas. Then launch parallel sub-agents, one per area. They read source code only; nobody launches the app. Typical areas:

- **Entry points and navigation**: routes, pages, menus, windows, CLI commands.
- **Forms and actions**: what users submit or click, and the handlers behind them.
- **API and back end**: endpoints and the side effects they cause.
- **Auth, roles and data**: who can do what, and what the data model allows.

Drop areas that don't apply (a CLI has no navigation). Split a large area by module.

Ask each sub-agent to return, for every workflow it finds:

- name and the role that performs it,
- entry point,
- main steps in user terms (labels, URLs, commands, visible text),
- preconditions (data, accounts, state),
- outcomes, including errors and validation the code handles,
- source files that prove it exists, with paths.

Tell them not to report anything they can't point to in the code.

Merge the results and remove duplicates. Rank each workflow:

- **critical**: core purpose of the app, authentication, money, or anything that can lose data,
- **important**: commonly used,
- **minor**: settings, cosmetic, rarely used.

Also record dependencies between workflows (inserting an article needs a logged-in user).

**Checkpoint:** show the ranked list as a table: workflow, rank, depends on, source files. The user adds, removes, re-ranks or merges entries.

## 2. Choose the framework

Load the matching file from `references/` (`web.md`, `desktop.md`, `cli.md`, `api.md`). If none fits, say so and propose one from your own research.

Check what the project already has (test runner, CI config, package manager, how the app starts) and propose **one** framework, with a one-line reason. Also state:

- how the tests will start the app and its dependencies,
- which shared fixtures the workflows need (e.g. `seeded-user`, `logged-in-admin`, `sample-article`). Shared preconditions become named fixtures, built once in the setup issue.

**Checkpoint:** the user confirms or changes the choices.

## 3. Install the contracts

Follow the spec's "Opening issues" for `e2e-setup` and `e2e-workflow`: use the project's newest published version of each, or seed `v1` from this skill's `templates/`. A seeded contract isn't committed yet; step 4 commits it with the plan.

**Checkpoint:** show the contracts. The user adapts a seeded one now, because the plan is written against its sections. A published version is never edited: for changes to one, the user runs `/issue-contract new <name>`, and you continue with the new version once it is published.

## 4. Write the plan

Write `docs/plans/e2e-kickoff.md`:

```
# E2E tests — <project>

Milestone: E2E tests

## Issue: Set up e2e testing
Type: e2e-setup
Labels: e2e
<one subsection per ## section of the e2e-setup contract>

## Issue: E2E — <workflow name>
Type: e2e-workflow
Depends on: Set up e2e testing[, E2E — <other workflow>]
Labels: e2e
<one subsection per ## section of the e2e-workflow contract>

...one workflow issue per critical or important workflow...

## Deferred (not to be opened as issues)
- <minor workflow>: <one line on what it is>, <source files>
```

Rules for the content:

- **One issue per workflow.** Its test cases cover the happy path, edge cases and error cases the code handles.
- **Each test case is numbered steps, with an assertion after every step**, written in terms of what the user sees:
  `1. On / click "Sign up" → URL is /register; registration form visible`
  Never write selectors, element IDs or framework code. The implementing agent decides those.
- Write each test case as a checklist item with its steps nested under it, so progress shows on the issue:
  ```
  - [ ] **TC1 — Register with valid data** (happy path)
    1. On / click "Sign up" → URL is /register; registration form visible
    2. Fill name, email, password; click "Create account" → URL is /dashboard; header shows the name
  - [ ] **TC2 — Register with an email already in use** (error)
    1. ...
  ```
- Refer to fixtures by name. Every fixture must be defined in the setup issue.
- List the source files from Step 1, so the implementing agent knows where to start.
- The setup issue's contract isn't grilled, so `plan-to-issues` opens it `ready`: its choices were reviewed at the checkpoints. Workflow issues wait for `grill-issue`.
- Leave `Ready checklist` and `Acceptance criteria` to the contract, which already has their items. Add an item only if this issue needs one the contract doesn't have.
- Don't put anything in the plan that the code doesn't support. If the code doesn't show how something behaves, write it as an open question in the issue (an unchecked checklist item), not as an assertion.

**Checkpoint:** the user reviews the plan file. Apply their changes, then commit the plan file and any contract seeded in step 3 once they approve. Then publish them as the spec's "Opening issues" says: on the default branch, ask before pushing; on any other branch, stop here and tell the user to run `/plan-to-issues docs/plans/e2e-kickoff.md --contract e2e-workflow` once it is merged.

## 5. Open the issues

Ask: "Open the issues now?" If yes, call the Skill tool with `plan-to-issues` and the arguments `docs/plans/e2e-kickoff.md --contract e2e-workflow`.

`plan-to-issues` shows its own preview and asks before creating anything. If the user says no, tell them to run `/plan-to-issues docs/plans/e2e-kickoff.md --contract e2e-workflow` later.

Finish by telling the user what happens next:

1. `/run-issues "E2E tests"` implements the setup issue now: it is already `ready`.
2. `/grill-issue --contract e2e-workflow` shapes the workflow issues, one per run, and adds `ready`.
3. Once the setup PR is merged, `/run-issues "E2E tests"` writes the tests for every `ready` issue. Run it again as more issues become `ready`.
