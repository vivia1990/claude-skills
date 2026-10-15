---
name: plan-to-issues
description: Split a plan into a milestone and issues, write each issue body from the project's issue contracts (.issue-contracts/), preview everything, then open them on GitHub (gh) or GitLab (glab) in dependency order. Re-runs never duplicate. Use for "/plan-to-issues", "open issues for this plan", "turn this plan into issues/a milestone", or when another skill hands over a plan file to be opened as issues.
---

# Plan to issues

Turn a plan into issues on the project's forge. This skill only opens issues; implementing them is someone else's job.

Usage: `/plan-to-issues <plan> [--contract <name>]`

- `<plan>` is a markdown file path or plan text pasted into the conversation.
- `--contract` is the default contract for every issue: a contract name, as in `.issue-contracts/<name>/`.

Every issue is written from a contract. Read `../issue-contract/references/spec.md` (next to this skill's folder) before starting: it defines contracts, their versions, and how an opener uses them.

Nothing is written to the forge until the user has approved both the split (step 3) and the full preview (step 6).

## 1. Detect the forge

1. If `.plan-to-issues.yml` exists at the repo root, read it (format below) and use its `forge`/`host`.
2. Otherwise read the host from `git remote get-url origin`. `github.com` → GitHub. Any other host: run `glab auth status --hostname <host>` and `gh auth status --hostname <host>`; use whichever is logged in.
3. If that's still ambiguous (several remotes, both or neither CLI logged in), ask the user once and write the answer into `.plan-to-issues.yml`.

Then load `references/github.md` or `references/gitlab.md` and use only the commands listed there. If the CLI is missing or not logged in, stop and tell the user how to install it or log in. Never ask for a token in the conversation.

```yaml
# .plan-to-issues.yml (optional, committed)
forge: gitlab            # github | gitlab
host: git.example.com
labels: [planned]        # added to every issue
contracts:               # issue type -> contract name, only when they differ
  bug: defect
```

An older file may call `contracts:` `templates:`; read it the same way.

## 2. Choose the contracts

A contract's name is its folder in `.issue-contracts/`. Choose each issue's contract in this order:

1. a `Type: <type>` line in that issue's section of the plan (mapped through `contracts:` in the config, else used as the name),
2. the `--contract` argument,
3. your own choice among the project's contracts and this skill's `templates/` (`bug`, `feature`), from what the issue is.

If `.github/ISSUE_TEMPLATE/` or `.gitlab/issue_templates/` has a template whose body starts with `<!-- contract:`, the project still uses the old layout: stop and tell the user to run `/issue-contract migrate` first.

## 3. Propose the split

Read the whole plan and decide the milestone and the issues:

- One issue = one piece of work that can be implemented and merged on its own.
- If the plan already marks out issues (e.g. `## Issue: ...` headings), follow them.
- A `Labels: <a>, <b>` line in an issue's section adds those labels to that issue, on top of the config's `labels` and the contract's. `ready` is the exception: the contract's Lifecycle decides it (step 5).
- Skip anything the plan marks as deferred, out of scope, or not to be opened.
- The milestone is the plan's stated milestone, else propose one. A single-issue plan may have none.
- Record dependencies between issues. Stop and report if they form a cycle.

Show the split as a table: slug, title, type → contract, labels, depends on. Give each issue a stable kebab-case slug from its title, prefixed with the milestone slug (`e2e-tests/user-registration`). Wait for approval; redo the table on feedback before writing any bodies.

## 4. Make sure the contracts are published

For every contract the approved split uses, follow the spec's "Opening issues": take the newest published version, or seed one and get it published first. This skill seeds only its own `bug` and `feature`: show a seeded one and wait for the user, who may adapt it, before committing it. Any other missing contract stops the run: name the skill that sets it up, as the spec says.

Read each contract's version in use from the default branch, as the spec's "Reading a contract" says.

## 5. Write the bodies

For each issue, write the body as the spec's "Opening issues" lays it out, from its contract's version in use:

1. the contract's marker, copied from line 1 of that version,
2. this skill's own marker and the dependencies:
   ```
   <!-- plan-to-issues: <slug> -->
   **Blocked by:** <dependency titles, resolved to #N at creation time>
   ```
   Omit the "Blocked by" line when there are no dependencies,
3. every section of the contract, in order, with its owner comment and fixed items (such as checklists), then the plan's content for it. Don't repeat what the comment says, and don't invent requirements the plan doesn't state. If a section would still be empty, write `None.` rather than dropping it.

Never copy the contract's rules comment or its `from:` line. Write each body to its own file in a temporary directory outside the repo.

Each issue's labels are the config's `labels`, the ones the contract's Labels field gives the opener, and the plan's `Labels:` line without `ready`. Add `ready` only when the contract's Lifecycle says it isn't grilled.

## 6. Preview

Before showing the preview, look up what already exists (commands in the forge reference):

- the milestone (by exact title),
- the labels,
- issues in that milestone (any state) whose body contains a `plan-to-issues:` marker. With no milestone, search the project for each marker; if search finds nothing, fall back to matching the exact title.

Show:

- the milestone: existing or to be created (with its due date, if the plan gives one),
- labels to be created,
- each issue: its contract and version, then **create** or **skip (exists as #N)**, followed by its full body. If there are more than five new issues, show the table with each body's file path and print only the bodies the user asks for.

Wait for explicit approval.

## 7. Create

1. Create the milestone and the missing labels, with the description and colour the spec's "Labels" gives each one.
2. Create issues in dependency order: an issue's blockers first. Just before creating each one, replace its "Blocked by" titles with `#N` of the blocking issues (whether just created or already existing).
3. Read back each issue's number and URL from the creation command's JSON output, as the forge reference describes.
4. Link each issue created in this run to its blockers with the forge's native blocking link (forge reference, "Blocking links"), so the forge itself shows which issues can start. Keep the "Blocked by" line too: it is what works where native links don't. If the forge refuses them (GitLab Free, older GitHub Enterprise), stop linking for the rest of the run and say so in the final table.

If a command fails, stop. Report what was created and the error. A re-run will skip what already exists and pick up where it stopped.

Finish with a table: issue number, title, URL, created or skipped.
