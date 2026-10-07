---
name: plan-to-issues
description: Split a plan into a milestone and issues, write each issue body from the project's editable issue templates, preview everything, then open them on GitHub (gh) or GitLab (glab) in dependency order. Re-runs never duplicate. Use for "/plan-to-issues", "open issues for this plan", "turn this plan into issues/a milestone", or when another skill hands over a plan file to be opened as issues.
---

# Plan to issues

Turn a plan into issues on the project's forge. This skill only opens issues; implementing them is someone else's job.

Usage: `/plan-to-issues <plan> [--template <name-or-path>]`

- `<plan>` is a markdown file path or plan text pasted into the conversation.
- `--template` is the default template for every issue: a template name (looked up as below) or a file path.

Nothing is written to the forge until the user has approved both the split (step 3) and the full preview (step 5).

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
templates:               # issue type -> template name, only when they differ
  bug: defect
```

## 2. Resolve templates

Template folder: `.github/ISSUE_TEMPLATE/` on GitHub, `.gitlab/issue_templates/` on GitLab. A template's name is its filename without `.md`. Only markdown templates are supported; skip GitHub `.yml` issue forms.

Choose each issue's template in this order:

1. a `Type: <type>` line in that issue's section of the plan (mapped through `templates:` in the config, else used as the name),
2. the `--template` argument,
3. your own choice among the project's templates, from what the issue is (feature, bug, ...).

If a chosen name isn't in the project's folder but exists in this skill's `templates/`, show it to the user and offer to copy it into the project's folder so they can edit it before continuing. On GitHub, add frontmatter when copying (`name`, `about`, `labels`) so the template also shows up in the web UI. Never edit an existing project template.

A template's `##` headings are its required sections, in order. Labels in a GitHub template's frontmatter are added to issues that use it.

## 3. Propose the split

Read the whole plan and decide the milestone and the issues:

- One issue = one piece of work that can be implemented and merged on its own.
- If the plan already marks out issues (e.g. `## Issue: ...` headings), follow them.
- Skip anything the plan marks as deferred, out of scope, or not to be opened.
- The milestone is the plan's stated milestone, else propose one. A single-issue plan may have none.
- Record dependencies between issues. Stop and report if they form a cycle.

Show the split as a table: slug, title, type → template, labels, depends on. Give each issue a stable kebab-case slug from its title, prefixed with the milestone slug (`e2e-tests/user-registration`). Wait for approval; redo the table on feedback before writing any bodies.

## 4. Write the bodies

For each issue, write the body using exactly the template's `##` sections, in order, filled with content from the plan. Don't invent requirements the plan doesn't state. If the plan has nothing for a section, write `None.` rather than dropping it.

Prepend to every body:

```
<!-- plan-to-issues: <slug> -->
**Blocked by:** <dependency titles, resolved to #N at creation time>
```

Omit the "Blocked by" line when there are no dependencies. Write each body to its own file in a temporary directory outside the repo.

## 5. Preview

Before showing the preview, look up what already exists (commands in the forge reference):

- the milestone (by exact title),
- the labels,
- issues in that milestone (any state) whose body contains a `plan-to-issues:` marker. With no milestone, search the project for each marker; if search finds nothing, fall back to matching the exact title.

Show:

- the milestone: existing or to be created (with its due date, if the plan gives one),
- labels to be created,
- each issue: **create** or **skip (exists as #N)**, followed by its full body. If there are more than five new issues, show the table with each body's file path and print only the bodies the user asks for.

Wait for explicit approval.

## 6. Create

1. Create the milestone and the missing labels.
2. Create issues in dependency order: an issue's blockers first. Just before creating each one, replace its "Blocked by" titles with `#N` of the blocking issues (whether just created or already existing).
3. Read back each issue's number and URL from the creation command's JSON output, as the forge reference describes.

If a command fails, stop. Report what was created and the error. A re-run will skip what already exists and pick up where it stopped.

Finish with a table: issue number, title, URL, created or skipped.
