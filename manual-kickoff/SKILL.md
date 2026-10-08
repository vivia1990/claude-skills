---
name: manual-kickoff
description: Plan a user manual for an existing web, desktop or CLI project that has none. Sub-agents read the source code to understand the product, its roles and sections, then find every user workflow; the skill writes a plan with a setup issue, an intro issue and one issue per workflow, whose contracts are the agreement between the griller and the writer, then hands the plan to plan-to-issues. Run only through "/manual-kickoff".
disable-model-invocation: true
---

# Manual kickoff

Plan a user manual for a project that has none. This skill only plans. It ends with a committed plan file and, if the user agrees, issues opened by `plan-to-issues`. What comes after is someone else's job:

1. `grill-issue` shapes each issue with the user and adds the `ready` label.
2. `run-issues` turns each `ready` issue into one Markdown file, in one PR.
3. The build from the setup issue turns the Markdown into one PDF.

The project's issue contracts (`.issue-contracts/`) are the agreement between those steps (see [The contract](#the-contract)).

The manual is for people who use the running product, grouped by role (guest, user, admin, ...). It doesn't cover installing, deploying or developing the product.

Run from the project's repo root. Each step ends at a checkpoint: wait for the user's answer before moving on.

## 0. Preflight

Find out, by reading the repo:

- **Project type**: web, desktop or CLI. If the project is only an API/service or a library, stop: a user manual isn't the right document for it, an API reference is.
- **Existing manual**: if `docs/manual/` or another end-user manual exists, stop and say so. This skill only plans manuals for projects that have none.
- **Old layout**: if `.github/ISSUE_TEMPLATE/` or `.gitlab/issue_templates/` has a template whose body starts with `<!-- contract:`, stop and tell the user to run `/issue-contract migrate`, then this skill again.
- **UI language**: the default locale of the i18n files, else the language of the hard-coded labels. The manual and the issue bodies are written in it. One language per run.
- **Inputs to reuse**: the glossary of domain terms (`GLOSSARY.md`, or the per-context ones `GLOSSARY-MAP.md` points at, or the older `CONTEXT.md`) and `docs/plans/e2e-kickoff.md` (workflows already found). Give them to the sub-agents as a starting point; the sub-agents still check everything against the code.

Report what you found at the step 1 checkpoint.

## 1. Understand the product

Launch three sub-agents in parallel. They read source code and existing docs only; nobody launches the app.

- **Stack and architecture**: languages, frameworks, how the app starts, entry points (routes, windows, CLI commands), where the UI text lives.
- **Domain**: what the product is for, the main entities and their lifecycle, the domain terms a user meets in the UI, and what the README, in-app help and `docs/` already say.
- **Roles and navigation**: the roles and what each can do, how a user gets an account and logs in, and the navigation map: the sections of the product (admin panel, reserved area, user dashboard, ...) and which roles see each one.

Tell them to quote UI labels exactly and not to report anything they can't point to in the code.

Merge the results into a **project overview**: purpose, audience, roles, sections, glossary, UI language, stack. The stack is there for the agents in step 2; it doesn't go into the manual.

**Checkpoint:** show the overview and the section list. The user corrects roles and sections, merges or splits sections, and confirms the language. Each section becomes a chapter.

## 2. Find the workflows

A workflow is something a user does from start to finish to get a result: log in, create a user, book a room, export a report, run `tool sync`.

Launch one sub-agent per section, in parallel. Give each the project overview and its section: entry points and the roles that see it. Split a large section by module. Point them at where workflows live for the project type: routes, menus, forms and their handlers for web; windows, dialogs, menus and their handlers for desktop; commands, subcommands, flags and help text for CLI.

Ask each sub-agent to return, for every workflow in its section:

- name and the role that performs it,
- entry point (menu, URL, window, command),
- steps in user terms: what the user does, with the exact labels, menus, URLs or commands, and what they see after each step,
- preconditions (role, data, state, other workflows first),
- outcomes, and the errors and messages a user can see, with their exact text,
- help text, tooltips and placeholders the code shows,
- the screens or outputs worth a screenshot, and the state they should be in,
- what the code can't tell (why a user does this, which option to recommend),
- source files that prove it exists, with paths.

Tell them not to report anything they can't point to in the code.

Merge the results and remove duplicates. Rank each workflow:

- **critical**: needed to get the product's core value (first access, the main task),
- **important**: done often,
- **minor**: settings and rare tasks.

Order the workflows in a chapter by the user's journey: first-time setup, then daily tasks, then occasional ones. Order the chapters from the least to the most privileged role. Record dependencies between workflows (booking a room needs a logged-in user).

**Checkpoint:** show one table per chapter: order, workflow, role, rank, depends on, source files. The user adds, removes, re-ranks, reorders or merges entries.

## 3. Install the contracts

Read `../issue-contract/references/spec.md` (next to this skill's folder) and follow its "Opening issues" for `manual-setup`, `manual-intro` and `manual-workflow`: use the project's newest published version of each, or seed `v1` from this skill's `templates/`. A seeded contract isn't committed yet; step 4 commits it with the plan.

**Checkpoint:** show the contracts. The user adapts a seeded one now, because the plan is written against its sections. A published version is never edited: for changes to one, the user runs `/issue-contract new <name>`, and you continue with the new version once it is published.

## 4. Write the plan

Load `references/capture.md` and follow the part for the project type. Then write `docs/plans/manual-kickoff.md`:

```
# User manual — <project>

Milestone: User manual

## Project overview
<purpose, audience, roles, chapters in order with their roles, glossary, UI language, stack>

## Issue: Manual — Set up the manual
Type: manual-setup
Labels: manual
<one subsection per ## section of the manual-setup contract>

## Issue: Manual — Introduction
Type: manual-intro
Depends on: Manual — Set up the manual
Labels: manual, manual:intro
<one subsection per ## section of the manual-intro contract>

## Issue: Manual — <Chapter> — <Workflow>
Type: manual-workflow
Depends on: Manual — Set up the manual
Labels: manual, manual:<chapter-slug>
<one subsection per ## section of the manual-workflow contract>

...one issue per critical or important workflow...

## Issue: Manual — <Chapter> — Other tasks
Type: manual-workflow
Depends on: Manual — Set up the manual
Labels: manual, manual:<chapter-slug>
<the same subsections, each split into one part per minor workflow of the chapter>
```

Rules for the content:

- **Fix every output path now**, so no two issues touch the same file and only the setup issue touches shared ones:
  ```
  docs/manual/
    manual.yaml                          # pandoc metadata, plus the chapters in order with their roles
    STYLE.md                             # from this skill's references/style.md
    00-intro.md                          # intro issue
    NN-<chapter>/
      00-chapter.md                      # chapter heading and who it's for (setup issue)
      NN-<workflow>.md                   # one workflow issue
      NN-other-tasks.md                  # the chapter's "Other tasks" issue
    assets/screenshots/<chapter>/<workflow>-NN.png
    assets/output/<chapter>/<workflow>-NN.txt   # CLI output instead of screenshots
    scripts/build-manual.*               # setup issue
    scripts/capture.*                    # setup issue
    scripts/capture/<chapter>/<workflow>.*   # one capture scenario per workflow issue
  ```
  `NN` follows the chapter and journey order from step 2.
- **One issue per critical or important workflow.** Minor workflows go into one "Other tasks" issue per chapter. Nothing is deferred: the reader can't tell a gap in the manual from a missing feature.
- **Issue dependencies are only on the setup issue.** Workflow dependencies (log in before booking) go into the `Before you start` and `Related workflows` sections, not into `Depends on`, so the chapters can be written in parallel.
- **Draft the steps from the code.** Each step is one action, then what the user sees, in the manual's language, with UI labels in bold and quoted exactly as the UI shows them:
  `1. Open **Users** from the side menu → the user list appears. 📷 S1`
  Never write selectors, element IDs or code.
- **List screenshots by id, screen and state**, and put each id on the step that shows it.
- **Open questions hold only what the code can't answer**: why users do this, which option to recommend, what to leave out, warnings the reader needs, names where the code and the UI disagree. Write each one as an unchecked checklist item. If the code doesn't show how something behaves, write an open question, not a step.
- Keep the contract's `##` headings in English, as they are. Write the content in the manual's language.
- Leave `Ready checklist` and `Acceptance criteria` to the contract, which already has their items. Add an item only if this issue needs one the contract doesn't have.
- List the source files from step 2 in every issue.
- Don't put anything in the plan that the code doesn't support.

**Checkpoint:** the user reviews the plan file. Apply their changes, then commit the plan file and any contract seeded in step 3 once they approve. Then publish them as the spec's "Opening issues" says: on the default branch, ask before pushing; on any other branch, stop here and tell the user to run `/plan-to-issues docs/plans/manual-kickoff.md --contract manual-workflow` once it is merged.

## 5. Open the issues

Ask: "Open the issues now?" If yes, call the Skill tool with `plan-to-issues` and the arguments `docs/plans/manual-kickoff.md --contract manual-workflow`.

`plan-to-issues` shows its own preview and asks before creating anything. If the user says no, tell them to run `/plan-to-issues docs/plans/manual-kickoff.md --contract manual-workflow` later.

Finish by telling the user what happens next:

1. `/run-issues "User manual"` implements the setup issue now: it is already `ready`.
2. `/grill-issue --contract manual-intro` and `/grill-issue --contract manual-workflow` shape the other issues, one per run, and add `ready`.
3. Once the setup PR is merged, `/run-issues "User manual"` writes every `ready` issue in parallel. Run it again as more issues become `ready`.

## The contract

The manual's three contracts follow `../issue-contract/references/spec.md`. Each version is a file in the project's `.issue-contracts/`, every issue names the version it was written under in a marker on its first line, and `grill-issue` and `run-issues` read that exact version. `plan-to-issues` copies each section's comment into the issue, so a person reading it on the forge sees who owns what; the rules stay in the contract file. In short:

- **No `ready` label means the issue still needs grilling.** The setup contract isn't grilled: its issue is opened `ready`, because its choices were reviewed at the plan checkpoint. The intro and workflow issues are grilled.
- The griller adds `ready` only when every item in the issue's `Ready checklist` is ticked.
- Only the opener writes `Workflow`, `Output file` and `Source references`. The griller refines the other content sections, answers `Open questions` inline, and may add new ones, which block `ready` until answered.
- If an issue should be split, merged or renamed, the griller comments on it and doesn't add `ready`. A person decides.
- A writer starts only on a `ready` issue and changes only its output file, its capture scenario and its screenshots.

To change these rules for a project, add a new version with `/issue-contract new <name>`. Issues already open keep the version they name, so they are never worked under new rules by mistake; `grill-issue` offers to move an issue that isn't `ready` yet.
